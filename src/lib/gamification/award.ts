/**
 * Server-only badge awarding: loads the signals needed by candidate badges,
 * evaluates them against the earned-badges set, and inserts winners into
 * `user_badges`.
 *
 * Never throws — a badge failure must not block the triggering user action
 * (entry save, login, etc.). Callers should use a service-role Supabase
 * client; RLS forbids client-side inserts.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Badge, WritingMode } from '$lib/data/badges';
import {
	BADGES_BY_EVENT,
	evaluateCriterion,
	type BadgeEvent,
	type EvaluationContext
} from './evaluate';

export interface EntryRow {
	created_at: string;
	entry_date: string;
	tone_id: string;
	writing_mode: WritingMode | null;
}

const NIGHT_HOURS = new Set([0, 1, 2, 3, 4]);
const DAY_MS = 86_400_000;
const DEFAULT_TIMEZONE = 'Europe/Stockholm';

export async function checkAndAward(
	supabase: SupabaseClient,
	userId: string,
	event: BadgeEvent,
	payload: Partial<EvaluationContext> = {}
): Promise<Badge[]> {
	try {
		const candidates = BADGES_BY_EVENT[event];
		if (candidates.length === 0) return [];

		const earned = await loadEarnedIds(supabase, userId);
		const toEvaluate = candidates.filter((b) => !earned.has(b.id));
		if (toEvaluate.length === 0) return [];

		const ctx = await buildContext(supabase, userId, payload, toEvaluate);

		const winners = toEvaluate.filter((b) => evaluateCriterion(b.criterion, ctx));
		if (winners.length === 0) return [];

		return await insertEarned(supabase, userId, winners);
	} catch (err) {
		console.error('[badges] checkAndAward failed:', err);
		return [];
	}
}

async function loadEarnedIds(supabase: SupabaseClient, userId: string): Promise<Set<string>> {
	const { data, error } = await supabase
		.from('user_badges')
		.select('badge_id')
		.eq('user_id', userId);
	if (error) throw error;
	return new Set((data ?? []).map((r: { badge_id: string }) => r.badge_id));
}

async function buildContext(
	supabase: SupabaseClient,
	userId: string,
	payload: Partial<EvaluationContext>,
	candidates: readonly Badge[]
): Promise<EvaluationContext> {
	const ctx: EvaluationContext = { ...payload };

	const needsBirthday =
		candidates.some((b) => b.criterion.type === 'entry-on-birthday') &&
		ctx.birthday === undefined;
	const needsProfileComplete =
		candidates.some((b) => b.criterion.type === 'profile-completed') &&
		ctx.profileComplete === undefined;
	const needsProfilePhoto =
		candidates.some((b) => b.criterion.type === 'profile-photo-uploaded') &&
		ctx.profileHasPhoto === undefined;
	const needsTimezoneForNightEntries =
		candidates.some((b) => b.criterion.type === 'entries-at-night') &&
		ctx.userTimezone === undefined;

	if (needsBirthday || needsProfileComplete || needsProfilePhoto || needsTimezoneForNightEntries) {
		const { data, error } = await supabase
			.from('profiles')
			.select('birthday, name, pronouns, hometown, avatar_url, timezone')
			.eq('id', userId)
			.maybeSingle();
		if (error) throw error;
		if (needsBirthday) {
			ctx.birthday = parseBirthday((data?.birthday ?? null) as string | null);
		}
		if (needsProfileComplete) {
			ctx.profileComplete = isProfileComplete(data);
		}
		if (needsProfilePhoto) {
			ctx.profileHasPhoto =
				typeof data?.avatar_url === 'string' && data.avatar_url.trim().length > 0;
		}
		if (needsTimezoneForNightEntries) {
			ctx.userTimezone =
				typeof data?.timezone === 'string' && data.timezone.trim().length > 0
					? data.timezone
					: DEFAULT_TIMEZONE;
		}
	}

	if (needsEntriesDerived(candidates)) {
		const { data, error } = await supabase
			.from('entries')
			.select('created_at, entry_date, tone_id, writing_mode')
			.eq('user_id', userId)
			.order('entry_date', { ascending: false });
		if (error) throw error;
		Object.assign(
			ctx,
			deriveFromEntries((data ?? []) as EntryRow[], {
				timezone: ctx.userTimezone ?? DEFAULT_TIMEZONE
			}),
			payload
		);
	}

	if (
		candidates.some((b) => b.criterion.type === 'entries-shared') &&
		ctx.sharedEntriesCount === undefined
	) {
		const { count, error } = await supabase
			.from('entries')
			.select('id', { count: 'exact', head: true })
			.eq('user_id', userId)
			.eq('is_public', true);
		if (error) throw error;
		ctx.sharedEntriesCount = count ?? 0;
	}

	return ctx;
}

function needsEntriesDerived(candidates: readonly Badge[]): boolean {
	return candidates.some((b) => {
		switch (b.criterion.type) {
			case 'entries-total':
			case 'entries-streak':
			case 'entries-at-night':
			case 'entries-weekend-streak':
			case 'entries-cover-all-hours':
			case 'entries-by-mode':
			case 'all-writing-modes-used':
			case 'unique-tones-used':
			case 'all-tones-used':
			case 'same-tone-entries':
			case 'returned-after-days':
			case 'entries-same-day':
				return true;
			default:
				return false;
		}
	});
}

function getHourInTimezone(date: Date, timezone: string): number | null {
	try {
		const parts = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			hour: '2-digit',
			hour12: false
		}).formatToParts(date);
		const rawHour = parts.find((p) => p.type === 'hour')?.value ?? '';
		const hour = parseInt(rawHour, 10);
		return Number.isNaN(hour) ? null : hour;
	} catch {
		return null;
	}
}

export function deriveFromEntries(
	rows: EntryRow[],
	options: { timezone?: string } = {}
): Partial<EvaluationContext> {
	const entriesByMode: Partial<Record<WritingMode, number>> = {};
	const toneCounts = new Map<string, number>();
	const entriesPerDay = new Map<string, number>();
	const hours = new Set<number>();
	let nightEntriesCount = 0;
	const timezone = options.timezone ?? DEFAULT_TIMEZONE;

	for (const r of rows) {
		if (r.writing_mode) {
			entriesByMode[r.writing_mode] = (entriesByMode[r.writing_mode] ?? 0) + 1;
		}
		toneCounts.set(r.tone_id, (toneCounts.get(r.tone_id) ?? 0) + 1);
		entriesPerDay.set(r.entry_date, (entriesPerDay.get(r.entry_date) ?? 0) + 1);
		const h = getHourInTimezone(new Date(r.created_at), timezone);
		if (h === null) continue;
		hours.add(h);
		if (NIGHT_HOURS.has(h)) nightEntriesCount++;
	}

	const uniqueDates = [...new Set(rows.map((r) => r.entry_date))].sort().reverse();

	const currentStreakDays = computeLongestDailyStreak(uniqueDates);
	const daysSinceLastEntry = computeLongestGap(uniqueDates);
	const weekendStreakWeeks = computeWeekendStreak(uniqueDates);
	const sameDayEntriesCount = entriesPerDay.size
		? Math.max(...entriesPerDay.values())
		: 0;

	const toneValues = [...toneCounts.values()];
	return {
		totalEntries: rows.length,
		entriesByMode,
		distinctModesUsed: Object.keys(entriesByMode).length,
		uniqueTonesUsed: toneCounts.size,
		sameToneMaxCount: toneValues.length ? Math.max(...toneValues) : 0,
		hoursCovered: hours.size,
		nightEntriesCount,
		currentStreakDays,
		daysSinceLastEntry,
		weekendStreakWeeks,
		sameDayEntriesCount
	};
}

function dayGap(laterIso: string, earlierIso: string): number {
	const a = Date.parse(laterIso + 'T00:00:00Z');
	const b = Date.parse(earlierIso + 'T00:00:00Z');
	return Math.round((a - b) / DAY_MS);
}

// Monday (UTC) of the given ISO date, as `YYYY-MM-DD`. Used to group weekend
// entries by their containing week for the weekend-streak badge.
function mondayOf(iso: string): string {
	const d = new Date(iso + 'T00:00:00Z');
	const dow = d.getUTCDay();
	const delta = dow === 0 ? -6 : 1 - dow;
	d.setUTCDate(d.getUTCDate() + delta);
	return d.toISOString().slice(0, 10);
}

function computeWeekendStreak(uniqueDatesDesc: string[]): number {
	const weeks = new Set<string>();
	for (const iso of uniqueDatesDesc) {
		const dow = new Date(iso + 'T00:00:00Z').getUTCDay();
		if (dow === 0 || dow === 6) weeks.add(mondayOf(iso));
	}
	if (weeks.size === 0) return 0;
	const sorted = [...weeks].sort().reverse();
	let streak = 1;
	let best = 1;
	for (let i = 1; i < sorted.length; i++) {
		if (dayGap(sorted[i - 1], sorted[i]) === 7) {
			streak++;
			best = Math.max(best, streak);
		} else {
			streak = 1;
		}
	}
	return best;
}

function computeLongestDailyStreak(uniqueDatesDesc: string[]): number {
	if (uniqueDatesDesc.length === 0) return 0;
	let streak = 1;
	let best = 1;
	for (let i = 1; i < uniqueDatesDesc.length; i++) {
		if (dayGap(uniqueDatesDesc[i - 1], uniqueDatesDesc[i]) === 1) {
			streak++;
			best = Math.max(best, streak);
		} else {
			streak = 1;
		}
	}
	return best;
}

function computeLongestGap(uniqueDatesDesc: string[]): number {
	let best = 0;
	for (let i = 1; i < uniqueDatesDesc.length; i++) {
		best = Math.max(best, dayGap(uniqueDatesDesc[i - 1], uniqueDatesDesc[i]));
	}
	return best;
}

// "Complete" = the four core identity fields are non-empty. Arrays (family,
// pets, interests) aren't required: the badge's flavour is "give Storify a
// glimpse of who you are", which these four deliver.
export function isProfileComplete(row: Record<string, unknown> | null | undefined): boolean {
	if (!row) return false;
	const nonEmpty = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
	return (
		nonEmpty(row.name) &&
		nonEmpty(row.pronouns) &&
		nonEmpty(row.hometown) &&
		nonEmpty(row.birthday)
	);
}

export function parseBirthday(iso: string | null): { month: number; day: number } | null {
	if (!iso) return null;
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!m) return null;
	return { month: Number(m[2]), day: Number(m[3]) };
}

async function insertEarned(
	supabase: SupabaseClient,
	userId: string,
	winners: readonly Badge[]
): Promise<Badge[]> {
	const { data, error } = await supabase
		.from('user_badges')
		.upsert(
			winners.map((b) => ({ user_id: userId, badge_id: b.id })),
			{ onConflict: 'user_id,badge_id', ignoreDuplicates: true }
		)
		.select('badge_id');
	if (error) {
		console.error('[badges] insert failed:', error.message);
		return [];
	}
	const insertedIds = new Set((data ?? []).map((r: { badge_id: string }) => r.badge_id));
	return winners.filter((b) => insertedIds.has(b.id));
}

/**
 * Server-only retroactive badge awarding.
 *
 * Scans existing DB state (entries + profile) and awards every badge whose
 * criterion is derivable from that state. Runs once per user, guarded by
 * `profiles.badges_backfilled_at`. Idempotent via the same upsert strategy
 * used by `award.ts`.
 *
 * Backfilled rows are written with `seen_at = now()` so users aren't hit by
 * a toast storm for badges that describe activity they already did.
 *
 * Event-only criteria — things with no persisted signal — are skipped here
 * and continue to fire via the regular `/api/badges/event` path going
 * forward. See README section in this folder or ask before adding more
 * criteria; each new criterion type needs an explicit decision about
 * whether it's retro-awardable.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
	BADGES,
	type Badge,
	type BadgeCriterion,
	type WritingMode
} from '$lib/data/badges';
import { evaluateCriterion, type EvaluationContext } from './evaluate';
import { deriveFromEntries, isProfileComplete, parseBirthday } from './award';
import { getZodiacFromBirthday } from '$lib/utils/zodiac';

interface BackfillEntryRow {
	created_at: string;
	updated_at: string | null;
	entry_date: string;
	tone_id: string;
	writing_mode: WritingMode | null;
	generated_text: string;
	mood_level: number | null;
	sleep_quality: number | null;
	energy_level: number | null;
	is_public: boolean;
}

interface BackfillProfileRow {
	birthday: string | null;
	name: string | null;
	pronouns: string | null;
	hometown: string | null;
	avatar_url: string | null;
	timezone: string | null;
	push_reminders_enabled: boolean | null;
	newsletter_weekly_enabled: boolean | null;
	newsletter_monthly_enabled: boolean | null;
	badges_backfilled_at: string | null;
}

// Criteria that need per-entry iteration: a single entry must match, not the
// aggregate. Evaluator is single-context, so backfill loops entries and
// builds a fresh ctx per row for these.
const PER_ENTRY_CRITERIA = new Set<BadgeCriterion['type']>([
	'entries-at-midnight',
	'entry-on-birthday',
	'entry-on-christmas-eve',
	'entry-with-low-mood',
	'entry-with-max-stats',
	'entry-word-count'
]);

export interface BackfillResult {
	newlyEarned: Badge[];
	skipped: boolean;
}

export async function backfillBadges(
	supabase: SupabaseClient,
	userId: string,
	options: { force?: boolean } = {}
): Promise<BackfillResult> {
	const { data: profile, error: profileErr } = await supabase
		.from('profiles')
		.select(
			'birthday, name, pronouns, hometown, avatar_url, timezone, push_reminders_enabled, newsletter_weekly_enabled, newsletter_monthly_enabled, badges_backfilled_at'
		)
		.eq('id', userId)
		.maybeSingle<BackfillProfileRow>();
	if (profileErr) throw profileErr;

	if (profile?.badges_backfilled_at && !options.force) {
		return { newlyEarned: [], skipped: true };
	}

	const { data: entriesData, error: entriesErr } = await supabase
		.from('entries')
		.select(
			'created_at, updated_at, entry_date, tone_id, writing_mode, generated_text, mood_level, sleep_quality, energy_level, is_public'
		)
		.eq('user_id', userId)
		.order('entry_date', { ascending: false });
	if (entriesErr) throw entriesErr;
	const entries = (entriesData ?? []) as BackfillEntryRow[];

	const { data: earnedData, error: earnedErr } = await supabase
		.from('user_badges')
		.select('badge_id')
		.eq('user_id', userId);
	if (earnedErr) throw earnedErr;
	const earned = new Set(
		(earnedData ?? []).map((r: { badge_id: string }) => r.badge_id)
	);

	const ctx = buildAggregateContext(entries, profile);
	const winners = pickWinners(entries, earned, ctx, profile);

	const newlyEarned = await insertBackfilled(supabase, userId, winners);

	// Only mark backfilled after a successful insert — a transient failure
	// must not permanently gate the user out of future retro-awards.
	await supabase
		.from('profiles')
		.update({ badges_backfilled_at: new Date().toISOString() })
		.eq('id', userId);

	return { newlyEarned, skipped: false };
}

function buildAggregateContext(
	entries: BackfillEntryRow[],
	profile: BackfillProfileRow | null
): EvaluationContext {
	const base = deriveFromEntries(entries, {
		timezone:
			typeof profile?.timezone === 'string' && profile.timezone.trim().length > 0
				? profile.timezone
				: 'Europe/Stockholm'
	});

	const zodiacSet = new Set<string>();
	for (const e of entries) {
		const z = getZodiacFromBirthday(e.entry_date);
		if (z) zodiacSet.add(z.id);
	}

	const sharedEntriesCount = entries.filter((e) => e.is_public).length;

	return {
		...base,
		uniqueZodiacSigns: zodiacSet.size,
		sharedEntriesCount,
		birthday: parseBirthday(profile?.birthday ?? null),
		profileComplete: isProfileComplete(profile as unknown as Record<string, unknown> | null),
		userTimezone:
			typeof profile?.timezone === 'string' && profile.timezone.trim().length > 0
				? profile.timezone
				: 'Europe/Stockholm'
	};
}

function pickWinners(
	entries: BackfillEntryRow[],
	earned: Set<string>,
	ctx: EvaluationContext,
	profile: BackfillProfileRow | null
): Badge[] {
	const winners: Badge[] = [];

	for (const badge of BADGES) {
		if (earned.has(badge.id)) continue;

		if (matches(badge, entries, ctx, profile)) {
			winners.push(badge);
		}
	}

	return winners;
}

function matches(
	badge: Badge,
	entries: BackfillEntryRow[],
	ctx: EvaluationContext,
	profile: BackfillProfileRow | null
): boolean {
	const type = badge.criterion.type;

	// Event-only criteria: no persisted signal, so skip during backfill.
	// These continue to fire via /api/badges/event going forward.
	switch (type) {
		case 'random-tone-used':
		case 'regenerated-in-new-tone':
		case 'community-entry-read':
		case 'revisited-entry':
		case 'on-this-day-viewed':
		case 'read-fine-print':
		case 'made-interviewer-laugh':
		case 'entry-deleted':
		case 'entry-archived':
		case 'entries-from-unique-cities':
		case 'homework-entries':
			return false;
	}

	// Profile-derived: always-true criteria become conditional on stored state.
	if (type === 'account-created' || type === 'first-login') return true;

	if (type === 'profile-photo-uploaded') {
		return typeof profile?.avatar_url === 'string' && profile.avatar_url.length > 0;
	}

	if (type === 'newsletter-subscribed') {
		return profile?.newsletter_weekly_enabled === true || profile?.newsletter_monthly_enabled === true;
	}

	if (type === 'notifications-enabled') {
		return profile?.push_reminders_enabled === true;
	}

	if (type === 'entry-edited') {
		return entries.some((e) => e.updated_at);
	}

	// Per-entry scans: build a ctx for each entry and test.
	if (PER_ENTRY_CRITERIA.has(type)) {
		for (const entry of entries) {
			const perEntryCtx: EvaluationContext = {
				...ctx,
				createdAt: new Date(entry.created_at),
				entryDate: entry.entry_date,
				moodLevel: entry.mood_level ?? undefined,
				sleepQuality: entry.sleep_quality ?? undefined,
				energyLevel: entry.energy_level ?? undefined,
				wordCount: countWords(entry.generated_text)
			};
			if (evaluateCriterion(badge.criterion, perEntryCtx)) return true;
		}
		return false;
	}

	// Aggregate/profile-completed criteria: evaluate once with aggregate ctx.
	return evaluateCriterion(badge.criterion, ctx);
}

function countWords(text: string): number {
	return text.trim() ? text.trim().split(/\s+/).length : 0;
}

async function insertBackfilled(
	supabase: SupabaseClient,
	userId: string,
	winners: readonly Badge[]
): Promise<Badge[]> {
	if (winners.length === 0) return [];

	const now = new Date().toISOString();
	const { data, error } = await supabase
		.from('user_badges')
		.upsert(
			winners.map((b) => ({
				user_id: userId,
				badge_id: b.id,
				earned_at: now,
				// Pre-marked seen: backfill describes past activity, so no toast.
				seen_at: now
			})),
			{ onConflict: 'user_id,badge_id', ignoreDuplicates: true }
		)
		.select('badge_id');

	if (error) {
		// Throw so the caller skips the `badges_backfilled_at` write —
		// otherwise a transient failure permanently suppresses retro-awards.
		console.error('[badges] backfill insert failed:', error.message);
		throw error;
	}

	const insertedIds = new Set((data ?? []).map((r: { badge_id: string }) => r.badge_id));
	return winners.filter((b) => insertedIds.has(b.id));
}

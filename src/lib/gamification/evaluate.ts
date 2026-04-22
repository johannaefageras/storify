/**
 * Pure, DB-free badge criterion evaluator.
 *
 * The engine is event-driven: callers emit a `BadgeEvent`, look up candidate
 * badges via `BADGES_BY_EVENT`, build an `EvaluationContext` with the minimum
 * signals needed, and pass each candidate's criterion to `evaluateCriterion`.
 *
 * Keeping this module free of DB and framework imports means it's trivially
 * unit-testable and can run in any environment (server route, worker, tests).
 */

import { BADGES, type Badge, type BadgeCriterion, type WritingMode } from '$lib/data/badges';
import { tones } from '$lib/data/tones';

export type BadgeEvent =
	| 'account-created'
	| 'first-login'
	| 'profile-updated'
	| 'profile-photo-uploaded'
	| 'newsletter-subscribed'
	| 'notifications-enabled'
	| 'entry-created'
	| 'entry-updated'
	| 'entry-deleted'
	| 'entry-archived'
	| 'entry-shared'
	| 'entry-viewed-own'
	| 'entry-viewed-community'
	| 'random-tone-used'
	| 'regenerated-in-new-tone'
	| 'on-this-day-viewed'
	| 'read-fine-print';

export interface EvaluationContext {
	// Aggregate counts (computed by `award.ts` when needed for a candidate).
	totalEntries?: number;
	entriesByMode?: Partial<Record<WritingMode, number>>;
	distinctModesUsed?: number;
	sharedEntriesCount?: number;
	sameDayEntriesCount?: number;
	uniqueCitiesCount?: number;
	uniqueZodiacSigns?: number;
	onThisDayViewedCount?: number;
	homeworkEntryCount?: number;
	uniqueTonesUsed?: number;
	sameToneMaxCount?: number;
	hoursCovered?: number;
	nightEntriesCount?: number;
	currentStreakDays?: number;
	weekendStreakWeeks?: number;
	/** Gap in days between the just-saved entry and the previous one. */
	daysSinceLastEntry?: number;

	// The current entry (only present for entry-scoped events).
	createdAt?: Date;
	entryDate?: string;
	toneId?: string;
	moodLevel?: number;
	sleepQuality?: number;
	energyLevel?: number;
	wordCount?: number;
	mode?: WritingMode;
	chatTranscript?: ReadonlyArray<{ role: 'user' | 'assistant'; content: string }>;

	// Account/profile signals.
	accountCreatedAt?: Date;
	profileComplete?: boolean;
	profileHasPhoto?: boolean;
	userTimezone?: string;
	/** 1-indexed month + 1-indexed day. */
	birthday?: { month: number; day: number } | null;

	// Event-level flags.
	interviewerLaughed?: boolean;
	readFinePrint?: boolean;
	isRandomTone?: boolean;
}

const criterionTypeToEvents: Record<BadgeCriterion['type'], readonly BadgeEvent[]> = {
	'account-created': ['account-created'],
	'first-login': ['first-login'],
	'profile-completed': ['profile-updated'],
	'profile-photo-uploaded': ['profile-photo-uploaded'],
	'newsletter-subscribed': ['newsletter-subscribed'],
	'notifications-enabled': ['notifications-enabled'],
	'entries-total': ['entry-created'],
	'entries-streak': ['entry-created'],
	'entries-at-night': ['entry-created'],
	'entries-weekend-streak': ['entry-created'],
	'entries-at-midnight': ['entry-created'],
	'entries-cover-all-hours': ['entry-created'],
	'entries-by-mode': ['entry-created'],
	'all-writing-modes-used': ['entry-created'],
	'entries-shared': ['entry-shared'],
	'community-entry-read': ['entry-viewed-community'],
	'entry-on-birthday': ['entry-created'],
	'entry-on-christmas-eve': ['entry-created'],
	'entry-with-low-mood': ['entry-created', 'entry-updated'],
	'entry-with-max-stats': ['entry-created', 'entry-updated'],
	'random-tone-used': ['random-tone-used'],
	'unique-tones-used': ['entry-created'],
	'all-tones-used': ['entry-created'],
	'same-tone-entries': ['entry-created'],
	'returned-after-days': ['entry-created'],
	'made-interviewer-laugh': ['entry-created'],
	'read-fine-print': ['read-fine-print'],
	'revisited-entry': ['entry-viewed-own'],
	'regenerated-in-new-tone': ['regenerated-in-new-tone'],
	'entry-edited': ['entry-updated'],
	'entry-deleted': ['entry-deleted'],
	'entries-from-unique-cities': ['entry-created'],
	'entries-across-all-zodiac-signs': ['entry-created'],
	'on-this-day-viewed': ['on-this-day-viewed'],
	'homework-entries': ['entry-created'],
	'entry-archived': ['entry-archived'],
	'entries-same-day': ['entry-created'],
	'entry-word-count': ['entry-created', 'entry-updated']
};

/** Index mapping each event to the badges whose criterion *may* fire on it. */
export const BADGES_BY_EVENT: Readonly<Record<BadgeEvent, readonly Badge[]>> = (() => {
	const map: Record<BadgeEvent, Badge[]> = {
		'account-created': [],
		'first-login': [],
		'profile-updated': [],
		'profile-photo-uploaded': [],
		'newsletter-subscribed': [],
		'notifications-enabled': [],
		'entry-created': [],
		'entry-updated': [],
		'entry-deleted': [],
		'entry-archived': [],
		'entry-shared': [],
		'entry-viewed-own': [],
		'entry-viewed-community': [],
		'random-tone-used': [],
		'regenerated-in-new-tone': [],
		'on-this-day-viewed': [],
		'read-fine-print': []
	};
	for (const badge of BADGES) {
		for (const ev of criterionTypeToEvents[badge.criterion.type]) {
			map[ev].push(badge);
		}
	}
	return map;
})();

const ALL_TONES_COUNT = tones.length;
const ALL_HOURS = 24;
const ALL_ZODIAC_SIGNS = 12;
const ALL_WRITING_MODES = 4;

// Kept loose on purpose — user-provided transcripts, not hand-authored patterns.
const LAUGH_REGEX = /😂|🤣|haha+|hehe+/i;

function isMidnightMinute(d: Date): boolean {
	return d.getHours() === 0 && d.getMinutes() === 0;
}

function isBirthday(d: Date, bday: { month: number; day: number }): boolean {
	return d.getMonth() + 1 === bday.month && d.getDate() === bday.day;
}

function isIsoDate(v: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function isBirthdayEntry(
	entryDate: string | undefined,
	createdAt: Date | undefined,
	bday: { month: number; day: number }
): boolean {
	if (entryDate && isIsoDate(entryDate)) {
		const [, month, day] = entryDate.split('-').map(Number);
		return month === bday.month && day === bday.day;
	}
	return createdAt ? isBirthday(createdAt, bday) : false;
}

function isChristmasEve(d: Date): boolean {
	return d.getMonth() === 11 && d.getDate() === 24;
}

function isChristmasEveEntry(entryDate?: string, createdAt?: Date): boolean {
	if (entryDate && isIsoDate(entryDate)) {
		const [, month, day] = entryDate.split('-').map(Number);
		return month === 12 && day === 24;
	}
	return createdAt ? isChristmasEve(createdAt) : false;
}

export function evaluateCriterion(c: BadgeCriterion, ctx: EvaluationContext): boolean {
	switch (c.type) {
		case 'account-created':
		case 'first-login':
		case 'newsletter-subscribed':
		case 'notifications-enabled':
		case 'community-entry-read':
		case 'revisited-entry':
		case 'regenerated-in-new-tone':
		case 'entry-edited':
		case 'entry-deleted':
		case 'entry-archived':
			return true;
		case 'profile-completed':
			return ctx.profileComplete === true;
		case 'profile-photo-uploaded':
			return ctx.profileHasPhoto === true;
		case 'entries-total':
			return (ctx.totalEntries ?? 0) >= c.count;
		case 'entries-streak':
			return (ctx.currentStreakDays ?? 0) >= c.days;
		case 'entries-at-night':
			return (ctx.nightEntriesCount ?? 0) >= c.count;
		case 'entries-weekend-streak':
			return (ctx.weekendStreakWeeks ?? 0) >= c.weeks;
		case 'entries-at-midnight':
			return ctx.createdAt ? isMidnightMinute(ctx.createdAt) : false;
		case 'entries-cover-all-hours':
			return (ctx.hoursCovered ?? 0) >= ALL_HOURS;
		case 'entries-by-mode':
			return (ctx.entriesByMode?.[c.mode] ?? 0) >= c.count;
		case 'all-writing-modes-used':
			return (ctx.distinctModesUsed ?? 0) >= ALL_WRITING_MODES;
		case 'entries-shared':
			return (ctx.sharedEntriesCount ?? 0) >= c.count;
		case 'entry-on-birthday':
			return !!(
				ctx.birthday && isBirthdayEntry(ctx.entryDate, ctx.createdAt, ctx.birthday)
			);
		case 'entry-on-christmas-eve':
			return isChristmasEveEntry(ctx.entryDate, ctx.createdAt);
		case 'entry-with-low-mood':
			return ctx.moodLevel !== undefined && ctx.moodLevel <= 2;
		case 'entry-with-max-stats':
			return (
				ctx.moodLevel === 10 && ctx.sleepQuality === 10 && ctx.energyLevel === 10
			);
		case 'random-tone-used':
			return ctx.isRandomTone === true;
		case 'unique-tones-used':
			return (ctx.uniqueTonesUsed ?? 0) >= c.count;
		case 'all-tones-used':
			return (ctx.uniqueTonesUsed ?? 0) >= ALL_TONES_COUNT;
		case 'same-tone-entries':
			return (ctx.sameToneMaxCount ?? 0) >= c.count;
		case 'returned-after-days':
			return (ctx.daysSinceLastEntry ?? 0) >= c.days;
		case 'made-interviewer-laugh':
			if (ctx.interviewerLaughed === true) return true;
			if (!ctx.chatTranscript) return false;
			return ctx.chatTranscript.some(
				(m) => m.role === 'assistant' && LAUGH_REGEX.test(m.content)
			);
		case 'read-fine-print':
			return ctx.readFinePrint === true;
		case 'entries-from-unique-cities':
			return (ctx.uniqueCitiesCount ?? 0) >= c.count;
		case 'entries-across-all-zodiac-signs':
			return (ctx.uniqueZodiacSigns ?? 0) >= ALL_ZODIAC_SIGNS;
		case 'on-this-day-viewed':
			return (ctx.onThisDayViewedCount ?? 0) >= c.count;
		case 'homework-entries':
			return (ctx.homeworkEntryCount ?? 0) >= c.count;
		case 'entries-same-day':
			return (ctx.sameDayEntriesCount ?? 0) >= c.count;
		case 'entry-word-count':
			return (ctx.wordCount ?? 0) >= c.minWords;
	}
}

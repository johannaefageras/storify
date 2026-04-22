import { describe, it, expect } from 'vitest';
import { BADGES, type BadgeCriterion } from '$lib/data/badges';
import { tones } from '$lib/data/tones';
import {
	BADGES_BY_EVENT,
	evaluateCriterion,
	type BadgeEvent,
	type EvaluationContext
} from './evaluate';

describe('BADGES_BY_EVENT', () => {
	it('covers every badge at least once', () => {
		const indexed = new Set<string>();
		for (const list of Object.values(BADGES_BY_EVENT)) {
			for (const b of list) indexed.add(b.id);
		}
		const missing = BADGES.filter((b) => !indexed.has(b.id));
		expect(missing).toEqual([]);
	});

	it('routes entries-total to entry-created only', () => {
		const created = BADGES_BY_EVENT['entry-created'].map((b) => b.id);
		expect(created).toContain('forsta-raden');
		expect(BADGES_BY_EVENT['entry-shared'].map((b) => b.id)).not.toContain('forsta-raden');
	});

	it('routes entry-with-low-mood to both entry-created and entry-updated', () => {
		const onCreate = BADGES_BY_EVENT['entry-created'].map((b) => b.id);
		const onUpdate = BADGES_BY_EVENT['entry-updated'].map((b) => b.id);
		expect(onCreate).toContain('trots-allt');
		expect(onUpdate).toContain('trots-allt');
	});
});

describe('evaluateCriterion — event-coincident criteria', () => {
	const eventOnly: BadgeCriterion['type'][] = [
		'account-created',
		'first-login',
		'newsletter-subscribed',
		'notifications-enabled',
		'community-entry-read',
		'revisited-entry',
		'regenerated-in-new-tone',
		'entry-edited',
		'entry-deleted',
		'entry-archived'
	];
	for (const type of eventOnly) {
		it(`${type} returns true with empty ctx`, () => {
			expect(evaluateCriterion({ type } as BadgeCriterion, {})).toBe(true);
		});
	}

	it('profile-photo-uploaded requires a persisted profile photo signal', () => {
		const c: BadgeCriterion = { type: 'profile-photo-uploaded' };
		expect(evaluateCriterion(c, {})).toBe(false);
		expect(evaluateCriterion(c, { profileHasPhoto: false })).toBe(false);
		expect(evaluateCriterion(c, { profileHasPhoto: true })).toBe(true);
	});
});

describe('evaluateCriterion — counts', () => {
	it('entries-total gated on threshold', () => {
		const c: BadgeCriterion = { type: 'entries-total', count: 10 };
		expect(evaluateCriterion(c, { totalEntries: 9 })).toBe(false);
		expect(evaluateCriterion(c, { totalEntries: 10 })).toBe(true);
		expect(evaluateCriterion(c, {})).toBe(false);
	});

	it('entries-by-mode reads the right slot', () => {
		const c: BadgeCriterion = { type: 'entries-by-mode', mode: 'interview', count: 5 };
		expect(evaluateCriterion(c, { entriesByMode: { interview: 4 } })).toBe(false);
		expect(evaluateCriterion(c, { entriesByMode: { interview: 5, quick: 0 } })).toBe(true);
		expect(evaluateCriterion(c, { entriesByMode: { quick: 99 } })).toBe(false);
	});

	it('all-writing-modes-used needs 4 distinct modes', () => {
		const c: BadgeCriterion = { type: 'all-writing-modes-used' };
		expect(evaluateCriterion(c, { distinctModesUsed: 3 })).toBe(false);
		expect(evaluateCriterion(c, { distinctModesUsed: 4 })).toBe(true);
	});

	it('all-tones-used compares against full tone list', () => {
		const c: BadgeCriterion = { type: 'all-tones-used' };
		expect(evaluateCriterion(c, { uniqueTonesUsed: tones.length - 1 })).toBe(false);
		expect(evaluateCriterion(c, { uniqueTonesUsed: tones.length })).toBe(true);
	});

	it('entries-cover-all-hours needs 24 unique hours', () => {
		const c: BadgeCriterion = { type: 'entries-cover-all-hours' };
		expect(evaluateCriterion(c, { hoursCovered: 23 })).toBe(false);
		expect(evaluateCriterion(c, { hoursCovered: 24 })).toBe(true);
	});

	it('entries-across-all-zodiac-signs needs all 12', () => {
		const c: BadgeCriterion = { type: 'entries-across-all-zodiac-signs' };
		expect(evaluateCriterion(c, { uniqueZodiacSigns: 11 })).toBe(false);
		expect(evaluateCriterion(c, { uniqueZodiacSigns: 12 })).toBe(true);
	});
});

describe('evaluateCriterion — entry-time windows', () => {
	it('entries-at-midnight: within 00:00:00–00:00:59', () => {
		const c: BadgeCriterion = { type: 'entries-at-midnight' };
		const d = (h: number, m: number) => new Date(2025, 0, 15, h, m, 30);
		expect(evaluateCriterion(c, { createdAt: d(0, 0) })).toBe(true);
		expect(evaluateCriterion(c, { createdAt: d(0, 1) })).toBe(false);
		expect(evaluateCriterion(c, { createdAt: d(23, 59) })).toBe(false);
		expect(evaluateCriterion(c, {})).toBe(false);
	});

	it('entry-on-birthday matches month/day', () => {
		const c: BadgeCriterion = { type: 'entry-on-birthday' };
		expect(
			evaluateCriterion(c, {
				createdAt: new Date(2025, 4, 7, 12, 0),
				birthday: { month: 5, day: 7 }
			})
		).toBe(true);
		expect(
			evaluateCriterion(c, {
				createdAt: new Date(2025, 4, 8, 12, 0),
				birthday: { month: 5, day: 7 }
			})
		).toBe(false);
		expect(evaluateCriterion(c, { createdAt: new Date(), birthday: null })).toBe(false);
		expect(evaluateCriterion(c, { birthday: { month: 5, day: 7 } })).toBe(false);
	});

	it('entry-on-birthday prefers entryDate for backdated entries', () => {
		const c: BadgeCriterion = { type: 'entry-on-birthday' };
		expect(
			evaluateCriterion(c, {
				createdAt: new Date(2025, 3, 22, 12, 0),
				entryDate: '2025-05-07',
				birthday: { month: 5, day: 7 }
			})
		).toBe(true);
	});

	it('entry-on-christmas-eve is Dec 24', () => {
		const c: BadgeCriterion = { type: 'entry-on-christmas-eve' };
		expect(evaluateCriterion(c, { createdAt: new Date(2025, 11, 24, 18, 0) })).toBe(true);
		expect(evaluateCriterion(c, { createdAt: new Date(2025, 11, 25, 0, 0) })).toBe(false);
	});

	it('entry-on-christmas-eve prefers entryDate for backdated entries', () => {
		const c: BadgeCriterion = { type: 'entry-on-christmas-eve' };
		expect(
			evaluateCriterion(c, {
				createdAt: new Date(2025, 3, 22, 12, 0),
				entryDate: '2025-12-24'
			})
		).toBe(true);
	});
});

describe('evaluateCriterion — mood', () => {
	it('entry-with-low-mood requires mood <= 2', () => {
		const c: BadgeCriterion = { type: 'entry-with-low-mood' };
		expect(evaluateCriterion(c, { moodLevel: 1 })).toBe(true);
		expect(evaluateCriterion(c, { moodLevel: 2 })).toBe(true);
		expect(evaluateCriterion(c, { moodLevel: 3 })).toBe(false);
		expect(evaluateCriterion(c, { moodLevel: 0 })).toBe(true);
		expect(evaluateCriterion(c, {})).toBe(false);
	});

	it('entry-with-max-stats requires all three at 10', () => {
		const c: BadgeCriterion = { type: 'entry-with-max-stats' };
		expect(
			evaluateCriterion(c, { moodLevel: 10, sleepQuality: 10, energyLevel: 10 })
		).toBe(true);
		expect(
			evaluateCriterion(c, { moodLevel: 10, sleepQuality: 10, energyLevel: 9 })
		).toBe(false);
		expect(evaluateCriterion(c, { moodLevel: 10 })).toBe(false);
	});
});

describe('evaluateCriterion — interviewer laugh', () => {
	const c: BadgeCriterion = { type: 'made-interviewer-laugh' };

	it('honors explicit flag', () => {
		expect(evaluateCriterion(c, { interviewerLaughed: true })).toBe(true);
	});

	it('scans transcript for laugh tokens in assistant messages', () => {
		expect(
			evaluateCriterion(c, {
				chatTranscript: [
					{ role: 'user', content: 'haha roligt' },
					{ role: 'assistant', content: 'Det var faktiskt kul 😂' }
				]
			})
		).toBe(true);
	});

	it('ignores laugh tokens from user messages alone', () => {
		expect(
			evaluateCriterion(c, {
				chatTranscript: [{ role: 'user', content: 'hahahaha' }]
			})
		).toBe(false);
	});

	it('returns false with no signal', () => {
		expect(evaluateCriterion(c, {})).toBe(false);
	});
});

describe('evaluateCriterion — streaks & gaps', () => {
	it('entries-streak', () => {
		const c: BadgeCriterion = { type: 'entries-streak', days: 7 };
		expect(evaluateCriterion(c, { currentStreakDays: 6 })).toBe(false);
		expect(evaluateCriterion(c, { currentStreakDays: 7 })).toBe(true);
	});

	it('returned-after-days', () => {
		const c: BadgeCriterion = { type: 'returned-after-days', days: 30 };
		expect(evaluateCriterion(c, { daysSinceLastEntry: 29 })).toBe(false);
		expect(evaluateCriterion(c, { daysSinceLastEntry: 30 })).toBe(true);
	});

	it('entries-weekend-streak', () => {
		const c: BadgeCriterion = { type: 'entries-weekend-streak', weeks: 4 };
		expect(evaluateCriterion(c, { weekendStreakWeeks: 3 })).toBe(false);
		expect(evaluateCriterion(c, { weekendStreakWeeks: 4 })).toBe(true);
	});
});

describe('evaluateCriterion — word count', () => {
	it('entry-word-count', () => {
		const c: BadgeCriterion = { type: 'entry-word-count', minWords: 1000 };
		expect(evaluateCriterion(c, { wordCount: 999 })).toBe(false);
		expect(evaluateCriterion(c, { wordCount: 1000 })).toBe(true);
	});
});

describe('every catalogue badge has a handler', () => {
	// If this fails it means BADGES has a criterion type evaluateCriterion
	// doesn't handle — the switch's exhaustiveness will already fail at
	// compile time, but this is a runtime safety net for future additions.
	it.each(BADGES.map((b) => [b.id, b.criterion] as const))(
		'%s',
		(_id, criterion) => {
			const ctx: EvaluationContext = {};
			expect(() => evaluateCriterion(criterion, ctx)).not.toThrow();
		}
	);
});

describe('BADGES_BY_EVENT covers all known events', () => {
	const expectedEvents: BadgeEvent[] = [
		'account-created',
		'first-login',
		'profile-updated',
		'profile-photo-uploaded',
		'newsletter-subscribed',
		'notifications-enabled',
		'entry-created',
		'entry-updated',
		'entry-deleted',
		'entry-archived',
		'entry-shared',
		'entry-viewed-own',
		'entry-viewed-community',
		'random-tone-used',
		'regenerated-in-new-tone',
		'on-this-day-viewed',
		'read-fine-print'
	];
	for (const ev of expectedEvents) {
		it(`has entry for ${ev}`, () => {
			expect(BADGES_BY_EVENT[ev]).toBeDefined();
		});
	}
});

import { describe, it, expect } from 'vitest';
import {
	buildWeeklyContent,
	makeExcerpt,
	stripMarkdown,
	getIsoWeekNumber,
	pickPromptOfTheWeek,
	countWords,
	NUDGE_PROMPTS_SV,
	type EntryRow,
	type WeeklyProfile
} from './selectWeeklyContent';

const NOW = new Date('2026-04-19T09:00:00Z'); // a Sunday

function entry(overrides: Partial<EntryRow> = {}): EntryRow {
	return {
		id: overrides.id ?? crypto.randomUUID(),
		created_at: overrides.created_at ?? '2026-04-18T10:00:00Z',
		generated_text: overrides.generated_text ?? 'En vanlig dag i april.',
		tone_id: overrides.tone_id ?? 'classic',
		emojis: overrides.emojis ?? []
	};
}

describe('stripMarkdown', () => {
	it('removes headings, bold, italic, links and code', () => {
		const input =
			'# Rubrik\n**fet** och *kursiv* och `kod` och [länk](https://x.se) och ~~strike~~';
		expect(stripMarkdown(input)).toBe('Rubrik fet och kursiv och kod och länk och strike');
	});

	it('collapses whitespace', () => {
		expect(stripMarkdown('hej\n\n\n  världen')).toBe('hej världen');
	});
});

describe('makeExcerpt', () => {
	it('returns text unchanged when shorter than limit', () => {
		expect(makeExcerpt('kort text')).toBe('kort text');
	});

	it('cuts at word boundary and appends ellipsis', () => {
		const long = 'alphabet '.repeat(40).trim();
		const excerpt = makeExcerpt(long, 50);
		expect(excerpt.endsWith('…')).toBe(true);
		expect(excerpt.length).toBeLessThanOrEqual(51);
		const words = excerpt.replace(/…$/, '').trim().split(/\s+/);
		for (const w of words) expect(w).toBe('alphabet');
	});

	it('strips markdown before cutting', () => {
		const input = '**fet text** som fortsätter och fortsätter mycket mycket länge';
		const excerpt = makeExcerpt(input, 30);
		expect(excerpt).not.toContain('**');
	});
});

describe('getIsoWeekNumber', () => {
	it('returns the correct ISO week for known dates', () => {
		expect(getIsoWeekNumber(new Date('2026-01-05T00:00:00Z'))).toBe(2);
		expect(getIsoWeekNumber(new Date('2025-12-29T00:00:00Z'))).toBe(1);
	});
});

describe('pickPromptOfTheWeek', () => {
	it('returns a prompt from the pool deterministically', () => {
		const p1 = pickPromptOfTheWeek(NOW);
		const p2 = pickPromptOfTheWeek(NOW);
		expect(p1).toBe(p2);
		expect(NUDGE_PROMPTS_SV).toContain(p1);
	});
});

describe('countWords', () => {
	it('counts words after stripping markdown', () => {
		expect(countWords('**ett** två tre')).toBe(3);
		expect(countWords('')).toBe(0);
	});
});

describe('buildWeeklyContent', () => {
	it('returns skip for a brand-new user with no entries', () => {
		const profile: WeeklyProfile = {
			id: 'u1',
			created_at: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
		};
		const result = buildWeeklyContent([], profile, NOW);
		expect(result.variant).toBe('skip');
		if (result.variant === 'skip') {
			expect(result.reason).toBe('new_user_no_entries');
		}
	});

	it('returns nudge for an established user with no entries this week', () => {
		const profile: WeeklyProfile = {
			id: 'u1',
			created_at: new Date(NOW.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()
		};
		const result = buildWeeklyContent([], profile, NOW);
		expect(result.variant).toBe('nudge');
		if (result.variant === 'nudge') {
			expect(NUDGE_PROMPTS_SV).toContain(result.promptText);
		}
	});

	it('returns recap with a single entry', () => {
		const profile: WeeklyProfile = {
			id: 'u1',
			created_at: '2025-01-01T00:00:00Z'
		};
		const entries = [
			entry({
				id: 'e1',
				created_at: '2026-04-14T10:00:00Z',
				generated_text: 'En lugn måndag med kaffe.',
				tone_id: 'cozy',
				emojis: ['☕']
			})
		];
		const result = buildWeeklyContent(entries, profile, NOW);
		expect(result.variant).toBe('recap');
		if (result.variant === 'recap') {
			expect(result.entries).toHaveLength(1);
			expect(result.entries[0].id).toBe('e1');
			expect(result.entries[0].excerpt).toContain('lugn måndag');
			expect(result.entries[0].emojis).toEqual(['☕']);
			expect(result.stats.entriesCount).toBe(1);
			expect(result.stats.topTone).toBe('cozy');
			expect(result.stats.totalWords).toBeGreaterThan(0);
		}
	});

	it('returns recap with at most 5 entries and computes top tone across all entries', () => {
		const profile: WeeklyProfile = {
			id: 'u1',
			created_at: '2025-01-01T00:00:00Z'
		};
		const entries: EntryRow[] = [
			entry({ tone_id: 'classic', generated_text: 'ett två tre' }),
			entry({ tone_id: 'cozy', generated_text: 'fyra fem sex' }),
			entry({ tone_id: 'cozy', generated_text: 'sju åtta nio' }),
			entry({ tone_id: 'classic', generated_text: 'tio elva tolv' }),
			entry({ tone_id: 'cozy', generated_text: 'tretton fjorton femton' }),
			entry({ tone_id: 'cozy', generated_text: 'sexton sjutton arton' }),
			entry({ tone_id: 'classic', generated_text: 'nitton tjugo tjugoett' })
		];
		const result = buildWeeklyContent(entries, profile, NOW);
		expect(result.variant).toBe('recap');
		if (result.variant === 'recap') {
			expect(result.entries).toHaveLength(5);
			expect(result.stats.entriesCount).toBe(7);
			expect(result.stats.topTone).toBe('cozy');
			expect(result.stats.totalWords).toBe(21);
		}
	});

	it('excerpt is plain text even when source contains markdown', () => {
		const profile: WeeklyProfile = {
			id: 'u1',
			created_at: '2025-01-01T00:00:00Z'
		};
		const entries = [
			entry({
				generated_text: '# Rubrik\n**fet** och [länk](https://x.se) tjohej'
			})
		];
		const result = buildWeeklyContent(entries, profile, NOW);
		if (result.variant === 'recap') {
			expect(result.entries[0].excerpt).not.toContain('**');
			expect(result.entries[0].excerpt).not.toContain('[');
			expect(result.entries[0].excerpt).not.toContain('#');
		}
	});
});

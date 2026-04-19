import type { SupabaseClient } from '@supabase/supabase-js';

export type EntryRow = {
	id: string;
	created_at: string;
	generated_text: string;
	tone_id: string;
	emojis: string[] | null;
};

export type EntryExcerpt = {
	id: string;
	date: string;
	excerpt: string;
	toneId: string;
	emojis: string[];
};

export type WeekStats = {
	entriesCount: number;
	topTone?: string;
	totalWords: number;
};

export type WeeklyContent =
	| { variant: 'recap'; entries: EntryExcerpt[]; stats: WeekStats }
	| { variant: 'nudge'; promptText: string }
	| { variant: 'skip'; reason: 'new_user_no_entries' };

export type WeeklyProfile = {
	id: string;
	created_at: string;
};

const EXCERPT_MAX_CHARS = 150;
const MAX_ENTRIES_IN_RECAP = 5;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const NUDGE_PROMPTS_SV: readonly string[] = [
	'Vad överraskade dig den här veckan?',
	'Vilket ögonblick vill du minnas om ett år?',
	'Vad gjorde dig glad i veckan?',
	'Vad har du lärt dig om dig själv?',
	'Vem är du tacksam för just nu, och varför?',
	'Vad har känts tungt — och hur bar du det?',
	'Vilken liten sak i vardagen uppskattar du mest?',
	'Vad skulle du vilja göra mer av nästa vecka?',
	'Vilken känsla återkommer oftast hos dig just nu?',
	'Vad gjorde du den här veckan som du är stolt över?'
];

export function getIsoWeekNumber(d: Date): number {
	const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
	const dayNum = date.getUTCDay() || 7;
	date.setUTCDate(date.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function pickPromptOfTheWeek(now: Date = new Date()): string {
	const week = getIsoWeekNumber(now);
	return NUDGE_PROMPTS_SV[week % NUDGE_PROMPTS_SV.length];
}

export function stripMarkdown(input: string): string {
	if (!input) return '';
	return input
		.replace(/`{3}[\s\S]*?`{3}/g, '')
		.replace(/`([^`]*)`/g, '$1')
		.replace(/!\[[^\]]*]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
		.replace(/^#+\s*/gm, '')
		.replace(/^>\s?/gm, '')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/__([^_]+)__/g, '$1')
		.replace(/_([^_]+)_/g, '$1')
		.replace(/~~([^~]+)~~/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

export function makeExcerpt(text: string, maxChars: number = EXCERPT_MAX_CHARS): string {
	const plain = stripMarkdown(text);
	if (plain.length <= maxChars) return plain;
	const slice = plain.slice(0, maxChars);
	const cut = slice.replace(/\s+\S*$/, '');
	const base = cut.length > 0 ? cut : slice;
	return base.replace(/[.,;:!?\s]+$/, '') + '…';
}

export function formatSwedishDate(d: Date): string {
	return new Intl.DateTimeFormat('sv-SE', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	}).format(d);
}

export function countWords(text: string): number {
	const plain = stripMarkdown(text);
	if (!plain) return 0;
	return plain.split(/\s+/).filter(Boolean).length;
}

export function buildWeeklyContent(
	entries: EntryRow[],
	profile: WeeklyProfile,
	now: Date = new Date()
): WeeklyContent {
	if (entries.length === 0) {
		const accountAgeMs = now.getTime() - new Date(profile.created_at).getTime();
		if (accountAgeMs < SEVEN_DAYS_MS) {
			return { variant: 'skip', reason: 'new_user_no_entries' };
		}
		return { variant: 'nudge', promptText: pickPromptOfTheWeek(now) };
	}

	const selected = entries.slice(0, MAX_ENTRIES_IN_RECAP);
	const excerpts: EntryExcerpt[] = selected.map((e) => ({
		id: e.id,
		date: formatSwedishDate(new Date(e.created_at)),
		excerpt: makeExcerpt(e.generated_text),
		toneId: e.tone_id,
		emojis: e.emojis ?? []
	}));

	const toneCounts = new Map<string, number>();
	for (const e of entries) {
		toneCounts.set(e.tone_id, (toneCounts.get(e.tone_id) ?? 0) + 1);
	}
	let topTone: string | undefined;
	let topCount = 0;
	for (const [tone, count] of toneCounts) {
		if (count > topCount) {
			topCount = count;
			topTone = tone;
		}
	}

	const totalWords = entries.reduce((sum, e) => sum + countWords(e.generated_text), 0);

	return {
		variant: 'recap',
		entries: excerpts,
		stats: {
			entriesCount: entries.length,
			topTone,
			totalWords
		}
	};
}

export async function selectWeeklyContent(
	supabase: SupabaseClient,
	profile: WeeklyProfile,
	now: Date = new Date()
): Promise<WeeklyContent> {
	const sinceIso = new Date(now.getTime() - SEVEN_DAYS_MS).toISOString();
	const { data, error } = await supabase
		.from('entries')
		.select('id, created_at, generated_text, tone_id, emojis')
		.eq('user_id', profile.id)
		.gte('created_at', sinceIso)
		.order('created_at', { ascending: false });

	if (error) throw error;
	return buildWeeklyContent((data ?? []) as EntryRow[], profile, now);
}

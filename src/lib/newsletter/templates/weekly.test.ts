import { describe, it, expect } from 'vitest';
import { renderWeeklyEmail } from './weekly';
import type { WeeklyContent } from '../selectWeeklyContent';

const UNSUB = 'https://mystorify.se/unsubscribe/tok-abc?kind=weekly';
const NEW = 'https://mystorify.se/wizard?utm_source=weekly&utm_medium=email';

describe('renderWeeklyEmail', () => {
	it('renders recap with entries and stats in Swedish', () => {
		const content: WeeklyContent = {
			variant: 'recap',
			entries: [
				{
					id: 'e1',
					date: 'måndag 14 april',
					excerpt: 'En lugn måndag med kaffe och lite läsning.',
					toneId: 'classic',
					emojis: ['☕']
				},
				{
					id: 'e2',
					date: 'onsdag 16 april',
					excerpt: 'Promenad i parken, blommorna blommar.',
					toneId: 'classic',
					emojis: []
				}
			],
			stats: { entriesCount: 2, topTone: 'classic', totalWords: 14 }
		};

		const { subject, html } = renderWeeklyEmail({
			firstName: 'Johanna',
			content,
			unsubscribeUrl: UNSUB,
			newEntryUrl: NEW
		});

		expect(subject).toBe('Din vecka: 2 inlägg');
		expect(html).toContain('Hej Johanna!');
		expect(html).toContain('måndag 14 april');
		expect(html).toContain('En lugn måndag');
		expect(html).toContain('Läs hela inlägget →');
		expect(html).toContain('2 inlägg');
		expect(html).toContain('14 ord');
		expect(html).toContain('Skriv dagens inlägg');
		expect(html).toContain('Avprenumerera');
		expect(html).toContain(UNSUB);
		expect(html).toContain(NEW);
	});

	it('renders nudge variant with prompt in blockquote', () => {
		const content: WeeklyContent = {
			variant: 'nudge',
			promptText: 'Vad överraskade dig den här veckan?'
		};
		const { subject, html } = renderWeeklyEmail({
			firstName: 'Anna',
			content,
			unsubscribeUrl: UNSUB,
			newEntryUrl: NEW
		});

		expect(subject).toBe('En tanke från My Storify');
		expect(html).toContain('Hej Anna!');
		expect(html).toContain('Vad överraskade dig den här veckan?');
		expect(html).toContain('Skriv dagens inlägg');
		expect(html).toContain(UNSUB);
	});

	it('falls back to a friendly greeting when firstName is empty', () => {
		const content: WeeklyContent = {
			variant: 'nudge',
			promptText: 'Vad överraskade dig?'
		};
		const { html } = renderWeeklyEmail({
			firstName: '',
			content,
			unsubscribeUrl: UNSUB,
			newEntryUrl: NEW
		});
		expect(html).toContain('Kära dagboksskrivare');
	});

	it('escapes user-supplied content', () => {
		const content: WeeklyContent = {
			variant: 'recap',
			entries: [
				{
					id: 'e1',
					date: 'måndag 14 april',
					excerpt: 'text <script>alert(1)</script>',
					toneId: 'classic',
					emojis: []
				}
			],
			stats: { entriesCount: 1, topTone: 'classic', totalWords: 4 }
		};
		const { html } = renderWeeklyEmail({
			firstName: '<b>evil</b>',
			content,
			unsubscribeUrl: UNSUB,
			newEntryUrl: NEW
		});
		expect(html).not.toContain('<script>');
		expect(html).not.toContain('<b>evil</b>');
		expect(html).toContain('&lt;script&gt;');
	});

	it('returns empty output for skip variant', () => {
		const content: WeeklyContent = { variant: 'skip', reason: 'new_user_no_entries' };
		const { subject, html } = renderWeeklyEmail({
			firstName: 'Lisa',
			content,
			unsubscribeUrl: UNSUB,
			newEntryUrl: NEW
		});
		expect(subject).toBe('');
		expect(html).toBe('');
	});

	it('builds journal entry links from the configured base', () => {
		const content: WeeklyContent = {
			variant: 'recap',
			entries: [
				{ id: 'abc123', date: 'måndag 14 april', excerpt: 'x', toneId: 'classic', emojis: [] }
			],
			stats: { entriesCount: 1, topTone: 'classic', totalWords: 1 }
		};
		const { html } = renderWeeklyEmail({
			firstName: 'A',
			content,
			unsubscribeUrl: UNSUB,
			newEntryUrl: NEW,
			journalBaseUrl: 'https://mystorify.se/journal'
		});
		expect(html).toContain('https://mystorify.se/journal#entry-abc123');
	});
});

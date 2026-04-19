import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { renderWeeklyEmail } from '../src/lib/newsletter/templates/weekly';
import type { WeeklyContent } from '../src/lib/newsletter/selectWeeklyContent';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../tmp');
mkdirSync(outDir, { recursive: true });

const UNSUB = 'https://mystorify.se/unsubscribe/preview-token?kind=weekly';
const NEW_ENTRY = 'https://mystorify.se/wizard?utm_source=weekly&utm_medium=email';

const recap: WeeklyContent = {
	variant: 'recap',
	entries: [
		{
			id: 'e1',
			date: 'måndag 13 april',
			excerpt:
				'En lugn start på veckan. Kaffe i köket innan de andra vaknade, lite läsning, och en promenad i morgonljuset.',
			toneId: 'classic',
			emojis: ['☕', '📖']
		},
		{
			id: 'e2',
			date: 'tisdag 14 april',
			excerpt:
				'Möten hela förmiddagen, men sedan räddade en oväntad glass i solen dagen. Små saker gör skillnad.',
			toneId: 'classic',
			emojis: ['🍦']
		},
		{
			id: 'e3',
			date: 'torsdag 16 april',
			excerpt: 'Promenad i parken. Körsbären blommar. Kände mig närvarande för första gången på länge.',
			toneId: 'classic',
			emojis: ['🌸']
		},
		{
			id: 'e4',
			date: 'lördag 18 april',
			excerpt:
				'Middag med familjen. Vi pratade om sommarplanerna och jag kände att det faktiskt kommer gå vägen.',
			toneId: 'classic',
			emojis: ['🍝']
		}
	],
	stats: { entriesCount: 4, topTone: 'classic', totalWords: 312 }
};

const nudge: WeeklyContent = {
	variant: 'nudge',
	promptText: 'Vad överraskade dig den här veckan?'
};

function dump(name: string, content: WeeklyContent, firstName: string) {
	const { subject, html } = renderWeeklyEmail({
		firstName,
		content,
		unsubscribeUrl: UNSUB,
		newEntryUrl: NEW_ENTRY
	});
	const file = resolve(outDir, `${name}.html`);
	writeFileSync(file, html);
	console.log(`→ ${file}`);
	console.log(`  subject: ${subject}`);
}

dump('weekly-recap', recap, 'Johanna');
dump('weekly-nudge', nudge, 'Johanna');

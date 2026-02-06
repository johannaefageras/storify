import type { Emoji } from './types.js';

export function shuffleAndPick(emojis: Emoji[], count: number): Emoji[] {
	const shuffled = [...emojis];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled.slice(0, count);
}

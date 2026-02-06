import type { EmojiCategory } from '$lib/types.js';

const colors = [
	'#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
	'#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#10b981', '#e11d48'
];

function circle(color: string): string {
	return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="${color}"/></svg>`;
}

function square(color: string): string {
	return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="3" fill="${color}"/></svg>`;
}

function diamond(color: string): string {
	return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polygon points="12,1 23,12 12,23 1,12" fill="${color}"/></svg>`;
}

function star(color: string): string {
	return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="${color}"/></svg>`;
}

function heart(color: string): string {
	return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21C12 21 3 13.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12 5C12.09 3.81 13.76 3 15.5 3C18.58 3 21 5.42 21 8.5C21 13.5 12 21 12 21Z" fill="${color}"/></svg>`;
}

function hexagon(color: string): string {
	return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="${color}"/></svg>`;
}

const shapes = [circle, square, diamond, star, heart, hexagon];
const categoryNames = ['Smileys', 'Animals', 'Food', 'Activities', 'Travel', 'Objects'];

function generateEmojis(categoryIndex: number, amount: number) {
	const shapeFn = shapes[categoryIndex];
	return Array.from({ length: amount }, (_, i) => ({
		id: `cat${categoryIndex}-${i}`,
		name: `${categoryNames[categoryIndex]} ${i + 1}`,
		svg: shapeFn(colors[i % colors.length])
	}));
}

// Each category has 100 emojis (more than the 72 displayed), so random selection kicks in
export const sampleCategories: EmojiCategory[] = categoryNames.map((name, i) => ({
	name,
	icon: shapes[i](colors[i]),
	emojis: generateEmojis(i, 100)
}));

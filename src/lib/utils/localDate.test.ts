import { describe, expect, it } from 'vitest';

import { formatLocalDateISO, getSwedishDiaryDate } from './localDate';

describe('formatLocalDateISO', () => {
	it('formats the local calendar date without UTC drift', () => {
		const localMidnight = new Date(2024, 0, 1, 0, 30);

		expect(formatLocalDateISO(localMidnight)).toBe('2024-01-01');
	});
});

describe('getSwedishDiaryDate', () => {
	it('formats Swedish diary date parts', () => {
		const result = getSwedishDiaryDate(new Date(2024, 5, 15, 12));

		expect(result).toEqual({
			weekday: 'Lördag',
			date: '15 juni 2024',
			dateISO: '2024-06-15'
		});
	});
});

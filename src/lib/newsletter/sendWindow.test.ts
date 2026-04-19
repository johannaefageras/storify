import { describe, it, expect } from 'vitest';
import { isDueNow, processInBatches } from './sendWindow';

// 2026-04-19 is a Sunday. 07:00 UTC == 09:00 Europe/Stockholm (CEST, UTC+2).
const SUNDAY_0700_UTC = new Date(Date.UTC(2026, 3, 19, 7, 0, 0));
// 2026-04-20 is a Monday. 07:00 UTC == 09:00 Europe/Stockholm.
const MONDAY_0700_UTC = new Date(Date.UTC(2026, 3, 20, 7, 0, 0));

describe('isDueNow', () => {
	it('returns true for Sunday 09:00 in Europe/Stockholm', () => {
		expect(isDueNow('Europe/Stockholm', SUNDAY_0700_UTC)).toBe(true);
	});

	it('returns false one hour earlier', () => {
		const sunday0600UTC = new Date(Date.UTC(2026, 3, 19, 6, 0, 0));
		expect(isDueNow('Europe/Stockholm', sunday0600UTC)).toBe(false);
	});

	it('returns false one hour later', () => {
		const sunday0800UTC = new Date(Date.UTC(2026, 3, 19, 8, 0, 0));
		expect(isDueNow('Europe/Stockholm', sunday0800UTC)).toBe(false);
	});

	it('returns false on Monday at the same UTC time', () => {
		expect(isDueNow('Europe/Stockholm', MONDAY_0700_UTC)).toBe(false);
	});

	it('handles timezones west of UTC (America/New_York)', () => {
		// 2026-04-19 13:00 UTC == 09:00 America/New_York (EDT, UTC-4).
		const sunday1300UTC = new Date(Date.UTC(2026, 3, 19, 13, 0, 0));
		expect(isDueNow('America/New_York', sunday1300UTC)).toBe(true);
		// Same UTC, wrong timezone.
		expect(isDueNow('Europe/Stockholm', sunday1300UTC)).toBe(false);
	});

	it('handles timezones east of UTC (Asia/Tokyo)', () => {
		// 2026-04-19 00:00 UTC == 09:00 Asia/Tokyo (JST, UTC+9).
		const sunday0000UTC = new Date(Date.UTC(2026, 3, 19, 0, 0, 0));
		expect(isDueNow('Asia/Tokyo', sunday0000UTC)).toBe(true);
	});

	it('returns false for invalid timezone strings', () => {
		expect(isDueNow('Not/A/Real_Zone', SUNDAY_0700_UTC)).toBe(false);
	});
});

describe('processInBatches', () => {
	it('processes every item', async () => {
		const items = [1, 2, 3, 4, 5];
		const seen: number[] = [];
		await processInBatches(items, 2, async (n) => {
			seen.push(n);
		});
		expect(seen.sort()).toEqual([1, 2, 3, 4, 5]);
	});

	it('is a no-op on an empty list', async () => {
		let calls = 0;
		await processInBatches([], 4, async () => {
			calls++;
		});
		expect(calls).toBe(0);
	});

	it('respects the concurrency cap', async () => {
		const items = Array.from({ length: 8 }, (_, i) => i);
		let active = 0;
		let peak = 0;
		await processInBatches(items, 3, async () => {
			active++;
			peak = Math.max(peak, active);
			await new Promise((r) => setTimeout(r, 5));
			active--;
		});
		expect(peak).toBeLessThanOrEqual(3);
	});

	it('swallows per-item errors without aborting the rest', async () => {
		const items = [1, 2, 3];
		const seen: number[] = [];
		await processInBatches(items, 2, async (n) => {
			if (n === 2) throw new Error('boom');
			seen.push(n);
		});
		expect(seen.sort()).toEqual([1, 3]);
	});
});

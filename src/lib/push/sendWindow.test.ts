import { describe, it, expect } from 'vitest';
import { isLocalHourNow, localDateString } from './sendWindow';

describe('isLocalHourNow', () => {
	it('returns true when the target hour matches local time in the zone', () => {
		// 19:30 UTC = 20:30 in Stockholm (CET, +1 winter — but DST means +2 in May).
		// Pick a fixed instant where Europe/Stockholm is exactly 20:xx.
		// 2026-01-15T19:30:00Z → CET = 20:30
		const now = new Date('2026-01-15T19:30:00Z');
		expect(isLocalHourNow('Europe/Stockholm', 20, now)).toBe(true);
	});

	it('returns false when the hour does not match', () => {
		const now = new Date('2026-01-15T19:30:00Z');
		expect(isLocalHourNow('Europe/Stockholm', 21, now)).toBe(false);
	});

	it('honors timezone differences', () => {
		// Same instant — different local hours
		const now = new Date('2026-01-15T19:30:00Z');
		expect(isLocalHourNow('Europe/Stockholm', 20, now)).toBe(true); // CET
		expect(isLocalHourNow('America/New_York', 14, now)).toBe(true); // EST
		expect(isLocalHourNow('Asia/Tokyo', 4, now)).toBe(true); // JST next day
	});

	it('returns false for invalid timezone', () => {
		expect(isLocalHourNow('Not/Real', 20, new Date())).toBe(false);
	});

	it('returns false when target hour is impossible (e.g., 25)', () => {
		// formatToParts won't produce hour=25; result depends on real hour value
		const now = new Date('2026-01-15T19:30:00Z');
		expect(isLocalHourNow('Europe/Stockholm', 25, now)).toBe(false);
	});

	it('handles midnight (hour 0)', () => {
		// 2026-01-15T23:30:00Z → CET = 00:30
		const now = new Date('2026-01-15T23:30:00Z');
		expect(isLocalHourNow('Europe/Stockholm', 0, now)).toBe(true);
	});
});

describe('localDateString', () => {
	it('returns the local date in ISO YYYY-MM-DD format', () => {
		// 2026-01-15T23:30:00Z → CET = 2026-01-16 00:30
		const now = new Date('2026-01-15T23:30:00Z');
		expect(localDateString('Europe/Stockholm', now)).toBe('2026-01-16');
	});

	it('returns the same UTC date when timezone matches UTC', () => {
		const now = new Date('2026-05-11T12:00:00Z');
		expect(localDateString('UTC', now)).toBe('2026-05-11');
	});

	it('respects negative offsets', () => {
		// 2026-01-15T02:30:00Z → New York (EST UTC-5) = 2026-01-14 21:30
		const now = new Date('2026-01-15T02:30:00Z');
		expect(localDateString('America/New_York', now)).toBe('2026-01-14');
	});

	it('returns null for invalid timezone', () => {
		expect(localDateString('Not/Real', new Date())).toBeNull();
	});

	it('uses now() default when called without explicit date', () => {
		const result = localDateString('UTC');
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});

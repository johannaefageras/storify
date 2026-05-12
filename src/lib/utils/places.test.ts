import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));

import { getPlaceCategory, isAddress, searchPlaces } from './places';

describe('getPlaceCategory', () => {
	it('maps establishment types to Swedish labels', () => {
		expect(getPlaceCategory(['restaurant'])).toBe('Restaurang');
		expect(getPlaceCategory(['cafe'])).toBe('Kafé');
		expect(getPlaceCategory(['gym'])).toBe('Gym');
		expect(getPlaceCategory(['gas_station'])).toBe('Bensinstation');
	});

	it('maps address types when no establishment match', () => {
		expect(getPlaceCategory(['route'])).toBe('Gata');
		expect(getPlaceCategory(['postal_town'])).toBe('Postort');
		expect(getPlaceCategory(['country'])).toBe('Land');
	});

	it('prefers establishment over address mapping', () => {
		expect(getPlaceCategory(['route', 'restaurant'])).toBe('Restaurang');
	});

	it('returns generic "Verksamhet" for unknown establishment', () => {
		expect(getPlaceCategory(['some_unknown_type', 'establishment'])).toBe('Verksamhet');
	});

	it('returns generic "Plats" for unknown geocode', () => {
		expect(getPlaceCategory(['some_unknown_type', 'geocode'])).toBe('Plats');
	});

	it('prefers specific establishment over generic establishment fallback', () => {
		expect(getPlaceCategory(['restaurant', 'establishment'])).toBe('Restaurang');
	});

	it('returns null when no types match', () => {
		expect(getPlaceCategory([])).toBeNull();
		expect(getPlaceCategory(['unknown_one', 'unknown_two'])).toBeNull();
	});

	it('returns first matching establishment when multiple match', () => {
		// Iteration order follows the input array
		const result = getPlaceCategory(['bar', 'restaurant']);
		expect(result).toBe('Bar');
	});
});

describe('isAddress', () => {
	it('returns true for pure address types', () => {
		expect(isAddress(['street_address'])).toBe(true);
		expect(isAddress(['route'])).toBe(true);
		expect(isAddress(['geocode'])).toBe(true);
		expect(isAddress(['premise'])).toBe(true);
	});

	it('returns false when type list includes establishment', () => {
		expect(isAddress(['route', 'establishment'])).toBe(false);
		expect(isAddress(['geocode', 'establishment', 'restaurant'])).toBe(false);
	});

	it('returns false when no address types present', () => {
		expect(isAddress(['restaurant'])).toBe(false);
		expect(isAddress([])).toBe(false);
		expect(isAddress(['locality'])).toBe(false); // locality is in addressMap but not addressTypes
	});

	it('returns true for subpremise without establishment', () => {
		expect(isAddress(['subpremise'])).toBe(true);
	});

	it('returns true for intersection', () => {
		expect(isAddress(['intersection'])).toBe(true);
	});
});

describe('searchPlaces', () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		fetchMock.mockReset();
		vi.stubGlobal('fetch', fetchMock);
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns places from a successful response', async () => {
		const places = [{ id: '1', name: 'A', address: 'a', fullText: 'A, a', types: ['cafe'] }];
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: true, places }), { status: 200 })
		);
		const result = await searchPlaces('caf');
		expect(result).toEqual(places);
	});

	it('returns [] for short input without calling fetch', async () => {
		expect(await searchPlaces('')).toEqual([]);
		expect(await searchPlaces('a')).toEqual([]);
		expect(await searchPlaces(' ')).toEqual([]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('appends coordinates to the URL when provided', async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: true, places: [] }), { status: 200 })
		);
		await searchPlaces('caf', { latitude: 59.3, longitude: 18.1 });
		const url = fetchMock.mock.calls[0][0] as string;
		expect(url).toContain('lat=59.3');
		expect(url).toContain('lon=18.1');
		expect(url).toContain('input=caf');
	});

	it('returns [] when response is not ok', async () => {
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		expect(await searchPlaces('caf')).toEqual([]);
		logSpy.mockRestore();
	});

	it('returns [] when success is false', async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: false, error: 'nope' }), { status: 200 })
		);
		expect(await searchPlaces('caf')).toEqual([]);
	});

	it('returns [] when fetch throws', async () => {
		fetchMock.mockRejectedValueOnce(new Error('network'));
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		expect(await searchPlaces('caf')).toEqual([]);
		logSpy.mockRestore();
	});

	it('url-encodes the input', async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: true, places: [] }), { status: 200 })
		);
		await searchPlaces('a&b c');
		const url = fetchMock.mock.calls[0][0] as string;
		expect(url).toContain('input=a%26b%20c');
	});
});

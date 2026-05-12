import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));

import { fetchLocationName } from './geocoding';

const fetchMock = vi.fn();

beforeEach(() => {
	fetchMock.mockReset();
	vi.stubGlobal('fetch', fetchMock);
	vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

const coords = { latitude: 59.33, longitude: 18.07 };

describe('fetchLocationName', () => {
	it('returns location info from a successful response', async () => {
		const location = { name: 'Södermalm, Stockholm', locality: 'Stockholm', area: 'Södermalm' };
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: true, location }), { status: 200 })
		);
		expect(await fetchLocationName(coords)).toEqual(location);
	});

	it('includes lat/lon in the URL', async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: true, location: { name: 'x', locality: 'x', area: 'x' } }), {
				status: 200
			})
		);
		await fetchLocationName(coords);
		const url = fetchMock.mock.calls[0][0] as string;
		expect(url).toContain('lat=59.33');
		expect(url).toContain('lon=18.07');
	});

	it('returns null when response is not ok', async () => {
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
		expect(await fetchLocationName(coords)).toBeNull();
	});

	it('returns null when success is false', async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: false, error: 'no results' }), { status: 200 })
		);
		expect(await fetchLocationName(coords)).toBeNull();
	});

	it('returns null when location is missing', async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: true }), { status: 200 })
		);
		expect(await fetchLocationName(coords)).toBeNull();
	});

	it('returns null when fetch throws', async () => {
		fetchMock.mockRejectedValueOnce(new Error('network'));
		expect(await fetchLocationName(coords)).toBeNull();
	});
});

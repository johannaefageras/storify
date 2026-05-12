import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWeather, formatWeatherForDisplay } from './weather';

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

function smhiResponse(params: Array<{ name: string; values: number[] }>) {
	return new Response(
		JSON.stringify({
			timeSeries: [{ validTime: '2026-05-11T12:00:00Z', parameters: params }]
		}),
		{ status: 200 }
	);
}

describe('fetchWeather', () => {
	it('parses temperature and symbol from SMHI response', async () => {
		fetchMock.mockResolvedValueOnce(
			smhiResponse([
				{ name: 't', values: [12.4] },
				{ name: 'Wsymb2', values: [6] }
			])
		);
		const result = await fetchWeather({ latitude: 59.33, longitude: 18.07 });
		expect(result).toEqual({ temperature: 12, description: 'mulet', symbol: '6' });
	});

	it('rounds temperature to nearest integer', async () => {
		fetchMock.mockResolvedValueOnce(
			smhiResponse([
				{ name: 't', values: [-3.6] },
				{ name: 'Wsymb2', values: [1] }
			])
		);
		const result = await fetchWeather({ latitude: 0, longitude: 0 });
		expect(result?.temperature).toBe(-4);
	});

	it('returns "okänt väder" for unknown symbol code', async () => {
		fetchMock.mockResolvedValueOnce(
			smhiResponse([
				{ name: 't', values: [10] },
				{ name: 'Wsymb2', values: [999] }
			])
		);
		const result = await fetchWeather({ latitude: 0, longitude: 0 });
		expect(result?.description).toBe('okänt väder');
		expect(result?.symbol).toBe('999');
	});

	it('uses 6-decimal precision in the URL', async () => {
		fetchMock.mockResolvedValueOnce(
			smhiResponse([
				{ name: 't', values: [5] },
				{ name: 'Wsymb2', values: [1] }
			])
		);
		await fetchWeather({ latitude: 59.123456789, longitude: 18.987654321 });
		const url = fetchMock.mock.calls[0][0] as string;
		expect(url).toContain('lat/59.123457');
		expect(url).toContain('lon/18.987654');
	});

	it('returns null when response is not ok', async () => {
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
		expect(await fetchWeather({ latitude: 0, longitude: 0 })).toBeNull();
	});

	it('returns null when timeSeries is empty', async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ timeSeries: [] }), { status: 200 })
		);
		expect(await fetchWeather({ latitude: 0, longitude: 0 })).toBeNull();
	});

	it('returns null when timeSeries is missing', async () => {
		fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));
		expect(await fetchWeather({ latitude: 0, longitude: 0 })).toBeNull();
	});

	it('returns null when fetch throws', async () => {
		fetchMock.mockRejectedValueOnce(new Error('network'));
		expect(await fetchWeather({ latitude: 0, longitude: 0 })).toBeNull();
	});

	it('defaults to symbol 1 / 0°C when parameters missing', async () => {
		fetchMock.mockResolvedValueOnce(smhiResponse([]));
		const result = await fetchWeather({ latitude: 0, longitude: 0 });
		expect(result).toEqual({ temperature: 0, description: 'klart', symbol: '1' });
	});
});

describe('formatWeatherForDisplay', () => {
	it('renders temperature with °C and description', () => {
		expect(
			formatWeatherForDisplay({ temperature: 8, description: 'mulet', symbol: '6' })
		).toBe('8°C, mulet');
	});

	it('handles negative temperatures', () => {
		expect(
			formatWeatherForDisplay({ temperature: -5, description: 'snöfall', symbol: '26' })
		).toBe('-5°C, snöfall');
	});
});

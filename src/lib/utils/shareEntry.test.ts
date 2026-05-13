import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shareSavedEntry, shareFreshEntry } from './shareEntry';

const fetchMock = vi.fn();

beforeEach(() => {
	fetchMock.mockReset();
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
	return new Response(JSON.stringify(body), {
		...init,
		headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) }
	});
}

describe('shareSavedEntry', () => {
	it('POSTs entryId and returns share url with current origin', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ shareId: 'abc123' }));
		const result = await shareSavedEntry('entry-42');

		expect(result.shareId).toBe('abc123');
		// jsdom sets window.location.origin to http://localhost:3000 by default
		expect(result.url).toMatch(/\/shared\/abc123$/);
		expect(result.url.startsWith('http')).toBe(true);

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe('/api/share');
		expect(init.method).toBe('POST');
		expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
		expect(JSON.parse(init.body as string)).toEqual({ entryId: 'entry-42' });
	});

	it('throws server error message when response is not ok', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'forbidden' }, { status: 403 }));
		await expect(shareSavedEntry('e1')).rejects.toThrow('forbidden');
	});

	it('throws Swedish fallback when response has no error and not ok', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
		await expect(shareSavedEntry('e1')).rejects.toThrow('Kunde inte skapa delningslänk.');
	});

	it('throws when response is ok but shareId is missing', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({}));
		await expect(shareSavedEntry('e1')).rejects.toThrow('Kunde inte skapa delningslänk.');
	});

	it('throws when response body is not valid JSON', async () => {
		fetchMock.mockResolvedValueOnce(new Response('not json', { status: 500 }));
		await expect(shareSavedEntry('e1')).rejects.toThrow('Kunde inte skapa delningslänk.');
	});

	it('coerces non-string shareId to string', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ shareId: 12345 }));
		const result = await shareSavedEntry('e1');
		expect(result.shareId).toBe('12345');
	});
});

describe('shareFreshEntry', () => {
	it('POSTs the full input payload', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ shareId: 'xyz' }));
		const input = {
			generated_text: 'Hej',
			tone_id: 'dagboksskribenten',
			entry_date: '2026-05-11',
			emojis: ['sparkles'],
			weekday: 'Måndag'
		};
		const result = await shareFreshEntry(input);

		expect(result.shareId).toBe('xyz');
		const [, init] = fetchMock.mock.calls[0];
		expect(JSON.parse(init.body as string)).toEqual(input);
		// Critical: should NOT send an entryId field
		expect(JSON.parse(init.body as string).entryId).toBeUndefined();
	});

	it('omits optional fields when absent', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ shareId: 'xyz' }));
		await shareFreshEntry({
			generated_text: 'Hej',
			tone_id: 'dagboksskribenten',
			entry_date: '2026-05-11'
		});
		const [, init] = fetchMock.mock.calls[0];
		const body = JSON.parse(init.body as string);
		expect(body.emojis).toBeUndefined();
		expect(body.weekday).toBeUndefined();
	});

	it('propagates errors from postShare', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'rate limited' }, { status: 429 }));
		await expect(
			shareFreshEntry({ generated_text: 'x', tone_id: 'dagboksskribenten', entry_date: '2026-05-11' })
		).rejects.toThrow('rate limited');
	});
});

describe('buildShareUrl (via shareSavedEntry)', () => {
	it('uses empty origin when window.location.origin is unavailable', async () => {
		const originalLocation = window.location;
		// Replace origin with empty string
		Object.defineProperty(window, 'location', {
			value: { ...originalLocation, origin: '' },
			configurable: true
		});
		fetchMock.mockResolvedValueOnce(jsonResponse({ shareId: 'noorigin' }));
		const result = await shareSavedEntry('e1');
		expect(result.url).toBe('/shared/noorigin');

		Object.defineProperty(window, 'location', {
			value: originalLocation,
			configurable: true
		});
	});
});

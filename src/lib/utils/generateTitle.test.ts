import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTitle } from './generateTitle';

const fetchMock = vi.fn();

beforeEach(() => {
	fetchMock.mockReset();
	vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
	vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
	return new Response(JSON.stringify(body), init);
}

describe('generateTitle', () => {
	it('returns the title on success', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, title: 'En lugn dag' }));
		expect(await generateTitle('text', 'classic')).toBe('En lugn dag');
	});

	it('sends text and toneId in body', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, title: 't' }));
		await generateTitle('hello', 'british');
		const [, init] = fetchMock.mock.calls[0];
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body as string)).toEqual({ text: 'hello', toneId: 'british' });
	});

	it('returns null for empty/whitespace text without calling fetch', async () => {
		expect(await generateTitle('')).toBeNull();
		expect(await generateTitle('  \n  ')).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('returns null when response is not ok', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'x' }, { status: 500 }));
		expect(await generateTitle('text')).toBeNull();
	});

	it('returns null when success is false', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ success: false, title: 'never' }));
		expect(await generateTitle('text')).toBeNull();
	});

	it('returns null when title is missing', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }));
		expect(await generateTitle('text')).toBeNull();
	});

	it('returns null when title is not a string', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, title: 123 }));
		expect(await generateTitle('text')).toBeNull();
	});

	it('returns null when fetch throws', async () => {
		fetchMock.mockRejectedValueOnce(new Error('network'));
		expect(await generateTitle('text')).toBeNull();
	});

	it('returns null when response body is not JSON', async () => {
		fetchMock.mockResolvedValueOnce(new Response('not json', { status: 200 }));
		expect(await generateTitle('text')).toBeNull();
	});

	it('works without a toneId', async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, title: 'x' }));
		await generateTitle('hello');
		const [, init] = fetchMock.mock.calls[0];
		const body = JSON.parse(init.body as string);
		expect(body.text).toBe('hello');
		expect(body.toneId).toBeUndefined();
	});
});

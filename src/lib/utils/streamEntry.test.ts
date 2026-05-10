import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { streamEntry } from './streamEntry';

function makeStreamResponse(chunks: string[]): Response {
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		start(controller) {
			for (const chunk of chunks) {
				controller.enqueue(encoder.encode(chunk));
			}
			controller.close();
		}
	});
	return new Response(stream, { status: 200 });
}

const fetchMock = vi.fn();

beforeEach(() => {
	fetchMock.mockReset();
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('streamEntry', () => {
	it('accumulates text chunks and returns final entry', async () => {
		fetchMock.mockResolvedValueOnce(
			makeStreamResponse([
				'data: {"type":"text","text":"Hello "}\n',
				'data: {"type":"text","text":"world"}\n'
			])
		);
		const onChunk = vi.fn();
		const result = await streamEntry({ foo: 'bar' }, { onChunk });
		expect(result.entry).toBe('Hello world');
		expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello ', 'Hello ');
		expect(onChunk).toHaveBeenNthCalledWith(2, 'world', 'Hello world');
	});

	it('captures model from meta event', async () => {
		fetchMock.mockResolvedValueOnce(
			makeStreamResponse([
				'data: {"type":"meta","model":"claude-opus-4-7"}\n',
				'data: {"type":"text","text":"Hi"}\n'
			])
		);
		const result = await streamEntry({});
		expect(result.model).toBe('claude-opus-4-7');
		expect(result.entry).toBe('Hi');
	});

	it('throws when server emits an error event', async () => {
		fetchMock.mockResolvedValueOnce(
			makeStreamResponse(['data: {"type":"error","error":"overload"}\n'])
		);
		await expect(streamEntry({})).rejects.toThrow('overload');
	});

	it('throws Swedish fallback when error event has no message', async () => {
		fetchMock.mockResolvedValueOnce(makeStreamResponse(['data: {"type":"error"}\n']));
		await expect(streamEntry({})).rejects.toThrow('Något gick fel vid genereringen.');
	});

	it('throws when response has no body', async () => {
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
		await expect(streamEntry({})).rejects.toThrow('Ingen ström tillgänglig.');
	});

	it('handles JSON split across chunk boundaries', async () => {
		// Split a single SSE line across two reads
		fetchMock.mockResolvedValueOnce(
			makeStreamResponse([
				'data: {"type":"text","te',
				'xt":"split"}\ndata: {"type":"text","text":"!"}\n'
			])
		);
		const result = await streamEntry({});
		expect(result.entry).toBe('split!');
	});

	it('handles multiple SSE messages in a single chunk', async () => {
		fetchMock.mockResolvedValueOnce(
			makeStreamResponse([
				'data: {"type":"text","text":"a"}\ndata: {"type":"text","text":"b"}\ndata: {"type":"text","text":"c"}\n'
			])
		);
		const result = await streamEntry({});
		expect(result.entry).toBe('abc');
	});

	it('ignores [DONE] marker', async () => {
		fetchMock.mockResolvedValueOnce(
			makeStreamResponse(['data: {"type":"text","text":"x"}\ndata: [DONE]\n'])
		);
		const result = await streamEntry({});
		expect(result.entry).toBe('x');
	});

	it('skips lines without the SSE data prefix', async () => {
		fetchMock.mockResolvedValueOnce(
			makeStreamResponse([
				': comment\nevent: ping\ndata: {"type":"text","text":"keep"}\n\n'
			])
		);
		const result = await streamEntry({});
		expect(result.entry).toBe('keep');
	});

	it('skips malformed JSON without throwing', async () => {
		fetchMock.mockResolvedValueOnce(
			makeStreamResponse([
				'data: {not json\ndata: {"type":"text","text":"ok"}\n'
			])
		);
		const result = await streamEntry({});
		expect(result.entry).toBe('ok');
	});

	it('passes signal to fetch', async () => {
		fetchMock.mockResolvedValueOnce(makeStreamResponse([]));
		const controller = new AbortController();
		await streamEntry({}, { signal: controller.signal });
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/generate',
			expect.objectContaining({ signal: controller.signal })
		);
	});

	it('sends JSON-stringified payload with correct headers', async () => {
		fetchMock.mockResolvedValueOnce(makeStreamResponse([]));
		await streamEntry({ a: 1, b: 'two' });
		const [, init] = fetchMock.mock.calls[0];
		expect(init.method).toBe('POST');
		expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
		expect(JSON.parse(init.body as string)).toEqual({ a: 1, b: 'two' });
	});

	it('returns empty entry when stream contains only meta', async () => {
		fetchMock.mockResolvedValueOnce(
			makeStreamResponse(['data: {"type":"meta","model":"sonnet"}\n'])
		);
		const result = await streamEntry({});
		expect(result.entry).toBe('');
		expect(result.model).toBe('sonnet');
	});

	it('throws on top-level error field even without type=error', async () => {
		fetchMock.mockResolvedValueOnce(
			makeStreamResponse(['data: {"error":"rate limited"}\n'])
		);
		await expect(streamEntry({})).rejects.toThrow('rate limited');
	});
});

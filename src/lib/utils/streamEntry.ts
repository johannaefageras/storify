import { getApiUrl } from '$lib/config';

export interface StreamEntryOptions {
	onChunk?: (chunk: string, accumulated: string) => void;
	signal?: AbortSignal;
}

export interface StreamEntryResult {
	entry: string;
	model?: string;
}

/**
 * POST a payload to /api/generate and consume its SSE stream.
 * Throws on error events or non-2xx responses (except 429, which includes a retry hint).
 */
export async function streamEntry(
	payload: unknown,
	options: StreamEntryOptions = {}
): Promise<StreamEntryResult> {
	const response = await fetch(getApiUrl('/api/generate'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		signal: options.signal
	});

	if (!response.body) {
		throw new Error('Ingen ström tillgänglig.');
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	let accumulated = '';
	let model: string | undefined;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split('\n');
		buffer = lines.pop() ?? '';

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed.startsWith('data: ')) continue;

			const data = trimmed.slice(6);
			if (data === '[DONE]') continue;

			let parsed: { type?: string; text?: string; model?: string; error?: string };
			try {
				parsed = JSON.parse(data);
			} catch {
				continue;
			}

			if (parsed.type === 'error' || parsed.error) {
				throw new Error(parsed.error || 'Något gick fel vid genereringen.');
			}
			if (parsed.type === 'meta' && parsed.model) {
				model = parsed.model;
			}
			if (parsed.type === 'text' && parsed.text) {
				accumulated += parsed.text;
				options.onChunk?.(parsed.text, accumulated);
			}
		}
	}

	return { entry: accumulated, model };
}

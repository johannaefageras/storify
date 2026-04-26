// Server-only: callers are responsible for any rate limiting upstream.
// `/api/title` and `/api/community` both wrap this; the backfill script
// imports it directly.

import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { env } from '$env/dynamic/private';
import {
	buildTitleSystemPrompt,
	buildTitleUserMessage,
	cleanTitle,
	languageForTone
} from '$lib/data/titlePrompt';

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const MODEL = env.TITLE_MODEL || 'claude-haiku-4-5-20251001';
const MAX_TOKENS = parseInt(env.TITLE_MAX_TOKENS || '40', 10);

export async function generateTitleServer(
	text: string,
	toneId?: string | null
): Promise<string | null> {
	const trimmed = text.trim();
	if (!trimmed) return null;

	const language = languageForTone(toneId);

	try {
		const response = await client.messages.create({
			model: MODEL,
			max_tokens: MAX_TOKENS,
			system: buildTitleSystemPrompt(language),
			messages: [{ role: 'user', content: buildTitleUserMessage(trimmed, language) }]
		});
		const block = response.content.find((b) => b.type === 'text');
		const raw = block && block.type === 'text' ? block.text : '';
		const title = cleanTitle(raw);
		return title || null;
	} catch (error) {
		console.error('Title generation error:', error);
		return null;
	}
}

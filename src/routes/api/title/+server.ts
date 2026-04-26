import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { tones } from '$lib/data/tones';
import { LIMITS } from '$lib/validation';
import { checkRateLimit, getClientIdentifier } from '$lib/validation/ratelimit';
import { generateTitleServer } from '$lib/server/generateTitleServer';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

export const OPTIONS: RequestHandler = async () => {
	return new Response(null, { headers: corsHeaders });
};

const toneIds = new Set(tones.map((t) => t.id));

export const POST: RequestHandler = async ({ request }) => {
	const clientId = getClientIdentifier(request);
	const rl = await checkRateLimit(`title:${clientId}`);
	if (!rl.success) {
		return json(
			{ success: false, error: 'För många försök. Försök igen senare.' },
			{
				status: 429,
				headers: {
					...corsHeaders,
					'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000))
				}
			}
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Ogiltigt format.' }, { status: 400, headers: corsHeaders });
	}

	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return json({ success: false, error: 'Ogiltigt format.' }, { status: 400, headers: corsHeaders });
	}

	const payload = body as { text?: unknown; toneId?: unknown };
	const rawText = typeof payload.text === 'string' ? payload.text.trim() : '';

	if (!rawText) {
		return json({ success: false, error: 'Saknar text.' }, { status: 400, headers: corsHeaders });
	}
	if (rawText.length > LIMITS.GENERATED_ENTRY) {
		return json({ success: false, error: 'Texten är för lång.' }, { status: 400, headers: corsHeaders });
	}

	const toneId = typeof payload.toneId === 'string' && toneIds.has(payload.toneId) ? payload.toneId : null;
	const title = await generateTitleServer(rawText, toneId);

	if (!title) {
		return json(
			{ success: false, error: 'Kunde inte skapa titel.' },
			{ status: 502, headers: corsHeaders }
		);
	}

	return json({ success: true, title }, { headers: corsHeaders });
};

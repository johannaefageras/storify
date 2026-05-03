import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { checkTranscribeRateLimit, getClientIdentifier } from '$lib/validation/ratelimit';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

export const OPTIONS: RequestHandler = async () => {
	return new Response(null, { headers: corsHeaders });
};

const MODEL = env.WHISPER_MODEL || 'whisper-1';
const MAX_BYTES = 25 * 1024 * 1024; // Whisper API hard limit
const ALLOWED_PREFIXES = ['audio/', 'video/webm', 'video/mp4'];

function jsonError(message: string, status: number, extra: Record<string, string> = {}): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { ...corsHeaders, ...extra, 'Content-Type': 'application/json' }
	});
}

function extensionFor(mime: string): string {
	if (mime.includes('webm')) return 'webm';
	if (mime.includes('mp4') || mime.includes('m4a')) return 'm4a';
	if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
	if (mime.includes('ogg')) return 'ogg';
	if (mime.includes('wav')) return 'wav';
	return 'webm';
}

export const POST: RequestHandler = async ({ request }) => {
	const apiKey = env.OPENAI_API_KEY;
	if (!apiKey) {
		console.error('OPENAI_API_KEY not configured');
		return jsonError('Tjänsten är inte konfigurerad. Försök igen senare.', 500);
	}

	const clientId = getClientIdentifier(request);
	const rateLimit = await checkTranscribeRateLimit(`transcribe:${clientId}`);
	if (!rateLimit.success) {
		return jsonError('Du har nått gränsen för antal inspelningar. Försök igen senare.', 429, {
			'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000))
		});
	}

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return jsonError('Ogiltig förfrågan.', 400);
	}

	const file = form.get('file');
	if (!(file instanceof File)) {
		return jsonError('Ingen ljudfil mottagen.', 400);
	}

	if (file.size === 0) {
		return jsonError('Inspelningen är tom.', 400);
	}

	if (file.size > MAX_BYTES) {
		return jsonError('Inspelningen är för lång.', 413);
	}

	const mime = file.type || '';
	if (mime && !ALLOWED_PREFIXES.some((p) => mime.startsWith(p))) {
		return jsonError('Filtypen stöds inte.', 415);
	}

	const ext = extensionFor(mime);
	const upstream = new FormData();
	upstream.append('file', file, `audio.${ext}`);
	upstream.append('model', MODEL);
	upstream.append('language', 'sv');
	upstream.append('response_format', 'json');

	try {
		const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
			method: 'POST',
			headers: { Authorization: `Bearer ${apiKey}` },
			body: upstream
		});

		if (!res.ok) {
			const body = await res.text();
			console.error('Whisper API error', res.status, body);
			return jsonError('Kunde inte transkribera. Försök igen.', 502);
		}

		const data = (await res.json()) as { text?: string };
		const text = (data.text || '').trim();

		return new Response(JSON.stringify({ text }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Transcribe request failed', error);
		return jsonError('Kunde inte ansluta till transkriberingstjänsten.', 502);
	}
};

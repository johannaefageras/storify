import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { checkChatRateLimit, getClientIdentifier } from '$lib/validation/ratelimit';
import { resolveAgentId, buildSignedUrlEndpoint } from './helpers';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

export const OPTIONS: RequestHandler = async () =>
	new Response(null, { headers: corsHeaders });

function jsonError(message: string, status: number): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' }
	});
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) return jsonError('Du måste vara inloggad.', 401);

	const clientId = getClientIdentifier(request);
	const limit = await checkChatRateLimit(`voice-interview:${clientId}`);
	if (!limit.success) {
		return new Response(
			JSON.stringify({ error: 'Du har nått gränsen för röstsamtal. Försök igen senare.' }),
			{
				status: 429,
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json',
					'Retry-After': String(Math.ceil((limit.reset - Date.now()) / 1000))
				}
			}
		);
	}

	let body: { personaId?: unknown };
	try {
		body = await request.json();
	} catch {
		return jsonError('Ogiltig JSON.', 400);
	}

	const agentId = resolveAgentId(body.personaId, {
		friend: env.ELEVENLABS_AGENT_FRIEND_ID,
		journalist: env.ELEVENLABS_AGENT_JOURNALIST_ID,
		therapist: env.ELEVENLABS_AGENT_THERAPIST_ID
	});
	if (!agentId) return jsonError('Okänd intervjuare.', 400);

	const apiKey = env.ELEVENLABS_API_KEY;
	if (!apiKey) {
		console.error('ELEVENLABS_API_KEY not configured');
		return jsonError('Röstsamtal är inte tillgängligt just nu.', 503);
	}

	try {
		const upstream = await fetch(buildSignedUrlEndpoint(agentId), {
			headers: { 'xi-api-key': apiKey }
		});
		if (!upstream.ok) {
			const text = await upstream.text().catch(() => '');
			console.error('ElevenLabs signed-url request failed:', upstream.status, text);
			return jsonError('Kunde inte starta röstsamtalet. Försök igen.', 502);
		}
		const data = (await upstream.json()) as { signed_url?: string };
		if (!data.signed_url) {
			console.error('ElevenLabs response missing signed_url:', data);
			return jsonError('Ogiltigt svar från röst-tjänsten.', 502);
		}
		return new Response(JSON.stringify({ signedUrl: data.signed_url }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('Voice interview signed-url error:', err);
		return jsonError('Kunde inte ansluta till röst-tjänsten.', 502);
	}
};

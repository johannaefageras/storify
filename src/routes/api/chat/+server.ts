import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import type { UserProfile } from '$lib/stores/wizard.svelte';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { env } from '$env/dynamic/private';
import {
	buildInterviewerPrompt,
	DEFAULT_INTERVIEWER,
	VALID_INTERVIEWER_IDS,
	type InterviewerId
} from '$lib/data/chatbotPrompts';
import { validateChatMessages, type ChatMessagePayload } from '$lib/validation';
import { sanitizeString } from '$lib/validation/sanitizers';
import { checkChatRateLimit, getClientIdentifier } from '$lib/validation/ratelimit';

// CORS headers for Capacitor native app
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

// Handle CORS preflight
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, { headers: corsHeaders });
};

const client = new Anthropic({
	apiKey: ANTHROPIC_API_KEY
});

const MODEL = env.CHAT_MODEL || 'claude-opus-4-6';
const MAX_TOKENS = parseInt(env.CHAT_MAX_TOKENS || '512', 10);

interface ChatRequestBody {
	messages: ChatMessagePayload[];
	profile: UserProfile;
	interviewer?: InterviewerId;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		// 1. Rate limiting
		const clientId = getClientIdentifier(request);
		const rateLimitResult = await checkChatRateLimit(`chat:${clientId}`);

		if (!rateLimitResult.success) {
			return new Response(
				JSON.stringify({
					error: 'Du har nått gränsen för antal meddelanden. Försök igen senare.'
				}),
				{
					status: 429,
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json',
						'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000))
					}
				}
			);
		}

		// 2. Parse request body
		let body: ChatRequestBody;
		try {
			body = await request.json();
		} catch {
			return new Response(JSON.stringify({ error: 'Ogiltig JSON.' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		const { messages, profile } = body;

		if (!messages || !profile) {
			return new Response(JSON.stringify({ error: 'Meddelanden och profil krävs.' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		const requestedInterviewer = body.interviewer ?? DEFAULT_INTERVIEWER;
		const interviewer: InterviewerId = VALID_INTERVIEWER_IDS.includes(requestedInterviewer)
			? requestedInterviewer
			: DEFAULT_INTERVIEWER;

		// 3. Sanitize user messages
		const sanitizedMessages: ChatMessagePayload[] = messages.map((msg) => ({
			role: msg.role,
			content: msg.role === 'user' ? sanitizeString(msg.content) : msg.content
		}));

		// 4. Validate messages
		const validation = validateChatMessages(sanitizedMessages);
		if (!validation.valid) {
			return new Response(JSON.stringify({ error: validation.error }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		// 5. Build system prompt (with wrap-up instruction near limit)
		let systemPrompt = buildInterviewerPrompt(interviewer, profile);

		if (sanitizedMessages.length >= 34) {
			// Final turn — user cannot reply after this. Force a warm close, no new questions.
			systemPrompt += `\n\nVIKTIGT — DETTA ÄR DITT SISTA MEDDELANDE:
Användaren kan inte skriva fler meddelanden efter detta. Ge en kort, varm avslutning som speglar tillbaka det viktigaste ni pratat om idag. STÄLL INGA NYA FRÅGOR och öppna inga nya trådar. Avsluta tydligt så användaren känner sig färdig och redo att skapa sin dagbok — t.ex. "Nu har du allt du behöver — dags att skapa din dagbok." Håll det varmt men kort (2–4 meningar).`;
		} else if (sanitizedMessages.length >= 30) {
			// 2-3 user turns left — start actively steering toward close.
			systemPrompt += `\n\nVIKTIGT — INTERVJUN NÄRMAR SIG SLUTET:
Det finns bara cirka 3 meddelanden kvar för användaren att skriva. Börja styra konkret mot avslut nu. Ställ avrundande frågor som "Något viktigt vi inte hunnit prata om?" eller "Vad känns viktigast att ta med från idag?". Öppna inte nya, breda ämnen — fokusera på att fånga det sista som behövs för dagboken.`;
		}

		// 6. Format messages for Anthropic API. Place a rolling cache breakpoint
		// on the latest user message so the growing conversation prefix is reused
		// across turns (within the 5-minute ephemeral cache TTL).
		const lastIdx = sanitizedMessages.length - 1;
		const anthropicMessages = sanitizedMessages.map((msg, idx) => {
			const role = msg.role as 'user' | 'assistant';
			if (idx !== lastIdx) {
				return { role, content: msg.content };
			}
			return {
				role,
				content: [
					{
						type: 'text' as const,
						text: msg.content,
						cache_control: { type: 'ephemeral' as const }
					}
				]
			};
		});

		// 7. Stream response via SSE. The system prompt gets its own cache
		// breakpoint so it's reused across every turn of the conversation.
		const stream = client.messages.stream({
			model: MODEL,
			max_tokens: MAX_TOKENS,
			system: [
				{
					type: 'text',
					text: systemPrompt,
					cache_control: { type: 'ephemeral' }
				}
			],
			messages: anthropicMessages
		});

		const encoder = new TextEncoder();

		const readable = new ReadableStream({
			async start(controller) {
				try {
					for await (const event of stream) {
						if (
							event.type === 'content_block_delta' &&
							event.delta.type === 'text_delta'
						) {
							const data = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
							controller.enqueue(encoder.encode(data));
						}
					}

					// Signal stream completion
					controller.enqueue(encoder.encode('data: [DONE]\n\n'));
					controller.close();
				} catch (error) {
					console.error('Stream error:', error);
					const errorData = `data: ${JSON.stringify({ error: 'Strömningen avbröts.' })}\n\n`;
					controller.enqueue(encoder.encode(errorData));
					controller.close();
				}
			}
		});

		return new Response(readable, {
			headers: {
				...corsHeaders,
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	} catch (error) {
		console.error('Chat endpoint error:', error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod.'
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			}
		);
	}
};

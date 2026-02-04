import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import type { WizardData } from '$lib/stores/wizard.svelte';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { buildTonePrompt } from '$lib/data/tonePrompts';
import { validateWizardData, validatePayloadSize } from '$lib/validation';
import { checkRateLimit, getClientIdentifier } from '$lib/validation/ratelimit';
import { getZodiacFromBirthday } from '$lib/utils/zodiac';
import {
  buildHoroscopeInstructions,
  buildOnThisDayInstructions,
  formatWizardDataForPrompt
} from './helpers';

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

const PRIMARY_MODEL = 'claude-opus-4-5-20251101';
const FALLBACK_MODEL = 'claude-sonnet-4-20250514';

async function generateWithFallback(
  systemPrompt: string,
  userContent: string
): Promise<{ text: string; model: string }> {
  const createMessage = async (model: string) => {
    return client.messages.create({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${userContent}\n\nSkriv ett dagboksinlägg baserat på denna information.`
        }
      ]
    });
  };

  try {
    const message = await createMessage(PRIMARY_MODEL);
    const textContent = message.content.find((block) => block.type === 'text');
    return { text: textContent?.text || '', model: PRIMARY_MODEL };
  } catch (error: unknown) {
    const isOverloaded =
      error instanceof Error &&
      (error.message.includes('overloaded') || error.message.includes('529'));

    if (isOverloaded) {
      console.log('Opus overloaded, falling back to Sonnet');
      const message = await createMessage(FALLBACK_MODEL);
      const textContent = message.content.find((block) => block.type === 'text');
      return { text: textContent?.text || '', model: FALLBACK_MODEL };
    }
    throw error;
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // 1. Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = await checkRateLimit(`generate:${clientId}`);

    if (!rateLimitResult.success) {
      return json(
        {
          success: false,
          error: 'Du har nått gränsen för antal genereringar. Försök igen senare.'
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000))
          }
        }
      );
    }

    // 2. Parse and validate payload size
    const data: WizardData = await request.json();

    if (!validatePayloadSize(data)) {
      return json(
        { success: false, error: 'Förfrågan är för stor.' },
        { status: 413, headers: corsHeaders }
      );
    }

    // 3. Validate all fields
    const validation = validateWizardData(data);

    if (!validation.valid) {
      return json(
        {
          success: false,
          error: 'Valideringsfel i indata.',
          details: validation.errors
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const toneId = data.selectedTone || 'classic';
    let systemPrompt = buildTonePrompt(toneId, data.profile);

    // Append horoscope instructions if enabled (pass toneId so addon matches the voice)
    if (data.includeHoroscope && data.profile.birthday) {
      const zodiac = getZodiacFromBirthday(data.profile.birthday);
      if (zodiac) {
        systemPrompt += buildHoroscopeInstructions(zodiac.name, toneId);
      }
    }

    // Append "on this day" instructions if enabled (pass toneId so addon matches the voice)
    if (data.includeOnThisDay && data.date) {
      systemPrompt += buildOnThisDayInstructions(data.date, toneId);
    }

    const userContent = formatWizardDataForPrompt(data);

    const result = await generateWithFallback(systemPrompt, userContent);

    return json(
      {
        success: true,
        entry: result.text
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Generation error:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate entry'
      },
      { status: 500, headers: corsHeaders }
    );
  }
};

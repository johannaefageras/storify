import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import type { WizardData, UserProfile } from '$lib/stores/wizard.svelte';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import emojiMeanings from '$lib/data/emojiMeanings.json';
import { buildTonePrompt } from '$lib/data/tonePrompts';
import {
  validateWizardData,
  validatePayloadSize
} from '$lib/validation';
import { checkRateLimit, getClientIdentifier } from '$lib/validation/ratelimit';
import { getZodiacFromBirthday, getAgeFromBirthday } from '$lib/utils/zodiac';

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

// NOTE: The buildTonePrompt function and all 20 tone definitions have been moved to
// src/lib/data/tones/ for better maintainability. Each tone is now in its own file.

function formatProfileForPrompt(profile: UserProfile): string {
  const lines: string[] = [];

  if (profile.name) {
    lines.push(`Namn: ${profile.name}`);
  }
  if (profile.birthday) {
    const age = getAgeFromBirthday(profile.birthday);
    if (age !== null) {
      lines.push(`Ålder: ${age} år`);
    }
  }
  if (profile.hometown) {
    lines.push(`Bor i: ${profile.hometown}`);
  }
  if (profile.occupationDetail.length > 0) {
    lines.push(`Sysselsättning: ${profile.occupationDetail.join(', ')}`);
  }
  if (profile.family.length > 0) {
    lines.push(`Familj: ${profile.family.join(', ')}`);
  }
  if (profile.pets.length > 0) {
    lines.push(`Husdjur: ${profile.pets.join(', ')}`);
  }
  if (profile.interests.length > 0) {
    lines.push(`Intressen: ${profile.interests.join(', ')}`);
  }

  if (lines.length > 0) {
    return `OM SKRIBENTEN:\n${lines.join('\n')}`;
  }
  return '';
}

function formatWizardDataForPrompt(data: WizardData): string {
  const sections: string[] = [];

  // Profile info (if any)
  const profileSection = formatProfileForPrompt(data.profile);
  if (profileSection) {
    sections.push(profileSection);
    sections.push(''); // Empty line separator
  }

  // Date info
  sections.push(`DAGENS INFORMATION:`);
  sections.push(`Datum: ${data.weekday} ${data.date}`);

  // Location (auto-detected via geocoding)
  if (data.locationName) {
    sections.push(`Plats: ${data.locationName}`);
  }

  // Weather (auto-detected from user's location)
  if (data.weather) {
    sections.push(`Väder: ${data.weather.temperature}°C, ${data.weather.description}`);
  }

  // Emojis that represent the day (with rich meanings for AI)
  if (data.emojis.length > 0) {
    const emojiDescriptions = data.emojis
      .map((emojiId) => {
        const emoji = emojiMeanings[emojiId as keyof typeof emojiMeanings];
        if (emoji) {
          return `- ${emoji.name}: ${emoji.meaning}`;
        }
        return `- ${emojiId}`;
      })
      .join('\n');
    sections.push(`Dagens känsla (emojis):\n${emojiDescriptions}`);
  }

  // Energy levels
  sections.push(`Sömn: ${data.sleepQuality}/10`);
  sections.push(`Energi: ${data.energyLevel}/10`);
  sections.push(`Humör: ${data.mood}/10`);

  // Locations
  const allLocations = [...data.locations, ...data.customLocations].filter(Boolean);
  if (allLocations.length > 0) {
    sections.push(`Platser: ${allLocations.join(', ')}`);
  }

  // Activities
  const allActivities = [...data.activities, ...data.customActivities].filter(Boolean);
  if (allActivities.length > 0) {
    sections.push(`Aktiviteter: ${allActivities.join(', ')}`);
  }

  // People
  if (data.people.length > 0) {
    sections.push(`Personer: ${data.people.join(', ')}`);
  }

  // Wins
  const wins = data.wins.filter((w) => w.trim());
  if (wins.length > 0) {
    sections.push(`Bra saker/vinster: ${wins.join('; ')}`);
  }

  // Frustrations
  const frustrations = data.frustrations.filter((f) => f.trim());
  if (frustrations.length > 0) {
    sections.push(`Motgångar/frustration: ${frustrations.join('; ')}`);
  }

  // Reflections (optional fields)
  if (data.almostHappened?.trim()) {
    sections.push(`Nästan hände: ${data.almostHappened}`);
  }
  if (data.unnecessaryThing?.trim()) {
    sections.push(`Onödig sak jag gjorde: ${data.unnecessaryThing}`);
  }
  if (data.wouldRedo?.trim()) {
    sections.push(`Skulle göra om: ${data.wouldRedo}`);
  }

  // Food
  const allMeals = [...data.meals, ...data.customMeals].filter(Boolean);
  if (allMeals.length > 0) {
    sections.push(`Mat: ${allMeals.join(', ')}`);
  }

  // Soundtrack
  const allSoundtracks = [...data.soundtracks, ...data.customSoundtracks].filter(Boolean);
  if (allSoundtracks.length > 0) {
    sections.push(`Musik/ljud: ${allSoundtracks.join(', ')}`);
  }

  // Time capsule memory
  if (data.memoryFor10Years?.trim()) {
    sections.push(`Minne att spara (tidskapsel): ${data.memoryFor10Years}`);
  }

  // Message to future self
  if (data.messageToFutureSelf?.trim()) {
    sections.push(`Meddelande till framtida jag: ${data.messageToFutureSelf}`);
  }

  // Horoscope info (if enabled)
  if (data.includeHoroscope && data.profile.birthday) {
    const zodiac = getZodiacFromBirthday(data.profile.birthday);
    if (zodiac) {
      sections.push('');
      sections.push(`HOROSKOP:`);
      sections.push(`Stjärntecken: ${zodiac.name} (${zodiac.symbol})`);
    }
  }

  return sections.join('\n');
}

function buildHoroscopeInstructions(zodiacName: string): string {
  return `

---

HOROSKOP-TILLÄGG:

Efter dagboksinlägget, lägg till ett SEPARAT avsnitt med rubriken "Horoskop för ${zodiacName}" (gärna med en passande emoji).

HOROSKOPET SKA:
- Vara baserat på dagens händelser och känslor från dagboken
- Ha en lekfull, mysig ton som passar dagbokens stil
- Vara personligt och kopplat till det som faktiskt hänt idag
- Innehålla en positiv eller uppmuntrande touch utan att vara krystat
- Vara 2-4 meningar långt
- Gärna inkludera lite "kosmisk" språkdräkt, som "stjärnorna antyder..." eller "universum vill..."

EXEMPEL PÅ BRA HOROSKOP:
- "Stjärnorna såg din insats idag och var imponerade. Venus står i en position som antyder att du snart kommer få ett oväntat komplimang."
- "Universum noterade att du inte gav upp. Den kosmiska energin belönar envishet – förvänta dig en liten seger i veckan som kommer."

GÖR INTE:
- Skriv inte generiska horoskop som kunde gälla vem som helst
- Skriv inte om saker som inte hänt eller nämnts i dagens händelser
- Var inte för allvarlig eller mystisk
- Använd inte klyschor som "kärlek väntar runt hörnet" om det inte passar kontexten`;
}

const PRIMARY_MODEL = 'claude-opus-4-5-20251101';
const FALLBACK_MODEL = 'claude-sonnet-4-20250514';

async function generateWithFallback(
  systemPrompt: string,
  userContent: string
): Promise<{ text: string; model: string }> {
  const createMessage = async (model: string) => {
    return client.messages.create({
      model,
      max_tokens: 1024,
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

    // Append horoscope instructions if enabled
    if (data.includeHoroscope && data.profile.birthday) {
      const zodiac = getZodiacFromBirthday(data.profile.birthday);
      if (zodiac) {
        systemPrompt += buildHoroscopeInstructions(zodiac.name);
      }
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

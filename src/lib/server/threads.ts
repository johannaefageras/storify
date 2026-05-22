import Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';

export const THREAD_TYPES = [
  'upcoming_event',
  'ongoing_concern',
  'relationship',
  'goal'
] as const;

export type ThreadType = (typeof THREAD_TYPES)[number];

export interface ExtractedThread {
  type: ThreadType;
  text: string;
}

export interface ActiveThread {
  type: ThreadType;
  text: string;
  created_at: string;
}

export const EXTRACTOR_SYSTEM_PROMPT = `Du extraherar "öppna trådar" från ett svenskt dagboksinlägg — saker som troligen är värda att följa upp en annan dag.

Returnera ENBART giltig JSON i formen: {"threads": [{"type": "...", "text": "..."}]}.

Tillåtna typer:
- upcoming_event: något som ska hända (möte, resa, tentamen, läkarbesök)
- ongoing_concern: en oro, stress eller pågående svårighet som inte är löst
- relationship: en specifik person eller relation som spelar roll i inlägget
- goal: ett uttalat mål eller en föresats

REGLER:
- Max 3 trådar. Om inget är värt att följa upp: returnera {"threads": []}.
- "text" är en kort svensk fras (max 100 tecken) som den som intervjuar imorgon ska kunna läsa och formulera en följdfråga utifrån. Skriv i tredje person, t.ex. "Möte med chefen imorgon som hen är nervös för" eller "Bråk med mamma som inte är löst".
- Plocka inte upp engångshändelser som redan är klara och avslutade.
- Plocka inte upp generella reflektioner ("livet är fint", "tacksam för naturen").
- Hitta inte på detaljer som inte finns i texten.
- Skriv ingen text utanför JSON-objektet.`;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const EXTRACTOR_MODEL = process.env.THREADS_EXTRACT_MODEL || 'claude-haiku-4-5-20251001';
const EXTRACTOR_MAX_TOKENS = parseInt(process.env.THREADS_EXTRACT_MAX_TOKENS || '512', 10);

export function parseExtractorResponse(raw: string): ExtractedThread[] {
  const trimmed = raw.trim();
  // Strip code fences if the model wrapped output, just in case.
  const stripped = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== 'object') return [];
  const threadsRaw = (parsed as { threads?: unknown }).threads;
  if (!Array.isArray(threadsRaw)) return [];

  const out: ExtractedThread[] = [];
  for (const item of threadsRaw) {
    if (!item || typeof item !== 'object') continue;
    const t = (item as { type?: unknown }).type;
    const text = (item as { text?: unknown }).text;
    if (typeof t !== 'string' || typeof text !== 'string') continue;
    if (!THREAD_TYPES.includes(t as ThreadType)) continue;
    const cleaned = text.trim().slice(0, 280);
    if (!cleaned) continue;
    out.push({ type: t as ThreadType, text: cleaned });
    if (out.length >= 3) break;
  }
  return out;
}

export async function extractThreads(entryText: string): Promise<ExtractedThread[]> {
  const message = await getClient().messages.create({
    model: EXTRACTOR_MODEL,
    max_tokens: EXTRACTOR_MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: EXTRACTOR_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' }
      }
    ],
    messages: [
      {
        role: 'user',
        content: `<entry>\n${entryText}\n</entry>`
      }
    ]
  });

  const block = message.content.find((c) => c.type === 'text');
  if (!block || block.type !== 'text') return [];
  return parseExtractorResponse(block.text);
}

export async function insertThreads(
  supabase: SupabaseClient,
  userId: string,
  entryId: string,
  threads: ExtractedThread[]
): Promise<void> {
  if (threads.length === 0) return;
  const rows = threads.map((t) => ({
    user_id: userId,
    entry_id: entryId,
    type: t.type,
    text: t.text
  }));
  const { error } = await supabase.from('entry_threads').insert(rows);
  if (error) {
    console.error('[threads] insert failed', error);
  }
}

export async function fetchActiveThreads(
  supabase: SupabaseClient,
  userId: string
): Promise<ActiveThread[]> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('entry_threads')
    .select('type, text, created_at')
    .eq('user_id', userId)
    .eq('status', 'open')
    .gte('created_at', cutoff)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(8);
  if (error) {
    console.error('[threads] fetch failed', error);
    return [];
  }
  return (data ?? []) as ActiveThread[];
}

const TYPE_LABEL: Record<ThreadType, string> = {
  upcoming_event: 'kommande händelse',
  ongoing_concern: 'pågående oro',
  relationship: 'relation',
  goal: 'mål'
};

export function formatThreadsForPrompt(threads: ActiveThread[]): string {
  if (threads.length === 0) return '';
  const lines = threads.map((t) => {
    const days = Math.max(
      0,
      Math.floor((Date.now() - new Date(t.created_at).getTime()) / (24 * 60 * 60 * 1000))
    );
    const when = days === 0 ? 'idag' : days === 1 ? 'igår' : `för ${days} dagar sedan`;
    return `- (${TYPE_LABEL[t.type]}, nämnt ${when}) ${t.text}`;
  });
  return `ÖPPNA TRÅDAR FRÅN TIDIGARE INLÄGG:
Användaren har nämnt följande i sina senaste inlägg. Du KAN — men måste inte — ställa en mjuk följdfråga om något av detta om det passar naturligt i samtalet. Tvinga inte fram det. Hänvisa aldrig till "tidigare inlägg" eller "din dagbok" — låt det låta som att du minns det de berättat.

${lines.join('\n')}`;
}

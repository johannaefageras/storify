import type { RequestHandler } from './$types';
import { extractThreads, insertThreads } from '$lib/server/threads';
import { checkRateLimit } from '$lib/validation/ratelimit';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, { headers: corsHeaders });
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) return json({ error: 'Inte inloggad.' }, 401);

  const rl = await checkRateLimit(`threads:${user.id}`);
  if (!rl.success) return json({ error: 'Rate limit.' }, 429);

  let body: { entryId?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ogiltig JSON.' }, 400);
  }

  const entryId = typeof body.entryId === 'string' ? body.entryId : '';
  if (!UUID_RE.test(entryId)) return json({ error: 'Ogiltigt entryId.' }, 400);

  // RLS scopes this to the authenticated user — no need to filter by user_id manually.
  const { data: entry, error } = await locals.supabase
    .from('entries')
    .select('id, generated_text')
    .eq('id', entryId)
    .maybeSingle();

  if (error || !entry) return json({ error: 'Inlägg hittades inte.' }, 404);
  const text = (entry as { generated_text?: string }).generated_text ?? '';
  if (text.trim().length < 40) return json({ ok: true, threads: 0 });

  try {
    const threads = await extractThreads(text);
    await insertThreads(locals.supabase, user.id, entryId, threads);
    return json({ ok: true, threads: threads.length });
  } catch (e) {
    console.error('[threads/extract] failed', e);
    return json({ ok: false, error: 'Extraction failed.' }, 500);
  }
};

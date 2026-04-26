import type { RequestHandler } from './$types';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { checkRateLimit, getClientIdentifier } from '$lib/validation/ratelimit';
import { escapeHtml } from '$lib/validation';

type Kind = 'weekly' | 'monthly' | 'all';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let adminClient: SupabaseClient | null = null;
function getAdminClient(): SupabaseClient | null {
  if (adminClient) return adminClient;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;
  adminClient = createClient(PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return adminClient;
}

function parseKind(raw: string | null): Kind {
  if (raw === 'monthly' || raw === 'all') return raw;
  return 'weekly';
}

function kindLabel(kind: Kind): string {
  if (kind === 'monthly') return 'månadsbrevet';
  if (kind === 'all') return 'alla nyhetsbrev';
  return 'veckobrevet';
}

async function unsubscribe(token: string, kind: Kind): Promise<'ok' | 'not_found' | 'error'> {
  const admin = getAdminClient();
  if (!admin) return 'error';

  const { data, error: selectError } = await admin
    .from('profiles')
    .select('id')
    .eq('newsletter_unsubscribe_token', token)
    .maybeSingle();

  if (selectError) {
    console.error('Unsubscribe lookup failed:', selectError);
    return 'error';
  }
  if (!data) return 'not_found';

  const patch: Record<string, boolean> = {};
  if (kind === 'weekly' || kind === 'all') patch.newsletter_weekly_enabled = false;
  if (kind === 'monthly' || kind === 'all') patch.newsletter_monthly_enabled = false;

  const { error: updateError } = await admin.from('profiles').update(patch).eq('id', data.id);

  if (updateError) {
    console.error('Unsubscribe update failed:', updateError);
    return 'error';
  }

  console.log(`Unsubscribe: user=${data.id} kind=${kind}`);
  return 'ok';
}

function htmlPage(title: string, bodyHtml: string, status: number): Response {
  const safeTitle = escapeHtml(title);
  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} · Storify</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:48px 20px;">
    <div style="background-color:#ffffff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      ${bodyHtml}
    </div>
    <p style="margin:24px 0 0 0;text-align:center;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Storify</p>
  </div>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function confirmationBody(kind: Kind): string {
  const label = kindLabel(kind);
  return `
      <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:600;">Du är avregistrerad</h1>
      <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#1a1a1a;">
        Du får inga fler mejl från ${escapeHtml(label)}. Tack för att du har följt med!
      </p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#666;">
        Ångrade du dig?
        <a href="/profile/settings" style="color:#f43f7a;font-weight:500;text-decoration:none;">Ändra dina inställningar</a>.
      </p>`;
}

const INVALID_BODY = `
      <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:600;">Länken fungerar inte</h1>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#1a1a1a;">
        Länken är ogiltig eller har gått ut. Logga in på
        <a href="/profile/settings" style="color:#f43f7a;font-weight:500;text-decoration:none;">din profil</a>
        för att ändra dina nyhetsbrevsinställningar.
      </p>`;

const RATE_LIMIT_BODY = `
      <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:600;">För många försök</h1>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#1a1a1a;">
        Försök igen om en stund.
      </p>`;

const ERROR_BODY = `
      <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:600;">Något gick fel</h1>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#1a1a1a;">
        Vi kunde inte avregistrera dig just nu. Försök igen senare eller ändra inställningen på
        <a href="/profile/settings" style="color:#f43f7a;font-weight:500;text-decoration:none;">din profil</a>.
      </p>`;

export const GET: RequestHandler = async ({ params, url, request }) => {
  const identifier = `unsub:${getClientIdentifier(request)}`;
  const { success } = await checkRateLimit(identifier);
  if (!success) {
    return htmlPage('För många försök', RATE_LIMIT_BODY, 429);
  }

  const token = params.token ?? '';
  if (!UUID_RE.test(token)) {
    return htmlPage('Länken fungerar inte', INVALID_BODY, 404);
  }

  const kind = parseKind(url.searchParams.get('kind'));
  const result = await unsubscribe(token, kind);

  if (result === 'not_found') return htmlPage('Länken fungerar inte', INVALID_BODY, 404);
  if (result === 'error') return htmlPage('Något gick fel', ERROR_BODY, 500);
  return htmlPage('Avregistrerad', confirmationBody(kind), 200);
};

// RFC 8058 one-click: mail clients POST here when the user taps the
// native "Unsubscribe" button driven by the List-Unsubscribe-Post header.
export const POST: RequestHandler = async ({ params, url, request }) => {
  const identifier = `unsub:${getClientIdentifier(request)}`;
  const { success } = await checkRateLimit(identifier);
  if (!success) return new Response('Rate limited', { status: 429 });

  const token = params.token ?? '';
  if (!UUID_RE.test(token)) return new Response('Not found', { status: 404 });

  const kind = parseKind(url.searchParams.get('kind'));
  const result = await unsubscribe(token, kind);
  if (result === 'not_found') return new Response('Not found', { status: 404 });
  if (result === 'error') return new Response('Error', { status: 500 });
  return new Response(null, { status: 204 });
};

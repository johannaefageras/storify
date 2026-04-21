// Weekly newsletter cron entry. Runs hourly on Render; for each user whose
// local time is currently Sunday 09:00, sends a recap (or nudge) email and
// logs the attempt to newsletter_sends.
//
// Bundled via scripts/build-cron.mjs (esbuild) into dist/cron/send-weekly.js.
// Bundling — rather than `tsx` — keeps production start cheap and avoids
// shipping a TS loader to the Render cron container.
//
// Flags:
//   --dry-run   read candidates and render emails but do not call Resend or
//               update the database. Safe to run against production.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import {
  selectWeeklyContent,
  type WeeklyContent,
  type WeeklyProfile
} from '../src/lib/newsletter/selectWeeklyContent';
import { renderWeeklyEmail } from '../src/lib/newsletter/templates/weekly';
import { isDueNow, processInBatches } from '../src/lib/newsletter/sendWindow';

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  timezone: string;
  newsletter_unsubscribe_token: string;
  weekly_last_sent_at: string | null;
  created_at: string;
};

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_CONCURRENCY = 10;
const FROM_ADDRESS = 'Storify <weekly@bystorify.se>';

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

function firstNameOf(name: string | null): string {
  const trimmed = name?.trim();
  if (!trimmed) return 'Kära dagboksskrivare';
  return trimmed.split(/\s+/)[0];
}

async function sendOne(
  supabase: SupabaseClient,
  resend: Resend | null,
  baseUrl: string,
  profile: ProfileRow,
  now: Date
): Promise<void> {
  if (!profile.email) {
    console.warn(`[cron] user=${profile.id} has no email, skipping`);
    return;
  }

  const weeklyProfile: WeeklyProfile = {
    id: profile.id,
    created_at: profile.created_at
  };
  const content: WeeklyContent = await selectWeeklyContent(supabase, weeklyProfile, now);

  if (content.variant === 'skip') {
    console.log(`[cron] skip user=${profile.id} reason=${content.reason}`);
    return;
  }

  const unsubUrl = `${baseUrl}/unsubscribe/${profile.newsletter_unsubscribe_token}?kind=weekly`;
  const newEntryUrl = `${baseUrl}/wizard?utm_source=weekly&utm_medium=email`;
  const { subject, html } = renderWeeklyEmail({
    firstName: firstNameOf(profile.name),
    content,
    unsubscribeUrl: unsubUrl,
    newEntryUrl
  });

  if (DRY_RUN || !resend) {
    console.log(
      `[cron][dry-run] would send user=${profile.id} to=${profile.email} variant=${content.variant} subject="${subject}"`
    );
    return;
  }

  let resendMessageId: string | null = null;
  let errorMsg: string | null = null;
  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: profile.email,
      subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    });
    if (result.error) throw new Error(result.error.message);
    resendMessageId = result.data?.id ?? null;
  } catch (e) {
    errorMsg = (e as Error).message;
    console.error(`[cron] send failed user=${profile.id}: ${errorMsg}`);
  }

  const entryIds = content.variant === 'recap' ? content.entries.map((e) => e.id) : [];
  const { error: logError } = await supabase.from('newsletter_sends').insert({
    user_id: profile.id,
    kind: 'weekly',
    variant: content.variant,
    resend_message_id: resendMessageId,
    entry_ids: entryIds,
    error: errorMsg
  });
  if (logError) {
    console.error(`[cron] failed to log send for user=${profile.id}: ${logError.message}`);
  }

  // Only advance the cursor on success — failures retry at the next hourly
  // tick while still inside this Sunday's local 09:00 window.
  if (!errorMsg) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ weekly_last_sent_at: new Date().toISOString() })
      .eq('id', profile.id);
    if (updateError) {
      console.error(
        `[cron] failed to update weekly_last_sent_at for user=${profile.id}: ${updateError.message}`
      );
    }
  }
}

async function main() {
  const supabaseUrl = requireEnv('PUBLIC_SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const baseUrl = requireEnv('PUBLIC_BASE_URL');
  const resendKey = DRY_RUN ? process.env.RESEND_API_KEY : requireEnv('RESEND_API_KEY');

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const resend = !DRY_RUN && resendKey ? new Resend(resendKey) : null;

  const now = new Date();
  // 6 days (not 7) gives a safety margin so we never skip a user whose
  // previous send landed slightly before the current Sunday 09:00 tick.
  const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

  const { data: candidates, error } = await supabase
    .from('profiles')
    .select(
      'id, name, email, timezone, newsletter_unsubscribe_token, weekly_last_sent_at, created_at'
    )
    .eq('newsletter_weekly_enabled', true)
    .or(`weekly_last_sent_at.is.null,weekly_last_sent_at.lte.${sixDaysAgo.toISOString()}`);

  if (error) throw error;

  const all = (candidates ?? []) as ProfileRow[];
  const due = all.filter((p) => p.email && isDueNow(p.timezone, now));

  console.log(
    `[cron] now=${now.toISOString()} candidates=${all.length} due=${due.length}${DRY_RUN ? ' (dry-run)' : ''}`
  );

  await processInBatches(due, BATCH_CONCURRENCY, (profile) =>
    sendOne(supabase, resend, baseUrl, profile, now)
  );

  console.log(`[cron] weekly send complete: processed=${due.length}`);
}

main().catch((e) => {
  console.error('[cron] weekly failed:', e);
  process.exit(1);
});

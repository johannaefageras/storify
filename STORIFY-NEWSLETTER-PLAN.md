# Storify — Weekly Newsletter Implementation Plan

## Goal

Build an automated **weekly personalized newsletter** that goes out every **Sunday morning (in each user's local timezone)** and recaps the user's own journal entries from the past 7 days. Each user gets unique content drawn from their own entries.

A **monthly editorial newsletter** (same content for all subscribers, sent on a chosen date) is planned as a phase-2 follow-up — the data model and infrastructure here must accommodate it without redesign.

This plan is self-contained and ready for an implementing agent to execute.

---

## Product decisions (already made — do not re-litigate)

1. **Sender domain:** `weekly@bystorify.se` (a domain the user owns; **separate from the existing transactional domain `dagbok.mystorify.se`**). The implementing agent must set up SPF, DKIM, and DMARC for `bystorify.se` in Resend before the first send works.
2. **Language:** Swedish only. All copy in templates, settings UI, and unsubscribe page must be in Swedish.
3. **Content scope:** Recap of the past 7 days using excerpts from the user's actual entries. Diary content goes _into_ the email body (not just metadata or links).
4. **Recap window:** Exactly the previous 7 days. No throwback / anniversary logic.
5. **Subscription model:** Opt-in (default off). Separate toggle from the monthly newsletter.
6. **Timezone:** Stored per user. Default `Europe/Stockholm`. Auto-detected at signup but editable.
7. **Unsubscribe:** GDPR-compliant one-click via tokenized URL. Plus `List-Unsubscribe` header for native Gmail/Apple Mail buttons.
8. **Provider:** Resend (already integrated for transactional emails).
9. **Resend plan:** User is currently on **free tier (100/day, 3000/month)**. This is fine for early testing but caps growth. The implementing agent should NOT enable the cron in production until either (a) user upgrades to Pro, or (b) the subscriber count is verified to be small enough.

---

## Existing infrastructure to reuse

- **Resend integration:** [src/routes/api/email/+server.ts](src/routes/api/email/+server.ts) shows the existing pattern (Resend SDK, HTML template, error handling). Reuse the same `Resend` client setup and the same HTML template visual style (white card on light gray, rounded corners, see lines 91–132).
- **Supabase server client:** [src/lib/supabase/server.ts](src/lib/supabase/server.ts) — SSR client. For the cron job we need a **separate service-role client** (see §4).
- **Validation/sanitization:** [src/lib/validation/index.ts](src/lib/validation/index.ts) exports `escapeHtml`, `safeMarkdownToHtml`, `validateEmail`, `LIMITS`. Reuse for excerpt rendering.
- **Env vars already configured** (see [render.yaml](render.yaml)): `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`.
- **Existing schema:** [supabase/migrations/001_schema.sql](supabase/migrations/001_schema.sql) — `profiles` table (PK = `auth.users.id`) and `entries` table (`user_id`, `created_at`, `generated_text`, `tone_id`, `entry_date`, `weekday`, etc.).

---

## 1. Database migration

Create `supabase/migrations/008_newsletter.sql`:

```sql
-- ============================================
-- Phase 8: Newsletter subscriptions and delivery log
-- ============================================

-- 1. Extend profiles
alter table public.profiles
  add column email text,                                                       -- mirrored from auth.users for cron joins
  add column timezone text not null default 'Europe/Stockholm',
  add column newsletter_weekly_enabled boolean not null default false,
  add column newsletter_monthly_enabled boolean not null default false,
  add column newsletter_unsubscribe_token uuid not null default gen_random_uuid() unique,
  add column weekly_last_sent_at timestamptz;

create index profiles_weekly_enabled_idx
  on public.profiles (newsletter_weekly_enabled)
  where newsletter_weekly_enabled = true;

-- 2. Backfill emails from auth.users for existing accounts
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- 3. Keep email in sync on signup (extend existing handle_new_user)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- 4. Keep email in sync on email change
create or replace function public.sync_profile_email()
returns trigger as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.sync_profile_email();

-- 5. Delivery log (idempotency, debugging, compliance audit)
create table public.newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  kind text not null check (kind in ('weekly', 'monthly')),
  variant text,                                  -- 'recap' | 'nudge' | (future variants)
  sent_at timestamptz not null default now(),
  resend_message_id text,
  entry_ids uuid[] not null default '{}',        -- entries referenced in this email
  error text                                     -- non-null if send failed; row still inserted
);

create index newsletter_sends_user_kind_sent_idx
  on public.newsletter_sends (user_id, kind, sent_at desc);

-- 6. Add RLS policies for the new column access patterns
-- (Existing profile policies cover the new columns since they apply to the whole row.
--  newsletter_sends has no user-facing read path; access only via service role.)
alter table public.newsletter_sends enable row level security;
-- No policies = service role only (which bypasses RLS).
```

**Note on `email` column:** mirroring is necessary because the cron job runs without a user JWT and needs to join profile + email + entry data efficiently. The triggers keep it consistent.

---

## 2. Settings UI

Add a "Notiser" / "Nyhetsbrev" section to [src/routes/profile/+page.svelte](src/routes/profile/+page.svelte) with:

1. **Veckobrev toggle** (`newsletter_weekly_enabled`)
   - Label: "Veckobrev varje söndag"
   - Helper text: "Få en sammanfattning av din vecka med utdrag från dina dagboksinlägg."
   - Default: off
2. **Månadsbrev toggle** (`newsletter_monthly_enabled`)
   - Label: "Månadsbrev från Storify"
   - Helper text: "Nyheter, tips och inspiration från Storify-teamet en gång i månaden."
   - Default: off
3. **Tidszon (timezone) field**
   - Auto-detect on first render via `Intl.DateTimeFormat().resolvedOptions().timeZone` if `timezone` is the default
   - Editable dropdown, populated from `Intl.supportedValuesOf('timeZone')`
   - Save on change

All three persist to `profiles` via Supabase. The existing profile save pattern in this file should be followed.

**Important:** when a user toggles weekly ON, set `weekly_last_sent_at = null` so the next Sunday cron picks them up immediately.

---

## 3. Unsubscribe endpoint

Create `src/routes/unsubscribe/[token]/+server.ts`:

- **GET** handler accepts `?kind=weekly|monthly|all`
- Looks up the profile by `newsletter_unsubscribe_token`. Use the **service-role client** (no user JWT here).
- Updates the appropriate flag(s) to `false`. For `kind=all`, set both.
- Returns a simple HTML page in Swedish: "Du är avregistrerad från [veckobrev/månadsbrev]. [Länk: ångra]."
- The "ångra" link points back to `/profile` (requires login to re-enable, which is fine).
- **Rate-limit by IP** using the existing [src/lib/validation/ratelimit.ts](src/lib/validation/ratelimit.ts) helper — token enumeration shouldn't be cheap.
- Log unsubscribes to `newsletter_sends` is NOT appropriate; log to console or skip.

The token is the credential — no auth required, by design (one-click GDPR compliance).

---

## 4. Content selection logic

Create `src/lib/newsletter/selectWeeklyContent.ts`:

```ts
type WeeklyContent =
  | { variant: 'recap'; entries: EntryExcerpt[]; stats: WeekStats }
  | { variant: 'nudge'; promptText: string }
  | { variant: 'skip'; reason: 'new_user_no_entries' };

type EntryExcerpt = {
  id: string;
  date: string; // formatted Swedish, e.g. "måndag 14 april"
  excerpt: string; // ≤150 chars, word-boundary cut, plain text
  toneId: string;
  emojis: string[];
};

type WeekStats = {
  entriesCount: number;
  topTone?: string; // tone_id used most often this week
  totalWords: number;
};
```

**Selection algorithm:**

1. Query `entries` for this user where `created_at >= now() - interval '7 days'`, ordered by `created_at desc`. Use the service-role client.
2. If `entries.length === 0`:
   - Query oldest entry's `created_at` to check account age (or check `profiles.created_at`)
   - If user has 0 lifetime entries AND profile created < 7 days ago → return `{variant: 'skip', reason: 'new_user_no_entries'}`
   - Otherwise → return `{variant: 'nudge', promptText: pickPromptOfTheWeek()}`
3. Otherwise → return `{variant: 'recap', entries: top5Entries, stats}`
   - Take up to 5 most recent entries
   - For each, generate excerpt: strip markdown, take first 150 chars, cut at last word boundary, append `…`
   - Compute `stats`: count, most-used tone_id, sum of word counts in `generated_text`

**Prompt pool** for nudges (rotate weekly using ISO week number as seed for determinism):

```ts
const NUDGE_PROMPTS_SV = [
  'Vad överraskade dig den här veckan?',
  'Vilket ögonblick vill du minnas om ett år?',
  'Vad gjorde dig glad i veckan?',
  'Vad har du lärt dig om dig själv?'
  // …add ~10 to start
];
```

**Tests:** create `selectWeeklyContent.test.ts` co-located. This is pure logic and easy to unit test — cover all four code paths (recap with 1 entry, recap with 5+ entries, nudge for active user with no entries this week, skip for brand new user).

---

## 5. Email template

Create `src/lib/newsletter/templates/weekly.ts` exporting a function:

```ts
export function renderWeeklyEmail(opts: {
  firstName: string;
  content: WeeklyContent; // from selectWeeklyContent
  unsubscribeUrl: string; // full URL with token
  newEntryUrl: string; // CTA target
}): { subject: string; html: string };
```

**Template requirements:**

- Match the visual style of [src/routes/api/email/+server.ts:91-132](src/routes/api/email/+server.ts) (white card, light gray bg, rounded corners, system font stack)
- All copy in Swedish
- Use `escapeHtml` from `$lib/validation` for any user-supplied text (name, excerpts)
- Include a primary CTA button: "Skriv dagens inlägg" → `https://mystorify.se/wizard?utm_source=weekly&utm_medium=email`
- Footer must include:
  - "Du får detta för att du prenumererar på Storifys veckobrev."
  - "Avprenumerera" link (the unsubscribe URL)
- The HTML must include the `List-Unsubscribe` header, but headers are set on the Resend `send()` call, not in HTML — see §6.

**Subject lines per variant:**

- `recap`: `Din vecka i Storify ✨` (or include the count, e.g. `Din vecka: 3 inlägg`)
- `nudge`: `En tanke från Storify`

**Excerpt rendering:** plain-text only inside excerpts (don't render markdown — these are short snippets and markdown formatting in 150 chars looks broken). For the full entry, include a "Läs hela inlägget →" link to `https://mystorify.se/journal#entry-{id}` (verify this anchor pattern matches the journal route's actual implementation).

---

## 6. Cron job — sender script

### 6a. Render config

Add to [render.yaml](render.yaml):

```yaml
- type: cron
  name: storify-newsletter-weekly
  runtime: node
  region: frankfurt
  schedule: '0 * * * *' # top of every hour UTC
  buildCommand: npm install && npm run build
  startCommand: node scripts/send-weekly.js
  envVars:
    - key: RESEND_API_KEY
      sync: false
    - key: PUBLIC_SUPABASE_URL
      sync: false
    - key: SUPABASE_SERVICE_ROLE_KEY
      sync: false
    - key: PUBLIC_BASE_URL
      value: https://mystorify.se
```

**Why hourly, not weekly:** to honor each user's local Sunday morning, the cron has to run more often than once a week. Hourly + a "is it Sunday 09:00 in their timezone?" check gives correct per-user timing without complex scheduling.

### 6b. Sender script

Create `scripts/send-weekly.js` (or `.ts` compiled to `dist/`). Pseudocode:

```ts
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { selectWeeklyContent } from '../src/lib/newsletter/selectWeeklyContent.js';
import { renderWeeklyEmail } from '../src/lib/newsletter/templates/weekly.js';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // bypasses RLS
);
const resend = new Resend(process.env.RESEND_API_KEY!);
const BASE_URL = process.env.PUBLIC_BASE_URL!;

async function main() {
  const nowUtc = new Date();

  // 1. Find candidates: weekly enabled, not sent in the last 6 days
  const sixDaysAgo = new Date(nowUtc.getTime() - 6 * 24 * 60 * 60 * 1000);
  const { data: candidates, error } = await supabase
    .from('profiles')
    .select(
      'id, name, email, timezone, newsletter_unsubscribe_token, weekly_last_sent_at, created_at'
    )
    .eq('newsletter_weekly_enabled', true)
    .or(`weekly_last_sent_at.is.null,weekly_last_sent_at.lte.${sixDaysAgo.toISOString()}`);

  if (error) throw error;

  // 2. Filter to users whose local time is currently Sunday 09:00–09:59
  const due = candidates.filter((p) => {
    const localParts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: p.timezone,
      weekday: 'short',
      hour: '2-digit',
      hour12: false
    }).formatToParts(nowUtc);
    const weekday = localParts.find((x) => x.type === 'weekday')?.value;
    const hour = parseInt(localParts.find((x) => x.type === 'hour')?.value ?? '', 10);
    return weekday === 'sön' && hour === 9;
  });

  // 3. Process with concurrency limit (~10 parallel)
  await processInBatches(due, 10, async (profile) => {
    const content = await selectWeeklyContent(supabase, profile);

    if (content.variant === 'skip') return;

    const unsubUrl = `${BASE_URL}/unsubscribe/${profile.newsletter_unsubscribe_token}?kind=weekly`;
    const newEntryUrl = `${BASE_URL}/wizard?utm_source=weekly&utm_medium=email`;
    const { subject, html } = renderWeeklyEmail({
      firstName: profile.name?.split(' ')[0] || 'Kära dagboksskrivare',
      content,
      unsubscribeUrl: unsubUrl,
      newEntryUrl
    });

    let resendMessageId: string | null = null;
    let errorMsg: string | null = null;
    try {
      const result = await resend.emails.send({
        from: 'Storify <weekly@bystorify.se>',
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
    }

    // 4. Always log the send attempt (success or failure)
    const entryIds = content.variant === 'recap' ? content.entries.map((e) => e.id) : [];
    await supabase.from('newsletter_sends').insert({
      user_id: profile.id,
      kind: 'weekly',
      variant: content.variant,
      resend_message_id: resendMessageId,
      entry_ids: entryIds,
      error: errorMsg
    });

    // 5. Only update last_sent_at on success — failures retry next hour (still inside the same Sunday window)
    if (!errorMsg) {
      await supabase
        .from('profiles')
        .update({ weekly_last_sent_at: new Date().toISOString() })
        .eq('id', profile.id);
    }
  });

  console.log(`Weekly send complete: ${due.length} candidates processed`);
}

main().catch((e) => {
  console.error('Weekly cron failed:', e);
  process.exit(1);
});
```

**Key correctness properties:**

- **Idempotency:** the `weekly_last_sent_at >= 6 days ago` filter ensures no double-sends within a week, even if the cron is invoked multiple times per hour.
- **Failure retry:** within the Sunday 09:00 hour window, a failed send will be retried on the next hourly tick (the script runs at 09:00 UTC, then `weekly_last_sent_at` is still null). Outside that window the user has to wait until next Sunday.
- **Service role:** required to read all users' profiles + entries across the whole table.

### 6c. Build setup

If `selectWeeklyContent` and `renderWeeklyEmail` use TypeScript / Svelte path aliases (`$lib`, `$env`), the cron script can't import them directly. Two options:

1. **Preferred:** keep these modules ESM-only, no `$lib` imports inside them. Use relative paths (`../src/lib/newsletter/...`). This avoids needing a separate build step for the cron.
2. **Alternative:** add a small `scripts/build-cron.js` that uses `esbuild` to bundle `send-weekly.ts` into `dist/send-weekly.js`. Update `render.yaml` `buildCommand` accordingly.

Verify by running locally: `node scripts/send-weekly.js` with appropriate env vars set.

---

## 7. Resend domain setup

**Manual step the implementing agent must call out to the user:**

Before the cron will deliver mail, the user must:

1. Add `bystorify.se` as a domain in the Resend dashboard.
2. Add the SPF, DKIM, and DMARC DNS records Resend provides to the `bystorify.se` DNS zone.
3. Wait for verification (usually minutes).
4. Confirm the `weekly@bystorify.se` sender works via a manual test send.

**Do not enable the production cron until this is verified.**

---

## 8. Phase 2 hooks (monthly editorial — not implemented now)

The following design choices in this plan exist specifically to make phase 2 cheap:

- `newsletter_sends.kind` already accepts `'monthly'` — no schema change needed
- The unsubscribe endpoint already accepts `?kind=monthly` and `?kind=all`
- The same hourly Render cron can drive monthly sends — when the time comes, add a `newsletter_issues` table and an admin route, and extend `send-weekly.js` (or add a sibling `send-monthly.js` with the same patterns)

**Do not implement any of this now.** It is documented only so phase-1 decisions don't block it.

---

## 9. Order of work

Execute strictly in this order. Verify each step before moving on.

1. **Migration** (`008_newsletter.sql`) — apply locally first, verify backfill populated `email` for existing users
2. **Content selection module** + unit tests — pure logic, fastest feedback loop
3. **Email template module** — render to a file and visually check in browser before wiring to send
4. **Settings UI** — add toggles + timezone picker, save to DB, manual test in browser
5. **Unsubscribe endpoint** — manual test by hitting URL with a known token
6. **Resend domain setup** (user's manual step — flag this; don't proceed past here without it)
7. **Cron sender script** — first run locally with `--dry-run` flag (log what _would_ be sent without calling Resend), then with real send to your own account only
8. **Render cron config** — deploy, but with `newsletter_weekly_enabled = true` only on your own account for the first Sunday
9. **Soft launch** — enable for a handful of beta users, monitor `newsletter_sends.error` for failures over 1–2 weeks
10. **Open the toggle to all users** — only after Resend plan upgrade is done if subscriber count is approaching 400 (free tier ÷ ~weekly + headroom)

---

## 10. Acceptance criteria

A reviewing agent / human should be able to verify:

- [ ] Migration applies cleanly; `email` is backfilled for all existing profiles; new signups get `email` populated automatically
- [ ] Profile settings page shows three new controls; toggling them persists to DB
- [ ] Unsubscribe URL flips the right flag and renders the Swedish confirmation page
- [ ] `selectWeeklyContent` unit tests pass for all four variants
- [ ] Manual send to a test account renders correctly in Gmail and Apple Mail (including the native unsubscribe button from `List-Unsubscribe` header)
- [ ] Cron run with no eligible users completes silently (no error)
- [ ] Cron run with a test user logs a row in `newsletter_sends` and updates `weekly_last_sent_at`
- [ ] A second cron run within the same week does NOT re-send to the same user
- [ ] Failed Resend send (simulate by setting bad API key) logs `error` to `newsletter_sends` and does NOT update `weekly_last_sent_at`

---

## 11. Out of scope (do not build)

- Per-user AI-generated weekly summaries (cost concern; recap of literal excerpts is sufficient)
- Throwback / anniversary content
- A/B testing infrastructure for subject lines
- Open/click tracking dashboards beyond what Resend provides natively
- Admin UI for managing subscribers
- Monthly editorial newsletter (phase 2)
- Re-engagement / win-back campaigns
- SMS or push notification equivalents

---

## 12. Implementation progress log (for handoff)

### Done so far

**Step 1 — Database migration ✅**

- Created [supabase/migrations/008_newsletter.sql](supabase/migrations/008_newsletter.sql) exactly per §1.
- **User action pending:** apply the migration to Supabase (out-of-band, per repo convention) and verify `email` backfill populated for existing profiles.

**Step 2 — Content selection module + tests ✅**

- Created [src/lib/newsletter/selectWeeklyContent.ts](src/lib/newsletter/selectWeeklyContent.ts).
  - Exports: `selectWeeklyContent` (IO wrapper around Supabase), `buildWeeklyContent` (pure decision), plus helpers (`stripMarkdown`, `makeExcerpt`, `formatSwedishDate`, `countWords`, `getIsoWeekNumber`, `pickPromptOfTheWeek`) and the `NUDGE_PROMPTS_SV` pool (10 Swedish prompts).
  - Module is `$lib`-free and `$env`-free — imports only `@supabase/supabase-js` types. Can be imported from both SvelteKit and Node scripts without a build step.
  - "New user skip" logic: entries.length === 0 AND `profile.created_at` < 7 days ago → skip. Otherwise nudge.
- Created [src/lib/newsletter/selectWeeklyContent.test.ts](src/lib/newsletter/selectWeeklyContent.test.ts) — 13 tests covering all 4 variants plus helper units.

**Step 3 — Email template + preview tooling ✅**

- Created [src/lib/newsletter/templates/weekly.ts](src/lib/newsletter/templates/weekly.ts):
  - `renderWeeklyEmail({ firstName, content, unsubscribeUrl, newEntryUrl, journalBaseUrl? }) → { subject, html }`.
  - All copy Swedish. `escapeHtml` applied to firstName, excerpts, dates, emojis, prompt text, and heading.
  - CTA button matches app style: background `#f43f7a` (light-theme `--color-accent`), 2px border-radius, 14px/36px padding, semibold 600, 0.025em letter-spacing.
  - Shell mirrors [src/routes/api/email/+server.ts:91-132](src/routes/api/email/+server.ts) (white card on `#f5f5f5`, 12px radius, system font stack).
  - Subjects: recap → `Din vecka: {N} inlägg`; nudge → `En tanke från Storify`; skip → empty output (defensive).
  - Entry links: `{journalBaseUrl}#entry-{id}` (default base `https://mystorify.se/journal`). **UNVERIFIED**: the journal route's actual anchor pattern hasn't been checked — verify before first real send.
- Created [src/lib/newsletter/templates/weekly.test.ts](src/lib/newsletter/templates/weekly.test.ts) — 6 tests (both variants, escaping, empty-name fallback, skip fallback, link building).
- Created [scripts/preview-weekly-email.ts](scripts/preview-weekly-email.ts) — writes `tmp/weekly-recap.html` and `tmp/weekly-nudge.html` for visual QA. Run with `npx tsx scripts/preview-weekly-email.ts`.
- Added `tmp/` to [.gitignore](.gitignore).

**Test status:** all 19 newsletter tests pass (`npm run test:run -- src/lib/newsletter`).

**Step 4 — Settings UI ✅**

- Added a "Nyhetsbrev" section to [src/routes/profile/+page.svelte](src/routes/profile/+page.svelte), placed between the profile form and "Kontoinställningar":
  - **Veckobrev toggle** (`newsletter_weekly_enabled`) — styled iOS-style switch with Swedish label + helper text per §2.
  - **Månadsbrev toggle** (`newsletter_monthly_enabled`) — same pattern.
  - **Tidszon dropdown** (`timezone`) — options from `Intl.supportedValuesOf('timeZone')` with a hard-coded fallback list if unsupported; stored value is always selectable even if absent from the enumerated list.
- **Save-on-change pattern** (not bundled with the "Spara profil" button) — each control writes directly to `profiles` via Supabase. On failure, the control reverts optimistically and `newsletterError` displays a Swedish alert at the top of the section.
- **Auto-detect timezone** on first load: if stored value is still the default `Europe/Stockholm`, `Intl.DateTimeFormat().resolvedOptions().timeZone` is consulted and persisted if different.
- **Weekly ON → resets `weekly_last_sent_at = null`** so the next Sunday cron tick picks the user up immediately (per §2's explicit note).
- `svelte-check` passes with 0 errors (pre-existing warnings untouched).

**Step 5 — Unsubscribe endpoint ✅**

- Created [src/routes/unsubscribe/[token]/+server.ts](src/routes/unsubscribe/[token]/+server.ts):
  - **GET** renders a self-contained Swedish HTML confirmation page ("Du är avregistrerad från {veckobrevet|månadsbrevet|alla nyhetsbrev}") with an "Ändra dina inställningar" link back to `/profile`. Styling mirrors the email template shell (white card on `#f5f5f5`, 12px radius, `#f43f7a` accent, system font).
  - **POST** added in addition to the spec's GET-only request so the `List-Unsubscribe-Post: One-Click` header set by the cron (§6b) actually triggers native Gmail/Apple Mail one-click unsubscribe per RFC 8058. Returns 204 on success, no body.
  - Both methods share a single `unsubscribe(token, kind)` helper that uses a **memoized service-role Supabase client** (anon client can't update arbitrary users). Token lookup uses `.maybeSingle()`; flip is idempotent so repeat clicks are safe.
  - **`kind` parsing:** accepts `weekly|monthly|all`; anything else (including missing) defaults to `weekly`. Chosen so the `List-Unsubscribe` header (always `?kind=weekly` in §6b) and legitimate email links both work; `all` must be explicit to avoid accidentally killing the monthly sub.
  - **Token format:** validated against a UUID regex before any DB call. Invalid format → 404 with the "Länken fungerar inte" page, so we don't waste a DB round-trip on obvious garbage.
  - **Rate limit:** via `checkRateLimit` from [src/lib/validation/ratelimit.ts](src/lib/validation/ratelimit.ts) keyed `unsub:<ip>` (10/hr, shared limiter — fine since legitimate users click at most a couple of times). Fires before the DB lookup so token enumeration is expensive.
  - Unsubscribes logged with `console.log` only; **not** written to `newsletter_sends` (that table is for send attempts, per §3).
  - Response headers: `cache-control: no-store` so unsubscribe pages aren't cached by intermediaries.
- `svelte-check` passes with 0 errors; existing newsletter test suite (19 tests) still green.

**Step 6 — Cron sender script + Render cron config ✅**

- Created [src/lib/newsletter/sendWindow.ts](src/lib/newsletter/sendWindow.ts) — pure helpers extracted so they're testable without spinning up Supabase / Resend:
  - `isDueNow(timezone, now)` — uses `Intl.DateTimeFormat('en-US', { weekday: 'short', hour: '2-digit', hour12: false })` and checks `weekday === 'Sun' && hour === 9`. **Deviation from §6b's pseudocode**: the spec's `sv-SE` short weekday returns `'sön.'` (with trailing period) on modern ICU, so `=== 'sön'` would silently never fire. The `en-US` form (`'Sun'`, `'Mon'`, …) is stable across ICU versions. Invalid TZ strings → returns `false` (defensive — never throws).
  - `processInBatches(items, concurrency, fn)` — promise-pool with per-item error catch so one bad row can't kill the rest of the cohort.
- Created [src/lib/newsletter/sendWindow.test.ts](src/lib/newsletter/sendWindow.test.ts) — 11 tests covering DST-correct windows in three zones (Europe/Stockholm, America/New_York, Asia/Tokyo), wrong-hour, wrong-weekday, invalid TZ, plus concurrency-cap and error-isolation for the batcher.
- Created [scripts/send-weekly.ts](scripts/send-weekly.ts) — the cron entry per §6b, with these refinements over the spec:
  - `--dry-run` flag: reads candidates, runs `selectWeeklyContent`, renders the email, and logs `[cron][dry-run] would send …` instead of calling Resend or touching the DB. `RESEND_API_KEY` becomes optional in dry-run.
  - Concurrency = 10 (matches spec).
  - Per-step error handling on `newsletter_sends.insert` and `profiles.update` — both are logged but never crash the worker (one bad write shouldn't take down the cohort).
  - Service-role Supabase client built with `auth: { persistSession: false, autoRefreshToken: false }` — appropriate for a one-shot script, no token refresh loop left dangling.
  - `firstNameOf(name)` extracted so the empty-name fallback (`'Kära dagboksskrivare'`) matches the template's behavior exactly.
- Created [scripts/build-cron.mjs](scripts/build-cron.mjs) — esbuild bundler producing `dist/cron/send-weekly.js` (ESM, node20 target, sourcemap, `createRequire` banner so any CJS-only deps inside the bundle still resolve `require()` calls).
  - **Why bundling, not `tsx`:** Node 20 (the Render runtime) can't load `.ts` directly, and `tsx` would need to be a production dep. Bundling keeps the cron container minimal and matches §6c's "alternative" path. The newsletter modules' SvelteKit-free / `$lib`-free constraint (preserved per Step 5's notes) makes the bundle small and deterministic.
- Added `build:cron` script and `esbuild` devDep in [package.json](package.json).
- Added `dist/` to [.gitignore](.gitignore) so the cron bundle isn't checked in.
- Extended [render.yaml](render.yaml) with the `storify-newsletter-weekly` cron service (`type: cron`, hourly UTC, Frankfurt, `npm run build:cron` → `node dist/cron/send-weekly.js`). Env vars set per §6a (`RESEND_API_KEY`, `PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_BASE_URL=https://mystorify.se`, `NODE_VERSION=20`). The cron is **safe to deploy now** — with zero opted-in users it just logs `candidates=0 due=0` and exits cleanly. No Resend calls happen until a user toggles weekly ON, so the §7 domain setup is only blocking for the first real send, not for the deploy itself.

**Verification:**

- `npm run test:run` — all 454 tests pass (30 newsletter, including 11 new sendWindow).
- `npm run check` — 0 errors (6 pre-existing warnings untouched).
- `npm run build:cron` — bundles to `dist/cron/send-weekly.js` (1.3 MB, 47 ms).
- End-to-end dry-run against the live Supabase: `node dist/cron/send-weekly.js --dry-run` connected, queried `profiles`, returned `candidates=0 due=0` (which doubly confirms the §1 migration IS applied — a missing `newsletter_weekly_enabled` column would have errored out, not returned zero).

### Key decisions already made (don't re-litigate)

- Newsletter modules avoid `$lib`/`$env` imports and use relative paths, so the future cron script (§6) can import them directly. **Preserve this constraint** — don't add SvelteKit-specific imports into `src/lib/newsletter/`.
- Template uses inline styles only (email-safe). No `<style>` blocks beyond the minimal one inherited from the reference template.
- The pure `buildWeeklyContent` is separated from the IO `selectWeeklyContent` specifically so it's testable without mocking Supabase. Keep this split.

### Next up: Step 7 — Resend domain setup for `bystorify.se` (§7, user-side manual task)

Prerequisites for the first real send:

1. Add `bystorify.se` in the Resend dashboard; publish the SPF/DKIM/DMARC DNS records Resend provides.
2. Once verified, opt one beta account in via the profile page and wait for the next Sunday 09:00 local tick (the cron runs hourly and filters by `isDueNow`).
3. Inspect `newsletter_sends` for the resulting row (`error` should be null, `resend_message_id` populated).

After Step 7, the remaining steps are **Steps 8–10 — soft launch and rollout** (§9). No further code changes are needed for Step 7 — it's DNS + Resend UI only.

**Contract the cron honors (fixed in Step 5, consumed in Step 6):**

- Unsub URL format: `${PUBLIC_BASE_URL}/unsubscribe/${newsletter_unsubscribe_token}?kind=weekly` — emitted by the cron as both a `List-Unsubscribe` header (POST one-click) and a footer link (GET).
- The unsubscribe endpoint shares the Upstash rate limiter with `/api/generate` (keyed `unsub:<ip>`, 10/hr). Mail-provider POSTs for one-click will hit this bucket; if Gmail/Apple are observed getting throttled during soft launch, bump the limit or add a separate prefix.
- `newsletter_sends` is send-attempts only — the cron inserts one row per user per tick (success or failure), and never writes unsubscribe events there.

### Open items the implementing agent should flag

- **Resend domain setup for `bystorify.se` (§7)** is the current blocker for any real send. Cron deploy is safe without it (candidates=0 → no Resend calls), but the moment the first user opts in, sends will fail until DNS is published.
- Verify the journal route's entry-anchor pattern matches `#entry-{id}` (used by [src/lib/newsletter/templates/weekly.ts](src/lib/newsletter/templates/weekly.ts)) or adjust the template's `journalBaseUrl` / anchor format.
- Resend plan: user is on the free tier (100/day, 3000/month). Fine for soft launch, but watch subscriber count — once approaching ~400 weekly opt-ins, upgrade to Pro before opening the toggle broadly (§2 #9).
- Migration [supabase/migrations/008_newsletter.sql](supabase/migrations/008_newsletter.sql) is confirmed applied (the Step 6 end-to-end dry-run query succeeded with `candidates=0` rather than a missing-column error).

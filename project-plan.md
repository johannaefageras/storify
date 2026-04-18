# Storify — Deep Review & Improvement Roadmap

## Context

Storify ([mystorify.se](https://mystorify.se)) is a Swedish-first AI journaling app: users answer a guided questionnaire and Claude generates a personalized diary entry in one of 24 voices. The codebase is SvelteKit 2 + Svelte 5 (runes), TypeScript strict, Supabase (auth + Postgres), Anthropic SDK (Opus 4.6 primary / Sonnet 4.6 fallback), Resend, Upstash Redis (rate limiting), TipTap, Vercel/Node adapter.

This document reviews the current state and proposes improvements — ranging from small hygiene fixes to large product extensions. No code is being changed; treat this as a menu to pick from.

---

## 1. Review — What's Good

- **Privacy-first architecture.** Profile lives in localStorage; only daily wizard data is sent to Claude. Good framing and good default.
- **Prompt-injection defense.** User data wrapped in XML tags in [src/routes/api/generate/+server.ts](src/routes/api/generate/+server.ts); pattern blocklist in [src/lib/validation/validators.ts](src/lib/validation/validators.ts).
- **Rate limiting.** Upstash Redis on all AI/email endpoints via [src/lib/validation/ratelimit.ts](src/lib/validation/ratelimit.ts).
- **Graceful model fallback.** Opus → Sonnet on overload. Users rarely see hard failures.
- **Tone system.** 24 distinct tones with dedicated prompts in [src/lib/data/tonePrompts/](src/lib/data/tonePrompts/) — a real differentiator, not a gimmick.
- **Four creation modes** (wizard, quick, interview, editor) cover different moods and time budgets.
- **TypeScript strict** with minimal `any` leakage; test coverage on stores, validators, utilities.
- **Clean modularization** — stores, utils, validation, data, and components are cleanly separated.

## 2. Review — Issues, in priority order

### High — security & correctness

- **API endpoints don't require auth.** Rate limit is keyed on IP only. Anonymous clients can burn AI budget. Require session on `/api/generate`, `/api/chat`, `/api/email`; keep `/api/community` read path public.
- **Error messages leak SDK internals.** [src/routes/api/generate/+server.ts:228](src/routes/api/generate/+server.ts:228) and [src/routes/api/chat/+server.ts:158](src/routes/api/chat/+server.ts:158) forward raw Anthropic error text. Log server-side, return generic messages.
- **Email XSS surface.** [src/routes/api/email/+server.ts:85-120](src/routes/api/email/+server.ts:85) embeds markdown-rendered HTML into the template. Relies entirely on `marked` being safe. Add explicit allowlist sanitization (e.g. DOMPurify-equivalent) post-render.
- **Third-party script without SRI.** [src/routes/contact/+page.svelte:17](src/routes/contact/+page.svelte:17) loads Forminit via `window.Forminit` — no integrity hash, no version pin.
- **localStorage is plain-text.** Wizard draft and chat history (incl. sensitive reflections) unencrypted. Document it in the privacy page, or move drafts server-side when logged in.

### Medium — DX, observability, UX polish

- **99 `console.log` calls across the codebase.** Replace with a tiny logger module gated by env (`PUBLIC_LOG_LEVEL`). Strip at build for production.
- **No linter/formatter config.** No ESLint, no Prettier, no Stylelint in the repo. `svelte-check` alone isn't enough.
- **No E2E tests.** Unit tests on stores and validators, but no Playwright coverage of the wizard → generate → export flow (the money path).
- **No component tests.** Testing Library is installed but barely used for rendering.
- **README has no Dev Setup / Env Vars section.** Friction for contributors.
- **No CI config visible.** No GitHub Actions for test/typecheck on PR.
- **Loading, empty, error states are inconsistent.** Journal and community pages go blank on failure; the generate spinner has no timeout and no "retry" affordance if the request hangs.
- **Error language mixed.** Swedish in UI, English in API error JSON. Pick one (Swedish) for user-facing messages; keep English in logs.
- **`jomojiMeanings.json` (~117KB) and `voiceSamples.ts` (~36KB)** ship to every client. Lazy-load or move server-side where only category mapping is needed.
- **Accessibility not audited.** No aria labels on emoji pickers / tone dropdowns that I saw; wizard step headings should be `h1` per step for SR navigation.

### Low — code-hygiene polish

- `let foo: X = $state(null!)` pattern for refs in several pages — works, but a `$state<X | null>(null)` with null-guarded access is safer.
- Shuffle/derived computations in [Step10Summary.svelte](src/routes/wizard/steps/Step10Summary.svelte) run on every tick — trivially `$derived` with tone id as key.
- No explicit timeout/abort-signal on `fetch('/api/generate')`.
- Inconsistent naming between `addUserMessage` / `appendToLastAssistantMessage` in [chat.svelte.ts](src/lib/stores/chat.svelte.ts).

---

## 3. Improvement Suggestions — Small (≤1 day each)

- **Logger module** wrapping console with env-gated levels; search-and-replace `console.log`.
- **Lock CORS to known origins** (`mystorify.se`, preview URLs, Capacitor bundle id when/if it ships).
- **Require Supabase session** on `/api/generate`, `/api/chat`, `/api/email`; graceful 401 + redirect.
- **Swap raw error bodies for generic messages**; add a `request-id` so support can correlate.
- **DOMPurify pass** on email HTML before send.
- **SRI hash** on the Forminit script; pin version.
- **ESLint + Prettier + svelte-eslint-parser** with a lean shared config; run in CI.
- **GitHub Actions** pipeline: `pnpm install && svelte-check && vitest run && vite build` on PR.
- **Vitest coverage threshold** (e.g. 60% for stores/utils/validation) to prevent backslide.
- **Empty states** for journal (no entries), community (no hits for filter), calendar (no streak yet).
- **AbortController + timeout** on generate fetch; show retry CTA after ~20s.
- **README Dev Setup section** + link to `.env.example` with a one-liner per var.
- **Accessibility sweep** — aria labels on icon-only buttons, focus rings, skip link, `prefers-reduced-motion`.
- **Bundle-size hygiene** — code-split `jomojiMeanings.json`; move tone previews server-side.
- **Replace `null!` ref patterns** with proper `null`-guarded state.
- **Sentry** (or Vercel error analytics) for API errors and browser exceptions.

## 4. Improvement Suggestions — Medium (1–5 days each)

- **Full-text search in journal.** Postgres `tsvector` on `generated_text`; simple UI in journal page. Pair with tag filters.
- **Entry tags.** Free-form or suggested ("trip", "family", "work"). Store as text[], filter in journal/calendar.
- **Mood analytics dashboard.** Line charts for mood/sleep/energy over time; heatmap calendar. The 1–10 data is already collected but never visualized.
- **Writing streaks + light gamification.** Calendar already computes streaks — surface them in Navbar, add milestone badges.
- **Weekly email digest.** "Your week in diaries" via Resend cron; top emotions, top tone used, a surfaced old entry.
- **Reminders / PWA push notifications.** Evening nudge "Write today's entry" — ties into streaks.
- **Version history per entry.** Store regenerations; let users flip between tones without losing the original.
- **Pinned / favorite entries.**
- **Import from other journal apps** (Day One JSON, Journey, plain markdown).
- **Markdown / Notion / Obsidian export.** Already have text, just need formatters + OAuth for Notion.
- **i18n scaffolding.** Everything is Swedish-hardcoded; `svelte-i18n` or `paraglide` with English as second locale. The British tone shows the infra is almost there.
- **"Letter to your future self"** — schedule an entry to be emailed on a future date via Supabase cron.
- **Year-in-review auto-book.** Compile all December entries into a themed PDF using the existing `PdfDocument.svelte`.
- **Memory resurfacing.** Each wizard start, AI picks a relevant old entry ("One year ago today…"). Deeper version of the current `on_this_day` addon.
- **Multi-turn regeneration.** Inline feedback box: "Make it shorter / funnier / more honest" → re-prompt with diff context.
- **Habit tracker in wizard.** Opt-in daily habits (meditation, exercise, screen time) → charted over time.
- **Dream journal mode** — separate entry type with symbolism analysis prompt.

## 5. Improvement Suggestions — Big (1–4 weeks each)

- **Subscriptions via Stripe.** Free tier (N entries/month, N tones) + Pro (unlimited, all tones, AI illustrations, priority model, longer entries, export formats, family sharing). Natural monetization given API costs are real.
- **Native app via Capacitor.** Comments in the code already hint at this. PWA → proper app with push notifications, widgets, share-target integration.
- **AI illustrations per entry.** DALL-E / Flux / Replicate image per diary entry, using entry excerpt as prompt + a shared style system. High perceived value, fits the "little book" vibe.
- **Voice narration.** ElevenLabs TTS read-back of entries in user's chosen voice. Great for accessibility and bedtime-journal use cases.
- **Voice input / dictation.** Speech-to-text via Whisper for wizard inputs and interview mode. Particularly powerful on mobile.
- **Photo-driven entries.** Upload photos; vision model describes them; wizard auto-fills activities and mood; illustrations reuse the photos as reference.
- **Integrations.**
  - Apple Health / Google Fit → auto-fill sleep and steps.
  - Spotify → pull the day's top tracks into Step 6.
  - Google Calendar → pull events into Step 3 activities.
  - Oura / Whoop → mood/energy prefill.
- **End-to-end encryption** for entries (premium tier). Entries are sensitive; "only you can read them" is a strong sell.
- **Collaborative / shared journals.** Couple or family shared diary — each person contributes; AI weaves a shared narrative.
- **AI reflection partner.** Post-entry, a chat mode where Claude asks gentle follow-up questions about patterns over the last N entries (opt-in; uses only the user's own corpus as context).
- **Time capsule** (already teased in wizard Step 7) — actually implement the "unlock on a date" delivery via scheduled email or in-app reveal.
- **Community v2.** Reactions, threaded replies, follow authors, anonymous DMs, weekly featured entries. Today it's a read-mostly gallery.
- **Prompt library.** Curated journaling prompts ("What would you tell yourself a year ago?") with a daily rotation — a low-lift way to get people writing when they feel stuck.
- **Therapy / CBT mode.** Guided entries around cognitive distortions, gratitude, worry postponement. Explicitly framed as _not_ therapy but inspired by it.

## 6. Platform & Infra Improvements

- **Auth middleware** instead of per-route session checks.
- **Sentry + structured logging** (pino to Axiom/Logtail/Betterstack).
- **Preview envs per PR** via Vercel.
- **Supabase migrations tracked in-repo** (if not already) — schema drift is invisible right now.
- **Scheduled Postgres backups + restore drill.**
- **Feature flags** (Flipt or a Supabase table) for rolling out Pro features and A/B'ing tones.
- **OpenAPI / typed client** for `/api/*` to eliminate fetch drift between UI and server.
- **Capacitor scaffolding** — since the CORS rules already anticipate it.

## 7. Critical Files Referenced

- [src/routes/api/generate/+server.ts](src/routes/api/generate/+server.ts) — main generation endpoint
- [src/routes/api/chat/+server.ts](src/routes/api/chat/+server.ts) — interview endpoint
- [src/routes/api/email/+server.ts](src/routes/api/email/+server.ts) — email delivery
- [src/lib/validation/validators.ts](src/lib/validation/validators.ts), [sanitizers.ts](src/lib/validation/sanitizers.ts), [ratelimit.ts](src/lib/validation/ratelimit.ts)
- [src/lib/stores/wizard.svelte.ts](src/lib/stores/wizard.svelte.ts), [chat.svelte.ts](src/lib/stores/chat.svelte.ts), [auth.svelte.ts](src/lib/stores/auth.svelte.ts)
- [src/lib/data/tones.ts](src/lib/data/tones.ts) and [src/lib/data/tonePrompts/](src/lib/data/tonePrompts/)
- [src/routes/wizard/steps/Step10Summary.svelte](src/routes/wizard/steps/Step10Summary.svelte)
- [src/routes/contact/+page.svelte](src/routes/contact/+page.svelte)
- [svelte.config.js](svelte.config.js), [vite.config.ts](vite.config.ts), [package.json](package.json)

## 8. Suggested First Sprint (if you pick one thing to start)

If I had to bet on highest ROI for a week of work:

1. **DOMPurify + AbortController/timeout on generate fetch** — closes the email XSS surface and the hanging-spinner UX bug in one small pass.
2. **Logger + Sentry + GitHub Actions CI** — foundation for everything else.
3. **Mood analytics dashboard** — turns data you already collect into a reason to come back.
4. **Writing streaks + light gamification** — calendar already computes streaks; surfacing them in Navbar with milestone badges is a cheap retention hook that compounds with analytics.
5. **Entry tags + full-text journal search** — bundle since tags (`text[]`) and `tsvector` land in the same migration; turns the journal from a scroll into something browsable.

Everything else can follow from there.

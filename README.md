# Storify

Storify is a Swedish AI journaling app for turning short notes, guided answers, or an interview-style chat into polished diary entries. Users can write through several flows, choose a narrative voice, save entries to a private journal, export/share selected entries, and optionally publish anonymized entries to the community.

Live site: https://mystorify.se

## What It Does

- AI diary generation with Anthropic Claude, including streaming responses and fallback model support.
- Four writing modes: AI interview, step-by-step wizard, quick entry, and free-writing editor.
- Swedish-first UI and generated content, with some voices intentionally using other styles or English.
- Private account-based journal backed by Supabase Auth and Postgres.
- Profile, theme, accent, font, avatar, newsletter, and push reminder settings.
- Entry editing, retone generation, title generation, PDF/image-style sharing utilities, and public share links.
- Community page for voluntarily shared diary entries.
- Blog posts from local Markdown files in `src/posts`.
- Badge/gamification system for writing milestones and feature usage.
- Weekly recap email and daily push reminder cron scripts.

## Tech Stack

| Area | Technology |
| --- | --- |
| App | SvelteKit 2, Svelte 5, TypeScript, Vite |
| Runtime | Node adapter with `server.js` |
| AI | Anthropic SDK |
| Database/Auth | Supabase |
| Rate limiting | Upstash Redis |
| Email | Resend |
| Push | Web Push / VAPID |
| Maps/geocoding | Google Maps / Google Cloud credentials |
| Rich text | Tiptap |
| PDF/export | jsPDF, html2canvas |
| Tests | Vitest, Testing Library, svelte-check |
| Hosting | Render web service plus Render cron jobs |

## Getting Started

Use npm; this repo includes `package-lock.json`.

```bash
npm install
cp .env.example .env
npm run dev
```

The dev server runs at the URL printed by Vite, usually `http://localhost:5173`.

Render deploys with Node 20, and that is the safest local version to use as well.

## Environment Variables

Copy `.env.example` to `.env` and fill in the services you need for the feature you are testing.

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Required for AI generation and chat. |
| `CHAT_MODEL`, `CHAT_MAX_TOKENS` | Chat/interview model configuration. |
| `GENERATE_PRIMARY_MODEL`, `GENERATE_FALLBACK_MODEL`, `GENERATE_MAX_TOKENS` | Diary generation model configuration. |
| `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` | Supabase client/auth configuration. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side jobs and privileged API work. |
| `RESEND_API_KEY` | Email sending. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Server-side rate limiting. |
| `GOOGLE_MAPS_API_KEY`, `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Places/geocoding support. |
| `PUBLIC_VAPID_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Browser push notifications. |
| `CLEANUP_SECRET` | Protected cleanup endpoint access. |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` | Google auth integration secret when enabled in Supabase. |
| `VITE_API_BASE_URL` | Legacy/optional API base setting; current app calls local API paths. |

Generate VAPID keys with:

```bash
npm exec web-push generate-vapid-keys
```

## Supabase Setup

The database schema lives in `supabase/migrations`. Apply the migrations in order to a Supabase project before using authenticated flows.

Core tables/features include:

- `profiles` for account profile, preferences, newsletter, push, and badge backfill state.
- `entries` for private saved diary entries and public share links.
- `community_entries` for community-shared copies.
- `user_badges` and related badge migration data.
- `newsletter_sends`, `push_subscriptions`, and `push_sends` for scheduled messaging.

Supabase Row Level Security policies are part of the migrations.

## Scripts

```bash
npm run dev            # start local dev server
npm run build          # production build
npm run preview        # preview the production build
npm run check          # svelte-check + SvelteKit sync
npm run test           # run Vitest in watch mode
npm run test:run       # run Vitest once
npm run test:coverage  # run Vitest with coverage
npm run build:cron     # bundle cron scripts into dist/cron
```

Cron entry points:

- `scripts/send-weekly.ts` sends weekly recap emails.
- `scripts/send-reminders.ts` sends daily journal push reminders.
- `scripts/preview-weekly-email.ts` previews the weekly email template.
- `scripts/backfill-titles.mjs` backfills entry titles.

## Project Structure

```text
storify/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # landing/dashboard
│   │   ├── interview/                # AI interview flow
│   │   ├── wizard/                   # guided multi-step flow
│   │   ├── quick/                    # short entry flow
│   │   ├── editor/                   # free-writing editor
│   │   ├── journal/                  # private saved entries
│   │   ├── community/                # public shared entries
│   │   ├── profile/                  # profile, settings, account pages
│   │   ├── blog/                     # Markdown-backed blog
│   │   ├── shared/[shareId]/         # public entry links
│   │   └── api/                      # generation, chat, share, badges, email, geocode
│   ├── lib/
│   │   ├── assets/                   # fonts, icons, custom emoji SVGs
│   │   ├── components/               # reusable Svelte components
│   │   ├── data/                     # tones, prompts, badges, copy, samples
│   │   ├── gamification/             # badge evaluation and awarding
│   │   ├── newsletter/               # weekly email selection/templates
│   │   ├── stores/                   # Svelte stores for auth, wizard, UI prefs
│   │   ├── supabase/                 # browser/server Supabase clients
│   │   ├── utils/                    # date, sharing, PDF/image, title helpers
│   │   └── validation/               # input validation, sanitizing, rate limits
│   ├── posts/                        # blog Markdown
│   └── service-worker.ts             # push/service worker support
├── docs/tones/                       # human-readable tone documentation
├── scripts/                          # cron and maintenance scripts
├── static/                           # favicons, manifests, OG image, robots/sitemap
├── supabase/migrations/              # database schema and RLS migrations
├── render.yaml                       # Render web + cron services
├── server.js                         # Node production server wrapper
└── package.json
```

## Writing Voices

Voice definitions are split between:

- `src/lib/data/tones.ts` for UI metadata.
- `src/lib/data/tonePrompts/` for generation prompts.
- `src/lib/data/voiceSamples.ts` and `src/lib/data/voiceGallery.ts` for previews and examples.
- `docs/tones/` for longer tone documentation.

When adding a new voice, update all relevant files and add tests where prompt or generation helper behavior changes.

## Deployment

`render.yaml` defines:

- `storify`, the Node web service running `node server.js`.
- `storify-newsletter-weekly`, an hourly cron that sends only to users whose local time is due.
- `storify-push-reminders`, an hourly cron that sends reminders to opted-in users who have not written today.

The production build uses `@sveltejs/adapter-node`. `server.js` adds cache headers for long-lived static assets and short-lived metadata files before handing requests to SvelteKit.

## Privacy Model

Storify stores account data, saved entries, preferences, badges, community links, newsletter settings, and push subscriptions in Supabase for logged-in users. Entries are private by default. Public sharing and community publishing are explicit user actions.

AI generation sends the provided diary input and profile context needed for the selected flow to Anthropic. Optional location-related features are used for weather/geocoding behavior when enabled.

See the in-app `/privacy`, `/terms`, and `/cookies` pages for user-facing policy text.

## License

Proprietary software. All rights reserved.

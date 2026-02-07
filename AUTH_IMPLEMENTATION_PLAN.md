# Supabase Auth & Journal Implementation Plan

This document outlines the plan for adding user authentication (Supabase), profile management, and a journal/gallery feature to Storify.

---

## Phase 1: Supabase Setup & Auth Store — DONE

### 1.1 Install Dependencies — DONE

- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - SvelteKit SSR helpers for auth

### 1.2 Supabase Project & Environment — DONE

- Created Supabase project
- Added env vars: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` to `.env`
- TODO: Add to `.env.example` and document in `CLAUDE.md`

### 1.3 Supabase Client — DONE

- Created `src/lib/supabase/client.ts` - browser client (uses `createBrowserClient` from `@supabase/ssr`)
- Created `src/lib/supabase/server.ts` - server client factory with cookie-based sessions

### 1.4 Auth Store — DONE

- Created `src/lib/stores/auth.svelte.ts` - Svelte 5 runes-based store
- Exposes: `user`, `session`, `isLoggedIn`, `isLoading`, `signOut()`
- Listens to `onAuthStateChange` to stay in sync
- Initialized in root `+layout.svelte` on mount

### 1.5 Auth Hooks — DONE

- Created `src/hooks.server.ts` with Supabase session middleware
- Attaches `supabase` client and `safeGetSession` to `event.locals`
- Updated `src/app.d.ts` with `Locals` type definitions

---

## Phase 2: Auth Pages — DONE

### 2.1 Login Page (`/login`) — DONE

- Email + password form
- Google OAuth button ("Fortsätt med Google")
- Links to register and forgot-password
- Redirects to `/wizard` on success
- Swedish UI labels

### 2.2 Register Page (`/register`) — DONE

- Email + password + confirm password
- Client-side validation (password match, min 6 chars)
- Supabase `signUp` with email confirmation flow
- Shows success message with "check your inbox" instructions

### 2.3 Forgot Password Page (`/forgot-password`) — DONE

- Email input, calls Supabase `resetPasswordForEmail`
- Confirmation message shown after submission

### 2.4 Auth Callback Route (`/auth/callback`) — DONE

- Created as `+page.svelte` (client-side) instead of `+server.ts`
- Handles OAuth redirects and email confirmation links
- Exchanges code for session via `supabase.auth.exchangeCodeForSession`
- Redirects to `/wizard` on success

### 2.5 Google OAuth — DONE (configured)

- Enabled Google provider in Supabase dashboard
- Created OAuth client ID in Google Cloud Console (storify-v2 project)
- Authorized redirect URI: `https://ytsznparkcxepaftkpqf.supabase.co/auth/v1/callback`

All auth pages have `prerender: false` and `ssr: false` since they use browser-only Supabase auth.

---

## Phase 3: Navigation — DONE

### 3.1 Navbar Component — DONE

- Created `src/lib/components/Navbar.svelte`
- **Logged-in state**: Dagbok, Journal, Profil links + Logga ut button
- **Guest state**: Dagbok + Logga in link
- Responsive hamburger menu on mobile (<=600px)
- Theme toggle integrated into navbar
- Auto-closes menu on navigation
- Uses Svelte 5 `$app/state` (not deprecated `$app/stores`)

### 3.2 Layout Integration — DONE

- Replaced standalone `ThemeToggle` with `Navbar` in root `+layout.svelte`
- Note: Landing page and wizard page still have their own inline ThemeToggles (potential cleanup later)

---

## Phase 4: Database Schema — DONE

### 4.1 Profiles Table — DONE

Migration file created at `supabase/migrations/001_schema.sql`. Run in Supabase SQL Editor or via CLI:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text default '',
  birthday date,
  pronouns text default '',
  hometown text default '',
  family text[] default '{}',
  pets text[] default '{}',
  occupation_type text default '',
  occupation_detail text[] default '{}',
  interests text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: users can only read/update their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
```

Auto-create profile on signup via a database trigger:

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 4.2 Entries Table — DONE

```sql
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),

  -- Generated content
  generated_text text not null,
  tone_id text not null,

  -- Wizard metadata (for rich previews in journal)
  entry_date date not null,
  weekday text,
  emojis text[] default '{}',
  mood_color text,
  energy_level integer,
  sleep_quality integer,
  mood_level integer
);

-- RLS: users can only access their own entries
alter table public.entries enable row level security;

create policy "Users can view own entries"
  on public.entries for select using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.entries for insert with check (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.entries for delete using (auth.uid() = user_id);
```

---

## Phase 5: Profile Page — DONE

### 5.1 Profile Route (`/profile`) — DONE

- Created `src/routes/profile/+page.svelte` and `+page.ts`
- Protected route (redirects to `/login` if not authenticated)
- Reuses the same fields as Step0Profile (name, birthday, pronouns, hometown, family, pets, occupation, interests)
- Loads from and saves to Supabase `profiles` table
- Editable fields with "Spara profil" button, success/error feedback
- Note: Field logic was duplicated rather than extracted into shared components (potential cleanup later)

### 5.2 Wizard Store Dual-Source Loading — DONE

- Updated `wizardStore.initProfile()` in `src/lib/stores/wizard.svelte.ts`:
  - If logged in → loads profile from Supabase `profiles` table via `loadProfileFromSupabase()`
  - If guest → loads from Capacitor Preferences via `loadProfileFromPreferences()` (existing behavior)
- `saveProfile()` writes to the appropriate source based on auth state
- Wizard auto-skips Step 0 for logged-in users (`currentStep` set to 1 in `initProfile()`)
- Updated `src/routes/+layout.svelte`: `await authStore.init()` before `wizardStore.initProfile()` to ensure auth state is ready
- Updated `src/routes/wizard/+page.svelte`: Back button on Step 1 links to `/` for logged-in users (since Step 0 is skipped)

---

## Phase 6: Save Entry Flow — DONE

### 6.1 Save to Journal Button — DONE

- Added "Spara i journalen" button in `Step10Summary.svelte`, displayed as a full-width prominent button between the diary card and the export actions grid
- Only visible for logged-in users (`authStore.isLoggedIn`)
- Calls Supabase `.insert()` on `entries` table with generated text + metadata
- Uses `actualToneUsed` (not `selectedTone`) to correctly handle "surprise" mode randomization
- Shows spinner while saving, checkmark + "Sparat i journalen!" on success (auto-dismisses after 3s), error message on failure
- Uses `EmojiLedger` icon

### 6.2 Entry Data Mapping — DONE

Includes a `parseSwedishDate()` helper to convert Swedish date strings (e.g. "6 februari 2026") to ISO format ("2026-02-06") for the `entry_date` DATE column.

| Wizard State | Entry Column |
|---|---|
| `generatedEntry` (local) | `generated_text` |
| `actualToneUsed` | `tone_id` |
| `date` (parsed to ISO) | `entry_date` |
| `weekday` | `weekday` |
| `emojis` | `emojis` |
| `moodColor` | `mood_color` |
| `energyLevel` | `energy_level` |
| `sleepQuality` | `sleep_quality` |
| `mood` | `mood_level` |

---

## Phase 7: Journal Page — DONE

### 7.1 DiaryCard Shared Component — DONE

- Extracted diary card rendering (paper texture, header with date/emojis, formatted content with addon heading detection, footer with tone icon/name and branding) from `Step10Summary.svelte` into `src/lib/components/DiaryCard.svelte`
- Props: `weekday`, `date`, `emojis`, `toneId`, `generatedText`, `birthday?`
- Exposes `getDocumentElement()` for parent image/PDF export
- Refactored `Step10Summary.svelte` to use `<DiaryCard>` instead of inline markup

### 7.2 Journal Route (`/journal`) — DONE

- Protected route (redirects to `/login` if not authenticated, same pattern as `/profile`)
- Fetches entries from Supabase ordered by `entry_date` DESC
- Displays as a responsive card grid (2 columns desktop, 1 column mobile):
  - Each card shows: weekday, date, emojis (up to 3), tone icon/name, truncated text preview (~120 chars)
  - Grouped by month (e.g. "Februari 2026")
- Empty state with message and link to wizard

### 7.3 Entry Modal — DONE

- Clicking a card opens a scrollable overlay modal displaying the full entry via `<DiaryCard>`
- Close button, backdrop click, and Escape key to dismiss
- Copy to clipboard action
- Delete button with inline confirmation dialog ("Ta bort inlägget?" → "Ja, ta bort" / "Avbryt")
- Deleting removes from Supabase and local state, then closes modal

---

## Phase 8: Polish & Cleanup — DONE

### 8.1 Update CLAUDE.md — DONE

- Added Supabase Auth section (browser client, server client, hooks, database schema)
- Documented new routes (auth pages, protected pages), components (Navbar, DiaryCard), auth store
- Updated wizard store description for dual-source profile loading
- Added `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` to required env vars
- Updated test coverage table with auth store and wizard dual-source tests

### 8.2 .env.example — DONE

- Created `.env.example` with all required and optional env vars

### 8.3 Tests — DONE

- Created `src/lib/stores/auth.svelte.test.ts` (6 tests): initial state, init with/without session, auth state change listener (sign-in + sign-out), signOut
- Updated `src/lib/stores/wizard.svelte.test.ts` (7 new tests): dual-source profile loading from Preferences (guest) and Supabase (logged-in), error handling for both sources, save routing to correct destination

### 8.4 Auth Callback Fix — DONE

- Converted auth callback from client-side (`+page.svelte` with `ssr: false`) to server-side (`+server.ts`)
- Fixed PKCE "code verifier not found" error: the server client (via `event.locals.supabase`) has proper cookie access to the PKCE code verifier stored during the initial auth request
- Removed `src/routes/auth/callback/+page.svelte` and `+page.ts`
- Created `src/routes/auth/callback/+server.ts`: reads `code` param, exchanges for session via server client, redirects to `/wizard` on success or `/login?error=auth` on failure

### 8.5 ThemeToggle Cleanup — SKIPPED (intentional)

- Inline ThemeToggles on landing page and wizard page are mobile-only responsive overrides (shown ≤600px when Navbar's toggle is hidden). Not duplication — left as-is.

### 8.6 Capacitor Considerations — NOTE

- OAuth deep links for Capacitor require manual testing on Android (not automatable here)

---

## File Overview

### Files created (Phases 1–3):

```
src/lib/supabase/client.ts              # Browser Supabase client
src/lib/supabase/server.ts              # Server Supabase client factory
src/lib/stores/auth.svelte.ts           # Auth state store
src/lib/components/Navbar.svelte        # Navigation bar
src/hooks.server.ts                     # Supabase session middleware
src/routes/login/+page.svelte           # Login page
src/routes/login/+page.ts               # Disable prerender/ssr
src/routes/register/+page.svelte        # Register page
src/routes/register/+page.ts            # Disable prerender/ssr
src/routes/forgot-password/+page.svelte # Forgot password page
src/routes/forgot-password/+page.ts     # Disable prerender/ssr
src/routes/auth/callback/+server.ts     # OAuth/email callback (server-side, PKCE-compatible)
```

### Files created (Phases 4–5):

```
supabase/migrations/001_schema.sql      # Database schema (profiles + entries tables)
src/routes/profile/+page.svelte         # Profile management page
src/routes/profile/+page.ts             # Disable prerender/ssr
```

### Files modified (Phases 1–3):

```
src/app.d.ts                            # Added Locals types for Supabase
src/routes/+layout.svelte               # Added Navbar, init auth store
```

### Files modified (Phases 4–6):

```
src/lib/stores/wizard.svelte.ts         # Dual-source profile loading (Supabase / Preferences)
src/routes/+layout.svelte               # await authStore.init() before initProfile()
src/routes/wizard/+page.svelte          # Skip Step 0 back button for logged-in users
src/routes/wizard/steps/Step10Summary.svelte # "Spara i journalen" button for logged-in users
```

### Files created (Phase 7):

```
src/lib/components/DiaryCard.svelte     # Shared diary entry card component
src/routes/journal/+page.svelte         # Journal page with card grid, modal, delete
src/routes/journal/+page.ts             # Disable prerender/ssr
```

### Files modified (Phase 7):

```
src/routes/wizard/steps/Step10Summary.svelte # Refactored to use <DiaryCard> component
```

### Files created (Phase 8):

```
.env.example                            # All env vars documented
src/lib/stores/auth.svelte.test.ts      # Auth store unit tests
src/routes/auth/callback/+server.ts     # Server-side auth callback (replaced client-side page)
```

### Files modified (Phase 8):

```
CLAUDE.md                               # Updated docs (routes, stores, components, env vars)
src/lib/stores/wizard.svelte.test.ts    # Added dual-source profile loading tests
```

### Files removed (Phase 8):

```
src/routes/auth/callback/+page.svelte   # Replaced by +server.ts
src/routes/auth/callback/+page.ts       # Replaced by +server.ts
```

# Profile Redesign Plan — Hub + Sub-pages

> **For the AI/agent picking this up:** this is a refactor, not a rewrite. All current functionality already exists in [src/routes/profile/+page.svelte](src/routes/profile/+page.svelte) (a ~1600-line file). Your job is to split it into a hub and three sub-routes, **without losing any behavior**. Read the source file end-to-end before starting.

---

## Goal

Turn `/profile` from one long scrollable page into a hub:

- **`/profile`** — landing page. Avatar, name, badges, a small "your journal" summary, and three navigation cards leading to the sub-pages below. No editable fields.
- **`/profile/edit`** — all profile-data fields (name, birthday, pronouns, hometown, family, pets, occupation, interests). Save button. Avatar upload.
- **`/profile/settings`** — newsletter toggles (weekly/monthly), push reminders, timezone.
- **`/profile/account`** — email (read-only), change password, log out.

The "Ny anteckning / Dagböcker / Kalender" action cards stay on the hub.

---

## Constraints (don't break these)

- Auth gate: every sub-route must redirect to `/login` if not logged in (current logic is in `onMount` of [+page.svelte:534-547](src/routes/profile/+page.svelte#L534-L547)).
- `prerender = false` and `ssr = false` are set in [+page.ts](src/routes/profile/+page.ts). Apply the same to every new sub-route's `+page.ts`.
- Supabase access uses the browser client from [$lib/supabase/client](src/lib/supabase/client.ts) and the auth store at [$lib/stores/auth.svelte](src/lib/stores/auth.svelte.ts) — keep using those, do not introduce a server load.
- Validation: keep using `FIELD_LIMITS` from [$lib/validation](src/lib/validation/) — do not inline length checks.
- Badges:
  - `fireBadgeEvent('profile-photo-uploaded')` after avatar upload
  - `fireBadgeEvent('profile-updated')` after profile save
  - `fireBadgeEvent('notifications-enabled')` when push is turned on
- After profile save, call `wizardStore.initProfile()` so wizard data stays in sync (see [+page.svelte:495](src/routes/profile/+page.svelte#L495)).
- Timezone auto-detect logic (only runs when value is still default `Europe/Stockholm`) must be preserved. See [+page.svelte:300-313](src/routes/profile/+page.svelte#L300-L313).
- Push support detection (`unsupported` vs `needs-ios-install`) must be preserved. See [+page.svelte:347-358](src/routes/profile/+page.svelte#L347-L358).
- Use Svelte 5 runes (`$state`, `$derived`) — these files are `.svelte`, not `.svelte.ts`, but the rune syntax is the same in `<script>` blocks. Match the existing style.
- Swedish UI copy — keep all user-facing strings in Swedish. Reuse the exact strings from the current file where possible.
- Styles: existing CSS is page-scoped. Move only the styles each sub-page actually uses; do not invent a new design system.

---

## Step-by-step

### Step 1 — Inventory the current file

Open [src/routes/profile/+page.svelte](src/routes/profile/+page.svelte) and map every block to one of the four destinations:

| Current block | Destination |
|---|---|
| Hero (avatar + name + `ProfileBadgeStrip`) | **hub** (read-only avatar, no upload), **edit** (with upload) |
| `.profile-actions` (Ny anteckning / Dagböcker / Kalender) + writing-mode modal | **hub** |
| Profile form fields (name, birthday, pronouns, hometown, occupation, family, pets, interests) | **edit** |
| Newsletter section (`Aviseringar`) | **settings** |
| Account section (email + password change) | **account** |
| Log out button | **account** |
| `LegalFooter` | **all four routes** |

Helpers that need to move with their owner:

- `parseBirthday`, `getDaysInMonth`, `handleBirthdayPartChange`, `swedishMonths`, `pronounOptions`, all tag helpers (`addTag`, `removeTag`, `removeLastTag`, `handleKeydown`, `handleCommaInput`, `focusInput`, `addFamily`, `addOccupation`, `addPet`, `addInterest`), `handleAvatarUpload`, `handleSave` → **edit**
- `handleWeeklyToggle`, `handleMonthlyToggle`, `handlePushToggle`, `handleTimezoneChange`, `checkPushSupport` import + push detection → **settings**
- `handleChangePassword`, `handleSignOut` → **account**

### Step 2 — Create the four routes

Create these files. Each `+page.ts` is identical to the current one (`prerender = false`, `ssr = false`).

```
src/routes/profile/+page.svelte           ← rewrite (hub)
src/routes/profile/+page.ts               ← unchanged
src/routes/profile/edit/+page.svelte      ← new
src/routes/profile/edit/+page.ts          ← new
src/routes/profile/settings/+page.svelte  ← new
src/routes/profile/settings/+page.ts      ← new
src/routes/profile/account/+page.svelte   ← new
src/routes/profile/account/+page.ts       ← new
```

Each sub-route's `<script>` must include the same auth-gate `onMount` pattern (poll `authStore.isLoading`, redirect to `/login` if not signed in, then call its own loader). Do not skip this — there is no server-side guard.

### Step 3 — Build a small shared loader (optional but recommended)

Three of the four pages need to read from the `profiles` Supabase row. Rather than duplicating the `select('*').eq('id', user.id).single()` query, add a helper:

- New file: `src/lib/profile/loadProfile.ts`
- Exports `loadProfileRow(userId: string)` returning the typed row (or `null` on error).
- Each page calls it and picks the fields it needs.

This is optional — if it complicates rune reactivity, just inline the query in each page. Don't over-engineer.

### Step 4 — Build the hub (`/profile`)

Contents, top to bottom:

1. Hero: `AvatarUpload` with `editable={false}` (just displays), name as `{name ? \`${name}s Profil\` : 'Min Profil'}`, `ProfileBadgeStrip`.
2. Action cards (existing): Ny anteckning (opens writing-mode modal), Dagböcker (`/journal`), Kalender (`/calendar`). Modal markup + handlers stay here.
3. **New** navigation list — three cards linking to the sub-routes:
   - "Redigera profil" → `/profile/edit` — helper text e.g. "Namn, födelsedag, intressen…"
   - "Aviseringar" → `/profile/settings` — helper text e.g. "Veckobrev, påminnelser, tidszon"
   - "Konto" → `/profile/account` — helper text e.g. "E-post, lösenord, logga ut"
   - Style these like `.action-card` but with a subtitle line. Reuse `arrowRightSvg`.
4. `LegalFooter` at the bottom.

The hub should only need: `name`, `avatarUrl` from the profile row. Load just those fields.

### Step 5 — Build `/profile/edit`

- Move the entire `<form class="profile-form">` plus its hero (with editable avatar) into this page.
- Add a back link or breadcrumb at the top: "← Tillbaka till profil" linking to `/profile`. Keep it lightweight; match the visual language of the rest of the app.
- After `handleSave` succeeds, leave the user on the page (current behavior — show success alert). Do not auto-navigate.
- Keep the success/error alert pattern unchanged.

### Step 6 — Build `/profile/settings`

- Move the `Aviseringar` section here.
- Same back link to `/profile`.
- Toggles save on change (current behavior — no Save button). Preserve optimistic update + revert-on-error pattern from `handleWeeklyToggle` / `handleMonthlyToggle` / `handlePushToggle` / `handleTimezoneChange`.
- Preserve the timezone auto-detect-on-first-visit behavior in this page's loader.
- Preserve push support detection and the `pushUnavailable` messaging.

### Step 7 — Build `/profile/account`

- Move email field + password change form + log out button.
- Same back link to `/profile`.
- `handleSignOut` redirects to `/` — unchanged.

### Step 8 — Slim down the original `+page.svelte`

After steps 4–7 are working, the original file becomes the hub from step 4. Delete every script/markup/style block that no longer belongs. The `<style>` block should shrink dramatically — keep only `.profile-page`, `.profile-hero`, `.hero-content`, `.hero-info`, `.hero-name`, `.profile-actions`, `.action-card`, `.action-label`, the modal styles, and the loading wrapper.

### Step 9 — Move shared styles if duplicated

If the same CSS is repeated across `edit` / `settings` / `account` (likely: `.profile-section`, `.section-title`, `.field-group`, `.field-label`, inputs, selects, alerts, toggle styles), extract them into either:

- a new `src/routes/profile/profile.css` imported by each page, **or**
- a `src/lib/components/profile/` set of components (e.g. `ProfileSection.svelte`, `Field.svelte`, `Toggle.svelte`).

Prefer the first option unless you see real reuse value — don't build a component library for a one-off refactor.

### Step 10 — Verify

Run, in order:

1. `npm run check` — must pass (TypeScript + Svelte diagnostics).
2. `npm run test:run` — must pass.
3. `npm run dev` — manually walk every flow:
   - Hub renders; clicking each of the three nav cards lands on the right sub-page.
   - Edit: change a field, save, see success, refresh — value persists.
   - Edit: upload avatar, see it appear, refresh — still there. Hub also shows new avatar.
   - Edit: badge fires for `profile-updated` and `profile-photo-uploaded` (check via `/badges` or whatever surface shows them).
   - Settings: toggle weekly newsletter — persists across refresh. Toggling on clears `weekly_last_sent_at`.
   - Settings: toggle push (in a browser that supports it) — flow completes; refusing permission reverts toggle and shows the localized error.
   - Settings: change timezone — persists.
   - Account: change password — succeeds with matching 6+ char password; shows error otherwise.
   - Account: log out — redirects to `/`.
   - Auth gate: visit each route signed-out — redirects to `/login`.

### Step 11 — Update internal links

Search the codebase for hardcoded `/profile` links and decide case-by-case whether they should now point to a sub-route. Most should still go to `/profile` (the hub). Examples to check:

```bash
rg "['\"\`]/profile['\"\`]" src/
rg "href=\"/profile" src/
rg "goto\\(.*profile" src/
```

Likely candidates for re-pointing:
- Any "edit your profile" CTA from elsewhere → `/profile/edit`.
- Any "manage notifications" link → `/profile/settings`.

### Step 12 — Mobile check

Test the hub and each sub-page at mobile widths. The current page already has `@media (max-width: 600px)` rules — make sure they survive the move and that the new "back to profile" link doesn't break the layout.

---

## Out of scope (do not do these now)

- Designing a new visual style for the hub. Use the existing `--color-*`, `--text-*`, `--font-primary`, `--radius-*` tokens.
- Adding new fields to the profile or new settings.
- Rewriting `AvatarUpload`, `ProfileBadgeStrip`, or the writing-mode modal.
- Server-side auth gates / `+page.server.ts` files.
- Renaming `/profile` to anything else.

---

## Done when

- All four routes exist, render, and pass the manual checks in Step 10.
- The original `+page.svelte` is the hub only (~200 lines, not ~1600).
- `npm run check` and `npm run test:run` are green.
- No `/profile` links in the rest of the app are broken.

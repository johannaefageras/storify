# Storify – Social Media Sharing Plan

## Prompt / Instructions for AI

You are helping implement social media sharing features for **Storify** (https://mystorify.se), a Swedish AI-powered journaling app. This document is the full specification. Read it carefully before writing any code.

### About the project

- **Stack:** SvelteKit 2 + Svelte 5 (runes) + TypeScript + Supabase + Anthropic API
- **Language:** All UI text is Swedish. English only when explicitly needed.
- **Styling:** Custom CSS with HSL-based CSS variables (no Tailwind). The app uses `var(--color-*)`, `var(--font-primary)`, `var(--text-*)`, `var(--weight-*)`, `var(--tracking-*)`, `var(--radius-*)` tokens throughout. Match existing component patterns exactly.
- **Font:** GT Pressura (variable weight/stretch)
- **Icons:** Custom SVG emoji system via `<Emoji name="..." size={N} />` and `<UniqueEmoji>` wrapper. No icon library (no Lucide, no Heroicons, etc.).
- **Accent color:** `var(--color-accent)` — a pink/rose hue, user-configurable.
- **Components follow this pattern:** Props via `$props()`, state via `$state()`, derived via `$derived()`. No classic Svelte stores. See existing components for reference.

### What Storify does

Users describe their day (via a wizard, quick mode, AI interview, or free-text editor), pick one of many humorous/creative "tones" (voices like Katten, Kvällstidningsreportern, Shakespeare, etc.), and an AI generates a journal entry in that voice. Users can save entries to their journal, share entries publicly via a link, share to an in-app community, export as image/PDF, and email entries.

### What already exists (don't rebuild these)

1. **`/shared/[shareId]` route** — A public page that displays a shared journal entry. It has dynamic OG meta tags (title, description from entry excerpt). Server-loaded via `+page.server.ts` reading from Supabase `entries` table where `share_id` matches and `is_public` is true.

2. **`ShareLinkButton.svelte`** — Existing component that creates a share link by calling `POST /api/share`, which generates a `share_id` on the entry and returns the `/shared/{shareId}` URL. Currently only copies the link to clipboard.

3. **`ShareToCommunity.svelte`** — Modal for sharing an entry to the in-app community feed. Posts to `POST /api/community`.

4. **`/api/share/+server.ts`** — Backend endpoint. Two paths: (A) share an existing saved entry by `entryId` (must be owner), (B) share a fresh unsaved entry by providing `generated_text`, `tone_id`, `entry_date`, etc. Both generate a `share_id` and set `is_public: true`.

5. **Base OG tags in `+layout.svelte`** — Generic Storify OG image and description already set.

6. **Community page (`/community`)** — Lists community entries in a card grid with a detail modal. Entries have: `id`, `display_name`, `tone_id`, `generated_text`, `excerpt`, `entry_date`, `emojis`, `weekday`, `created_at`. Currently no individual community entry URLs.

7. **Tone data in `src/lib/data/tones.ts`** — Array of `{ id, name, emoji, preview }` for all 32 tones.

8. **Tone icon mapping** — A `toneIconMap` record mapping tone IDs to emoji names exists in both `journal/+page.svelte` and `community/+page.svelte`. This should be extracted to a shared location.

---

## The Four Sharing Scenarios

We are implementing four distinct sharing scenarios. All four use the same reusable `<ShareMenu>` component but with different data.

---

### Scenario 1: Dela appen (Share the App)

**Purpose:** Let users share Storify itself — "check out this cool app."

**Where it appears:**
- Landing page (as a subtle share link/button)
- About page
- Optionally in the footer or navbar

**Shared URL:** `https://mystorify.se`

**OG preview:** Uses the existing base OG tags from the layout (generic Storify image + description).

**Platform-specific share text:**

| Platform | Text |
|----------|------|
| Facebook | *(no text param — uses OG tags)* |
| X (Twitter) | `Storify – en AI-dagbok som skriver din dag i 32 olika röster ✍️` |
| WhatsApp | `Kolla in Storify! En AI-dagbok som berättar din dag i din valda röst 🌹` |
| LinkedIn | *(no text param — uses OG tags)* |
| Telegram | `Storify – en AI-dagbok som skriver din dag i 32 olika röster` |
| Email | **Subject:** `Kolla in Storify` · **Body:** `Hej! Testa Storify – en AI-dagbok som skriver din dag i din valda röst: https://mystorify.se` |
| Copy link | `https://mystorify.se` |

---

### Scenario 2: Dela en community-post (Share a Community Entry)

**Purpose:** Let someone share a specific community entry they found interesting.

**Where it appears:** Inside the community entry detail modal (`community/+page.svelte`), as a share button row in the `modal-footer`.

**Prerequisites — new route needed:**

Create a `/community/[id]` route that:
- Loads a single community entry by its `id` from the `community_entries` Supabase table
- Renders the entry with the `DiaryCard` component (same as `/shared/[shareId]`)
- Sets dynamic OG meta tags:
  - `og:title` → `"Dagbok i {toneName}-rösten · Storify"`
  - `og:description` → first ~160 chars of the entry text
  - `og:url` → `https://mystorify.se/community/{id}`
  - `og:type` → `article`
- Includes a CTA at the bottom: "Skapa din egen AI-dagbok" → links to `/`
- The page should look and feel like the existing `/shared/[shareId]` page

**Shared URL:** `https://mystorify.se/community/{id}`

**Platform-specific share text:**

| Platform | Text |
|----------|------|
| Facebook | *(uses OG tags)* |
| X | `"{excerpt…}" – skriven i {toneName}-rösten på Storify ✍️` |
| WhatsApp | `Läs den här dagboksanteckningen på Storify – skriven i {toneName}-rösten 📖\n{url}` |
| LinkedIn | *(uses OG tags)* |
| Telegram | `Dagbok i {toneName}-rösten – läs på Storify` |
| Email | **Subject:** `En dagbok från Storify` · **Body:** `Läs den här dagboksanteckningen, skriven i {toneName}-rösten:\n\n"{excerpt…}"\n\n{url}` |
| Copy link | `https://mystorify.se/community/{id}` |

**Variables to interpolate:**
- `{toneName}` — from `tones.find(t => t.id === entry.tone_id)?.name`
- `{excerpt}` — first ~100 chars of `generated_text`, trimmed with `…`
- `{url}` — the full community entry URL

---

### Scenario 3: Dela min dagboksanteckning (Share My Journal Entry)

**Purpose:** Let a user share their own journal entry to social media via the existing `/shared/[shareId]` URL.

**Where it appears:** In the journal entry detail modal (`journal/+page.svelte`). This upgrades the existing `ShareLinkButton` from a simple "copy link" button to a full share menu with platform icons.

**Flow:**
1. User clicks the share icon/button in the entry modal
2. If the entry doesn't have a `share_id` yet, the component calls `POST /api/share` with the `entryId` to create one (same as `ShareLinkButton` already does)
3. Once the share URL is ready, the share menu opens with platform icons

**Shared URL:** `https://mystorify.se/shared/{shareId}`

**OG preview:** The `/shared/[shareId]` page already has dynamic OG title and description. Note: there is currently no per-entry `og:image` — it falls back to the generic Storify image from the layout. This is fine for now. (Future improvement: generate dynamic OG images per entry.)

**Platform-specific share text:**

| Platform | Text |
|----------|------|
| Facebook | *(uses OG tags)* |
| X | `Min dag, berättad i {toneName}-rösten på Storify ✍️` |
| WhatsApp | `Läs min dagbok – {toneName}-rösten berättar min {weekday} 🌹\n{url}` |
| LinkedIn | *(uses OG tags)* |
| Telegram | `Min dagbok i {toneName}-rösten – läs här` |
| Email | **Subject:** `Min dagbok – {weekday} {date}` · **Body:** `Hej! Läs min dagboksanteckning, skriven i {toneName}-rösten på Storify:\n\n{url}` |
| Copy link | `https://mystorify.se/shared/{shareId}` |

**Variables to interpolate:**
- `{toneName}` — tone display name
- `{weekday}` — e.g. "Tisdag"
- `{date}` — e.g. "15 april 2026"
- `{url}` — the full shared entry URL

---

### Scenario 6: "Prova själv"-inbjudan (Post-Generation Invite)

**Purpose:** Catch the user at the "wow moment" right after their entry is generated — the highest-conversion share opportunity.

**Where it appears:** On the result/output screen after entry generation. This exists in multiple routes:
- Wizard result (after Step10Summary generates)
- Quick mode result
- Interview result
- Editor result

Display as a subtle prompt: *"Gillade du din dagbok? Tipsa en vän!"* followed by platform icons.

**Shared URL:** `https://mystorify.se` (sending people to the app, not the specific entry)

**Platform-specific share text — tone-aware and playful:**

| Platform | Text |
|----------|------|
| Facebook | *(uses OG tags)* |
| X | `Fick precis min dag berättad som en {toneDescription} av en AI 😂 Testa själv på Storify!` |
| WhatsApp | `Haha jag fick just en AI att skriva min dagbok i {toneName}-rösten 😂 Testa: https://mystorify.se` |
| LinkedIn | *(uses OG tags)* |
| Telegram | `Min dag blev en {toneDescription} tack vare Storify AI 😂 Testa själv!` |
| Email | **Subject:** `Du måste testa det här` · **Body:** `Jag hittade en app som skriver din dagbok med AI, i typ 32 olika röster. Min dag blev en {toneDescription}. Kolla: https://mystorify.se` |
| Copy link | `https://mystorify.se` |

**The `{toneDescription}` variable** is a short natural-language description of the tone, different from the formal `toneName`. This makes the share text read naturally:

| Tone ID | toneName (formal) | toneDescription (for share text) |
|---------|-------------------|----------------------------------|
| classic | Dagboksskribenten | klassisk dagbok |
| storytelling | Berättaren | berättelse |
| cat-perspective | Katten | kattdagbok |
| sportscaster | Sportkommentatorn | sportreferat |
| tabloid | Kvällstidningsreportern | kvällstidningsartikel |
| shakespeare | Shakespeare | Shakespeare-drama |
| quest-log | Gamern | gamingdagbok |
| formal | Akademikern | akademisk rapport |
| bureaucratic | Handläggaren | byråkratiskt ärende |
| nature-documentary | Naturfilmaren | naturfilmsdagbok |
| therapist | Psykologen | terapisession |
| ai-robot | AI-Roboten | systemlogg |
| drama-queen | Divan | divan-monolog |
| cringe | Tonåringen | tonårsdagbok |
| british | Britten | Britten-dagbok |
| bored | Tråkmånsen | uttråkad dagbok |
| philosophical | Filosofen | filosofisk betraktelse |
| nerd | Nörden | nördrapport |
| tinfoil-hat | Foliehatten | konspirationsteori |
| self-help | Livscoachen | Livscoachen-session |
| overthinker | Grubblaren | grubbleri |
| cynical | Cynikern | skeptisk betraktelse |
| passive-aggressive | Martyren | Martyren-dagbok |
| chaotic | Multitaskaren | Multitaskaren-dagbok |

---

## Reusable Component: `<ShareMenu>`

All four scenarios use the same component with different props.

### Props interface

```typescript
interface ShareMenuProps {
  url: string;
  title: string;
  text: string;
  emailSubject?: string;
  emailBody?: string;
  variant?: 'inline' | 'modal';
}
```

### Platforms to include

Seven sharing targets, in this display order:

1. **Facebook** — `https://www.facebook.com/sharer/sharer.php?u={encodedUrl}`
2. **X (Twitter)** — `https://twitter.com/intent/tweet?url={encodedUrl}&text={encodedText}`
3. **WhatsApp** — `https://wa.me/?text={encodedText}%20{encodedUrl}`
4. **LinkedIn** — `https://www.linkedin.com/sharing/share-offsite/?url={encodedUrl}`
5. **Telegram** — `https://t.me/share/url?url={encodedUrl}&text={encodedText}`
6. **Email** — `mailto:?subject={encodedSubject}&body={encodedBody}`
7. **Copy link** — Copies `url` to clipboard, shows a brief "Kopierad!" confirmation

### Share URL construction

All URLs open in a new tab/window (`window.open(url, '_blank', 'noopener,noreferrer')`). On mobile, platforms will deep-link to native apps if installed.

All parameter values must be encoded with `encodeURIComponent()`.

### Visual design

- **`variant: 'inline'`** — A horizontal row of small circular icon buttons. Used for Scenario 1 (landing page) and Scenario 6 (post-generation). The icons sit inline in the page flow.
- **`variant: 'modal'`** — A bottom sheet or small modal with icons in a grid. Used for Scenario 2 (community) and Scenario 3 (journal entry). Triggered by clicking a share button.

**Icon style:** Each platform gets a small SVG icon (Facebook, X, WhatsApp, LinkedIn, Telegram, email, link). These should be simple monochrome SVGs that respect `currentColor` so they adapt to the theme. Keep them minimal — no brand colors, just shape outlines or filled paths in `var(--color-text-muted)` with hover state `var(--color-accent)`.

**Button style:** Match the existing button patterns in the app — `var(--color-bg-elevated)` background, `var(--color-border)` border, `var(--radius-sm)` border-radius, smooth hover transitions.

### Web Share API (optional progressive enhancement)

On mobile browsers that support it, `navigator.share()` provides the native share sheet. The component can check for support and show a primary "Dela" button that uses the native API, with the individual platform icons as fallback. This is optional — the platform links work everywhere.

```typescript
const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;
```

---

## Implementation Checklist

### New files to create

- [ ] `src/lib/components/ShareMenu.svelte` — The reusable share menu component
- [ ] `src/lib/data/toneDescriptions.ts` — Map of tone IDs to natural-language descriptions for share text (Scenario 6)
- [ ] `src/routes/community/[id]/+page.server.ts` — Server load for individual community entry
- [ ] `src/routes/community/[id]/+page.svelte` — Public page for a single community entry with OG tags

### Existing files to modify

- [ ] `src/routes/community/+page.svelte` — Add share button(s) to the community entry modal footer
- [ ] `src/routes/journal/+page.svelte` — Replace or augment `ShareLinkButton` with `ShareMenu` in the entry modal
- [ ] Wizard result view — Add Scenario 6 invite prompt after generation
- [ ] Quick result view — Add Scenario 6 invite prompt after generation
- [ ] Interview result view — Add Scenario 6 invite prompt after generation
- [ ] Editor result view — Add Scenario 6 invite prompt after generation
- [ ] `src/routes/+page.svelte` or about page — Add Scenario 1 share option
- [ ] Extract `toneIconMap` to a shared file (currently duplicated in journal and community pages)

### Things NOT to do

- Don't rebuild the `/shared/[shareId]` route or `ShareLinkButton` or `/api/share` endpoint — they work fine
- Don't add dynamic per-entry OG images yet — that's a future enhancement
- Don't add platform brand colors to the icons — keep them monochrome with the app's theme
- Don't install any icon library — create simple inline SVGs or add them to the existing SVG asset system
- Don't use Tailwind — the project uses custom CSS throughout

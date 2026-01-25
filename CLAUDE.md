# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Storify is an AI-powered journaling app that transforms user responses into personalized diary entries using Claude AI. Users complete a 10-step wizard, choose a writing tone, and receive a generated entry. The app runs on web (Vercel) and Android (Capacitor).

**Primary language:** Swedish (UI text, prompts, generated content). Exception: British tone generates English entries.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Build for production
npm run check        # TypeScript/Svelte type checking
npm run preview      # Preview production build

# Android (after npm run build)
npx cap sync android   # Sync web assets to Android project
npx cap open android   # Open in Android Studio
```

## Architecture

### Dual Adapter Setup
[svelte.config.js](svelte.config.js) switches adapters based on environment:
- **Vercel deployment:** Uses `@sveltejs/adapter-vercel` (has server-side API routes)
- **Capacitor build:** Uses `@sveltejs/adapter-static` (SPA mode, calls remote API)

Native apps must set `VITE_API_BASE_URL` in `.env` to the deployed backend URL since there's no bundled server.

### State Management
[src/lib/stores/wizard.svelte.ts](src/lib/stores/wizard.svelte.ts) - Svelte 5 runes-based store managing:
- `WizardData`: All wizard step inputs
- `UserProfile`: Persistent profile data (saved via `@capacitor/preferences`)
- Step navigation and validation logic

### Wizard Flow
[src/routes/wizard/+page.svelte](src/routes/wizard/+page.svelte) - Main wizard container
[src/routes/wizard/steps/](src/routes/wizard/steps/) - 10 step components (Step0Profile.svelte through Step9Summary.svelte)

### API Endpoints
[src/routes/api/generate/+server.ts](src/routes/api/generate/+server.ts) - Diary generation:
1. Receives `WizardData` from client
2. Builds a system prompt from selected tone (20 tones defined inline via `buildTonePrompt()`)
3. Formats user data into a structured prompt
4. Calls Claude API (claude-opus-4-5-20251101)
5. Returns generated diary entry

[src/routes/api/email/+server.ts](src/routes/api/email/+server.ts) - Email delivery:
- Sends generated diary entries via Resend API
- Converts markdown to HTML email format

### Utilities
[src/lib/utils/](src/lib/utils/) - Helper functions:
- `weather.ts`: Fetches weather data for diary context
- `geolocation.ts`: Gets user location for weather lookup

### Writing Tones
20 tones available (see [tones/TONES.md](tones/TONES.md) for full list):
- Tone metadata: [src/lib/data/tones.ts](src/lib/data/tones.ts)
- Tone prompts: Defined in `buildTonePrompt()` in the API route
- Sample texts: [src/lib/data/voiceSamples.ts](src/lib/data/voiceSamples.ts)
- Detailed instructions: [tones/](tones/) directory (markdown files)

### Adding a New Tone
1. Add tone definition to `src/lib/data/tones.ts`
2. Add tone prompt instructions in `buildTonePrompt()` in `src/routes/api/generate/+server.ts`
3. Add sample text to `src/lib/data/voiceSamples.ts`
4. Create detailed markdown instructions in `tones/` directory

## Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...           # Required: Claude API key
RESEND_API_KEY=re_...                  # Required: Resend API key for email functionality
VITE_API_BASE_URL=https://...          # Required for Capacitor native builds
```

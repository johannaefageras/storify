# Capacitor Conversion Todo List

## Critical / Must Do

| # | Task | Notes |
|---|------|-------|
| 1 | **Change adapter to static** | Replace `@sveltejs/adapter-auto` with `@sveltejs/adapter-static` in `svelte.config.js` — Capacitor requires a static build |
| 2 | **Install & init Capacitor** | `npm install @capacitor/core @capacitor/cli` then `npx cap init` and `npx cap add android` |
| 3 | **Replace localStorage** | Currently used for profile & theme in `src/lib/stores/wizard.svelte.ts` and `src/lib/stores/theme.svelte.ts` — use `@capacitor/preferences` instead |
| 4 | **Replace clipboard API** | Used in `src/routes/wizard/steps/Step9Summary.svelte` — use `@capacitor/clipboard` |
| 5 | **Replace file download** | Image/text export creates DOM elements for download — use `@capacitor/filesystem` + `@capacitor/share` for native sharing |
| 6 | **Solve the API key problem** | The `/api/generate` endpoint uses `ANTHROPIC_API_KEY` server-side. **You cannot ship API keys in a mobile app.** Options: Host a separate backend service, use a serverless function (Vercel/Cloudflare), or proxy through your own API with auth |

## Important / Should Do

| # | Task | Notes |
|---|------|-------|
| 7 | **Test html2canvas** | Used for "Save as image" — may have performance issues or limitations in Android WebView |
| 8 | **Add splash screen & icon** | Use `@capacitor/splash-screen` — create proper Android icon sizes |
| 9 | **Configure status bar** | Use `@capacitor/status-bar` — match your theme colors |

## Nice to Have

| # | Task | Notes |
|---|------|-------|
| 10 | **Test on real devices** | All 10 wizard steps, emoji grid performance (180+ SVGs), form inputs |
| 11 | **Add native sharing** | Share generated diary entries directly to other apps |
| 12 | **Offline support** | Cache tone data, handle API failures gracefully |

---

## Key Concern: Backend Architecture

The biggest decision is **how to handle the Claude API**. Your current setup has a SvelteKit server endpoint, but Capacitor apps are purely client-side. You'll need to either:

1. **Deploy a backend** — Keep your API route running somewhere (Vercel, Railway, etc.) and have the app call it
2. **Serverless function** — Same idea but using edge functions
3. **User-provided API key** — Let users enter their own Anthropic key (stored securely with Capacitor Preferences)

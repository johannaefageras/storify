# Storify – Implementation Plan

Baserad på [deep-research-report.md](deep-research-report.md). Sorterad efter prioritet: P0 (gör först, 30 dgr), P1 (90 dgr), P2 (180 dgr). Varje punkt har konkreta filer/åtgärder och acceptanskriterier.

---

## P0 – SEO-grund och domänstruktur (30 dagar)

### 1. Per-sida `<svelte:head>` med unik title/description/canonical/OG

**Problem:** [src/routes/+layout.svelte:38-75](src/routes/+layout.svelte#L38-L75) sätter title, description, OG, Twitter och canonical (`https://mystorify.se/`) globalt. Följande publika rutter saknar egna `<svelte:head>` och ärver därför hemsidans metadata och canonical:

- [src/routes/about/+page.svelte](src/routes/about/+page.svelte)
- [src/routes/guide/+page.svelte](src/routes/guide/+page.svelte)
- [src/routes/contact/+page.svelte](src/routes/contact/+page.svelte)
- [src/routes/privacy/+page.svelte](src/routes/privacy/+page.svelte)
- [src/routes/terms/+page.svelte](src/routes/terms/+page.svelte)
- [src/routes/cookies/+page.svelte](src/routes/cookies/+page.svelte)
- [src/routes/community/+page.svelte](src/routes/community/+page.svelte)

**Åtgärd:**

1. Skapa en återanvändbar komponent [src/lib/components/SeoHead.svelte](src/lib/components/SeoHead.svelte) som tar props `title`, `description`, `path` (för canonical/OG-url), valfri `ogImage`, valfri `noindex`. Komponenten renderar `<svelte:head>` med title, meta description, canonical, OG-title/description/url/image, Twitter card.
2. Flytta hemsidans head-block från [+layout.svelte](src/routes/+layout.svelte) → [+page.svelte](src/routes/+page.svelte) (rotsidan). Lämna kvar i layout: font preload, ev. global favicon/manifest. **Ta bort** den globala `<title>`, `<meta name="description">`, OG/Twitter, `<link rel="canonical">` från layouten så att de inte längre ärvs.
3. Lägg till `<SeoHead …>` i varje publik sida ovan plus:
   - [src/routes/voices/+page.svelte](src/routes/voices/+page.svelte) (har redan head — granska och konvertera)
   - [src/routes/blog/+page.svelte](src/routes/blog/+page.svelte) och [src/routes/blog/[slug]/+page.svelte](src/routes/blog/[slug]/+page.svelte) (om finns)
   - [src/routes/changelog/+page.svelte](src/routes/changelog/+page.svelte)
   - [src/routes/accessibility/+page.svelte](src/routes/accessibility/+page.svelte)
4. Strukturerad data (`WebApplication` JSON-LD) bör ligga ENBART på rotsidan, inte i layouten. Flytta tillsammans med title-blocket.
5. Privata/genererande rutter (`/interview`, `/wizard`, `/quick`, `/editor`, `/journal`, `/profile`, `/calendar`, `/badges`, `/login`, `/register`, `/forgot-password`) ska sätta `noindex` via SeoHead — robots.txt blockerar redan crawl men `noindex` skyddar om någon länkar in.

**Acceptanskriterier:**
- `curl https://mystorify.se/about` returnerar title som börjar med "Om Storify" och canonical `/about`.
- Inga två publika sidor har samma `<title>` eller `<link rel="canonical">`.
- View source på `/guide` visar OG-url `https://mystorify.se/guide`.

**Insats:** Medium · **Effekt:** Hög

---

### 2. Domänkonsolidering: mystorify.se vs getstorify.app

**Problem:** Båda domänerna serverar samma app och indexeras separat. Canonical pekar redan till mystorify.se, men getstorify.app sidor existerar i sökresultat (privacy, quick, editor, interview, speak).

**Åtgärd:**

1. Beslut: behåll `mystorify.se` som primär. Det är det varumärket sajten faktiskt heter.
2. På Render: lägg till `getstorify.app` som en separat service eller redirect-regel som 301:ar **allt** till motsvarande sökväg på mystorify.se. Antingen via Render redirect rules eller via en `handle` hook som kollar `event.url.host`:
   ```ts
   // src/hooks.server.ts
   if (event.url.host === 'getstorify.app' || event.url.host === 'www.getstorify.app') {
     return new Response(null, {
       status: 301,
       headers: { location: `https://mystorify.se${event.url.pathname}${event.url.search}` }
     });
   }
   ```
3. Lägg till `www.mystorify.se` → `mystorify.se` redirect (eller tvärt om — välj en) i samma block.
4. Sätt `link rel="alternate" hreflang="sv"` på huvudsidan om internationalisering övervägs framöver (inte nu).
5. Verifiera i Google Search Console: lägg till båda domänerna, bekräfta att getstorify.app rapporterar 301:or, begär omindexering av primära sidor.

**Acceptanskriterier:**
- `curl -I https://getstorify.app/privacy` → 301 till `https://mystorify.se/privacy`.
- Search Console visar minskning av getstorify.app-indexerade sidor inom 4 veckor.

**Insats:** Medium · **Effekt:** Hög

---

### 3. Sitemap-utbyggnad och äkta `lastmod`

**Problem:** [src/routes/sitemap.xml/+server.ts](src/routes/sitemap.xml/+server.ts) listar bara 7 statiska URL:er + community. Saknar: `/blog`, `/blog/[slug]`, `/voices`, `/changelog`, `/accessibility`. Sätter `lastmod = TODAY` för alla statiska sidor.

**Åtgärd:**

1. Lägg till statiska poster för `/voices`, `/changelog`, `/accessibility` med hårdkodad `lastmod` (uppdateras vid utgivning) eller härled från fil-mtime via en build-time-konstant.
2. Lägg till blogg: läs [src/posts/](src/posts/) via [src/lib/server/blog.ts](src/lib/server/blog.ts) och iterera över slugs. Använd front-matter `date` eller filens mtime som `lastmod`.
3. För statiska policy-sidor (`/privacy`, `/terms`, `/cookies`, `/about`, `/guide`, `/contact`, `/accessibility`): lägg in fasta datum i en const-tabell, t.ex.:
   ```ts
   const STATIC_URLS = [
     { path: '', lastmod: '2026-05-14' },
     { path: '/about', lastmod: '2026-05-14' },
     // ...
   ];
   ```
   Uppdatera manuellt när sidan faktiskt ändras.
4. För `/changelog`: använd senaste changelog-entry-datum.
5. Lägg till `<changefreq>` och `<priority>` (lågt prio: policys, högt: start/blog/voices).
6. Verifiera att robots.txt fortsätter blockera `/journal`, `/interview` etc. — de ska INTE läggas i sitemap.

**Acceptanskriterier:**
- `GET /sitemap.xml` innehåller alla publika rutter.
- Bloggsidor finns med riktiga `lastmod`.
- Inga `lastmod` är "idag" om sidan inte faktiskt ändrats idag.

**Insats:** Låg-medium · **Effekt:** Hög

---

### 4. Publik beta-/pricing-/FAQ-sida

**Problem:** "Gratis under beta" finns spritt i copy men ingen sammanhållen sida som besvarar "vad händer när beta tar slut?", "vad kommer kosta?", "vad förblir gratis?", "hur lagras min data efter beta?".

**Åtgärd:**

1. Skapa [src/routes/beta/+page.svelte](src/routes/beta/+page.svelte) (eller `/pricing` — välj termen som matchar produktstadiet; `/beta` är ärligare nu).
2. Innehåll:
   - Vad "beta" betyder konkret (funktionsstatus, ev. brister)
   - Garanti om förvarning innan prisändring (matcha [/terms](src/routes/terms/+page.svelte))
   - Preliminär struktur: vad förblir gratis, vad blir premium (skissa: ev. större arkiv, mer AI-quota, avancerad export, fler röster). Tydligt märkt "preliminärt".
   - FAQ-sektion: integritet, datalagring, radering, GDPR-rättigheter, export
3. Länka från footer + från `/about`.
4. Lägg in sidan i sitemap.
5. SeoHead med unik title "Beta och framtida prismodell – Storify".

**Acceptanskriterier:**
- Sidan är publik, har egen metadata, finns i sitemap, länkad från footer.

**Insats:** Låg · **Effekt:** Hög

---

## P1 – Förtroende, säkerhet, integritet (90 dagar)

### 5. Säkerhetsheaders i hooks.server.ts

**Problem:** [src/hooks.server.ts](src/hooks.server.ts) sätter inga säkerhetsheaders. CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy bör vara synliga i appkoden så att de versionshanteras.

**Åtgärd:**

1. Utöka `handle` i [src/hooks.server.ts](src/hooks.server.ts):
   ```ts
   const response = await resolve(event, { /* … */ });
   response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
   response.headers.set('X-Content-Type-Options', 'nosniff');
   response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
   response.headers.set('X-Frame-Options', 'DENY');
   response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(self)');
   // CSP — börja i Report-Only-läge för att hitta inline-skript som bryts:
   response.headers.set('Content-Security-Policy-Report-Only', [
     "default-src 'self'",
     "script-src 'self' 'unsafe-inline'",  // Svelte 5 + JSON-LD inline-skript kräver detta tills nonces införs
     "style-src 'self' 'unsafe-inline'",
     "img-src 'self' data: https:",
     "connect-src 'self' https://*.supabase.co https://api.anthropic.com",
     "font-src 'self'",
     "frame-ancestors 'none'"
   ].join('; '));
   return response;
   ```
2. Notera att `microphone=(self)` krävs av [/speak](src/routes/speak/) röstinspelningen.
3. Efter ~2 veckor i Report-Only utan brott: byt till `Content-Security-Policy` (enforced) och stram åt `script-src` med nonce om möjligt.
4. Lägg till `server.js` static asset-headers verifiering — krocka inte med befintliga.

**Acceptanskriterier:**
- `curl -I https://mystorify.se/` visar HSTS, X-Frame-Options, Referrer-Policy.
- Inga CSP-violations i prod-konsolen efter migration till enforced.

**Insats:** Medium · **Effekt:** Hög

---

### 6. Trust- och säkerhetssida + security.txt

**Åtgärd:**

1. Skapa [static/.well-known/security.txt](static/.well-known/security.txt) enligt RFC 9116:
   ```
   Contact: mailto:[kontakt-email]
   Expires: 2027-12-31T23:59:59Z
   Preferred-Languages: sv, en
   Canonical: https://mystorify.se/.well-known/security.txt
   ```
2. Skapa [src/routes/security/+page.svelte](src/routes/security/+page.svelte) som beskriver:
   - Hosting (Render Frankfurt)
   - Krypteringsläge (TLS in transit, Supabase at rest)
   - Backup-rutin (hur ofta, hur länge, var)
   - Retentionspolicy (kopplas till privacy)
   - Incident response (kontaktväg + förväntad responstid)
   - Säkerhetsheaders (se #5)
3. Länka från footer och från [/privacy](src/routes/privacy/+page.svelte).

**Insats:** Medium · **Effekt:** Hög

---

### 7. Förtydliga Gemenskapen + åldersfrågor + SMS-villkor

**Problem:** Rapport flaggar att publik delning + ålderslös målgrupp + SMS-villkor i terms är inkonsekvent.

**Åtgärd:**

1. [src/routes/community/+page.svelte](src/routes/community/+page.svelte): lägg in tydligt block "Innan du delar":
   - Påminnelse om att inlägg blir publika
   - Råd om personuppgifter och tredje part
   - Åldersrekommendation (matcha [project_audience.md](memory: ages 10–100) — om barn använder produkten, hur skyddas de i community?)
2. Före submit i communityflödet: kräv aktiv kryssruta "Jag förstår att detta blir publikt" (om saknas).
3. [src/routes/terms/+page.svelte](src/routes/terms/+page.svelte): granska SMS-/marknadsföringssektionen. Om SMS inte används, ta bort. Om används framtida — flagga "ej aktivt under beta".
4. Lägg till åldersbekräftelse i registreringsflödet om relevant.

**Insats:** Låg-medium · **Effekt:** Medium-hög

---

### 8. Synka publik copy med faktiska lägen

**Problem:** [README.md](README.md) listar 4 skrivlägen, sajten 5 (Tala in saknas i README). Den hårdkodade röstantals-buggen åtgärdades enligt changelog 2026-05-14 — säkerställ att samma princip används för lägen.

**Åtgärd:**

1. Skapa en single source of truth: t.ex. `src/lib/data/modes.ts` som exporterar `ACTIVE_MODES` med id, label, beskrivning.
2. Använd i: hemsidan, [/about](src/routes/about/+page.svelte), [/guide](src/routes/guide/+page.svelte), README, meta descriptions.
3. Uppdatera README så det matchar.

**Insats:** Låg · **Effekt:** Medium

---

### 9. Social proof och testimonials

**Åtgärd:**

1. Lägg in en frivillig "Berätta för oss"-form (befintlig kontaktväg räcker) som ber om citat + samtycke att publicera anonymt.
2. Skapa en sektion på hemsidan eller [/about](src/routes/about/+page.svelte) för 3–5 anonymiserade citat när de finns.
3. Överväg en publik "byggdagbok"-sida (changelog är redan ett embryo — utöka med "varför" inte bara "vad").

**Insats:** Medium · **Effekt:** Medium-hög

---

### 10. Svenskt SEO-innehållskluster

**Åtgärd:**

1. Identifiera 5–8 långsvansade söktermer: "AI-dagbok på svenska", "dagbok utan konto", "hur börja skriva dagbok", "dagboksappar jämförelse", "privat dagbok online", "skriv dagbok snabbt".
2. Skapa blogginlägg under [src/posts/](src/posts/) med ett inlägg per term. Längd: 800–1500 ord, svenska, med interna länkar till relevanta lägen.
3. Säkerställ att bloggsidor har egen [SeoHead](src/lib/components/SeoHead.svelte) med unik title per inlägg (komplettera #1 om blogg saknar det).
4. Lägg till JSON-LD `Article` per inlägg.

**Insats:** Medium · **Effekt:** Medium-hög

---

## P2 – Paketering och tillväxt (180 dagar)

### 11. Premiumpaketering

**Åtgärd:** När betafas avslutas:

1. Definiera plan-grid på [/beta](src/routes/beta/+page.svelte) (eller flytta till `/pricing`).
2. Behåll fri kärna: alla skrivlägen, ett rimligt antal genereringar/månad, alla röster.
3. Premium-värdeaxlar: större kvota för AI-genereringar och transkribering, avancerad PDF-export, ev. extra "specialröster", långtidsarkiv.
4. Implementera Stripe (eller Polar/Lemon) med Supabase-kopplad subscription-state.
5. Migrera "gratis under beta"-copy → "gratis grundnivå + premium".

**Insats:** Hög · **Effekt:** Medium-hög

---

### 12. Onboarding-räls per användartyp

**Åtgärd:**

1. Efter "Kom igång"-klick: kort 3-stegs val: "Vill du skriva, prata eller bli intervjuad?" → "Har du några minuter eller bara 30 sekunder?" → välj läge.
2. Implementera som en liten klient-only komponent på [/+page.svelte](src/routes/+page.svelte) eller egen route `/start`.
3. Spara val i localStorage så återkommande besökare hoppar direkt till sitt favoritläge.

**Insats:** Låg-medium · **Effekt:** Medium

---

### 13. Tillgänglighetsåtgärder

**Problem:** [/accessibility](src/routes/accessibility/+page.svelte) listar redan kända brister: fokusring i modaler, kontraster i vissa teman, skärmläsartestning kalender/röstväljare/editor.

**Åtgärd:**

1. Audit med axe DevTools på varje modal + dropdown. Tagga med ARIA-roller och `aria-modal`, `aria-labelledby`.
2. Kontroll-loop: gå igenom alla teman (se [accentStore](src/lib/stores/accent.svelte)/[themeStore](src/lib/stores/theme.svelte)) mot WCAG AA kontrast (4.5:1 text, 3:1 stor text). Fixa svaga kombinationer.
3. Skärmläsartest (VoiceOver + NVDA) av kalender, voice picker, editor. Dokumentera resultat på /accessibility.

**Insats:** Medium · **Effekt:** Medium (men hög för berörda användare)

---

## Roadmap-översikt

| Vecka | Fokus |
|---|---|
| 1–2 | #1 SeoHead-komponent + migrera alla publika sidor |
| 2–3 | #2 Domän-redirect via hooks + DNS/Render-konfig |
| 3 | #3 Sitemap-utbyggnad |
| 4 | #4 /beta-sida + footer-länk |
| 5–6 | #5 Säkerhetsheaders (CSP Report-Only först) |
| 6–8 | #6 Trust-sida + security.txt, #7 Community/ålder/SMS |
| 8–10 | #8 Synka modes, #9 Testimonials-flöde |
| 10–13 | #10 SEO-innehåll (1 inlägg/vecka) |
| 14+ | #11 Premiumpaketering, #12 Onboarding, #13 A11y |

---

## Verifikation efter P0

Innan något i P1 påbörjas:

- [ ] `curl -s https://mystorify.se/about | grep -i "<title>"` visar unik title
- [ ] `curl -I https://getstorify.app/` returnerar 301
- [ ] `curl https://mystorify.se/sitemap.xml | wc -l` har växt med minst 5 rader
- [ ] Google Search Console: skicka in uppdaterad sitemap, begär indexering av primära sidor
- [ ] Verifiera i Search Console "Coverage" att inga ärvda canonical-konflikter rapporteras

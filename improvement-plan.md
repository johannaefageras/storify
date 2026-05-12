# Förbättringsplan baserad på `deep-research-report.md`

Status: utkast 2026-05-11. Källa: `deep-research-report.md`. Baseras även på snabbgranskning av `src/` för att jorda rekommendationerna i faktisk kod.

Verifierad nuvarande state (kort):

- Antal toner i [`src/lib/data/tones.ts`](src/lib/data/tones.ts): **32** (`tones.length`).
- Antal "lägen": **5** (wizard, quick, interview, speak, editor) — redan konsekvent som "fem" i [`about`](src/routes/about/+page.svelte:44), [`guide`](src/routes/guide/+page.svelte:77), [`terms`](src/routes/terms/+page.svelte:43), [`badges.ts:289`](src/lib/data/badges.ts).
- Toninkonsekvenser kvar:
  - [`src/routes/+layout.svelte:38`](src/routes/+layout.svelte#L38) säger "28 röster" (meta description).
  - [`src/routes/+page.svelte:274`](src/routes/+page.svelte#L274) säger "32 olika röster".
  - 6 blogginlägg i [`src/posts/`](src/posts/) skriver "32 röster".
  - [`terms`](src/routes/terms/+page.svelte:43) använder redan dynamiskt `{tones.length}` — bra mönster.

---

## Tier 1 — Konkreta kodfixar (låg insats, hög trovärdighetseffekt)

### 1. Single source of truth för antal röster

**Mål:** Eliminera 28/32-driften. Numret kommer alltid från `tones.length`.

**Steg:**

1. I [`src/lib/data/tones.ts`](src/lib/data/tones.ts), lägg till längst ned:
   ```ts
   export const TONE_COUNT = tones.length;
   ```
2. Ersätt hårdkodade "28" och "32" i Svelte-komponenter med variabelinterpolation:
   - [`src/routes/+page.svelte:274`](src/routes/+page.svelte#L274): `"Din dag, i 32 olika röster"` → importera `tones` (eller `TONE_COUNT`) och skriv `Din dag, i {tones.length} olika röster`.
   - [`src/routes/+layout.svelte:38`](src/routes/+layout.svelte#L38): meta description säger "28 röster". Eftersom meta description är statisk text i `<svelte:head>` går det inte att enkelt göra dynamiskt utan att flytta titeln/beskrivningen till en page-specifik `<svelte:head>`. Två val:
     - **A (rekommenderat):** Importera `tones` och rendera `description` som `{`...${tones.length} röster...`}`. SvelteKit serverrenderar headen, så detta funkar för SEO.
     - B: Hårdkoda till `33` och lägg en kommentar `// uppdatera när tones.ts ändras` (sämre — driften kommer tillbaka).
   - Kontrollera även `og:description` och `twitter:description` i samma fil — om de finns och nämner antalet, behandla likadant.
3. **Blogginlägg** ([`src/posts/`](src/posts/)) — eftersom dessa är `.md`-filer kan de inte interpolera. Två policyalternativ:
   - **A (rekommenderat):** Skriv om till siffergenerisk text: "_flera dussin röster_" eller "_röstgalleriet_" med länk till `/voices`. Då slipper man drift utan codepath-magi.
   - B: Behåll "33" som hårdvärde och lägg till en lint-regel/test (se steg 5).
   - Filer att uppdatera:
     - [`src/posts/objektiv-dagbok-fakta-fore-tolkning.md:65`](src/posts/objektiv-dagbok-fakta-fore-tolkning.md#L65)
     - [`src/posts/mental-flik-stangs-nar-du-skriver.md:83`](src/posts/mental-flik-stangs-nar-du-skriver.md#L83)
     - [`src/posts/vi-byggde-olika-saker-med-flit.md:37`](src/posts/vi-byggde-olika-saker-med-flit.md#L37)
     - [`src/posts/dagboksskrivande-nar-du-inte-har-tid.md:81`](src/posts/dagboksskrivande-nar-du-inte-har-tid.md#L81)
     - [`src/posts/dagbok-filsystem-for-tankar.md:79`](src/posts/dagbok-filsystem-for-tankar.md#L79)
     - [`src/posts/ai-skrivassistent-inte-livscoach.md:83`](src/posts/ai-skrivassistent-inte-livscoach.md#L83)
   - **Specialfall:** [`src/posts/32-roster-dagbok-inte-gimmick.md`](src/posts/32-roster-dagbok-inte-gimmick.md) har "32" i titel, filnamn och brödtext. Lämna slug och titel oförändrade (frys postens identitet till tidpunkten den skrevs) men lägg till en kort redaktionsnotering högst upp: _"När det här skrevs fanns 32 röster. Antalet kan ändras — se [röstgalleriet](/voices) för aktuell lista."_
4. **Test:** Lägg till en enkel sanity test i [`src/lib/data/tonePrompts/index.test.ts`](src/lib/data/tonePrompts/index.test.ts) eller en ny `tones.test.ts`:
   ```ts
   it('exports a non-empty list of tones', () => {
     expect(tones.length).toBeGreaterThan(0);
   });
   ```
   _(Lägg INTE in en låst siffra — testet ska tolerera att antalet ändras.)_
5. **Lint-skydd (valfritt men billigt):** Lägg till ett `vitest`-test som söker i `src/routes/**/*.svelte` och `src/posts/**/*.md` efter regex `/\b\d{2}\s+röster\b/` och failar om det hittas (med undantag för `32-roster-dagbok-inte-gimmick.md`). Förhindrar regression.

**Acceptanskriterium:** `grep -rEn "\b(28|32)\s+röster\b" src/` returnerar inget utöver den medvetet frusna posten.

---

### 2. Standardisera "lägen" till 5

**Status:** redan konsekvent. Inget att göra utöver att hålla ögonen öppna när nya sidor läggs till.

**Skydd:** lägg gärna till en kort kommentar i [`src/routes/+layout.svelte`](src/routes/+layout.svelte) eller en `MODES`-konstant i [`src/lib/data/`](src/lib/data/) som listar de fem och kan importeras i `about`, `guide`, `terms`. Då är "fyra vs fem"-driften strukturellt omöjlig.

**Föreslagen plats:** ny fil `src/lib/data/modes.ts`:

```ts
export interface Mode {
  id: 'wizard' | 'quick' | 'interview' | 'speak' | 'editor';
  name: string;
  path: string;
  description: string;
}
export const modes: Mode[] = [
  /* ... */
];
export const MODE_COUNT = modes.length;
```

Refaktorera sedan `about`, `guide`, `terms` att läsa från denna lista istället för att räkna upp dem manuellt i prosa. Mer arbete, men gör att framtida lägen automatiskt syns på alla relevanta sidor.

---

### 3. Juridisk identitet i footer

**Mål:** Användare/Google ska kunna se vem som driver sajten utan att leta.

**Steg:**

1. Hitta footern. Den ligger sannolikt i [`src/routes/+layout.svelte`](src/routes/+layout.svelte) eller en `Footer.svelte`-komponent under `src/lib/components/`. Sök: `grep -rn "footer" src/lib/components/ src/routes/+layout.svelte`.
2. Lägg till ett block i footern:
   ```
   Storify drivs som hobbyprojekt av Johanna Fagerås, Göteborg.
   Kontakt: <a href="mailto:hej@mystorify.se">hej@mystorify.se</a> ·
   <a href="/about">Om</a> ·
   <a href="/privacy">Integritet</a> ·
   <a href="/terms">Villkor</a> ·
   <a href="https://github.com/johannaefageras/storify">Källkod</a>
   ```
3. Om/när ett AB registreras: byt textraden till "Storify drivs av _Bolagsnamn AB_ (org.nr xxxxxx-xxxx)". Lägg gärna fält i en `src/lib/data/legal.ts`-konstant så uppdateringen sker på ett ställe.
4. Verifiera att `mailto:`-adressen faktiskt går till en inbox du läser. Om inte: använd kontaktformuläret som nämns i villkoren och länka dit istället.

**Acceptanskriterium:** Footer syns på alla sidor och innehåller en identifierbar avsändare + kontaktväg.

---

### 4. Affärsmodellstatus

**Mål:** Besökare ska inte gissa om tjänsten är gratis-för-alltid eller pre-paywall.

**Steg:**

1. Lägg till en kort rad i tre lägen — välj den som passar varumärket bäst:
   - "_Gratis under beta. Eventuell premium aviseras i god tid._"
   - "_Gratis just nu. Vi testar oss fram till en hållbar modell — du får veta innan något ändras._"
   - "_100 % gratis. Inga annonser. Inga tracking-pixlar för tredje part._" (bara om det faktiskt stämmer)
2. Placering:
   - I hero-blocket på [`src/routes/+page.svelte`](src/routes/+page.svelte) som en liten badge eller under primär CTA.
   - I [`src/routes/about/+page.svelte`](src/routes/about/+page.svelte) som ett eget kort avsnitt "Affärsmodell".
3. Om en betalplan börjar bli aktuell: skapa `/pricing` även om den bara säger "Premium kommer hösten 2026 — anmäl intresse" med ett mailfält som postar till nyhetsbrevslistan i [`src/lib/newsletter/`](src/lib/newsletter/).

---

## Tier 2 — Trust- och bevismaterial (medel insats)

### 5. Trust-block på landningssidan

**Mål:** Avväpna integritets-/datafrågor innan användaren ens hinner ställa dem.

**Innehåll (fyra korta punkter):**

- **Privat som standard.** Ingen ser dina inlägg om du inte aktivt delar.
- **Tränar inte AI-modeller.** Din text används inte för att träna någon modell.
- **Data i EU.** Lagras hos Supabase. _(Verifiera region i Supabase-konsolen innan du publicerar.)_
- **Öppen källkod.** Du kan inspektera och granska koden själv på [GitHub](https://github.com/johannaefageras/storify).

**Implementation:**

1. Ny komponent `src/lib/components/TrustBlock.svelte` med fyra ikon+rubrik+brödtext-celler.
2. Inkludera i [`src/routes/+page.svelte`](src/routes/+page.svelte) ovanför den slutgiltiga CTA:n.
3. Återanvänd i [`src/routes/about/+page.svelte`](src/routes/about/+page.svelte) och eventuellt på registreringssidan.

**Datakälla:** [`src/routes/privacy/+page.svelte`](src/routes/privacy/+page.svelte) bör fortfarande vara den auktoritativa långa versionen — trust-blocket länkar dit.

---

### 6. Visuella produktbevis

**Mål:** En förstagångsbesökare ska _se_ vad produkten producerar utan att registrera sig.

**Steg:**

1. Producera 3 statiska bilder (eller 1 kort loop-GIF/video, max ~2 MB):
   - **Bild A:** Voice picker med 3–4 toner synliga (en distinkt, t.ex. Katten + Shakespeare + Dagboksskribenten).
   - **Bild B:** Samma dag, genererad i två olika toner sida vid sida — visar produktens kärnvärde direkt.
   - **Bild C:** Arkiv/kalendervy med streak-markering.
2. Lägg dem i `static/marketing/` (eller `static/screenshots/`) och referera från [`src/routes/+page.svelte`](src/routes/+page.svelte) som ett `<section class="proof">`.
3. Prestanda: använd `loading="lazy"`, sätt explicita `width`/`height` för att undvika CLS, kör bilderna genom en `.webp`-konvertering (`cwebp -q 80`).
4. Tillgänglighet: konkreta `alt`-texter ("Skärmbild: tonväljare med 33 olika röster, exempel på Katten och Shakespeare").

**Datakälla för exempel:** generera riktiga texter via egen testanvändare så proverna är produkttrogna, inte påhittade.

---

### 7. Changelog-sida

**Mål:** Visar att produkten lever; bra både för retention och SEO.

**Steg:**

1. Ny route: `src/routes/changelog/+page.svelte` + `+page.ts` med `prerender = true`.
2. Datakälla — välj enklast först:
   - **A (enklast):** En manuell Markdown-fil `src/lib/data/changelog.md` som renderas med `marked` (redan dep i [`src/lib/server/blog.ts`](src/lib/server/blog.ts)).
   - B: En lista av entries i `src/lib/data/changelog.ts` med `date`, `title`, `notes`.
3. Lägg till länk i footern (steg 3 ovan).
4. Skriv minst 5–10 inledande poster baserat på senaste git-loggen så sidan inte ser tom ut vid lansering. Filtrera bort interna refactors — fokus på _vad användaren märker_.
5. Lägg till `<link rel="alternate" type="application/rss+xml" href="/changelog.xml">` om du vill gå hela vägen (kan vänta).

**Acceptanskriterium:** `/changelog` finns, är prerendrad, länkad från footern, har minst 5 entries.

---

### 8. Tillgänglighetspass + statement

**Mål:** Hygiennivå — och en synlig sida som visar att ni bryr er.

**Steg:**

1. Snabb manuell genomgång:
   - Kör `npm run build && npm run preview` och kör Lighthouse Accessibility på `/`, `/wizard`, `/voices`, `/journal`. Notera alla failures.
   - Kontrollera kontrast på "muted"/sekundärtext — vanligaste WCAG-failet.
   - Kontrollera fokusring: ta bort eventuellt `outline: none` utan ersättning.
   - Kontrollera att alla `<img>` har `alt` (eller `alt=""` om dekorativa).
   - Kontrollera att rubriksekvensen i [`src/routes/+page.svelte`](src/routes/+page.svelte) följer h1→h2→h3 utan hopp.
2. Skapa `src/routes/accessibility/+page.svelte` med en kort, ärlig sida:
   - Mål-WCAG-nivå (sikta på AA).
   - Vilka delar som testats.
   - Kända begränsningar.
   - Kontaktväg för rapportering.
3. Länka från footern.

---

## Tier 3 — Tillväxt och retention (medel-hög insats)

### 9. Jämförelsesidor

**Mål:** Fånga sökintention "X vs Y" där användare redan letar efter en dagboksapp.

**Sidor att bygga (en åt gången):**

- `/storify-vs-day-one`
- `/storify-vs-daylio`
- `/storify-vs-dagbok-apple`

**Struktur per sida (~600–900 ord):**

1. H1: "Storify vs Day One — vilken passar dig?"
2. Snabbsammanfattning (3 rader).
3. Jämförelsetabell: språk, AI-generering, integritet, pris, plattform, export.
4. När välja Storify / När välja konkurrenten — ärligt.
5. CTA till `/wizard` eller `/quick`.
6. JSON-LD `Article` + `FAQPage` om relevant.

**Tekniskt:** ny route per sida under `src/routes/`, prerendered. Lägg till URL:erna i `svelte.config.js` `prerender.entries` om de inte är länkade från någon sida.

**Källkrav:** Hämta priser etc. från konkurrenternas officiella sidor (`citeturn39search1` etc. i rapporten) — _aldrig_ från minnet.

---

### 10. Bloggen → SEO-hub

**Mål:** Gå från 14 lösa poster till ett kluster med internt länknät.

**Steg:**

1. Definiera 3 _pillar pages_: `/voices`, `/quick`, `/wizard`. Dessa ska vara de mest länkade-till från bloggposter.
2. Gå igenom befintliga 14 poster i [`src/posts/`](src/posts/) och säkerställ att varje post länkar till minst 1 pillar + 2 andra poster.
3. Lägg till en "Relaterade inlägg"-sektion i [`src/lib/server/blog.ts`](src/lib/server/blog.ts) som väljer 3 poster med matchande taggar.
4. Lägg till `tags`-fält i blogpost frontmatter om det inte finns — taxonomi-rutter (`/blogg/amne/integritet` etc.) kan vänta.
5. Sätt `<link rel="canonical">` på alla bloggposter (om inte redan gjort).

---

### 11. Analytics med samtycke

**Mål:** Faktisk mätning utan att tappa integritetspositionering.

**Val:**

- **A (rekommenderat):** [Plausible](https://plausible.io) eller self-hosted [Umami](https://umami.is). Cookielös, EU-friendly, ingen consent banner krävs juridiskt.
- B: GA4 bakom en consent banner — sämre för integritetsbudskapet.

**Steg om A väljs:**

1. Lägg till script-tag i [`src/routes/+layout.svelte`](src/routes/+layout.svelte) `<svelte:head>`, gated på `import.meta.env.PROD`.
2. Spåra händelser: `signup`, `entry_generated` (med `mode` och `tone` properties), `share_to_community`. Kalla från relevanta `+server.ts`-routes eller klient-actions.
3. Uppdatera [`src/routes/cookies/+page.svelte`](src/routes/cookies/+page.svelte) och [`src/routes/privacy/+page.svelte`](src/routes/privacy/+page.svelte) för att nämna analytics och varför ingen cookie-banner behövs.

---

### 12. Lifecycle email-paketering

**Mål:** Vecko-/månadsbrev är retention-infrastruktur men marknadsförs inte. Synliggör.

**Steg:**

1. Lägg till en signup-modul på landningssidan (under hero eller före slutlig CTA): "Få ett veckobrev som sammanfattar din dagbok — varje söndag."
2. För icke inloggade: e-mailfält som skapar en "pending"-prenumeration och föreslår registrering.
3. Visa på inställningar (`/profile`) tydliga toggles för veckobrev/månadsbrev (om inte redan finns).
4. Resend-templates lever i [`src/lib/newsletter/`](src/lib/newsletter/) — säkerställ att utskicken har en stabil CTA "Skriv idag" till `/quick` så mailet driver tillbaka till produkten.

---

## Genomförandeordning (förslag)

| Sprint | Innehåll                                                     | Uppskattat arbete |
| ------ | ------------------------------------------------------------ | ----------------- |
| 1      | Tier 1 steg 1, 3, 4 (en PR)                                  | ~2 timmar         |
| 2      | Tier 1 steg 2 (modes-refaktor) + Tier 2 steg 5 (trust-block) | ~3 timmar         |
| 3      | Tier 2 steg 6 (visuella bevis) + steg 7 (changelog)          | ~4 timmar         |
| 4      | Tier 2 steg 8 (accessibility)                                | ~2 timmar         |
| 5      | Tier 3 steg 9 (en jämförelsesida i taget)                    | ~3 timmar/sida    |
| 6      | Tier 3 steg 10–12                                            | ~6 timmar totalt  |

---

## Explicita icke-mål

- **Inga falska testimonials.** Vänta tills riktiga användare ger riktiga citat med tillstånd.
- **Ingen prissida förrän en plan faktiskt finns.** "Kommer snart"-sidor utan substans skadar mer än de hjälper.
- **Ingen mass-cookie-banner** om analytics-valet är cookielös (steg 11A).
- **Ingen automatiserad SEO-spammning** av bloggen — håll fast vid Om-sidans löfte att bloggen inte ska bli en "halvautomatiserad SEO-maskin".

---

## Öppna frågor som behöver beslut innan implementation

1. Vilken kontakt-epostadress ska exponeras i footern?
2. Ska jämförelsesidor (Tier 3 steg 9) skrivas av en människa eller får AI utkastet och människa redigerar?
3. Plausible (~$9/mån) vs Umami (self-host, gratis)? Påverkar steg 11.
4. Ska bilderna i steg 6 vara fejk-data eller riktiga dagboksinlägg (med tillstånd)?
5. Org.nr-frågan: planeras AB-registrering, eller ska "hobbyprojekt"-positionen behållas långsiktigt?

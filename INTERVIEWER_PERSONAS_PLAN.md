# Handlingsplan: Tre intervjuarpersonligheter i Interview Mode

**Status:** Klart för implementation. Alla designbeslut fattade.
**Mål:** Utöka befintligt interview-läge (`/interview`) från en enda neutral intervjuare till tre valbara personligheter. Användaren väljer persona _innan_ samtalet startar.

---

## 1. Kontext (läs detta först)

### Vad som redan finns

Interview mode är en av tre vägar in i ett dagboksinlägg (se [CLAUDE.md](CLAUDE.md) → "Three entry paths"). Specifikation finns i [docs/ai-interviewer.md](docs/ai-interviewer.md). Nuvarande implementation:

- **Route:** [src/routes/interview/+page.svelte](src/routes/interview/+page.svelte)
- **Store:** [src/lib/stores/chat.svelte.ts](src/lib/stores/chat.svelte.ts) (Svelte 5 runes)
- **System prompt builder:** [src/lib/data/chatbotPrompt.ts](src/lib/data/chatbotPrompt.ts) — en enda fil som exporterar `buildInterviewerPrompt(profile)`
- **Chat API:** [src/routes/api/chat/+server.ts](src/routes/api/chat/+server.ts) — anropar `buildInterviewerPrompt(profile)`
- **Openers** (lokala första-assistentmeddelanden, ingen API-rundtur): [src/lib/data/interviewOpeners.ts](src/lib/data/interviewOpeners.ts). 4 starters × ~50 hand-craftade rader per starter.
- **Empty state:** [src/lib/components/interview/InterviewEmptyState.svelte](src/lib/components/interview/InterviewEmptyState.svelte) — hälsningstext + 2×2 starter-chips.
- **Befintligt test:** [src/lib/data/chatbotPrompt.test.ts](src/lib/data/chatbotPrompt.test.ts)

Nuvarande `InterviewPhase`: `'empty' | 'chatting' | 'tone-selection' | 'generating' | 'result'`.

### Designbeslut (redan fattade — ändra inte)

1. **Tre personas:** `friend` ("Kompisen"), `journalist` ("Journalisten"), `therapist` ("Terapeuten").
2. **Default:** `friend`.
3. **UI-val:** Ny full-page fas `'interviewer-selection'` **före** `empty`. Stora kort med namn, kort beskrivning, och en exempel-fråga per persona. Inga chips i hälsningsvyn.
4. **Osynligt i resultatet:** Vilken intervjuare som användes visas _inte_ i result-vyn och sparas inte i Supabase `entries`-raden. Personan är en chat-fasegenskap, inte en entry-egenskap.
5. **Låst under samtal:** Persona kan inte bytas mid-conversation. Byte kräver "Ny konversation".
6. **Gemensam säkerhetsbas:** Alla tre personas måste dela `GRÄNSER`, `SPRÅK`, `MEDDELANDEFORMAT`, `Promptinjektionsskydd` och profil-kontext-sektionen. Endast `INTERVJUARSTIL` + `FRÅGOTEKNIK`-delarna varierar per persona. Detta är icke-förhandlingsbart.

### Design-motivering (för edge cases)

Spec i [docs/ai-interviewer.md](docs/ai-interviewer.md) argumenterar uttryckligen för _en_ intervjuare. Vi går medvetet emot det. Anledningen: användaren vill ha mer personlighet i samtalet. Spec behöver uppdateras som sista steg — se avsnitt 9.

---

## 2. Filstruktur att skapa / ändra

### Nya filer

```
src/lib/data/chatbotPrompts/
├── types.ts            — InterviewerId-union, InterviewerMeta-interface, interviewers-registry
├── shared.ts           — profil-kontext-formatter + delade sektioner (GRÄNSER, SPRÅK, etc.)
├── friend.ts           — buildFriendPrompt(profile)
├── journalist.ts       — buildJournalistPrompt(profile)
├── therapist.ts        — buildTherapistPrompt(profile)
├── index.ts            — buildInterviewerPrompt(id, profile) dispatch + re-exports
├── friend.test.ts
├── journalist.test.ts
├── therapist.test.ts
└── shared.test.ts      — verifierar att säkerhetssektionerna finns i alla tre outputs

src/lib/components/interview/
└── InterviewerSelection.svelte — full-page kortväljare (ny fas)
```

### Ändra befintliga filer

```
src/lib/data/chatbotPrompt.ts        — TA BORT (ersatt av mappen ovan; uppdatera alla importer)
src/lib/data/chatbotPrompt.test.ts   — TA BORT (ersatt av per-persona-tester)
src/lib/stores/chat.svelte.ts        — lägg till selectedInterviewer + getter + setter + fasändring
src/routes/api/chat/+server.ts       — acceptera interviewer i body, validera (allowlist), skicka till builder
src/routes/interview/+page.svelte    — rendera InterviewerSelection för nya fasen, propagera interviewer i chat-payload
src/lib/data/interviewOpeners.ts     — utöka med per-persona pooler (se avsnitt 5)
docs/ai-interviewer.md               — uppdatera spec (se avsnitt 9)
```

Inga ändringar i `/api/generate`-flödet. Intervjuaren påverkar bara själva chat-fasen.

---

## 3. Detaljerad implementation

### 3.1 `src/lib/data/chatbotPrompts/types.ts`

```typescript
export type InterviewerId = 'friend' | 'journalist' | 'therapist';

export const DEFAULT_INTERVIEWER: InterviewerId = 'friend';

export const VALID_INTERVIEWER_IDS: readonly InterviewerId[] = [
  'friend',
  'journalist',
  'therapist'
] as const;

export interface InterviewerMeta {
  id: InterviewerId;
  name: string; // "Kompisen"
  shortLabel: string; // "Varm och prestigelös" (under namnet i kortet)
  description: string; // 1-2 meningar, visas i valskärmen
  sampleQuestion: string; // exempel-fråga som illustrerar stilen
  emoji: string; // Emoji-name från $lib/assets/emojis (t.ex. 'smiling-face')
}

export const interviewers: Record<InterviewerId, InterviewerMeta> = {
  friend: {
    id: 'friend',
    name: 'Kompisen',
    shortLabel: 'Varm och prestigelös',
    description:
      'En vän som hämtar dig på vägen hem och bara frågar "nå, hur var det då?" — nyfiken utan att vara intensiv.',
    sampleQuestion: 'Åh, berätta — hur kändes det då?',
    emoji: 'smiling-face'
  },
  journalist: {
    id: 'journalist',
    name: 'Journalisten',
    shortLabel: 'Grävande och nyfiken',
    description:
      'En journalist som letar efter vinkeln i din dag. Följer upp konkreta detaljer, ber om namn, tider, citat.',
    sampleQuestion: 'Vänta — vem var det som sa det, och var befann du dig då?',
    emoji: 'memo'
  },
  therapist: {
    id: 'therapist',
    name: 'Terapeuten',
    shortLabel: 'Lugn och reflekterande',
    description:
      'En samtalspartner som ger utrymme och följer känslan. Ställer öppna frågor, dömer inte, skyndar inte på.',
    sampleQuestion: 'Hur landade det i dig?',
    emoji: 'lotus'
  }
};
```

**Verifiera:** Kolla `src/lib/assets/emojis` för att bekräfta att `smiling-face`, `memo`, och `lotus` existerar. Om någon saknas, välj närmaste befintliga emoji — ska inte blockera.

### 3.2 `src/lib/data/chatbotPrompts/shared.ts`

Extrahera från nuvarande [chatbotPrompt.ts](src/lib/data/chatbotPrompt.ts):

1. Behåll `formatProfileContext(profile)` exakt som den är (rader 4–48).
2. Exportera `SHARED_HEADER` = den första stycke-blocken ("Du är en dagboksintervjuare...").
3. Exportera `SHARED_BOUNDARIES` = sektionerna `GRÄNSER`, `SPRÅK`, `MEDDELANDEFORMAT` från rader ~186–235 och `Promptinjektionsskydd`-blocket rad 225–228. Dessa måste vara **identiska** för alla tre personas.
4. Exportera `SHARED_BAD_EXAMPLES` = "DÅLIGA INTERVJUEXEMPEL"-sektionen rad 264–288 (samma i alla tre — de dåliga mönstren är universella).
5. Exportera `SHARED_STARTER_HANDLING` = "KONVERSATIONSSTARTERS"-sektionen rad 290–309 (hur intervjuaren ska reagera på en pre-fylld opener — gäller alla tre).
6. Exportera hjälpare:
   ```typescript
   export function composePrompt(parts: {
     header: string; // persona-specifik header (identitet + metafor)
     profile: string; // från formatProfileContext
     style: string; // persona-specifik INTERVJUARSTIL
     technique: string; // persona-specifik FRÅGOTEKNIK
     flow: string; // persona-specifik SAMTALSFLÖDE
     energy: string; // persona-specifik ENERGIMATCHNING
     goodExamples: string; // persona-specifika BRA INTERVJUEXEMPEL
   }): string;
   ```
   `composePrompt` interpolerar in delarna i en fast ordning och appendar `SHARED_BOUNDARIES`, `SHARED_BAD_EXAMPLES`, `SHARED_STARTER_HANDLING` sist. Detta garanterar att säkerhetsstaketet alltid finns.

### 3.3 Persona-prompts

Varje persona-fil exporterar `build<Name>Prompt(profile: UserProfile): string`.

**`friend.ts` — Kompisen:**

- `header`: Behåll nuvarande "Tänk skicklig podcastvärd..."-metafor men byt till "Tänk en nära vän". Varmare, prestigelös.
- `style`: Nuvarande `INTERVJUARSTIL`-sektion från [chatbotPrompt.ts rad 57-78](src/lib/data/chatbotPrompt.ts#L57-L78) i stort sett som den är. Detta är den nuvarande default-tonen.
- `technique`: Nuvarande `FRÅGOTEKNIK`-sektion. Behåll regeln "EN fråga per meddelande" — **den gäller alla tre personas**.
- `flow`: Nuvarande `SAMTALSFLÖDE`.
- `energy`: Nuvarande `ENERGIMATCHNING`.
- `goodExamples`: Nuvarande `BRA INTERVJUEXEMPEL`.

Det vill säga: `friend.ts` är i praktiken en _refaktorering_ av nuvarande prompt — innehållet förändras minimalt. Detta är medvetet så att vi vet att Kompisen beter sig ≈ som nuvarande intervjuare beter sig idag.

**`journalist.ts` — Journalisten:**

- `header`: "Du är en dagboksintervjuare, men med en grävande journalists öra. Du letar efter vinkeln, de konkreta detaljerna, det som gör en vardaglig dag till en berättelse. Tänk skicklig reporter — du är vänlig, men du accepterar inte vaga svar. Du bygger en scen."
- `style`: Samma grundton (varm, EN fråga åt gången, aldrig terapeutisk), men med tillägg:
  - Pressa mjukt på specifika detaljer: namn, platser, tider, exakta repliker.
  - "Vänta, vem sa det?" / "Var befann ni er då?" / "Hur lät det?"
  - Älskar motsägelser och det oväntade. Plockar upp när en användare säger något i förbigående och zoomar in.
  - Mer benägen att be om ett citat: "Kommer du ihåg exakt vad hen sa?"
  - Validerar _mindre_ än Kompisen — mer "aha, spännande" än "åh vad fint". Nyfikenhet > värme.
- `technique`: Behåll EN-fråga-regeln. Lägg till "detaljfrågor"-kategori med journalistiska varianter. Behåll listan över frågor att UNDVIKA. Lägg explicit till: "Ledande frågor ska du absolut inte ställa — du är intresserad av deras sanning, inte din hypotes."
- `flow`: Fas 2 fokuserar på att bygga scenen (vilka, vad, var, när). Fas 3 letar motsägelser / mönster i det de berättat. Fas 4 vanlig avrundning.
- `energy`: Samma fyra underkategorier (entusiastisk / kortfattad / ledsen / glad / disträ) men med journalist-spin. Viktigt: Under "Ledsen användare" — journalisten ska _inte_ plötsligt bli Terapeuten. Hen fortsätter vara intresserad men saktar ner tempot.
- `goodExamples`: Skriv 3–5 nya exempel i journalist-stil. Minst ett där intervjuaren plockar upp en förbi-passerande detalj och gräver.

**`therapist.ts` — Terapeuten:**

⚠️ **VIKTIGT — detta är inte en terapeut.** Namnet är metaforiskt. Personan är "en lugn, reflekterande samtalspartner" — _inte_ en som ger diagnoser, råd eller terapeutiska interventioner. `SHARED_BOUNDARIES` står kvar intakt, inklusive sektionen "Du är en intervjuare, INTE en terapeut". Detta är en spänning men ska lösas genom att Terapeuten-personan **följer samma gränser** — hen är bara varmare kring känslor och ger mer utrymme.

- `header`: "Du är en dagboksintervjuare med en lugn, lyssnande ton. Du ger utrymme, skyndar inte på, och är bekväm med pauser. Tänk en mentor eller en trygg vuxen som bara... lyssnar. Du är _inte_ en terapeut, ger inga råd, gör inga diagnoser — men du är bekväm med känslor och följer dem om användaren öppnar den dörren."
- `style`:
  - Långsammare tempo. Längre mellanrum mellan frågor är okej.
  - Öppna frågor dominerar. Mindre "vad hände?" och mer "hur var det?"
  - Mjuka reflektioner ("Det låter som en blandning av lättnad och sorg") — men _alltid_ validerande, aldrig tolkande. Aldrig "det låter som ett mönster av...".
  - Sensoriska / kropps-frågor är naturliga här: "Hur kändes det i kroppen?" "Var någonstans landade det?"
  - Hen _upprepar_ användaren ibland med egna ord: "Så när du säger att du kände dig osynlig — kan du berätta mer om den känslan?"
  - Ingen coaching, inga framtidsfrågor ("vad ska du göra åt det?"), inga lösningar.
- `technique`: EN-fråga-regeln. Lägg till en sektion om "reflekterande återkopplingar" (varsamt — inte som dagbokskribenten-AI:n gör efteråt, utan som kort paus i samtalet). Gränser förtydligas: "Du reflekterar tillbaka det användaren sagt. Du _tolkar inte_. Du _analyserar inte_. Du ger absolut inga råd."
- `flow`: Fas 1 öppet. Fas 2 följer känsla/tema snarare än kronologi. Fas 3 går djupare i det som bär affekt. Fas 4 lugn avrundning.
- `energy`: Alla fyra underkategorier. "Ledsen användare" är där den här personan är som mest i sitt element — men pressa fortfarande inte, tolka inte, föreslå inte "prata med någon" om det inte är akut (då gäller `SHARED_BOUNDARIES` 1177-hänvisningen).
- `goodExamples`: 3–5 nya exempel. Minst ett där användaren är ledsen och Terapeuten håller utrymmet utan att bli rådgivande.

### 3.4 `src/lib/data/chatbotPrompts/index.ts`

```typescript
import type { UserProfile } from '$lib/stores/wizard.svelte';
import type { InterviewerId } from './types';
import { buildFriendPrompt } from './friend';
import { buildJournalistPrompt } from './journalist';
import { buildTherapistPrompt } from './therapist';

export * from './types';

export function buildInterviewerPrompt(interviewerId: InterviewerId, profile: UserProfile): string {
  switch (interviewerId) {
    case 'friend':
      return buildFriendPrompt(profile);
    case 'journalist':
      return buildJournalistPrompt(profile);
    case 'therapist':
      return buildTherapistPrompt(profile);
  }
}
```

**Signaturändring:** Gamla signaturen var `buildInterviewerPrompt(profile)`. Nya signaturen kräver `interviewerId` som första argument. Uppdatera alla callers (bara `/api/chat/+server.ts` i dagsläget).

### 3.5 Store-ändringar: `src/lib/stores/chat.svelte.ts`

Lägg till:

```typescript
import { DEFAULT_INTERVIEWER, type InterviewerId } from '$lib/data/chatbotPrompts';
```

Utöka `InterviewPhase`:

```typescript
export type InterviewPhase =
  | 'interviewer-selection' // NY — inledande fas
  | 'empty'
  | 'chatting'
  | 'tone-selection'
  | 'generating'
  | 'result';
```

Utöka `ChatDraft`:

```typescript
interface ChatDraft {
  messages: ChatMessage[];
  phase: InterviewPhase;
  selectedInterviewer: InterviewerId; // NY
  selectedTone: string;
  includeHoroscope: boolean;
  includeOnThisDay: boolean;
  includeHomework: boolean;
  savedAt: number;
}
```

I `createChatStore`:

- Ändra `phase`-initvärde från `'empty'` till `'interviewer-selection'`.
- Lägg till `let selectedInterviewer = $state<InterviewerId>(DEFAULT_INTERVIEWER);`.
- Lägg till getter + setter:
  ```typescript
  get selectedInterviewer() { return selectedInterviewer; },
  setInterviewer(id: InterviewerId) {
    selectedInterviewer = id;
    scheduleDraftSave();
  },
  chooseInterviewerAndContinue(id: InterviewerId) {
    selectedInterviewer = id;
    phase = 'empty';
    scheduleDraftSave();
  },
  ```
- I `saveDraftNow`: inkludera `selectedInterviewer` i draftobjektet.
- I `loadDraft`: läs tillbaka `selectedInterviewer`. **Fallback:** om fältet saknas (gammal draft från före feature-släpp), sätt `DEFAULT_INTERVIEWER`. Om draftens `phase === 'interviewer-selection'` — låt den stå, användaren får välja igen.
- I `reset()`: sätt `selectedInterviewer = DEFAULT_INTERVIEWER` och `phase = 'interviewer-selection'`.

**Edge case — draft med meddelanden men utan intervjuare:** Vid `loadDraft`: om `messages.length > 0` och `selectedInterviewer` saknas i drafter → default till `'friend'` (retroaktivt). Logga inget varnande, bara fall tillbaka tyst.

### 3.6 API-ändringar: `src/routes/api/chat/+server.ts`

Uppdatera `ChatRequestBody`:

```typescript
interface ChatRequestBody {
  messages: ChatMessagePayload[];
  profile: UserProfile;
  interviewer?: InterviewerId; // optional för bakåtkompatibilitet
}
```

I POST-handlern, efter parse av body:

```typescript
import {
  buildInterviewerPrompt,
  DEFAULT_INTERVIEWER,
  VALID_INTERVIEWER_IDS,
  type InterviewerId
} from '$lib/data/chatbotPrompts';

// ...

const requestedInterviewer = body.interviewer ?? DEFAULT_INTERVIEWER;

// Allowlist-validering — trusta ALDRIG klient-strängen direkt
const interviewer: InterviewerId = VALID_INTERVIEWER_IDS.includes(requestedInterviewer)
  ? requestedInterviewer
  : DEFAULT_INTERVIEWER;

// ...

let systemPrompt = buildInterviewerPrompt(interviewer, profile);
```

Inga andra ändringar i API:et. Wrap-up-instruktionerna (rad 95–103) är personaoberoende och står kvar.

### 3.7 Page-ändringar: `src/routes/interview/+page.svelte`

1. Importera nya komponenten:
   ```typescript
   import InterviewerSelection from '$lib/components/interview/InterviewerSelection.svelte';
   ```
2. Lägg till ny `{:else if chatStore.phase === 'interviewer-selection'}`-gren **först** i `{#if}`-kedjan:
   ```svelte
   {#if chatStore.phase === 'interviewer-selection'}
     <div class="interview-select">
       <InterviewerSelection
         onSelect={(id) => chatStore.chooseInterviewerAndContinue(id)}
       />
     </div>
   {:else if chatStore.phase === 'empty'}
     ...
   ```
3. Uppdatera bottens `{#if}`-guard för `.interview-footer` så `ChatInput` **inte** visas under `interviewer-selection`:
   ```svelte
   {#if chatStore.phase === 'empty' || chatStore.phase === 'chatting'}
     <div class="interview-footer">...</div>
   {/if}
   ```
   Denna rad (771) är redan korrekt — verifiera bara.
4. I `streamResponse()` (rad 171), inkludera `interviewer` i payload:
   ```typescript
   const payload = {
     messages: /* ... */,
     profile: wizardStore.data.profile,
     interviewer: chatStore.selectedInterviewer
   };
   ```
5. Lägg till CSS för `.interview-select` — speglar `.interview-empty` layout (flex, centrerat, fyller utrymmet).

### 3.8 Ny komponent: `src/lib/components/interview/InterviewerSelection.svelte`

**Props:**

```typescript
interface Props {
  onSelect: (id: InterviewerId) => void;
}
```

**Struktur:**

- Hälsningstext ovanför: "Välj din intervjuare" + underrubrik: "Hen styr samtalet. Valet syns bara här — dagboksinlägget får du välja röst för i nästa steg."
- Kortgrid: desktop 3 kolumner, mobil 1 kolumn (full bredd). Använd samma elevation och radius som `.starter-chip` i [InterviewEmptyState.svelte](src/lib/components/interview/InterviewEmptyState.svelte#L112-L132) som visuell förlaga.
- Varje kort:
  - Stor emoji (från `InterviewerMeta.emoji`, t.ex. storlek 48)
  - Namn (h3)
  - `shortLabel` (liten, muted)
  - `description` (1-2 rader)
  - `sampleQuestion` i kursiv/italic, prefixad med citatmarkering (t.ex. `"<em>{sampleQuestion}</em>"`)
  - Hela kortet är klickbart (`<button>`), kör `onSelect(id)` vid klick.
- Accent-färg runt kort vid hover, motsvarande `.starter-chip:hover`.
- Läs personerna via `Object.values(interviewers)` för att rendera dynamiskt — ordning: `friend`, `journalist`, `therapist` (Record-ordning är insertion-ordning i TS ≥ 5).

**Accessibility:**

- Varje kort = `<button>` med `aria-label="Välj intervjuare: {name}. {shortLabel}"`.
- Tab-navigerbart. Enter/Space aktiverar. Standard `<button>`-beteende räcker.

### 3.9 Openers: `src/lib/data/interviewOpeners.ts`

**Val:** Per-persona opener-pooler. Skäl: det _första_ assistentmeddelandet sätter tonen direkt — en Kompis-opener från Terapeuten bryter illusionen.

**Strukturändring:**

```typescript
import type { InterviewerId } from './chatbotPrompts';

// STARTER_LABELS står kvar oförändrad.

// Ny typ:
type OpenerPools = Record<InterviewerId, Record<StarterId, readonly string[]>>;

export const INTERVIEW_OPENERS: OpenerPools = {
  friend: {
    tips: [
      /* befintliga 50 — flytta hit oförändrade */
    ],
    unexpectedQuestion: [
      /* befintliga 50 */
    ],
    rememberDay: [
      /* befintliga 50 */
    ],
    digInteresting: [
      /* befintliga 50 */
    ]
  },
  journalist: {
    tips: [
      /* ~15-25 nya rader i journalist-stil */
    ],
    unexpectedQuestion: [
      /* ~15-25 */
    ],
    rememberDay: [
      /* ~15-25 */
    ],
    digInteresting: [
      /* ~15-25 */
    ]
  },
  therapist: {
    tips: [
      /* ~15-25 nya rader i terapeut-stil */
    ],
    unexpectedQuestion: [
      /* ~15-25 */
    ],
    rememberDay: [
      /* ~15-25 */
    ],
    digInteresting: [
      /* ~15-25 */
    ]
  }
} as const;

export function pickOpener(
  interviewer: InterviewerId,
  starter: StarterId,
  rng: () => number = Math.random
): string {
  const pool = INTERVIEW_OPENERS[interviewer][starter];
  const index = Math.floor(rng() * pool.length);
  return pool[index];
}
```

**Storleksriktlinje:** Skriv ~20 openers per starter × persona för journalist/therapist. Det ger 4 × 20 × 2 = 160 nya rader totalt. Kompisen ärver de 200 befintliga (flytta utan ändring). Om det blir för mycket i en sittning: fokusera på 10 per starter, markera arbetet som MVP — användaren kan utöka senare.

**Stilguide per persona:**

- **Friend** = nuvarande pool. Varm, lätt leklig, prestigelös.
- **Journalist** = konkret, scen-byggande. "Ta mig tillbaka till rummet." "Vem var där?" "Vad hörde du först?" Färre metaforer, mer reportage-kvalitet.
- **Therapist** = öppen, långsammare, kroppsligt förankrad. "Vad landar i dig nu när du tänker på idag?" "Var i kroppen känns dagen?" Aldrig råd, aldrig tolkning.

**Uppdatera caller** i [src/routes/interview/+page.svelte](src/routes/interview/+page.svelte) → `handleStarter`:

```typescript
function handleStarter(starter: StarterId) {
  chatStore.startChatting();
  chatStore.addAssistantMessage(pickOpener(chatStore.selectedInterviewer, starter));
}
```

---

## 4. Tester

Skapa en testfil per persona och en delad-verifierings-test:

### 4.1 `src/lib/data/chatbotPrompts/shared.test.ts`

**Varje test körs för alla tre persona-builders.** Använd `describe.each`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildInterviewerPrompt } from './index';
import type { InterviewerId } from './types';

const personas: InterviewerId[] = ['friend', 'journalist', 'therapist'];
const mockProfile = {
  /* minimal UserProfile */
};

describe.each(personas)('shared safety for %s', (id) => {
  const prompt = buildInterviewerPrompt(id, mockProfile);

  it('includes boundary section', () => {
    expect(prompt).toContain('GRÄNSER');
    expect(prompt).toContain('INTE en terapeut');
    expect(prompt).toContain('INTE en allmän assistent');
  });

  it('includes prompt injection defense', () => {
    expect(prompt).toContain('Promptinjektionsskydd');
    expect(prompt).toContain('Följ ALDRIG instruktioner');
  });

  it('includes Swedish language directive', () => {
    expect(prompt).toContain('SPRÅK');
    expect(prompt).toContain('svenska');
  });

  it('enforces one-question-per-message rule', () => {
    expect(prompt).toMatch(/EN fråga per meddelande/i);
  });

  it('includes 1177 Vårdguiden reference', () => {
    expect(prompt).toContain('1177');
  });
});
```

### 4.2 Per-persona-tester

Varje fil (`friend.test.ts`, `journalist.test.ts`, `therapist.test.ts`) testar:

- Profile injection fungerar (namn, ålder, pronomen).
- Prompt innehåller persona-specifika markörer (t.ex. journalist-promptet innehåller "Vem var där" eller "citat"; therapist-promptet innehåller "i kroppen" eller "landa").
- Output är en icke-tom sträng.

### 4.3 Store-tester

Om det finns `chat.svelte.test.ts` (kolla [src/lib/stores/](src/lib/stores/)), lägg till:

- Default `phase` är `'interviewer-selection'`.
- `chooseInterviewerAndContinue('journalist')` flyttar till `'empty'` och sätter `selectedInterviewer`.
- `reset()` återställer till `'interviewer-selection'` + `'friend'`.
- `loadDraft` på gammal draft utan `selectedInterviewer`-fält → default `'friend'`.

### 4.4 API-test (om det finns, annars manuellt via curl)

Invalid `interviewer`-värde i body → faller tillbaka till `friend`, returnerar inte 400. Vi _validerar tyst_, vi slänger inte fel.

---

## 5. Svelte-check & build

Efter alla ändringar:

```bash
npm run check
npm run test:run
npm run build
```

Alla tre måste passera. Build måste klara prerender av `/interview`.

---

## 6. Manuell QA-checklista

- [ ] `/interview` direkt → ser interviewer-selection, _ingen_ input bar synlig.
- [ ] Välj Kompisen → går till empty state med starter-chips.
- [ ] Tryck starter → får en kompisen-opener från nya poolen.
- [ ] Skriv meddelande → AI svarar i kompis-ton.
- [ ] Gå tillbaka till `/`, klicka `/interview` igen → draft återställs, landar i `chatting` (inte selection).
- [ ] Tryck "Ny konversation" (beroende på var den knappen sitter) → tillbaka till interviewer-selection.
- [ ] Upprepa för Journalisten — verifiera _märkbart_ annorlunda ton i första AI-svaret.
- [ ] Upprepa för Terapeuten — märkbart lugnare/öppnare ton.
- [ ] Välj valfri persona, generera ett inlägg → result-vyn visar _ingen_ hänvisning till vilken intervjuare som användes.
- [ ] Spara inlägg till journal (om inloggad) → Supabase-raden innehåller ingen `interviewer`-kolumn eller -metadata.
- [ ] Mobilvy: korten stackar vertikalt, allt läsbart.
- [ ] Tab-navigation på selection-skärmen fungerar.

---

## 7. Vad som _inte_ ska göras

- **Ingen `source`-kolumn eller `interviewer`-kolumn i `entries`-tabellen.** Beslut: osynligt i result och i lagring.
- **Ingen persona-byte mid-conversation.** Lås via UI — ingen "byt intervjuare"-knapp under `chatting`.
- **Ingen analytics-instrumentering** för vilket val som är populärast (utanför scope).
- **Ingen förändring av `/api/generate`** eller tone-systemet. Intervjuaren är orthogonal till output-tone.
- **Ingen uppdatering av quick-mode eller wizard-flödena** — interview är den enda vägen som berörs.
- **Ingen internationalisering** — svenska only, precis som resten.

---

## 8. Implementation-ordning (rekommenderad)

Bygg i den här ordningen, commita efter varje steg:

1. Skapa `chatbotPrompts/types.ts` + `shared.ts` + `friend.ts` + `index.ts`. Behåll gamla [chatbotPrompt.ts](src/lib/data/chatbotPrompt.ts) parallellt. Kör tester för friend-persona.
2. Byt `/api/chat/+server.ts` till nya importen (fortfarande bara `friend`). Kör dev, verifiera att interview fortfarande fungerar.
3. Lägg till `journalist.ts` + `therapist.ts` + deras tester.
4. Utöka `chat.svelte.ts` med `selectedInterviewer` + ny fas.
5. Bygg `InterviewerSelection.svelte`.
6. Koppla in i `+page.svelte`.
7. Utöka `interviewOpeners.ts` med per-persona-pooler. Uppdatera `pickOpener`-caller.
8. Ta bort gamla [chatbotPrompt.ts](src/lib/data/chatbotPrompt.ts) och dess test. Kontrollera med grep att inga andra importer pekar på den.
9. `npm run check && npm run test:run`.
10. Manuell QA enligt avsnitt 6.
11. Uppdatera [docs/ai-interviewer.md](docs/ai-interviewer.md) — se nästa avsnitt.

---

## 9. Uppdatera spec-dokumentet

[docs/ai-interviewer.md](docs/ai-interviewer.md) har idag sektionen "Why One Interviewer Instead of Multiple" som motiverar motsatt design. Uppdatera:

- **Ta bort** "Why One Interviewer Instead of Multiple"-sektionen (rader 31–37).
- **Ersätt med** en sektion "Three Interviewer Personas" som förklarar:
  - De tre personas och deras roller
  - Varför valet görs före samtalet (inte mid-chat)
  - Varför det är osynligt i result
  - Hänvisning till `src/lib/data/chatbotPrompts/` för prompts
- **Uppdatera** "System Prompt — Interview Phase"-sektionen (rad 175+) till att referera till `chatbotPrompts/`-mappen och `buildInterviewerPrompt(interviewer, profile)`-signaturen.
- **Uppdatera** "API Integration" → request body till att inkludera `interviewer`-fältet.
- **Uppdatera** "State Management" → `ChatState` till att inkludera `selectedInterviewer`.
- **Uppdatera** "UI Components" → lägg till `InterviewerSelection.svelte`.
- **Uppdatera** "Page phases"-listan med `interviewer-selection` som första fas.

---

## 10. Öppna frågor (om något är oklart — fråga användaren)

Inga kända. Alla större beslut är fattade i avsnitt 1.

Om en edge case dyker upp under implementation som inte täcks här, default till:

- **Säkerhet > funktionalitet** — behåll alla `SHARED_BOUNDARIES`-regler.
- **Kompisen är defaulten** i all osäkerhet.
- **Osynlig i result** — lägg aldrig till intervjuarmetadata i något som leder till export/save/share.

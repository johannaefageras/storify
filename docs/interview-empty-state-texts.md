# Interview mode — empty-state texts

This doc explains the three sets of text that appear on the **empty interview screen** (the first screen the user sees after picking an interviewer, before they've said anything), and how to extend each of them with more variations.

If you're copy-writing and don't touch code, you only need to edit the two data files described below. No component or logic changes are required.

---

## What is this project?

**Storify** is a Swedish journaling app. Users can create a diary entry in three ways:

1. **Wizard** — a guided, multi-step form.
2. **Quick** — a minimal fast path.
3. **Interview** — the relevant mode for this doc. The user chats with an AI "interviewer" persona, and the transcript is later turned into a diary entry by the generator.

There are currently three interviewer personas:

| id           | name          | voice                                              |
|--------------|---------------|----------------------------------------------------|
| `friend`     | Kompisen      | Warm, low-stakes, playful — a curious friend.      |
| `journalist` | Journalisten  | Curious and digging, asks for concrete details.    |
| `therapist`  | Terapeuten    | Calm, reflective, gentle — never advice-giving.    |

The UI is Swedish by default. All copy below should be written in Swedish (the "Brittisk" tone is a documented English exception and doesn't apply here).

---

## The three empty-state texts

When the user opens an interview with a chosen persona and hasn't typed anything yet, the screen shows:

```
                  👋
             <greeting-text>         ← big title
             <greeting-sub>          ← subtitle under the title

    ┌─────────────┐  ┌─────────────┐
    │  <chip-text> │  │  <chip-text> │   ← 4 starter chips
    └─────────────┘  └─────────────┘
    ┌─────────────┐  ┌─────────────┐
    │  <chip-text> │  │  <chip-text> │
    └─────────────┘  └─────────────┘
```

All three of these texts are **persona-aware**: they should sound like the selected interviewer. Kompisen greets you casually; Terapeuten greets you softly; Journalisten greets you with focused curiosity.

### 1. `greeting-text` — the big title

Short, warm, one line. Think: "Hej hej!", "Då kör vi.", "Välkommen in."

The title sets the tone before the user reads anything else, so it should feel unmistakably like the chosen persona.

### 2. `greeting-sub` — the subtitle

1–2 sentences directly under the title. It invites the user to start without demanding anything specific.

Each title comes with a **pair** of subs (two variations). When the title is picked, one of its two subs is chosen at random. This keeps the pair feeling like a coherent pair rather than one title mixed with random subs.

### 3. `chip-text` — the four starter-button labels

There are always **exactly four chips** on this screen, one per starter type:

| starter id            | purpose                                          |
|-----------------------|--------------------------------------------------|
| `tips`                | Give me a suggestion for what to write about.    |
| `unexpectedQuestion`  | Ask me an unexpected question.                   |
| `rememberDay`         | Help me remember today.                          |
| `digInteresting`      | Dig something interesting out of my day.         |

Each chip label is the **short prompt** the user taps. Each starter has its own pool of label variants per interviewer — when the screen renders, one variant is picked at random from the pool.

> **Important:** you never add new starter chip *types* here — there are always the same four. You only add more *label variations* for each of the existing four.

---

## How to add more variations

There are only two files to touch.

### File A — `src/lib/data/welcomeMessages.ts`

This file controls **greeting-text + greeting-sub**.

It contains three arrays, one per persona:

- `friendWelcomes` — for Kompisen
- `journalistWelcomes` — for Journalisten
- `therapistWelcomes` — for Terapeuten

Each array holds objects with this shape:

```ts
{
  title: 'Hej hej!',                 // greeting-text
  greetings: [                       // two greeting-subs
    'Skönt att du kikar in. ...',
    'Kom igen — stort, smått ...'
  ]
}
```

#### Add a new greeting pair (new title + its two subs)

Push a new object onto the relevant persona's array. Example for Kompisen:

```ts
const friendWelcomes: WelcomeMessage[] = [
  { title: 'Hej hej!', greetings: [...] },
  { title: 'Nämen, hej!', greetings: [...] },

  // 👇 new entry
  {
    title: 'Tjabba!',
    greetings: [
      'Läget i skallen då?',
      'Vad är på gång idag?'
    ]
  }
];
```

#### Swap one of the two subs on an existing title

Edit the string in-place inside the `greetings: [ ... ]` tuple.

> **Why only two subs per title?** The type is `[string, string]` on purpose — pairing keeps a single title's options feeling coherent rather than tonally random. If you want more than two subs per title, tell a developer and the tuple can be loosened to an open array.

---

### File B — `src/lib/data/interviewOpeners.ts`

This file controls **chip-text** (among other things — see the note at the bottom).

Find the `STARTER_LABEL_POOLS` object. It looks like:

```ts
export const STARTER_LABEL_POOLS = {
  friend: {
    tips: [ '...', '...' ],
    unexpectedQuestion: [ '...', '...' ],
    rememberDay: [ '...', '...' ],
    digInteresting: [ '...', '...' ]
  },
  journalist: { /* same four keys */ },
  therapist:  { /* same four keys */ }
};
```

#### Add more chip-text variations

Push more strings into any of the existing arrays. Example — more `tips` labels for Kompisen:

```ts
friend: {
  tips: [
    'Ge mig tips på vad jag borde skriva om..',
    'Kasta fram en ingång — vad kan jag börja med?',
    // 👇 new variants
    'Vad borde jag skriva om idag?',
    'Hjälp mig hitta nåt att börja med..'
  ],
  // ...
}
```

#### Rules

- **Never add new top-level keys** inside a persona object. There must always be exactly these four: `tips`, `unexpectedQuestion`, `rememberDay`, `digInteresting`. They're the ids that route to the right follow-up question when the user taps the chip.
- **Every persona must have all four keys.** Don't leave one empty.
- **Each array needs at least one string.** Don't leave an empty `[]`.

---

## Writing guidance

Regardless of which of the three texts you're editing:

- **Swedish only** for all three personas here.
- **Keep the persona voice consistent.** A Kompisen line should feel casual and warm; a Journalisten line focused and curious; a Terapeuten line calm and gentle. When in doubt, read 2–3 existing entries in the same persona's pool and match the register.
- **No markdown, no emojis** inside the strings.
- **Length:** titles are short (one line). Subs are 1–2 sentences. Chip labels are short phrases that fit on a button — roughly the length of the current examples.
- **The trailing `..`** on chip labels is a stylistic choice (implies continuation / invitation). Keep it.

---

## Anything else in these files?

`interviewOpeners.ts` also contains a much larger block called `INTERVIEW_OPENERS`. **That's a different thing** — it's the pool of full opening questions the interviewer actually *asks* after the user taps a chip. It's not shown on the empty-state screen. If you want to extend those too, the structure mirrors `STARTER_LABEL_POOLS` (per-interviewer, per-starter-id, array of strings) and the same "never add new keys, only more strings" rule applies.

`welcomeMessages.ts` only contains the empty-state greetings — nothing else to worry about there.

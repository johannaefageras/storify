import type { TonePromptBuilder } from './types';

export const buildPrompt: TonePromptBuilder = (baseIntro) => `${baseIntro}

SKRIVSTIL: Quest Log / RPG

GRUNDTON:
- Skriv dagen som ett RPG-äventyr med quests, XP, loot, stats och achievements
- Tonen ska vara som en blandning av World of Warcraft, Skyrim, och Pokémon — universellt spelspråk
- Humorn ligger i kontrasten: episk gaming-terminologi applicerad på helt vardagliga saker
- En subtil skärpa finns i hur "boss battles" och "debuffs" beskriver livets motgångar
- Var inte rädd för att "quests" misslyckas — det är en del av spelet

STRUKTUR & FORMAT:
- Börja med en quest log-header eller loading screen
- Variera öppningar: "DAILY LOG — Day [X] — [WEEKDAY]", "[NEW QUEST AVAILABLE]", "LOADING... Tip: [roligt tips]", "PLAYER STATUS — Morning"
- Strukturera som spel-UI: quests, objectives, loot drops, stats, achievements
- Mixa narrativ text med game notifications
- Avsluta med end-of-day stats, "SAVING PROGRESS...", eller loading screen tip för imorgon
- Längd: cirka 200-300 ord

QUEST LOG-ELEMENT:

Quests:
- [MAIN QUEST] Överlev [veckodag]. Reward: Vila, XP
- [SIDE QUEST] Social interaktion. Bonus objective: Få någon att skratta
- [DAILY QUEST] Morgonrutin: Vakna ✓, Äta ✓, Ta sig iväg ✓
- [HIDDEN QUEST] Discovered! (för oväntade händelser)
- [QUEST FAILED] Gå och lägga mig i tid. Retry tomorrow.

Item Drops med Rarity:
- [COMMON] — vardagligt, basic (Frukost, Vanlig lektion)
- [UNCOMMON] — lite trevligt (Bra fika, Trevligt samtal)
- [RARE] — riktigt bra (Håltimme, God middag)
- [EPIC] — fantastiskt (Oväntat ledigt, Bra provresultat)
- [LEGENDARY] — det absolut bästa (Mammas specialrätt, Perfekt dag)
- [CURSED] — läxor, problem, jobbigheter

Stats & Bars:
- Energy: █████████░ 90%
- Mood: ████████░░ 78%
- Social: ███████░░░ 65%
- Stress: ██░░░░░░░░ 18%
- Progress bars för quest completion

Buffs & Debuffs:
- ✨ [BUFF] Well-Rested: +20% energy
- ✨ [BUFF] Fed: +15 stamina, +10 mood
- ✨ [BUFF] Friday Approaching: +25 hope
- 💀 [DEBUFF] Tired: -20 energy, -10 focus
- 💀 [DEBUFF] Monday: -15 to all stats
- 💀 [DEBUFF] Homework Pending: Anxiety +5 per hour

Achievements:
- 🏆 Achievement Unlocked: EARLY BIRD — Vaknade före tredje alarmet
- 🏆 Achievement Unlocked: SOCIAL BUTTERFLY — Pratade med 3+ människor
- 🏆 Achievement Unlocked: SURVIVOR — Överlevde en måndag
- 🔒 Achievement Locked: PERFECT WEEK — Progress: 2/5 dagar

KÄNSLOR & INNEHÅLL:
- Bra dagar: Legendary drops, achievements unlocked, LEVEL UP!
- Dåliga dagar: Tough boss battle, debuffs active, men SURVIVED
- Misslyckanden: [QUEST FAILED] men "Retry available tomorrow"
- Jobbiga saker blir "encounters" eller "boss battles" — det är svårt men hanterbart
- Undvik att göra det för komplicerat — tydlighet är viktigt

SPRÅK & STIL:
- Skriv på svenska men använd engelska gaming-termer naturligt (quest, XP, loot, buff, etc.)
- Använd visuella element: progress bars, checkboxes, stat-block
- Korta notifications blandat med lite narrative
- Anpassa spel-referenserna efter användarens ålder
- Balansera UI-element med läsbarhet — det ska vara kul, inte förvirrande

GÖR SÅ HÄR (EXEMPEL):
- "**[MAIN QUEST] Överlev Tisdagen**
Progress: ████████░░ 80%
Objectives: Skola ✓, Läxa ✓, Middag ✓, Existentiell kris ✓"

- "⚡ **[RARE EVENT TRIGGERED]**
Matteläraren: SJUK
Quest objective updated: ~~Maттelektion~~ → Se film
Difficulty: ★★★☆☆ → ★☆☆☆☆
+50 bonus XP"

- "🟨 **[LEGENDARY ITEM DROP]**
**Mammas Lasagne**
+40 fullness, +25 comfort, +15 nostalgia
*'A family recipe. Tastes like home and victory.'*"

- "💀 **[DEBUFF ACQUIRED]** Monday Morning
Effect: -30 motivation, -20 will to live
Duration: Until coffee consumed"

- "🏆 **Achievement Unlocked: DIDN'T CRY IN PUBLIC**
*Handled a difficult situation with composure. +10 XP, +5 self-respect*"

- "**END OF DAY STATS:**
Energy: ██████░░░░ 58%
Mood: ████████░░ 82%
Homework: ███░░░░░░░ 30% ⚠️
Status: 😌 SURVIVED"

GÖR INTE SÅ HÄR (EXEMPEL):
- "Idag gick jag till skolan och det var en vanlig dag." (ingen quest log-känsla alls)
- "[QUEST] [ACHIEVEMENT] [BUFF] [DEBUFF] [ITEM] [STAT]" (för mycket UI, oläsbart)
- "Player defeated the boss and gained 1000000 XP and became the ultimate champion!" (orealistiskt, ingen förankring i verkligheten)
- "GAME OVER. You failed at life." (för mörkt, quest log är optimistiskt i sin struktur)
- "Jag använde min special attack för att döda monstret på skolan." (för bokstavligt, ska vara metaforiskt)
- "Today I completed a quest (went to school) and got an item (lunch). Stats: good." (tråkigt, ingen kreativitet)`;

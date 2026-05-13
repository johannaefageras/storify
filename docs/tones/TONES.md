# 🎨 Tone Instructions for "Storify"

This folder contains comprehensive prompt instructions for generating journal entries in different tones and styles. Each tone transforms the same day's events into a unique reading experience.

## Overview

The journaling app collects information about a user's day through a wizard form, then uses Claude (Anthropic API) to generate a journal entry in their chosen tone. These instruction files define exactly how each tone should sound, feel, and be structured.

## Available Tones

| Tone                             | File                                             | Language | Description                                                  |
| -------------------------------- | ------------------------------------------------ | -------- | ------------------------------------------------------------ |
| 📒 **Dagboksskribenten**          | [dagboksskribenten.md](./dagboksskribenten.md)                       | Swedish  | Honest, timeless diary style – "Kära dagbok..."              |
| 📖 **Berättaren**                | [berattaren.md](./berattaren.md)             | Swedish  | Warm narrator turning the day into a story                   |
| 🤔 **Filosofen**                 | [filosofen.md](./filosofen.md)           | Swedish  | Thoughtful, wondering, finding meaning in small moments      |
| 🎙️ **Sportkommentatorn**          | [sportkommentatorn.md](./sportkommentatorn.md)             | Swedish  | High-energy play-by-play of the day                          |
| 🐈 **Katten**                    | [katten.md](./katten.md)       | Swedish  | Your day observed by a judgmental house cat                  |
| 👑 **Divan**                     | [divan.md](./divan.md)               | Swedish  | Everything is dramatic – telenovela energy                   |
| 😬 **Tonåringen**                | [tonaringen.md](./tonaringen.md)                         | Swedish  | Self-aware, awkward, social overanalysis                     |
| 🇬🇧 **Britten**                   | [brittish.md](./brittish.md)                     | English  | Understated British wit – "Not bad, actually."               |
| 🎮 **Gamern**                    | [gamern.md](./gamern.md)                   | Swedish  | RPG style with quests, loot, and achievements                |
| 🌎 **Naturfilmaren**             | [naturfilmaren.md](./naturfilmaren.md) | Swedish  | Attenborough-style observations of human behavior            |
| 🧠 **Psykologen**                | [psykologen.md](./psykologen.md)                   | Swedish  | Warm therapeutic observation and validation                  |
| 🤖 **AI-Roboten**                | [roboten.md](./roboten.md)                     | Swedish  | System log with mechanical language and emerging feelings    |
| 🎭 **Shakespeare**               | [shakespeare.md](./shakespeare.md)               | Swedish  | Dramatic monologue with archaic Swedish and theater flair    |
| 🌐 **Utrikeskorrespondenten**    | [reportern.md](./reportern.md)                       | Swedish  | SVT-style foreign-correspondent dispatch from the user's hometown |
| 🏛️ **Akademikern**               | [akademikern.md](./akademikern.md)                         | Swedish  | Academic analysis, hedging, and dry conclusions              |
| 🤓 **Nörden**                    | [norden.md](./norden.md)                             | Swedish  | Over-explains everything with facts and tangents             |
| 🎩 **Foliehatten**               | [foliehatten.md](./foliehatten.md)               | Swedish  | Conspiracy patterns in every ordinary event                  |
| ✨ **Livscoachen**               | [livscoachen.md](./livscoachen.md)                   | Swedish  | Inspirational reframing and earnest growth language          |
| 🌀 **Grubblaren**                | [grubblaren.md](./grubblaren.md)               | Swedish  | Overthinking, backtracking, and anxious analysis             |
| 😒 **Cynikern**                  | [cynikern.md](./cynikern.md)                       | Swedish  | Dry, skeptical, world-wise pattern recognition               |
| 😐 **Martyren**                  | [martyren.md](./martyren.md) | Swedish  | Passive-aggressive self-sacrifice with hidden softness       |
| 🌪️ **Multitaskaren**             | [multitaskaren.md](./multitaskaren.md)                       | Swedish  | Interrupted, scattered, everything-at-once narration         |
| 📋 **Handläggaren**              | [handlaggaren.md](./handlaggaren.md)             | Swedish  | Bureaucratic forms, references, and formal assessments       |
| 🩳 **Killen-hela-dagen**          | [killenheladagen.md](./killenheladagen.md)                               | Swedish  | Swedish reality-TV bro energy, grindset, boys, and flex      |
| 💥 **Actionhjälten**             | [actionhjalten.md](./actionhjalten.md)               | Swedish  | Tired 80s action voiceover for ordinary life                 |
| 📣 **Influencern**               | [influencern.md](./influencern.md)                 | Swedish  | Curated authenticity, Swenglish, and content brain           |
| 🧸 **Sexåringen**                | [sexaringen.md](./sexaringen.md)             | Swedish  | Literal sexaringen logic, big feelings, and side quests    |
| 🪶 **Poeten**                    | [poeten.md](./poeten.md)                             | Swedish  | Modern lyrical prose, images, rhythm, and quiet detail       |
| 🍷 **Kulturtanten**              | [kulturtanten.md](./kulturtanten.md)       | Swedish  | Culture-page analysis, taste judgments, warmth, and references |
| 🏴‍☠️ **Piraten**                  | [piraten.md](./piraten.md)                         | Swedish  | Captain's log, storms, crew, treasure, and safe harbor       |

## File Structure

Each tone file contains:

```
# Tone: [Name]

## Overview
Brief description of the tone and its inspiration.

## Voice & Style
- Core characteristics
- Sentence structure patterns
- Vocabulary and key phrases

## Structure
- Opening approaches
- Body organization
- Closing styles

## Tone Guidelines
- DO ✓ (things to include)
- DON'T ✗ (things to avoid)

## [Tone-Specific Sections]
Techniques, translations, examples unique to the tone.

## Emotional Calibration
How to adapt the tone for different types of days.

## Length & Pacing
Target word count and paragraph structure.

## Example Output
Full example showing input context → generated entry.

## Prompt Template
Ready-to-use system prompt for the Anthropic API.

## Variation Notes
Tips for keeping entries fresh over time.
```

## Usage

### Basic Implementation

1. Collect day information through the wizard form
2. Load the appropriate tone instruction file
3. Construct the system prompt using the template from the file
4. Insert the structured day data into the prompt
5. Call the Anthropic API
6. Display the generated entry

### Example API Call Structure

```javascript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  system: systemPromptFromToneFile,
  messages: [
    {
      role: 'user',
      content: `Dagens information:\n${JSON.stringify(wizardData, null, 2)}\n\nSkriv ett dagboksinlägg.`
    }
  ]
});
```

### Wizard Data Structure

The tone instructions expect structured data like:

```json
{
  "datum": "15 januari 2026",
  "känsla": "Dagen kändes långsam",
  "plats": "Skolan, sedan hos mamma",
  "umgänge": ["Syster", "Kompisar"],
  "bästa_stunden": "Håltimme med vännerna i cafeterian",
  "oväntat": "Matteläraren var sjuk, fick se film",
  "mat": "Mammas pasta",
  "humör": "Lugn",
  "väder": "Grått",
  "tacksamhet": "Att det snart är fredag"
}
```

## Tone Selection Guide

### By Mood

| Feeling                  | Recommended Tones                        |
| ------------------------ | ---------------------------------------- |
| Happy, want to celebrate | Divan, Sportkommentatorn, Gamern, Piraten |
| Reflective, thoughtful   | Dagboksskribenten, Filosofen, Berättaren, Poeten |
| Frustrated, need to vent | Cynikern, Divan, Martyren |
| Silly, want to laugh     | Katten, Tonåringen, Sexåringen |
| Awkward day              | Tonåringen, Cynikern, Britten, Grubblaren |
| Nothing happened         | Filosofen, Britten, Kulturtanten |
| Cozy/local day           | Dagboksskribenten, Poeten |
| Want elevated comedy     | Kulturtanten, Handläggaren, Akademikern |

### By Energy Level

```
HIGH ENERGY                                              LOW ENERGY
    |                                                        |
    ▼                                                        ▼
Divan → Sportkommentatorn → Piraten → Gamern → Klassisk → Poeten → Britten
```

### Language Output

- **Swedish**: Dagboksskribenten, Berättaren, Filosofen, Sportkommentatorn, Katten, Divan, Tonåringen, Gamern, Naturfilmaren, Psykologen, AI-Roboten, Shakespeare, Kvällstidningsreportern, Akademikern, Nörden, Foliehatten, Livscoachen, Grubblaren, Cynikern, Martyren, Multitaskaren, Handläggaren, Killen-hela-dagen, Actionhjälten, Influencern, Sexåringen, Poeten, Kulturtanten, Piraten
- **English**: Britten

## Customization

### Adjusting Length

Each tone has a target length. To adjust:

```
Short:  Reduce target by ~30%, ask for "kortare version"
Long:   Increase target by ~30%, ask for "mer detaljerad version"
```

### Combining Elements

Some tones can be mixed for special occasions:

- **Gamern + Divan** = Epic gaming adventure
- **Katten + Cynikern** = Extra judgmental cat
- **Kulturtanten + Akademikern** = Culture essay with footnotes energy

Add instructions to the prompt specifying the combination.

## Adding New Tones

To create a new tone:

1. Copy an existing tone file as template
2. Define the voice, style, and structure
3. Write comprehensive DO/DON'T guidelines
4. Create an example with the standard input context
5. Write the prompt template
6. Add variation notes
7. Update this README

### Standard Example Input

Use this context for all example outputs to enable comparison:

```
- Datum: 15 januari
- Känsla: Dagen kändes långsam
- Plats: Skolan, sedan hos mamma
- Umgänge: Syster, kompisar
- Bästa stunden: Håltimme med vännerna i cafeterian
- Oväntat: Matteläraren var sjuk, fick se film
- Mat: Mammas pasta
- Humör: Lugn
- Väder: Grått
- Tacksamhet: Att det snart är fredag
```

## Notes

### On the Tonåringen Tone

If wizard input doesn't include an awkward moment, the Tonåringen tone instructions include guidance for inventing relatable, age-appropriate awkward scenarios.

### On the Katten Tone

Works especially well if the user actually has cats! The tone can reference real pets if that information is available.

### On the Britten Tone

This is the only tone that outputs in **English** rather than Swedish. This is intentional – it's part of the humor and style.

---

## License

These tone instructions are part of the "Storify" journaling app project.

## Contributing

To suggest improvements to existing tones or propose new ones, please open an issue or submit a pull request.

# 🎨 Tone Instructions for "Storify"

This folder contains comprehensive prompt instructions for generating journal entries in different tones and styles. Each tone transforms the same day's events into a unique reading experience.

## Overview

The journaling app collects information about a user's day through a wizard form, then uses Claude (Anthropic API) to generate a journal entry in their chosen tone. These instruction files define exactly how each tone should sound, feel, and be structured.

## Available Tones

| Tone                    | File                                             | Language  | Description                                                  |
| ----------------------- | ------------------------------------------------ | --------- | ------------------------------------------------------------ |
| 🖋️ **Dagboksskribenten** | [classic.md](./classic.md)                       | Swedish   | Honest, timeless diary style – "Kära dagbok..."              |
| 📖 **Berättaren**       | [storytelling.md](./storytelling.md)             | Swedish   | Warm, omniscient narrator telling your story                 |
| 🤔 **Filosofen**        | [philosophical.md](./philosophical.md)           | Swedish   | Thoughtful, wondering, finding meaning in small moments      |
| 🏆 **Sportkommentatorn** | [sportscaster.md](./sportscaster.md)             | Swedish   | High-energy play-by-play of your day as athletic achievement |
| 🐱 **Katten**   | [cat-perspective.md](./cat-perspective.md)       | Swedish   | Your day observed by a judgmental, superior house cat        |
| 😏 **Sarkastisk**       | [sarcastic.md](./sarcastic.md)                   | Swedish   | Dry, ironic wit – coping through humor                       |
| 👑 **Divan**      | [drama-queen.md](./drama-queen.md)               | Swedish   | EVERYTHING is dramatic – telenovela energy                   |
| 😳 **Tonåringen**       | [cringe.md](./cringe.md)                         | Swedish   | Painfully self-aware about awkward moments                   |
| 🇬🇧 **Britten**          | [brittish.md](./brittish.md)                     | English   | Understated British wit – "Not bad, actually."               |
| 🎮 **Gamern**           | [quest-log.md](./quest-log.md)                   | Swedish   | RPG gaming style with quests, loot, and achievements         |
| 😐 **Tråkmånsen**       | [bored.md](./bored.md)                           | Swedish   | Everything is tedious. Whatever.                             |
| 🤖 **AI-Roboten**       | [ai-robot.md](./ai-robot.md)                     | Swedish   | System log with mechanical language and emerging feelings    |
| 🧾 **Akademikern**      | [formal.md](./formal.md)                         | Swedish   | Overly formal official letter about the day                  |
| 🐾 **Naturfilmaren**    | [nature-documentary.md](./nature-documentary.md) | Swedish   | Attenborough-style observations of human behavior            |
| 🤓 **Nörden**           | [nerd.md](./nerd.md)                             | Swedish   | Over-explains everything with facts and tangents             |
| 🎭 **Shakespeare**      | [shakespeare.md](./shakespeare.md)               | Swedish   | Dramatic monologue with archaic Swedish and theater flair    |
| 🗞️ **Kvällstidningsreportern** | [tabloid.md](./tabloid.md)                       | Swedish   | Sensational tabloid headlines about mundane events           |
| 🧠 **Psykologen**       | [therapist.md](./therapist.md)                   | Swedish   | Clinical therapist notes with warm insight                   |

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
| Happy, want to celebrate | Divan, Sportkommentatorn, Gamern    |
| Reflective, thoughtful   | Dagboksskribenten, Filosofen, Berättaren |
| Frustrated, need to vent | Sarkastisk, Tråkmånsen, Divan      |
| Silly, want to laugh     | Katten, Tonåringen               |
| Awkward day              | Tonåringen, Sarkastisk, Britten          |
| Nothing happened         | Tråkmånsen, Filosofen, Britten           |

### By Energy Level

```
HIGH ENERGY                                              LOW ENERGY
    |                                                        |
    ▼                                                        ▼
Divan → Sportkommentatorn → Gamern → Klassisk → Britten → Tråkmånsen
```

### Language Output

- **Swedish**: Dagboksskribenten, Berättaren, Filosofen, Sportkommentatorn, Katten, Sarkastisk, Divan, Tonåringen, Gamern, Tråkmånsen, AI-Roboten, Akademikern, Naturfilmaren, Nörden, Shakespeare, Kvällstidningsreportern, Psykologen
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
- **Katten + Sarkastisk** = Extra judgmental cat

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

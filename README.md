# Storify

A journaling app that transforms your daily experiences into personalized diary entries using AI.

## Overview

Collect information about your day through a wizard form, then use Claude to generate a journal entry in your chosen tone and style.

## Tech Stack

- **SvelteKit** - Full-stack framework
- **TypeScript** - Type safety
- **Anthropic API** - Claude for text generation

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file:

```
ANTHROPIC_API_KEY=your_api_key_here
```

## Available Tones

See [TONES](tones/TONES.md) for all available writing styles:

- 🖋️ Klassisk (Classic)
- 📖 Berättarröst (Storytelling)
- 🤔 Filosofisk (Philosophical)
- 🏆 Sportkommentator (Sportscaster)
- 🐱 Kattperspektiv (Cat Perspective)
- 😏 Sarkastisk (Sarcastic)
- 👑 Drama Queen
- 📱 Meme
- 😳 Cringe
- 🇬🇧 Brittisk (British)
- 🎮 Quest Log
- 😐 Uttråkad (Bored)

## Project Structure

```
├── src/
│   ├── routes/             # SvelteKit pages and API routes
│   └── lib/                # Shared components and utilities
├── tones/                  # Tone instruction files for Claude
│   │── bored.md
│   │── british.md
│   │── cat-perspective.md
│   │── classic.md
│   │── cringe.md
│   │── drama-queen.md
│   │── meme.md
│   │── philosophical.md
│   │── quest-log.md
│   │── sarcastic.md
│   │── sportscaster.md
│   │── storytelling.md
│   │── TONES.md
├── static/                 # Static assets
└── package.json
```

## License

This project is part of the "Storify" journaling app.

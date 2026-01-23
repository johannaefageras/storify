# 📔 Storify

> *For all the diaries you bought but never wrote in* ✨

**Storify** is an AI-powered journaling app that transforms your daily experiences into personalized diary entries. Answer a few guided questions about your day, pick a writing style, and let Claude AI craft a unique journal entry just for you.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-storify--v1.vercel.app-blue)](https://storify-v1.vercel.app)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-FF3E00?logo=svelte)](https://kit.svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Anthropic](https://img.shields.io/badge/Powered_by-Claude_AI-D4A574)](https://anthropic.com)

---

## 🎯 Overview

Journaling is powerful, but starting is hard. Storify removes the friction by:

1. 📝 **Guiding you** through a simple wizard with questions about your day
2. 🎭 **Letting you choose** from 12 unique writing styles
3. 🤖 **Generating** a personalized diary entry using Claude AI
4. 📤 **Exporting** your entry as text, image, or sharing directly

No more staring at a blank page – just answer a few questions and get a beautifully written diary entry in seconds!

---

## ✨ Features

### 🧙‍♂️ 10-Step Guided Wizard

| Step | Name | Description |
|:----:|------|-------------|
| 0 | 👤 Profile | Your name, age, hometown, interests (saved for future entries) |
| 1 | 😊 Mood & Date | Pick up to 4 emojis that capture your day |
| 2 | ⚡ Energy | Rate your sleep, energy, and overall mood (1-10) |
| 3 | 🏃 Activities | Where you went, what you did, who you met |
| 4 | 🏆 Wins & Frustrations | Celebrate victories and vent frustrations |
| 5 | 💭 Reflections | What almost happened, regrets, redo moments |
| 6 | 🍕 Food & Music | Meals and soundtracks of your day |
| 7 | ⏳ Time Capsule | A memory to preserve for 10 years |
| 8 | 🎭 Voice | Choose your writing style |
| 9 | 📋 Summary | Review and generate your entry |

### 🎭 12 Unique Writing Tones

| Tone | Description |
|------|-------------|
| 🖋️ **Klassisk** (Classic) | Traditional "Dear Diary" format |
| 📖 **Berättelse** (Storytelling) | Your day as a narrative adventure |
| 🤔 **Filosofisk** (Philosophical) | Deep reflections and existential musings |
| 🏆 **Sportkommentator** (Sportscaster) | ENERGETIC play-by-play commentary |
| 🐱 **Kattperspektiv** (Cat Perspective) | A judgmental cat observing its human |
| 😏 **Sarkastisk** (Sarcastic) | Dry wit and ironic observations |
| 👑 **Drama Queen** | Everything is DRAMATIC |
| 📱 **Meme** | Gen Z internet speak, very relatable |
| 😳 **Cringe** | Awkwardly endearing self-awareness |
| 🇬🇧 **Brittisk** (British) | Understated elegance and dry humor |
| 🎮 **Quest Log** | Your day as an RPG adventure |
| 😐 **Uttråkad** (Bored) | Minimal enthusiasm, maximum vibes |

### 📱 Multi-Platform Support

- 🌐 **Web App** – Works in any modern browser
- 📱 **Android App** – Native app via Capacitor
- 🌙 **Dark Mode** – Easy on the eyes, day or night

### 🔒 Privacy-First

- Profile data stored **locally on your device**
- Only daily entries sent to AI for generation
- No server-side storage of your diary entries

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| ⚡ Framework | [SvelteKit 2.x](https://kit.svelte.dev) + [Svelte 5](https://svelte.dev) |
| 📘 Language | [TypeScript 5.9](https://www.typescriptlang.org) |
| 🤖 AI | [Anthropic Claude API](https://anthropic.com) (Claude Opus 4.5) |
| 📦 Build | [Vite 7.x](https://vitejs.dev) |
| 📱 Mobile | [Capacitor 8.x](https://capacitorjs.com) |
| 🚀 Hosting | [Vercel](https://vercel.com) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Anthropic API key ([get one here](https://console.anthropic.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/storify.git
cd storify

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173
```

### Production Build

```bash
# Build for web
npm run build

# Preview production build
npm run preview
```

### Android Build

```bash
# Build static site for Capacitor
npm run build

# Sync with Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Required: Your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Optional: API base URL for Capacitor native app
VITE_API_BASE_URL=https://storify-v1.vercel.app
```

---

## 📁 Project Structure

```
storify/
├── 📂 src/
│   ├── 📂 routes/                    # SvelteKit pages & API
│   │   ├── 📄 +page.svelte           # Landing page
│   │   ├── 📂 wizard/                # Main wizard flow
│   │   │   ├── 📄 +page.svelte       # Wizard container
│   │   │   └── 📂 steps/             # Individual wizard steps
│   │   ├── 📂 api/generate/          # AI generation endpoint
│   │   ├── 📂 about/                 # About page
│   │   ├── 📂 contact/               # Contact page
│   │   ├── 📂 privacy/               # Privacy policy
│   │   └── 📂 terms/                 # Terms of service
│   └── 📂 lib/
│       ├── 📂 stores/                # Svelte state management
│       │   ├── 📄 wizard.svelte.ts   # Wizard data store
│       │   └── 📄 theme.svelte.ts    # Theme preferences
│       ├── 📂 data/                  # Static data
│       │   ├── 📄 tones.ts           # Tone definitions
│       │   └── 📄 emojis.ts          # Emoji categories
│       └── 📂 components/            # Reusable components
│           └── 📂 emojis/            # Custom emoji SVGs
├── 📂 tones/                         # Detailed tone instructions
│   ├── 📄 classic.md
│   ├── 📄 storytelling.md
│   ├── 📄 philosophical.md
│   ├── 📄 sportscaster.md
│   ├── 📄 cat-perspective.md
│   ├── 📄 sarcastic.md
│   ├── 📄 drama-queen.md
│   ├── 📄 meme.md
│   ├── 📄 cringe.md
│   ├── 📄 british.md
│   ├── 📄 quest-log.md
│   ├── 📄 bored.md
│   └── 📄 TONES.md                   # Tone overview
├── 📂 android/                       # Capacitor Android project
├── 📂 static/                        # Static assets & fonts
├── 📄 capacitor.config.ts            # Capacitor configuration
├── 📄 svelte.config.js               # SvelteKit configuration
├── 📄 vite.config.ts                 # Vite configuration
└── 📄 package.json
```

---

## 🎨 Customization

### Adding a New Tone

1. Create a new markdown file in `tones/` with detailed instructions
2. Add the tone definition to `src/lib/data/tones.ts`
3. Add a sample text in `src/lib/data/voiceSamples.ts`
4. Update the tone instructions in `src/routes/api/generate/+server.ts`

### Theming

The app uses CSS custom properties for theming. Modify colors in `src/app.css`:

```css
:root {
  --color-primary: #your-color;
  --color-background: #your-background;
  /* ... */
}
```

---

## 🌍 Language

The app is primarily in **Swedish** 🇸🇪 (UI text, tone instructions, generated content). The British tone is the exception, generating entries in English.

---

## 📊 Current Status

| Component | Status |
|-----------|--------|
| 🌐 Web App | ✅ Production |
| 📱 Android App | ✅ Production |
| 🍎 iOS App | 🔜 Planned |
| 🌍 Multi-language | 🔜 Planned |
| 💾 Entry History | 🔜 Planned |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. 🐛 Report bugs
2. 💡 Suggest new features or tones
3. 🔧 Submit pull requests

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

- 🤖 Powered by [Anthropic's Claude](https://anthropic.com)
- ⚡ Built with [SvelteKit](https://kit.svelte.dev)
- 📱 Mobile support via [Capacitor](https://capacitorjs.com)

---

<div align="center">

**Made with ❤️ for journaling enthusiasts**

[🌐 Try Storify](https://storify-v1.vercel.app) · [🐛 Report Bug](https://github.com/yourusername/storify/issues) · [💡 Request Feature](https://github.com/yourusername/storify/issues)

</div>

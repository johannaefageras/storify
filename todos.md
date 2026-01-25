📝 Entry Generation Improvements

Length slider — Short (tweet-length), Medium, Long, Epic
Mood-adaptive tone — If user reports bad day, tone adjusts sensitivity (less sarcasm on hard days)
"Spice level" — How dramatic/exaggerated should the tone be? 1-5 scale
Multiple generations — Generate 2-3 versions, let user pick favorite
Regenerate specific paragraphs — Keep parts you like, regenerate others
Hybrid tones — "Shakespeare meets Sportscaster"
Custom tone builder — User describes their ideal writing style, AI learns it
Tone of the day — Random/suggested tone to encourage variety

🧙‍♂️ Wizard Improvements

Quick mode — 3-step express version for busy days ("Mood + One highlight + Tone")
Voice input — Speak your answers instead of typing
Photo attachment — Add a photo, AI incorporates it into the narrative
Skip with AI guess — Skip a step, AI makes educated guesses based on patterns
Mood board step — Pick colors/images that represent your day
Music integration — Connect Spotify, include "soundtrack of the day"
Branching questions — If "bad day" → different follow-up questions than "great day"
"One word" mode — Answer each step with just one word, AI expands

📚 Entry History & Library

Local entry storage — Save generated entries on device
Cloud sync — Optional account for cross-device access
Calendar view — See your journaling streak, browse by date
Search entries — Full-text search across your diary
Tags & categories — Auto-tag entries (work, relationships, health, etc.)
Highlights reel — AI picks best quotes from your entries
Year in review — Annual summary generated from all entries
"On this day" — Show entry from 1 year ago
Entry comparison — Compare how you felt on two different dates

📊 Insights & Analytics

Mood tracking graphs — Visualize emotional patterns over time
Word clouds — Most mentioned people, places, activities
Energy patterns — "You're most energetic on Thursdays"
Streak tracking — Journaling consistency gamification
AI insights — "You mention work stress 3x more than last month"
Correlation finder — "Days with exercise → 40% higher mood scores"
Monthly/weekly summaries — Auto-generated reflection digests
Sleep vs. mood correlation — Chart the relationship

🎮 Gamification

Journaling streaks — Daily streak counter with rewards
Achievements/badges — "First entry", "7-day streak", "Tried all tones", "Night owl" (late entries)
Tone collection — "Unlock" tones by journaling consistently
Seasonal/limited tones — Halloween horror tone, Christmas cozy tone
XP system — Level up your journaling practice
Challenges — "Write 5 entries this week", "Try a new tone"
Random prompts — Optional daily prompts for inspiration

🤝 Social & Sharing

Beautiful export cards — Instagram-story-ready entry snippets
Share specific quotes — Pull out one beautiful line to share
Anonymized community — Read anonymized entries from others (opt-in)
Tone voting — Community votes on new tone ideas
Collaborative entries — Couples/friends journal about shared experiences
"Letter to future self" — Schedule entries to resurface later
Time capsule sharing — Send your time capsule memory to yourself in 10 years

🎨 UI/UX Improvements

Reading mode — Beautiful, distraction-free entry display
Custom themes — Beyond dark/light: sepia, midnight, forest, etc.
Font choices — Typewriter, handwriting, elegant serif
Animated transitions — Smooth wizard step transitions
Entry "paper" styles — Make it look like notebook paper, parchment, etc.
Confetti on completion — Celebrate finishing an entry
Progress indicator — Visual progress through wizard
Keyboard shortcuts — Power user navigation
Swipe gestures — Mobile-friendly step navigation
Skeleton loading — Better loading states during generation

🔌 Integrations

Apple Health / Google Fit — Auto-import steps, sleep, activity
Spotify/Apple Music — "Most played song today"
Calendar integration — Auto-populate "what you did" from calendar
Location history — Auto-suggest places visited
Photo library — Pick photo of the day
Notion export — Send entries to Notion database
Obsidian export — Markdown files for Obsidian vault
Day One import/export — Interop with popular journaling app
WhatsApp/iMessage — Journal via chat interface
Siri/Google Assistant — "Hey Siri, start my journal entry"
Widgets — iOS/Android home screen widgets (streak, prompt)

🔐 Privacy & Security

Local-only mode — Never send data to cloud
End-to-end encryption — For cloud sync
Biometric lock — Face ID / fingerprint to open app
PIN protection — Secondary app lock
Export all data — GDPR-friendly data export
Auto-delete old entries — Optional privacy setting
Incognito entries — Entries that auto-delete after reading

✍️ Writing Enhancements

Entry editing — Edit generated text before saving
AI suggestions — "Add more detail about X?"
Grammar/style check — Polish the generated text
Translation — Generate in Swedish, translate to English (or vice versa)
Multi-language support — Full UI in English, German, Spanish, etc.
Vocabulary richness — Slider for simple vs. elaborate language
Profanity filter — Toggle for family-friendly content
Name anonymization — Replace real names with placeholders

📱 Platform Expansion

iOS app — (already planned!)
Desktop app — Electron or Tauri wrapper
Browser extension — Quick journal from anywhere
Apple Watch app — Quick mood check-ins
Wear OS app — Same for Android watches
CLI tool — For terminal nerds: storify --mood happy --tone nerd
Telegram/Discord bot — Journal through chat

🎁 Monetization Ideas (if relevant)

Freemium model — Free: 3 tones, 5 entries/month. Pro: unlimited
Premium tones — Exclusive/elaborate tones for subscribers
Physical journal export — Print your year as a real book
API access — Let developers build on Storify
Team/family plans — Shared journaling for households
Tone marketplace — Community creates and sells tones

🧪 Experimental/Wild Ideas

AI interviewer mode — Claude asks follow-up questions conversationally before generating
Dream journal mode — Special tone/format for recording dreams
Gratitude focus — Mode that specifically extracts and amplifies gratitude
Therapy companion — (careful with this) Gentle prompts for mental health reflection
Fiction mode — "Rewrite my day but I'm a spy / astronaut / wizard"
Parallel universe — "What if you had made different choices today?"
Future prediction — AI writes tomorrow's "ideal day" entry
Pet perspective — Your day from your pet's point of view (beyond cat!)
Object perspective — Your day from your coffee mug's point of view
News article — Your day written as breaking news
Recipe format — "Ingredients: 1 cup of stress, 2 tbsp procrastination..."

🛠 Technical Improvements

Offline support — PWA with service workers, queue entries for later
Faster generation — Streaming responses, show text as it generates
Caching — Cache tone prompts, reduce API calls
Error recovery — Better handling of failed generations
Analytics — Track which tones are popular, wizard completion rates
A/B testing framework — Test different prompts, UI variations
Rate limiting UI — Graceful handling when API limits hit

🏆 Quick Wins (Low effort, high impact)

Add a "Copy to clipboard" button for generated entries
Show character/word count on generated entry
Add loading quotes/tips during generation
"Surprise me" random tone button
Favorite/bookmark tones
Recently used tones section
Tone preview samples before selection
Share button with native share sheet
Haptic feedback on mobile interactions
Celebration animation when entry is generated

---

Code Quality & Technical Improvements
High Priority
Add automated testing - There are no tests in the codebase. This is a significant risk for a production app. Add:

Unit tests for the wizard store (wizard.svelte.ts)
API endpoint tests for /api/generate and /api/email
Component tests for critical wizard steps
Extract tone prompts - The buildTonePrompt() function in +server.ts is ~1,500 lines of nested string literals. Extract each tone to separate files in /tones/ (e.g., tones/classic.ts, tones/sarcastic.ts) for maintainability.

Medium Priority
Improve error handling UX - Silent failures for weather/geolocation give no user feedback. Add subtle indicators when optional data couldn't be fetched.

Add session recovery - If the browser crashes mid-wizard, all unsaved daily data is lost. Consider saving draft state to localStorage periodically.

Replace custom emoji components - 300+ tiny Svelte files for emojis bloats the bundle. Consider using a standard emoji library or Unicode with a single renderer component.

Improve email markdown conversion - The regex-based conversion in +server.ts is fragile. Use a proper library like marked or showdown.

Add request timeout - The Claude API call has no timeout handling. Add a 60-second timeout with user feedback.

New Feature Suggestions
User Experience
Entry history/journal - Store generated entries locally (or with optional cloud sync) so users can:

View past entries in a calendar view
Search through their diary
See a "year in review" compilation
Quick mode - A 3-step express wizard for busy days (emojis → wins/frustrations → generate)

Generation options:

Length slider (short/medium/long)
"Spice level" for how much exaggeration (1-5)
Generate multiple versions to choose from
Regenerate specific paragraphs
Voice input - Allow speaking answers instead of typing, especially useful on mobile

Photo attachment - Let users attach a photo of the day that influences the narrative

Mood-adaptive tones - Automatically adjust tone intensity based on reported mood (less sarcasm on rough days)

New Tones
Your todos.md already has great ideas. Highest impact additions:

Noir Detective - "The city never sleeps, and neither did they..."
True Crime Podcast - "But what really happened that Tuesday?"
Grandparent Storytelling - Warm, nostalgic, full of "in my day..."
Haiku Mode - Entire entry as a series of haikus
Custom Tone Builder - Let users describe their own tone
Platform & Integration
i18n support - Add an internationalization framework so the app can expand beyond Swedish. The UI, prompts, and generated content are all hard-coded in Swedish.

Spotify integration - Auto-detect what the user listened to today for the "soundtrack" section

Widget support - Quick Android widget for daily emoji mood logging

Sharing improvements:

Generate shareable images (quote cards) from entry excerpts
Direct sharing to Instagram Stories or social media
Notifications - Daily reminder to write an entry (opt-in)

Analytics & Insights
Personal insights dashboard:

Mood trends over time
Most common activities/locations
Energy patterns by weekday
Word clouds from entries
Usage analytics (for you as developer):

Which tones are most popular
Where users drop off in the wizard
Generation success/failure rates
Architecture Suggestions
Area Current Suggested
Testing None Vitest + Playwright
i18n Hard-coded Swedish svelte-i18n or paraglide
Rate limiting None upstash/ratelimit or similar
Entry storage None IndexedDB locally, optional Supabase sync
Emoji handling 300+ components emoji-mart or Unicode
Tone prompts 1 giant function Modular /tones/\*.ts files
Quick Wins (Low Effort, High Impact)
Add a "loading" skeleton for the weather fetch
Show tone popularity badges ("Most loved", "New")
Add keyboard shortcuts for navigation (←/→ for steps)
Haptic feedback on mobile when selecting emojis
Confetti animation after successful generation

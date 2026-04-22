/**
 * Starting badge catalogue for gamification.
 *
 * Source: _gamification-references/Badges *.html (Notion export).
 * SVG assets live in src/lib/assets/emojis/{emojiSlug}.svg.
 *
 * All user-facing copy is Swedish (the app's default language; see CLAUDE.md).
 *
 * Each badge has a machine-readable `criterion` so awarding can be wired up
 * without re-parsing the description. Criteria are intentionally conservative —
 * extend the `BadgeCriterion` union rather than overloading existing types.
 */

export type BadgeCategory =
  | 'onboarding'
  | 'milestones'
  | 'streaks'
  | 'timing'
  | 'writing-mode'
  | 'community'
  | 'occasions'
  | 'mood'
  | 'voice'
  | 'engagement'
  | 'editing'
  | 'exploration'
  | 'features'
  | 'craft';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type WritingMode = 'wizard' | 'quick' | 'interview' | 'manual';

export type BadgeCriterion =
  | { type: 'account-created' }
  | { type: 'first-login' }
  | { type: 'profile-completed' }
  | { type: 'profile-photo-uploaded' }
  | { type: 'newsletter-subscribed' }
  | { type: 'notifications-enabled' }
  | { type: 'entries-total'; count: number }
  | { type: 'entries-streak'; days: number }
  | { type: 'entries-at-night'; count: number }
  | { type: 'entries-weekend-streak'; weeks: number }
  | { type: 'entries-at-midnight' }
  | { type: 'entries-cover-all-hours' }
  | { type: 'entries-by-mode'; mode: WritingMode; count: number }
  | { type: 'all-writing-modes-used' }
  | { type: 'entries-shared'; count: number }
  | { type: 'community-entry-read' }
  | { type: 'entry-on-birthday' }
  | { type: 'entry-on-christmas-eve' }
  | { type: 'entry-with-low-mood' }
  | { type: 'entry-with-max-stats' }
  | { type: 'random-tone-used' }
  | { type: 'unique-tones-used'; count: number }
  | { type: 'all-tones-used' }
  | { type: 'same-tone-entries'; count: number }
  | { type: 'returned-after-days'; days: number }
  | { type: 'made-interviewer-laugh' }
  | { type: 'read-fine-print' }
  | { type: 'revisited-entry' }
  | { type: 'regenerated-in-new-tone' }
  | { type: 'entry-edited' }
  | { type: 'entry-deleted' }
  | { type: 'entries-from-unique-cities'; count: number }
  | { type: 'entries-across-all-zodiac-signs' }
  | { type: 'on-this-day-viewed'; count: number }
  | { type: 'homework-entries'; count: number }
  | { type: 'entry-archived' }
  | { type: 'entries-same-day'; count: number }
  | { type: 'entry-word-count'; minWords: number };

export interface Badge {
  /** Stable slug; safe to persist in DB and URLs. */
  id: string;
  /** Swedish display name. */
  name: string;
  /** Swedish one-line description shown on the badge card. */
  description: string;
  /** Unicode emoji as shown in the source Notion page. */
  emoji: string;
  /** Filename stem inside src/lib/assets/emojis/ (no extension). */
  emojiSlug: string;
  category: BadgeCategory;
  tier: BadgeTier;
  criterion: BadgeCriterion;
  /**
   * Surprise/easter-egg badges that shouldn't appear in the "upcoming" list
   * before they're earned. Revealed only once awarded.
   */
  hidden?: boolean;
}

export const BADGES: readonly Badge[] = [
  {
    id: 'forsta-steget',
    name: 'Första Steget',
    description: 'Du har skapat ditt konto och påbörjat din resa med Storify.',
    emoji: '🌱',
    emojiSlug: 'seedling',
    category: 'onboarding',
    tier: 'bronze',
    criterion: { type: 'account-created' }
  },
  {
    id: 'dorren-oppnas',
    name: 'Dörren Öppnas',
    description: 'Du loggade in för första gången — välkommen in!',
    emoji: '🔑',
    emojiSlug: 'key',
    category: 'onboarding',
    tier: 'bronze',
    criterion: { type: 'first-login' }
  },
  {
    id: 'forsta-raden',
    name: 'Första Raden',
    description: 'Du skrev ditt allra första inlägg. En utmärkt början!',
    emoji: '📝',
    emojiSlug: 'memo',
    category: 'milestones',
    tier: 'bronze',
    criterion: { type: 'entries-total', count: 1 }
  },
  {
    id: 'spegelbild',
    name: 'Spegelbild',
    description: 'Du fyllde i din profil och gav Storify en glimt av vem du är.',
    emoji: '🪞',
    emojiSlug: 'mirror',
    category: 'onboarding',
    tier: 'bronze',
    criterion: { type: 'profile-completed' }
  },
  {
    id: 'ansiktet-utat',
    name: 'Ansiktet Utåt',
    description: 'Du laddade upp en profilbild — nu har din berättelse ett ansikte.',
    emoji: '📸',
    emojiSlug: 'camera',
    category: 'onboarding',
    tier: 'bronze',
    criterion: { type: 'profile-photo-uploaded' }
  },
  {
    id: 'brevvannen',
    name: 'Brevvännen',
    description: 'Du valde att hänga med via nyhetsbrevet — inga nyheter ska missa dig.',
    emoji: '📬',
    emojiSlug: 'mailbox',
    category: 'onboarding',
    tier: 'bronze',
    criterion: { type: 'newsletter-subscribed' }
  },
  {
    id: 'alltid-alert',
    name: 'Alltid Alert',
    description: 'Du slog på notiser — Storify håller dig i loopen.',
    emoji: '🔔',
    emojiSlug: 'bell',
    category: 'onboarding',
    tier: 'bronze',
    criterion: { type: 'notifications-enabled' }
  },
  {
    id: 'tio-i-rad',
    name: 'Tio i Rad',
    description: 'Du har skrivit tio inlägg — skrivandet börjar bli en vana!',
    emoji: '🔥',
    emojiSlug: 'fire',
    category: 'milestones',
    tier: 'silver',
    criterion: { type: 'entries-total', count: 10 }
  },
  {
    id: 'halvhundringen',
    name: 'Halvhundringen',
    description: 'Femtio inlägg — din dagbok har blivit en riktig bok.',
    emoji: '📚',
    emojiSlug: 'books',
    category: 'milestones',
    tier: 'gold',
    criterion: { type: 'entries-total', count: 50 }
  },
  {
    id: 'hundringen',
    name: 'Hundringen',
    description: 'Hundra inlägg! Din berättelse har fått riktigt djup.',
    emoji: '💯',
    emojiSlug: 'hundred-points',
    category: 'milestones',
    tier: 'gold',
    criterion: { type: 'entries-total', count: 100 }
  },
  {
    id: 'aret-runt',
    name: 'Året Runt',
    description: '365 inlägg — ett helt år av tankar och ord.',
    emoji: '📅',
    emojiSlug: 'calendar-tear-off',
    category: 'milestones',
    tier: 'platinum',
    criterion: { type: 'entries-total', count: 365 }
  },
  {
    id: 'veckovanan',
    name: 'Veckovanan',
    description: 'Sju dagar i rad — du har hittat din rytm.',
    emoji: '✍🏻',
    emojiSlug: 'writing-hand',
    category: 'streaks',
    tier: 'silver',
    criterion: { type: 'entries-streak', days: 7 }
  },
  {
    id: 'manadsflodet',
    name: 'Månadsflödet',
    description: 'Trettio dagar i rad — skrivandet har blivit en del av din vardag.',
    emoji: '🌊',
    emojiSlug: 'water-wave',
    category: 'streaks',
    tier: 'gold',
    criterion: { type: 'entries-streak', days: 30 }
  },
  {
    id: 'hundradagarskraften',
    name: 'Hundradagarskraften',
    description: 'Hundra dagar i rad — din disciplin är imponerande.',
    emoji: '⛰️',
    emojiSlug: 'mountain',
    category: 'streaks',
    tier: 'platinum',
    criterion: { type: 'entries-streak', days: 100 }
  },
  {
    id: 'nattugglan',
    name: 'Nattugglan',
    description: 'Fem inlägg skrivna mitt i natten — dina tankar vaknar när världen sover.',
    emoji: '🌃',
    emojiSlug: 'night',
    category: 'timing',
    tier: 'silver',
    criterion: { type: 'entries-at-night', count: 5 }
  },
  {
    id: 'helgskribenten',
    name: 'Helgskribenten',
    description: 'Du skrev varje helg i en hel månad — helgerna har fått en ny ritual.',
    emoji: '☕',
    emojiSlug: 'hot-beverage',
    category: 'timing',
    tier: 'gold',
    criterion: { type: 'entries-weekend-streak', weeks: 4 }
  },
  {
    id: 'intervjuobjektet',
    name: 'Intervjuobjektet',
    description: 'Fem inlägg via AI-intervju — ibland behöver man bara bli ställd rätt frågor.',
    emoji: '🎤',
    emojiSlug: 'microphone',
    category: 'writing-mode',
    tier: 'silver',
    criterion: { type: 'entries-by-mode', mode: 'interview', count: 5 }
  },
  {
    id: 'blixtskrivaren',
    name: 'Blixtskrivaren',
    description: 'Fem inlägg via Quickmode — kort, snabbt och rakt på sak.',
    emoji: '⚡',
    emojiSlug: 'high-voltage',
    category: 'writing-mode',
    tier: 'silver',
    criterion: { type: 'entries-by-mode', mode: 'quick', count: 5 }
  },
  {
    id: 'egna-ord',
    name: 'Egna Ord',
    description: 'Tre inlägg skrivna helt för hand — din röst, dina ord.',
    emoji: '🖋️',
    emojiSlug: 'pen',
    category: 'writing-mode',
    tier: 'silver',
    criterion: { type: 'entries-by-mode', mode: 'manual', count: 3 }
  },
  {
    id: 'allroundern',
    name: 'Allroundern',
    description: 'Du har provat alla fyra sätt att skriva — mångsidig som få.',
    emoji: '🧩',
    emojiSlug: 'puzzle-piece',
    category: 'writing-mode',
    tier: 'gold',
    criterion: { type: 'all-writing-modes-used' }
  },
  {
    id: 'forsta-appladen',
    name: 'Första Applåden',
    description: 'Du delade ditt första inlägg med communityn — modigt och generöst.',
    emoji: '👏🏻',
    emojiSlug: 'clapping-hands',
    category: 'community',
    tier: 'bronze',
    criterion: { type: 'entries-shared', count: 1 }
  },
  {
    id: 'oppen-bok',
    name: 'Öppen Bok',
    description: 'Tio delade inlägg — du låter andra ta del av din berättelse.',
    emoji: '📢',
    emojiSlug: 'loudspeaker',
    category: 'community',
    tier: 'silver',
    criterion: { type: 'entries-shared', count: 10 }
  },
  {
    id: 'fodelsedagsdagboken',
    name: 'Födelsedagsdagboken',
    description: 'Du skrev på din födelsedag — det bästa presenten du kan ge dig själv.',
    emoji: '🎂',
    emojiSlug: 'birthday-cake',
    category: 'occasions',
    tier: 'silver',
    criterion: { type: 'entry-on-birthday' }
  },
  {
    id: 'julpennan',
    name: 'Julpennan',
    description: 'Du skrev på julafton — en stund av reflektion mitt i allt myller.',
    emoji: '🎄',
    emojiSlug: 'christmas-tree',
    category: 'occasions',
    tier: 'silver',
    criterion: { type: 'entry-on-christmas-eve' }
  },
  {
    id: 'trots-allt',
    name: 'Trots Allt',
    description: 'Du skrev trots att du mådde som sämst — det är då det betyder mest.',
    emoji: '🥀',
    emojiSlug: 'wilted-flower',
    category: 'mood',
    tier: 'gold',
    criterion: { type: 'entry-with-low-mood' }
  },
  {
    id: 'toppen-av-toppen',
    name: 'Toppen Av Toppen',
    description: 'Sömn, energi och humör — allt på max. En dag att minnas!',
    emoji: '🌟',
    emojiSlug: 'glowing-star',
    category: 'mood',
    tier: 'gold',
    criterion: { type: 'entry-with-max-stats' }
  },
  {
    id: 'slumpskribenten',
    name: 'Slumpskribenten',
    description: 'Du lät appen välja ton åt dig — ibland är det kul att bli överraskad.',
    emoji: '🎲',
    emojiSlug: 'game-dice',
    category: 'voice',
    tier: 'bronze',
    criterion: { type: 'random-tone-used' }
  },
  {
    id: 'rostakrobaten',
    name: 'Röstakrobaten',
    description: 'Fem olika toner testade — du har hittat flera sätt att berätta din historia.',
    emoji: '🔊',
    emojiSlug: 'speaker',
    category: 'voice',
    tier: 'silver',
    criterion: { type: 'unique-tones-used', count: 5 }
  },
  {
    id: 'rostkonstnaren',
    name: 'Röstkonstnären',
    description: 'Tio toner utforskade — din berättelse har alla nyanser.',
    emoji: '🎨',
    emojiSlug: 'palette',
    category: 'voice',
    tier: 'gold',
    criterion: { type: 'unique-tones-used', count: 10 }
  },
  {
    id: 'rostjagaren',
    name: 'Röstjägaren',
    description: 'Du har provat varenda ton — ingen stämning lämnad outforskad.',
    emoji: '🏅',
    emojiSlug: 'sports-medal',
    category: 'voice',
    tier: 'platinum',
    criterion: { type: 'all-tones-used' }
  },
  {
    id: 'trogen-rost',
    name: 'Trogen Röst',
    description: 'Tio inlägg med samma ton — du vet vad du gillar och äger det.',
    emoji: '💎',
    emojiSlug: 'gem-stone',
    category: 'voice',
    tier: 'silver',
    criterion: { type: 'same-tone-entries', count: 10 }
  },
  {
    id: 'atervandaren',
    name: 'Återvändaren',
    description:
      'Tillbaka efter mer än en månads uppehåll — det är aldrig för sent att börja igen.',
    emoji: '🔄',
    emojiSlug: 're-generate',
    category: 'engagement',
    tier: 'silver',
    criterion: { type: 'returned-after-days', days: 30 }
  },
  {
    id: 'isbrytaren',
    name: 'Isbrytaren',
    description: 'Du fick AI-intervjuaren att skratta — inte alla kan charma en maskin.',
    emoji: '😂',
    emojiSlug: 'face-rolling-on-the-floor-laughing',
    category: 'engagement',
    tier: 'gold',
    criterion: { type: 'made-interviewer-laugh' },
    hidden: true
  },
  {
    id: 'paragraflasaren',
    name: 'Paragrafläsaren',
    description: 'Du kollade in det finstilta — en sann detaljmänniska.',
    emoji: '🧐',
    emojiSlug: 'face-monocle',
    category: 'engagement',
    tier: 'bronze',
    criterion: { type: 'read-fine-print' },
    hidden: true
  },
  {
    id: 'andra-chansen',
    name: 'Andra Chansen',
    description: 'Du lät samma tankar klä sig i en ny röst — ibland låter det bättre andra gången.',
    emoji: '🔁',
    emojiSlug: 'repeat',
    category: 'editing',
    tier: 'silver',
    criterion: { type: 'regenerated-in-new-tone' }
  },
  {
    id: 'finjusteraren',
    name: 'Finjusteraren',
    description:
      'Du gick tillbaka och finslipade ett inlägg — bra texter förtjänar en andra omgång.',
    emoji: '✏️',
    emojiSlug: 'pencil',
    category: 'editing',
    tier: 'bronze',
    criterion: { type: 'entry-edited' }
  },
  {
    id: 'viktras',
    name: 'Viktras',
    description: 'Du tog bort ett inlägg — ibland behöver man släppa taget.',
    emoji: '🗑️',
    emojiSlug: 'wastebasket',
    category: 'editing',
    tier: 'bronze',
    criterion: { type: 'entry-deleted' }
  },
  {
    id: 'tyst-lasare',
    name: 'Tyst Läsare',
    description: 'Du läste någon annans inlägg — ibland är det andras ord som berör mest.',
    emoji: '👀',
    emojiSlug: 'eyes',
    category: 'community',
    tier: 'bronze',
    criterion: { type: 'community-entry-read' }
  },
  {
    id: 'resedagboken',
    name: 'Resedagboken',
    description: 'Tre olika städer, tre olika berättelser — dina ord reser med dig.',
    emoji: '🗺️',
    emojiSlug: 'world-map',
    category: 'exploration',
    tier: 'gold',
    criterion: { type: 'entries-from-unique-cities', count: 3 }
  },
  {
    id: 'stjarnskadaren',
    name: 'Stjärnskådaren',
    description:
      'Tolv inlägg, ett under varje stjärntecken — du har skrivit dig genom hela zodiaken.',
    emoji: '🌠',
    emojiSlug: 'shooting-star',
    category: 'exploration',
    tier: 'platinum',
    criterion: { type: 'entries-across-all-zodiac-signs' }
  },
  {
    id: 'pa-denna-dag',
    name: 'På Denna Dag',
    description: 'Fem gånger har du tittat bakåt — att minnas är också ett sätt att växa.',
    emoji: '⏳',
    emojiSlug: 'hourglass',
    category: 'features',
    tier: 'silver',
    criterion: { type: 'on-this-day-viewed', count: 5 }
  },
  {
    id: 'laxmastare',
    name: 'Läxmästare',
    description: 'Fem inlägg med hemuppgifter avklarade — du tar din utveckling på allvar.',
    emoji: '🎓',
    emojiSlug: 'graduation-cap',
    category: 'features',
    tier: 'silver',
    criterion: { type: 'homework-entries', count: 5 }
  },
  {
    id: 'midnattstimmen',
    name: 'Midnattstimmen',
    description: 'Ett inlägg exakt vid midnatt — på gränsen mellan igår och imorgon.',
    emoji: '🕛',
    emojiSlug: 'twelve-o-clock',
    category: 'timing',
    tier: 'silver',
    criterion: { type: 'entries-at-midnight' },
    hidden: true
  },
  {
    id: 'arkivarien',
    name: 'Arkivarien',
    description:
      'Du sparade ett inlägg till ditt personliga arkiv — vissa ord förtjänar att bevaras.',
    emoji: '🗄️',
    emojiSlug: 'file-cabinet',
    category: 'features',
    tier: 'bronze',
    criterion: { type: 'entry-archived' }
  },
  {
    id: 'dubbeldagboken',
    name: 'Dubbeldagboken',
    description: 'Mer än ett inlägg på en dag — ibland räcker inte en gång.',
    emoji: '✌🏻',
    emojiSlug: 'victory-hand',
    category: 'craft',
    tier: 'silver',
    criterion: { type: 'entries-same-day', count: 2 }
  },
  {
    id: 'dygnsskribenten',
    name: 'Dygnsskribenten',
    description: 'Du har skrivit på alla dygnets timmar — dina tankar vilar aldrig.',
    emoji: '🕒',
    emojiSlug: 'three-o-clock',
    category: 'timing',
    tier: 'platinum',
    criterion: { type: 'entries-cover-all-hours' }
  },
  {
    id: 'aterkommaren',
    name: 'Återkommaren',
    description: 'Du läste om ett gammalt inlägg igen — vissa ord förtjänar fler besök.',
    emoji: '🪃',
    emojiSlug: 'boomerang',
    category: 'engagement',
    tier: 'bronze',
    criterion: { type: 'revisited-entry' }
  },
  {
    id: 'romanforfattaren',
    name: 'Romanförfattaren',
    description: 'Över tusen ord i ett enda inlägg — du hade mycket att berätta.',
    emoji: '📜',
    emojiSlug: 'scroll',
    category: 'craft',
    tier: 'gold',
    criterion: { type: 'entry-word-count', minWords: 1000 }
  }
] as const;

export const BADGES_BY_ID: Readonly<Record<string, Badge>> = Object.freeze(
  Object.fromEntries(BADGES.map((b) => [b.id, b]))
);

export function getBadge(id: string): Badge | undefined {
  return BADGES_BY_ID[id];
}

export function badgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES.filter((b) => b.category === category);
}

export function badgesByTier(tier: BadgeTier): Badge[] {
  return BADGES.filter((b) => b.tier === tier);
}

export interface Tone {
  id: string;
  name: string;
  emoji: string;
  preview: string;
}

export const tones: Tone[] = [
  {
    id: 'classic',
    name: 'Klassisk Dagbok',
    emoji: '🖋️',
    preview: 'Kära dagbok, idag var en av de där dagarna...'
  },
  {
    id: 'storytelling',
    name: 'Berättelse',
    emoji: '📖',
    preview: 'Det var en grå tisdag när allt förändrades...'
  },
  {
    id: 'philosophical',
    name: 'Filosofisk',
    emoji: '🤔',
    preview: 'Vad är egentligen en dag, om inte en samling ögonblick...'
  },
  {
    id: 'sportscaster',
    name: 'Sportkommentator',
    emoji: '🏆',
    preview: 'OCH HAN KLIVER UPP UR SÄNGEN! Vilken start på dagen!'
  },
  {
    id: 'cat-perspective',
    name: 'Kattperspektiv',
    emoji: '🐱',
    preview: 'Människan vaknade sent igen. Typiskt.'
  },
  {
    id: 'sarcastic',
    name: 'Sarkastisk',
    emoji: '😏',
    preview: 'Åh, vilken fantastisk dag. Verkligen. Helt makalös.'
  },
  {
    id: 'drama-queen',
    name: 'Drama Queen',
    emoji: '👑',
    preview: 'ALDRIG har någon upplevt en sådan MONUMENTAL morgon!'
  },
  {
    id: 'meme',
    name: 'Meme',
    emoji: '📱',
    preview: 'no bc today was lowkey giving main character energy fr fr'
  },
  {
    id: 'cringe',
    name: 'Cringe',
    emoji: '😳',
    preview: 'Okej så jag råkade säga "du med" när någon önskade smaklig måltid...'
  },
  {
    id: 'brittish',
    name: 'Brittisk',
    emoji: '🇬🇧',
    preview: 'Rather uneventful day, I must say. Not bad though.'
  },
  {
    id: 'quest-log',
    name: 'Quest Log',
    emoji: '🎮',
    preview: '[QUEST ACCEPTED] Överlev måndagen. Reward: +10 XP'
  },
  {
    id: 'bored',
    name: 'Uttråkad',
    emoji: '😐',
    preview: 'Jaha. En dag till. Samma sak som vanligt antar jag.'
  }
];

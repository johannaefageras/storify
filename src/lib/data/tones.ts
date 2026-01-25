export interface Tone {
  id: string;
  name: string;
  emoji: string;
  preview: string;
}

export const tones: Tone[] = [
  {
    id: 'classic',
    name: 'Klassisk',
    emoji: '📒',
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
    emoji: '🎙️',
    preview: 'OCH HAN KLIVER UPP UR SÄNGEN! Vilken start på dagen!'
  },
  {
    id: 'cat-perspective',
    name: 'Kattperspektiv',
    emoji: '🐈',
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
    emoji: '💩',
    preview: 'no bc today was lowkey giving main character energy fr fr'
  },
  {
    id: 'cringe',
    name: 'Cringe',
    emoji: '😬',
    preview: 'Okej så jag råkade säga "du med" när någon önskade smaklig måltid...'
  },
  {
    id: 'british',
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
    emoji: '🥱',
    preview: 'Jaha. En dag till. Samma sak som vanligt antar jag.'
  },
  {
    id: 'nature-documentary',
    name: 'Naturdokumentär',
    emoji: '🌎',
    preview: 'Här ser vi tonåringen i sin naturliga miljö... sovande.'
  },
  {
    id: 'therapist',
    name: 'Psykolog',
    emoji: '🧠️',
    preview: 'Jag hör att det var en utmanande dag. Det är okej att känna så.'
  },
  {
    id: 'ai-robot',
    name: 'AI-Robot',
    emoji: '🤖',
    preview: 'SYSTEMLOGG: Ny dag initierad. Status: operationell.'
  },
  {
    id: 'shakespeare',
    name: 'Shakespeare',
    emoji: '🎭',
    preview: 'Hör, vad ljus från morgonfönstret bryter? Det är alarmet, och jag är trött.'
  },
  {
    id: 'tabloid-newspaper',
    name: 'Kvällstidning',
    emoji: '📰',
    preview: 'CHOCK: Lokal kvinna TVINGADES vakna INNAN klockan åtta!'
  },
  {
    id: 'formal',
    name: 'Formell',
    emoji: '🏛️',
    preview: 'Undertecknad får härmed meddela att dagens förehavanden nu dokumenteras.'
  },
  {
    id: 'troubadour',
    name: 'Trubadur',
    emoji: '🎶',
    preview: 'Hör min sång om denna dag, om solljus och om regn...'
  },
  {
    id: 'nerd',
    name: 'Nörd',
    emoji: '🤓',
    preview: 'Frukosten bestod av havregryn – stapelvara sedan bronsåldern, faktiskt!'
  }
];

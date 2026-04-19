export interface Tone {
  id: string;
  name: string;
  emoji: string;
  preview: string;
}

export const tones: Tone[] = [
  {
    id: 'classic',
    name: 'Dagboksskribenten',
    emoji: '📒',
    preview: 'Kära dagbok, idag var en av de där dagarna...'
  },
  {
    id: 'storytelling',
    name: 'Berättaren',
    emoji: '📖',
    preview: 'Det var en grå tisdag när allt förändrades...'
  },
  {
    id: 'philosophical',
    name: 'Filosofen',
    emoji: '🤔',
    preview: 'Vad är egentligen en dag, om inte en samling ögonblick...'
  },
  {
    id: 'sportscaster',
    name: 'Sportkommentatorn',
    emoji: '🎙️',
    preview: 'OCH HAN KLIVER UPP UR SÄNGEN! Vilken start på dagen!'
  },
  {
    id: 'cat-perspective',
    name: 'Katten',
    emoji: '🐈',
    preview: 'Människan vaknade sent igen. Typiskt.'
  },
  {
    id: 'drama-queen',
    name: 'Divan',
    emoji: '👑',
    preview: 'ALDRIG har någon upplevt en sådan MONUMENTAL morgon!'
  },
  {
    id: 'cringe',
    name: 'Tonåringen',
    emoji: '😬',
    preview: 'Okej. Dagens grej: jag försökte vara normal och det gick... sådär.'
  },
  {
    id: 'british',
    name: 'Britten',
    emoji: '🇬🇧',
    preview: 'Rather uneventful day, I must say. Not bad though.'
  },
  {
    id: 'quest-log',
    name: 'Gamern',
    emoji: '🎮',
    preview: '[QUEST ACCEPTED] Överlev måndagen. Reward: +10 XP'
  },
  {
    id: 'bored',
    name: 'Tråkmånsen',
    emoji: '🥱',
    preview: 'Jaha. En dag till. Samma sak som vanligt antar jag.'
  },
  {
    id: 'nature-documentary',
    name: 'Naturfilmaren',
    emoji: '🌎',
    preview: 'Här ser vi tonåringen i sin naturliga miljö... sovande.'
  },
  {
    id: 'therapist',
    name: 'Psykologen',
    emoji: '🧠️',
    preview: 'Jag hör att det var en utmanande dag. Det är okej att känna så.'
  },
  {
    id: 'ai-robot',
    name: 'AI-Roboten',
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
    id: 'tabloid',
    name: 'Kvällstidningsreportern',
    emoji: '📰',
    preview: 'CHOCK: Lokal kvinna TVINGADES vakna INNAN klockan åtta!'
  },
  {
    id: 'formal',
    name: 'Akademikern',
    emoji: '🏛️',
    preview: 'Dagens preliminära tes: även en tisdag kan erbjuda intressant empiri.'
  },
  {
    id: 'nerd',
    name: 'Nörden',
    emoji: '🤓',
    preview: 'Frukosten bestod av havregryn – stapelvara sedan bronsåldern, faktiskt!'
  },
  {
    id: 'tinfoil-hat',
    name: 'Foliehatten',
    emoji: '🎩',
    preview: 'Matteläraren var sjuk. *Exakt* samma dag som provet. Sammanträffande? Knappast.'
  },
  {
    id: 'self-help',
    name: 'Livscoachen',
    emoji: '✨',
    preview: 'Ibland är de långsamma dagarna de viktigaste. Du är nog. Precis som du är.'
  },
  {
    id: 'overthinker',
    name: 'Grubblaren',
    emoji: '🌀',
    preview: 'Dagen var bra. Eller, "bra" – vad menar jag med det egentligen? Typ okej?'
  },
  {
    id: 'cynical',
    name: 'Cynikern',
    emoji: '😒',
    preview:
      'Det gick bra. Inte för att jag förväntade mig det, men ibland har världen sina ögonblick.'
  },
  {
    id: 'passive-aggressive',
    name: 'Martyren',
    emoji: '😐',
    preview: 'Jag tog det själv. Någon behövde ju bära dagens lilla börda.'
  },
  {
    id: 'chaotic',
    name: 'Multitaskaren',
    emoji: '🌪️',
    preview: 'Okej jag måste – åh katten vill in igen – ja. Bra dag. Typ. KATT. Hejdå.'
  },
  {
    id: 'bureaucratic',
    name: 'Handläggaren',
    emoji: '📋',
    preview: 'Ärendet avslutas. Med vänlig hälsning, Undertecknad, Handläggare.'
  },
  {
    id: 'bro',
    name: 'Killen-hela-dagen',
    emoji: '🩳',
    preview: 'Ass boys, vaknade 06:00 för padel. Grind mode. Inte för att skryta men.'
  },
  {
    id: 'action-hero',
    name: 'Actionhjälten',
    emoji: '💥',
    preview: '06:47. Stockholm. Jag satte på fuel. Svart. Inget annat räknas.'
  },
  {
    id: 'influencer',
    name: 'Influencern',
    emoji: '📣',
    preview: 'Okej ni. Jag måste bara dela — det där magiska med en grå tisdag. ✨'
  },
  {
    id: 'six-year-old',
    name: 'Sexåringen',
    emoji: '🧸',
    preview: 'Idag hände det JÄTTEMYCKET. Typ hundra grejer. Fast mest bara två.'
  }
];

export interface Tone {
  id: string;
  name: string;
  emoji: string;
  preview: string;
  disabled?: boolean;
}

export const tones: Tone[] = [
  {
    id: 'dagboksskribenten',
    name: 'Dagboksskribenten',
    emoji: '📒',
    preview: 'Kära dagbok, idag var en av de där dagarna...'
  },
  {
    id: 'berattaren',
    name: 'Berättaren',
    emoji: '📖',
    preview: 'Det var en grå tisdag när allt förändrades...'
  },
  {
    id: 'filosofen',
    name: 'Filosofen',
    emoji: '🤔',
    preview: 'Vad är egentligen en dag, om inte en samling ögonblick...'
  },
  {
    id: 'sportkommentatorn',
    name: 'Sportkommentatorn',
    emoji: '🎙️',
    preview: 'OCH HAN KLIVER UPP UR SÄNGEN! Vilken start på dagen!'
  },
  {
    id: 'katten',
    name: 'Katten',
    emoji: '🐈',
    preview: 'Människan vaknade sent igen. Typiskt.',
    disabled: true
  },
  {
    id: 'divan',
    name: 'Divan',
    emoji: '👑',
    preview: 'ALDRIG har någon upplevt en sådan MONUMENTAL morgon!'
  },
  {
    id: 'tonaringen',
    name: 'Tonåringen',
    emoji: '😬',
    preview: 'Okej. Dagens grej: jag försökte vara normal och det gick... sådär.'
  },
  {
    id: 'britten',
    name: 'Britten',
    emoji: '🇬🇧',
    preview: 'Rather uneventful day, I must say. Not bad though.'
  },
  {
    id: 'gamern',
    name: 'Gamern',
    emoji: '🎮',
    preview: '[QUEST ACCEPTED] Överlev måndagen. Reward: +10 XP'
  },
  {
    id: 'naturfilmaren',
    name: 'Naturfilmaren',
    emoji: '🌎',
    preview: 'Här ser vi tonåringen i sin naturliga miljö... sovande.',
    disabled: true
  },
  {
    id: 'psykologen',
    name: 'Psykologen',
    emoji: '🧠️',
    preview: 'Jag hör att det var en utmanande dag. Det är okej att känna så.'
  },
  {
    id: 'roboten',
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
    id: 'reportern',
    name: 'Utrikeskorrespondenten',
    emoji: '🌐',
    preview: 'GÖTEBORG. Det regnar tunt över Avenyn när dagen tar sin början...',
    disabled: true
  },
  {
    id: 'akademikern',
    name: 'Akademikern',
    emoji: '🏛️',
    preview: 'Dagens preliminära tes: även en tisdag kan erbjuda intressant empiri.'
  },
  {
    id: 'norden',
    name: 'Nörden',
    emoji: '🤓',
    preview: 'Frukosten bestod av havregryn – stapelvara sedan bronsåldern, faktiskt!'
  },
  {
    id: 'foliehatten',
    name: 'Foliehatten',
    emoji: '🎩',
    preview: 'Matteläraren var sjuk. *Exakt* samma dag som provet. Sammanträffande? Knappast.'
  },
  {
    id: 'livscoachen',
    name: 'Livscoachen',
    emoji: '✨',
    preview: 'Ibland är de långsamma dagarna de viktigaste. Du är nog. Precis som du är.'
  },
  {
    id: 'grubblaren',
    name: 'Grubblaren',
    emoji: '🌀',
    preview: 'Dagen var bra. Eller, "bra" – vad menar jag med det egentligen? Typ okej?'
  },
  {
    id: 'cynikern',
    name: 'Cynikern',
    emoji: '😒',
    preview:
      'Det gick bra. Inte för att jag förväntade mig det, men ibland har världen sina ögonblick.'
  },
  {
    id: 'martyren',
    name: 'Martyren',
    emoji: '😐',
    preview: 'Jag tog det själv. Någon behövde ju bära dagens lilla börda.'
  },
  {
    id: 'multitaskaren',
    name: 'Multitaskaren',
    emoji: '🌪️',
    preview: 'Okej jag måste – åh katten vill in igen – ja. Bra dag. Typ. KATT. Hejdå.'
  },
  {
    id: 'handlaggaren',
    name: 'Handläggaren',
    emoji: '📋',
    preview: 'Ärendet avslutas. Med vänlig hälsning, Undertecknad, Handläggare.',
    disabled: true
  },
  {
    id: 'killenheladagen',
    name: 'Killen-hela-dagen',
    emoji: '🩳',
    preview: 'Ass boys, vaknade 06:00 för padel. Grind mode. Inte för att skryta men.',
    disabled: true
  },
  {
    id: 'actionhjalten',
    name: 'Actionhjälten',
    emoji: '💥',
    preview: '06:47. Stockholm. Jag satte på fuel. Svart. Inget annat räknas.',
    disabled: true
  },
  {
    id: 'influencern',
    name: 'Influencern',
    emoji: '📣',
    preview: 'Okej ni. Jag måste bara dela — det där magiska med en grå tisdag. ✨'
  },
  {
    id: 'sexaringen',
    name: 'Sexåringen',
    emoji: '🧸',
    preview: 'Idag hände det JÄTTEMYCKET. Typ hundra grejer. Fast mest bara två.',
    disabled: true
  },
  {
    id: 'poeten',
    name: 'Poeten',
    emoji: '🪶',
    preview: 'Dagen låg grå och mjuk över mig, som en filt av tystnad.',
    disabled: true
  },
  {
    id: 'kulturtanten',
    name: 'Kulturtanten',
    emoji: '🍷',
    preview: 'Dagens uppsättning var lågmäld, men inte utan vissa fina partier.',
    disabled: true
  },
  {
    id: 'piraten',
    name: 'Piraten',
    emoji: '🏴‍☠️',
    preview: 'Kaptenens logg: jag satte kurs mot ännu en vardag på öppet hav.',
    disabled: true
  }
];

export const activeTones: Tone[] = tones.filter((t) => !t.disabled);

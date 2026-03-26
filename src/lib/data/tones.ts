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
    id: 'tabloid',
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
    id: 'cozy',
    name: 'Mysig',
    emoji: '☕',
    preview: 'Ligger i sängen nu. Filten är varm. Dagen är över, och det känns bra.'
  },
  {
    id: 'nerd',
    name: 'Nördig',
    emoji: '🤓',
    preview: 'Frukosten bestod av havregryn – stapelvara sedan bronsåldern, faktiskt!'
  },
  {
    id: 'tinfoil-hat',
    name: 'Foliehatt',
    emoji: '🎩',
    preview: 'Matteläraren var sjuk. *Exakt* samma dag som provet. Sammanträffande? Knappast.'
  },
  {
    id: 'self-help',
    name: 'Livscoach',
    emoji: '✨',
    preview: 'Ibland är de långsamma dagarna de viktigaste. Du är nog. Precis som du är.'
  },
  {
    id: 'detective',
    name: 'Deckare',
    emoji: '🕵️',
    preview: 'Klockan var åtta. Himlen var grå som en gammal filt. Ännu ett fall.'
  },
  {
    id: 'overthinker',
    name: 'Grubblande',
    emoji: '🌀',
    preview: 'Dagen var bra. Eller, "bra" – vad menar jag med det egentligen? Typ okej?'
  },
  {
    id: 'cynical',
    name: 'Cynisk',
    emoji: '😒',
    preview:
      'Det gick bra. Inte för att jag förväntade mig det, men ibland har världen sina ögonblick.'
  },
  {
    id: 'passive-aggressive',
    name: 'Passivt Aggressiv',
    emoji: '😐',
    preview: 'Ingen sa tack. Men det behövs väl inte. Jag förväntar mig inget.'
  },
  {
    id: 'melodramatic',
    name: 'Melodramatisk',
    emoji: '🎭',
    preview: 'Regnet föll mot rutan som mina drömmar faller mot livets hårda golv.'
  },
  {
    id: 'chaotic',
    name: 'Kaotisk',
    emoji: '🌪️',
    preview: 'Okej jag måste – åh katten vill in igen – ja. Bra dag. Typ. KATT. Hejdå.'
  },
  {
    id: 'bureaucratic',
    name: 'Byråkratisk',
    emoji: '📋',
    preview: 'Ärendet avslutas. Med vänlig hälsning, Undertecknad, Handläggare.'
  },
  {
    id: 'fairy-tale',
    name: 'Saga',
    emoji: '🏰',
    preview: 'Det var en gång, i ett land inte så långt härifrån...'
  },
  {
    id: 'grandma',
    name: 'Mormor',
    emoji: '👵',
    preview: 'Lilla vansen, idag ska jag berätta om din dag...'
  },
  {
    id: 'hr-review',
    name: 'Utvecklingssamtal',
    emoji: '📝',
    preview: 'Vi tar en snabb avstämning kring dagens prestation och utvecklingsområden.'
  },
  {
    id: 'ikea',
    name: 'IKEA-manual',
    emoji: '🔧',
    preview: 'Steg 1: Vakna. Steg 2: Kontrollera att alla delar finns. Steg 3: Börja dagen.'
  }
];

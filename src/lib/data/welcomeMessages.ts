import type { InterviewerId } from './chatbotPrompts';

export type WelcomeMessage = {
  title: string;
  greetings: [string, string];
};

/**
 * Per-interviewer welcome pools powering the empty-state greeting (title + sub).
 * Add more entries to any pool to extend the variations for that persona.
 * Each entry has a `title` (the big greeting) and a two-item `greetings`
 * tuple — a random one is picked on each mount.
 */

const friendWelcomes: WelcomeMessage[] = [
  {
    title: 'Hej hej!',
    greetings: [
      'Skönt att du kikar in. Vad är det första som dyker upp när jag frågar hur dagen har varit?',
      'Kom igen — stort, smått eller helt knäppt, allt får plats här. Var börjar vi?'
    ]
  },
  {
    title: 'Nämen, hej!',
    greetings: [
      'Vad roligt att se dig. Har det hänt nåt idag du redan vet att du vill berätta om?',
      'Sätt dig en stund — vad snurrar i skallen just nu, ärligt?'
    ]
  }
];

const journalistWelcomes: WelcomeMessage[] = [
  {
    title: 'Då kör vi.',
    greetings: [
      'Jag är nyfiken på dagen du precis haft. Var börjar vi — med platsen, personerna, eller ett specifikt ögonblick?',
      'Ge mig en vinkel. Vad är dagens mest berättarvärda händelse, även om den verkar liten?'
    ]
  },
  {
    title: 'Hej, kom in.',
    greetings: [
      'Jag har anteckningsblocket framme. Vad vill du att vi ska dokumentera från idag?',
      'Börja var du vill — men gärna med en konkret detalj. Vem, vad eller var tar vi först?'
    ]
  }
];

const therapistWelcomes: WelcomeMessage[] = [
  {
    title: 'Välkommen in.',
    greetings: [
      'Ingen brådska alls. Vad landar i dig nu när du får lite utrymme?',
      'Andas ut en stund. Vad av dagen känns som att det vill få plats först?'
    ]
  },
  {
    title: 'Så skönt att du är här.',
    greetings: [
      'Vi tar det i din takt. Var i dagen vill du stanna en stund?',
      'Det finns inga krav på var vi börjar. Vad märker du att du bär med dig just nu?'
    ]
  }
];

export const WELCOME_MESSAGES_BY_INTERVIEWER: Record<InterviewerId, WelcomeMessage[]> = {
  friend: friendWelcomes,
  journalist: journalistWelcomes,
  therapist: therapistWelcomes
};

/**
 * Returns a random welcome message (title + one of its greetings) for the
 * given interviewer persona.
 */
export function getRandomWelcomeMessage(
  interviewerId: InterviewerId,
  rng: () => number = Math.random
): { title: string; greeting: string } {
  const pool = WELCOME_MESSAGES_BY_INTERVIEWER[interviewerId];
  const message = pool[Math.floor(rng() * pool.length)];
  const greeting = message.greetings[Math.floor(rng() * message.greetings.length)];
  return { title: message.title, greeting };
}

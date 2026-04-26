import type { EmojiName } from '$lib/assets/emojis';

export type InterviewerId = 'friend' | 'journalist' | 'therapist';

export const DEFAULT_INTERVIEWER: InterviewerId = 'friend';

export const VALID_INTERVIEWER_IDS: readonly InterviewerId[] = [
  'friend',
  'journalist',
  'therapist'
] as const;

export interface InterviewerMeta {
  id: InterviewerId;
  name: string;
  shortLabel: string;
  description: string;
  sampleQuestion: string;
  emoji: EmojiName;
}

export const interviewers: Record<InterviewerId, InterviewerMeta> = {
  friend: {
    id: 'friend',
    name: 'Kompisen',
    shortLabel: 'Varm & prestigelös',
    description:
      'En vän som hämtar dig på vägen hem och bara frågar “nå, hur var det?” — nyfiken utan att vara intensiv.',
    sampleQuestion: 'Hallå, hur är läget — nåt kul som hänt idag?',
    emoji: 'people-hugging'
  },
  journalist: {
    id: 'journalist',
    name: 'Journalisten',
    shortLabel: 'Grävande & nyfiken',
    description:
      'En journalist som letar efter vinkeln i din dag. Följer upp konkreta detaljer, ber om namn, tider, citat.',
    sampleQuestion: 'Vem var det som sa det, och var var du då?',
    emoji: 'magnifying-glass'
  },
  therapist: {
    id: 'therapist',
    name: 'Terapeuten',
    shortLabel: 'Lugn & insiktsfull',
    description:
      'En stillsam samtalspartner som speglar tillbaka. Följer känslan — ger inga råd, tolkar inte och skyndar inte.',
    sampleQuestion: 'Det är ingen brådska — hur landade det i dig?',
    emoji: 'lotus'
  }
};

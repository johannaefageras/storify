import type { UserProfile } from '$lib/stores/wizard.svelte';
import { buildBaseIntro, type ToneId, type TonePromptBuilder } from './types';

// Import all tone modules
import { buildPrompt as classicPrompt } from './classic';
import { buildPrompt as storytellingPrompt } from './storytelling';
import { buildPrompt as philosophicalPrompt } from './philosophical';
import { buildPrompt as sportscasterPrompt } from './sportscaster';
import { buildPrompt as catPerspectivePrompt } from './cat-perspective';
import { buildPrompt as cynicalPrompt } from './cynical';
import { buildPrompt as dramaQueenPrompt } from './drama-queen';
import { buildPrompt as cringePrompt } from './cringe';
import { buildPrompt as britishPrompt } from './british';
import { buildPrompt as questLogPrompt } from './quest-log';
import { buildPrompt as boredPrompt } from './bored';
import { buildPrompt as natureDocumentaryPrompt } from './nature-documentary';
import { buildPrompt as therapistPrompt } from './therapist';
import { buildPrompt as aiRobotPrompt } from './ai-robot';
import { buildPrompt as shakespearePrompt } from './shakespeare';
import { buildPrompt as tabloidPrompt } from './tabloid';
import { buildPrompt as formalPrompt } from './formal';
import { buildPrompt as nerdPrompt } from './nerd';
import { buildPrompt as tinfoilHatPrompt } from './tinfoil-hat';
import { buildPrompt as selfHelpPrompt } from './self-help';
import { buildPrompt as overthinkerPrompt } from './overthinker';
import { buildPrompt as passiveAggressivePrompt } from './passive-aggressive';
import { buildPrompt as chaoticPrompt } from './chaotic';
import { buildPrompt as bureaucraticPrompt } from './bureaucratic';
import { buildPrompt as broPrompt } from './bro';
import { buildPrompt as actionHeroPrompt } from './action-hero';
import { buildPrompt as influencerPrompt } from './influencer';
import { buildPrompt as sixYearOldPrompt } from './six-year-old';

// Registry of all tone prompt builders
const toneBuilders: Record<ToneId, TonePromptBuilder> = {
  classic: classicPrompt,
  storytelling: storytellingPrompt,
  philosophical: philosophicalPrompt,
  sportscaster: sportscasterPrompt,
  'cat-perspective': catPerspectivePrompt,
  cynical: cynicalPrompt,
  'drama-queen': dramaQueenPrompt,
  cringe: cringePrompt,
  british: britishPrompt,
  'quest-log': questLogPrompt,
  bored: boredPrompt,
  'nature-documentary': natureDocumentaryPrompt,
  therapist: therapistPrompt,
  'ai-robot': aiRobotPrompt,
  shakespeare: shakespearePrompt,
  tabloid: tabloidPrompt,
  formal: formalPrompt,
  nerd: nerdPrompt,
  'tinfoil-hat': tinfoilHatPrompt,
  'self-help': selfHelpPrompt,
  overthinker: overthinkerPrompt,
  'passive-aggressive': passiveAggressivePrompt,
  chaotic: chaoticPrompt,
  bureaucratic: bureaucraticPrompt,
  bro: broPrompt,
  'action-hero': actionHeroPrompt,
  influencer: influencerPrompt,
  'six-year-old': sixYearOldPrompt
};

/**
 * Build a complete tone prompt for the given tone ID and user profile.
 * Falls back to 'classic' tone if the requested tone is not found.
 */
export function buildTonePrompt(toneId: string, profile: UserProfile): string {
  const baseIntro = buildBaseIntro(profile);
  const builder = toneBuilders[toneId as ToneId] || toneBuilders.classic;
  return builder(baseIntro);
}

// Re-export types for convenience
export type { ToneId, TonePromptBuilder } from './types';
export { buildBaseIntro, buildProfileDescription } from './types';

// Export the list of available tone IDs
export const availableToneIds: ToneId[] = Object.keys(toneBuilders) as ToneId[];

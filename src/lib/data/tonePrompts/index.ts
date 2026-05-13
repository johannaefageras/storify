import type { UserProfile } from '$lib/stores/wizard.svelte';
import {
  STATIC_PROMPT_HEADER,
  buildProfileTail,
  type ToneId,
  type TonePromptBuilder
} from './types';

// Import all tone modules
import { buildPrompt as dagboksskribentenPrompt } from './dagboksskribenten';
import { buildPrompt as berattarenPrompt } from './berattaren';
import { buildPrompt as filosofenPrompt } from './filosofen';
import { buildPrompt as sportkommentatornPrompt } from './sportkommentatorn';
import { buildPrompt as kattenPrompt } from './katten';
import { buildPrompt as cynikernPrompt } from './cynikern';
import { buildPrompt as divanPrompt } from './divan';
import { buildPrompt as tonaringenPrompt } from './tonaringen';
import { buildPrompt as brittenPrompt } from './britten';
import { buildPrompt as gamernPrompt } from './gamern';
import { buildPrompt as naturfilmarenPrompt } from './naturfilmaren';
import { buildPrompt as psykologenPrompt } from './psykologen';
import { buildPrompt as aiRobotPrompt } from './roboten';
import { buildPrompt as shakespearePrompt } from './shakespeare';
import { buildPrompt as reporternPrompt } from './reportern';
import { buildPrompt as akademikernPrompt } from './akademikern';
import { buildPrompt as nordenPrompt } from './norden';
import { buildPrompt as foliehattenPrompt } from './foliehatten';
import { buildPrompt as livscoachenPrompt } from './livscoachen';
import { buildPrompt as grubblarenPrompt } from './grubblaren';
import { buildPrompt as martyrenPrompt } from './martyren';
import { buildPrompt as multitaskarenPrompt } from './multitaskaren';
import { buildPrompt as handlaggarenPrompt } from './handlaggaren';
import { buildPrompt as killenHelaDagenPrompt } from './killenheladagen';
import { buildPrompt as actionHjaltenPrompt } from './actionhjalten';
import { buildPrompt as influencernPrompt } from './influencern';
import { buildPrompt as sexaringenPrompt } from './sexaringen';
import { buildPrompt as poetenPrompt } from './poeten';
import { buildPrompt as kulturtantenPrompt } from './kulturtanten';
import { buildPrompt as piratenPrompt } from './piraten';

// Registry of all tone prompt builders
const toneBuilders: Record<ToneId, TonePromptBuilder> = {
  dagboksskribenten: dagboksskribentenPrompt,
  berattaren: berattarenPrompt,
  filosofen: filosofenPrompt,
  sportkommentatorn: sportkommentatornPrompt,
  katten: kattenPrompt,
  cynikern: cynikernPrompt,
  divan: divanPrompt,
  tonaringen: tonaringenPrompt,
  britten: brittenPrompt,
  gamern: gamernPrompt,
  naturfilmaren: naturfilmarenPrompt,
  psykologen: psykologenPrompt,
  roboten: aiRobotPrompt,
  shakespeare: shakespearePrompt,
  reportern: reporternPrompt,
  akademikern: akademikernPrompt,
  norden: nordenPrompt,
  foliehatten: foliehattenPrompt,
  livscoachen: livscoachenPrompt,
  grubblaren: grubblarenPrompt,
  martyren: martyrenPrompt,
  multitaskaren: multitaskarenPrompt,
  handlaggaren: handlaggarenPrompt,
  killenheladagen: killenHelaDagenPrompt,
  actionhjalten: actionHjaltenPrompt,
  influencern: influencernPrompt,
  sexaringen: sexaringenPrompt,
  poeten: poetenPrompt,
  kulturtanten: kulturtantenPrompt,
  piraten: piratenPrompt
};

/**
 * Build the static, profile-agnostic portion of a tone prompt.
 * This is identical across all users using the same tone, which makes it
 * a perfect candidate for Anthropic prompt caching (set the cache breakpoint
 * at the end of this block).
 *
 * Falls back to 'dagboksskribenten' if the requested tone is not found.
 */
export function buildToneStaticPrefix(toneId: string): string {
  const builder = toneBuilders[toneId as ToneId] || toneBuilders['dagboksskribenten'];
  return `${STATIC_PROMPT_HEADER}\n\n${builder()}`;
}

/**
 * Build the per-user dynamic suffix that follows the cached prefix.
 * Empty string when the user has no profile data set.
 */
export function buildToneDynamicSuffix(profile: UserProfile): string {
  return buildProfileTail(profile);
}

/**
 * Convenience: assemble the full system prompt as a single string.
 * Equivalent to `buildToneStaticPrefix(toneId) + buildToneDynamicSuffix(profile)`.
 * Used where caching is not applied (or for tests/debugging).
 */
export function buildTonePrompt(toneId: string, profile: UserProfile): string {
  return buildToneStaticPrefix(toneId) + buildToneDynamicSuffix(profile);
}

// Re-export types for convenience
export type { ToneId, TonePromptBuilder } from './types';
export { STATIC_PROMPT_HEADER, buildProfileDescription, buildProfileTail } from './types';

// Export the list of available tone IDs
export const availableToneIds: ToneId[] = Object.keys(toneBuilders) as ToneId[];

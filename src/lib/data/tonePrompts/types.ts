import type { UserProfile } from '$lib/stores/wizard.svelte';
import { getAgeFromBirthday } from '$lib/utils/zodiac';

export type ToneId =
  | 'dagboksskribenten'
  | 'berattaren'
  | 'filosofen'
  | 'sportkommentatorn'
  | 'katten'
  | 'cynikern'
  | 'divan'
  | 'tonaringen'
  | 'britten'
  | 'gamern'
  | 'naturfilmaren'
  | 'psykologen'
  | 'roboten'
  | 'shakespeare'
  | 'reportern'
  | 'akademikern'
  | 'norden'
  | 'foliehatten'
  | 'livscoachen'
  | 'martyren'
  | 'multitaskaren'
  | 'handlaggaren'
  | 'grubblaren'
  | 'killenheladagen'
  | 'actionhjalten'
  | 'influencern'
  | 'sexaringen'
  | 'poeten'
  | 'kulturtanten'
  | 'piraten';

export type TonePromptBuilder = () => string;

export interface ToneModule {
  id: ToneId;
  buildPrompt: TonePromptBuilder;
}

/**
 * Static, profile-agnostic header that prefixes every tone prompt.
 * Kept stable across users so it (combined with the static tone body)
 * forms a cacheable prefix for Anthropic's prompt cache.
 */
export const STATIC_PROMPT_HEADER = `Du är en hjälpsam skrivassistent som skriver dagboksinlägg åt skribenten.

VIKTIGT: Inkludera ALDRIG datumet i texten du genererar — datumet visas redan separat i gränssnittet. Börja direkt med innehållet utan datumstämpel.`;

export function buildProfileDescription(profile: UserProfile): string {
  const parts: string[] = [];

  if (profile.birthday) {
    const age = getAgeFromBirthday(profile.birthday);
    if (age !== null) {
      parts.push(`${age} år`);
    }
  }

  if (profile.pronouns === 'hon') {
    parts.push('tjej');
  } else if (profile.pronouns === 'han') {
    parts.push('kille');
  } else if (profile.pronouns === 'hen') {
    parts.push('person');
  }

  if (profile.hometown) {
    parts.push(`i ${profile.hometown}`);
  }

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return 'ung person';
}

/**
 * Per-user "OM SKRIBENTEN" suffix appended after the cached prefix.
 * Returns an empty string when no profile data is set so retone-mode
 * (with empty profile) doesn't leak a placeholder descriptor.
 */
export function buildProfileTail(profile: UserProfile): string {
  const hasProfileData =
    !!profile.birthday || !!profile.pronouns || !!profile.hometown;
  if (!hasProfileData) return '';
  const profileDesc = buildProfileDescription(profile);
  return `\n\nOM SKRIBENTEN:\nDu skriver åt en ${profileDesc}.`;
}

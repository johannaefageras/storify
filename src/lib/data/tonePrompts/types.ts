import type { UserProfile } from '$lib/stores/wizard.svelte';
import { getAgeFromBirthday } from '$lib/utils/zodiac';

export type ToneId =
  | 'classic'
  | 'storytelling'
  | 'philosophical'
  | 'sportscaster'
  | 'cat-perspective'
  | 'cynical'
  | 'drama-queen'
  | 'cringe'
  | 'british'
  | 'quest-log'
  | 'bored'
  | 'nature-documentary'
  | 'therapist'
  | 'ai-robot'
  | 'shakespeare'
  | 'tabloid'
  | 'formal'
  | 'nerd'
  | 'tinfoil-hat'
  | 'self-help'
  | 'passive-aggressive'
  | 'chaotic'
  | 'bureaucratic'
  | 'overthinker'
  | 'bro'
  | 'action-hero'
  | 'influencer'
  | 'six-year-old'
  | 'poet'
  | 'culture-vulture'
  | 'pirate'
  | 'gothenburger';

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

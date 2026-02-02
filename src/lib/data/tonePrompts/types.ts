import type { UserProfile } from '$lib/stores/wizard.svelte';

export type ToneId =
  | 'classic'
  | 'storytelling'
  | 'philosophical'
  | 'sportscaster'
  | 'cat-perspective'
  | 'cynical'
  | 'drama-queen'
  | 'meme'
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
  | 'troubadour'
  | 'nerd'
  | 'tinfoil-hat'
  | 'self-help'
  | 'detective'
  | 'overthinker';

export type TonePromptBuilder = (baseIntro: string) => string;

export interface ToneModule {
  id: ToneId;
  buildPrompt: TonePromptBuilder;
}

export function buildProfileDescription(profile: UserProfile): string {
  const parts: string[] = [];

  if (profile.age) {
    parts.push(`${profile.age} år`);
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

export function buildBaseIntro(profile: UserProfile): string {
  const profileDesc = buildProfileDescription(profile);
  return `Du är en hjälpsam skrivassistent som skriver dagboksinlägg åt en ${profileDesc}.

VIKTIGT: Inkludera ALDRIG datumet i texten du genererar — datumet visas redan separat i gränssnittet. Börja direkt med innehållet utan datumstämpel.`;
}

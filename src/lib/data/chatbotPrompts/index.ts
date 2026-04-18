import type { UserProfile } from '$lib/stores/wizard.svelte';
import type { InterviewerId } from './types';
import { buildFriendPrompt } from './friend';
import { buildJournalistPrompt } from './journalist';
import { buildTherapistPrompt } from './therapist';

export * from './types';
export { formatProfileContext } from './shared';

export function buildInterviewerPrompt(interviewerId: InterviewerId, profile: UserProfile): string {
  switch (interviewerId) {
    case 'friend':
      return buildFriendPrompt(profile);
    case 'journalist':
      return buildJournalistPrompt(profile);
    case 'therapist':
      return buildTherapistPrompt(profile);
    default: {
      const _exhaustive: never = interviewerId;
      throw new Error(`Unknown interviewer id: ${_exhaustive as string}`);
    }
  }
}

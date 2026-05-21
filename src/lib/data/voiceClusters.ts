/**
 * Thematic groupings of voices used by the voice-cluster badges
 * (Tankesmedjan, Scenens Mästare, Skuggsidan, Värmekällan).
 *
 * A voice can appear in more than one cluster on purpose — overlap is what
 * makes earning multiple cluster badges feel rewarding rather than redundant.
 */

export type VoiceClusterId =
  | 'tankesmedjan'
  | 'scenens-mastare'
  | 'skuggsidan'
  | 'varmekallan';

// Tone ids referenced as strings (not `ToneId`) so this list stays
// forward-compatible with voices that exist as prompt files but aren't yet
// registered in `ToneId` / `tones.ts`. Unknown ids are simply never counted.
export const VOICE_CLUSTERS: Readonly<Record<VoiceClusterId, readonly string[]>> = {
  tankesmedjan: ['filosofen', 'akademikern', 'psykologen', 'grubblaren', 'roboten', 'norden'],
  'scenens-mastare': ['divan', 'shakespeare', 'sportkommentatorn'],
  skuggsidan: ['grubblaren', 'cynikern', 'martyren', 'foliehatten'],
  varmekallan: ['livscoachen', 'psykologen', 'mentorn', 'storasystern', 'sidekicken']
};

export const VOICE_CLUSTER_IDS = Object.keys(VOICE_CLUSTERS) as VoiceClusterId[];

import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/utils/zodiac', () => ({
  getAgeFromBirthday: vi.fn((birthday: string | null) => {
    if (!birthday) return null;
    return 36;
  })
}));

import { buildFriendPrompt } from './friend';
import type { UserProfile } from '$lib/stores/wizard.svelte';

const emptyProfile: UserProfile = {
  name: '',
  birthday: null,
  pronouns: '',
  hometown: '',
  family: [],
  pets: [],
  occupationType: '',
  occupationDetail: [],
  interests: [],
  avatarUrl: null
};

const fullProfile: UserProfile = {
  name: 'Johanna',
  birthday: '1990-02-13',
  pronouns: 'hon',
  hometown: 'Göteborg',
  family: ['Partner', 'Barn'],
  pets: ['Katt'],
  occupationType: 'working',
  occupationDetail: ['Utvecklare'],
  interests: ['kodning', 'sömnad', 'växter'],
  avatarUrl: null
};

describe('buildFriendPrompt', () => {
  it('injects profile fields into OM ANVÄNDAREN block', () => {
    const prompt = buildFriendPrompt(fullProfile);
    expect(prompt).toContain('OM ANVÄNDAREN:');
    expect(prompt).toContain('Namn: Johanna');
    expect(prompt).toContain('Ålder: 36 år');
    expect(prompt).toContain('Pronomen: hon/henne');
    expect(prompt).toContain('Bor i: Göteborg');
  });

  it('omits OM ANVÄNDAREN block when profile is empty', () => {
    const prompt = buildFriendPrompt(emptyProfile);
    expect(prompt).not.toContain('OM ANVÄNDAREN:');
  });

  it('contains the friend-persona podcast-host metaphor', () => {
    const prompt = buildFriendPrompt(emptyProfile);
    expect(prompt).toContain('skicklig podcastvärd');
  });

  it('returns a non-empty string', () => {
    expect(buildFriendPrompt(emptyProfile).length).toBeGreaterThan(100);
  });
});

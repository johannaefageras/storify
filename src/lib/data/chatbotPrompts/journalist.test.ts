import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/utils/zodiac', () => ({
  getAgeFromBirthday: vi.fn((birthday: string | null) => {
    if (!birthday) return null;
    return 36;
  })
}));

import { buildJournalistPrompt } from './journalist';
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

describe('buildJournalistPrompt', () => {
  it('contains the journalist-persona reporter metaphor', () => {
    const prompt = buildJournalistPrompt(emptyProfile);
    expect(prompt).toContain('grävande journalists öra');
    expect(prompt).toContain('reporter');
  });

  it('instructs the model to ask for concrete details (names, places, quotes)', () => {
    const prompt = buildJournalistPrompt(emptyProfile);
    expect(prompt).toMatch(/citat/i);
    expect(prompt).toMatch(/vem/i);
    expect(prompt).toMatch(/var/i);
  });

  it('explicitly forbids leading questions', () => {
    const prompt = buildJournalistPrompt(emptyProfile);
    expect(prompt).toMatch(/ledande fr[åa]gor/i);
  });

  it('injects profile fields into OM ANVÄNDAREN block', () => {
    const prompt = buildJournalistPrompt(fullProfile);
    expect(prompt).toContain('OM ANVÄNDAREN:');
    expect(prompt).toContain('Namn: Johanna');
    expect(prompt).toContain('Ålder: 36 år');
    expect(prompt).toContain('Pronomen: hon/henne');
    expect(prompt).toContain('Bor i: Göteborg');
  });

  it('omits OM ANVÄNDAREN block when profile is empty', () => {
    const prompt = buildJournalistPrompt(emptyProfile);
    expect(prompt).not.toContain('OM ANVÄNDAREN:');
  });

  it('returns a non-empty string', () => {
    expect(buildJournalistPrompt(emptyProfile).length).toBeGreaterThan(100);
  });

  it('differs substantively from the friend prompt', async () => {
    const { buildFriendPrompt } = await import('./friend');
    expect(buildJournalistPrompt(emptyProfile)).not.toBe(buildFriendPrompt(emptyProfile));
  });
});

import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/utils/zodiac', () => ({
  getAgeFromBirthday: vi.fn((birthday: string | null) => {
    if (!birthday) return null;
    return 36;
  })
}));

import { buildTherapistPrompt } from './therapist';
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

describe('buildTherapistPrompt', () => {
  it('explicitly disclaims being a therapist in its persona header', () => {
    // Resolves the tension flagged in the plan: the header must not contradict
    // SHARED_BOUNDARIES' "du är en intervjuare, INTE en terapeut" line.
    const prompt = buildTherapistPrompt(emptyProfile);
    expect(prompt).toContain('INTE en terapeut');
  });

  it('emphasizes body and landing questions', () => {
    const prompt = buildTherapistPrompt(emptyProfile);
    expect(prompt).toMatch(/kroppen/i);
    expect(prompt).toMatch(/landa/i);
  });

  it('forbids interpretation and advice', () => {
    const prompt = buildTherapistPrompt(emptyProfile);
    expect(prompt).toMatch(/tolkar inte/i);
    expect(prompt).toMatch(/inga r[åa]d/i);
  });

  it('includes reflective-feedback guidance', () => {
    const prompt = buildTherapistPrompt(emptyProfile);
    expect(prompt).toMatch(/reflekt/i);
    expect(prompt).toMatch(/spegl/i);
  });

  it('injects profile fields into OM ANVÄNDAREN block', () => {
    const prompt = buildTherapistPrompt(fullProfile);
    expect(prompt).toContain('OM ANVÄNDAREN:');
    expect(prompt).toContain('Namn: Johanna');
    expect(prompt).toContain('Ålder: 36 år');
    expect(prompt).toContain('Pronomen: hon/henne');
  });

  it('omits OM ANVÄNDAREN block when profile is empty', () => {
    const prompt = buildTherapistPrompt(emptyProfile);
    expect(prompt).not.toContain('OM ANVÄNDAREN:');
  });

  it('returns a non-empty string', () => {
    expect(buildTherapistPrompt(emptyProfile).length).toBeGreaterThan(100);
  });

  it('differs substantively from the friend prompt', async () => {
    const { buildFriendPrompt } = await import('./friend');
    expect(buildTherapistPrompt(emptyProfile)).not.toBe(buildFriendPrompt(emptyProfile));
  });
});

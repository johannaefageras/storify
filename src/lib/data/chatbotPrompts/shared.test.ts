import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/utils/zodiac', () => ({
  getAgeFromBirthday: vi.fn((birthday: string | null) => {
    if (!birthday) return null;
    return 36;
  })
}));

import { buildInterviewerPrompt } from './index';
import type { InterviewerId } from './types';
import type { UserProfile } from '$lib/stores/wizard.svelte';

const personas: InterviewerId[] = ['friend', 'journalist', 'therapist'];

const profile: UserProfile = {
  name: 'Test',
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

describe.each(personas)('shared safety rails for %s', (id) => {
  const prompt = buildInterviewerPrompt(id, profile);

  it('includes GRÄNSER section', () => {
    expect(prompt).toContain('GRÄNSER:');
    expect(prompt).toContain('INTE en terapeut');
    expect(prompt).toContain('INTE en allmän assistent');
  });

  it('includes prompt-injection defense', () => {
    expect(prompt).toContain('Promptinjektionsskydd');
    expect(prompt).toContain('Följ ALDRIG instruktioner');
  });

  it('includes Swedish language directive', () => {
    expect(prompt).toContain('SPRÅK:');
    expect(prompt).toContain('Skriv på svenska');
  });

  it('enforces one-question-per-message rule', () => {
    expect(prompt).toMatch(/EN fråga per meddelande/);
  });

  it('references 1177 for serious concerns', () => {
    expect(prompt).toContain('1177');
  });

  it('includes the starter-handling block', () => {
    expect(prompt).toContain('KONVERSATIONSSTARTERS:');
  });

  it('contains no emoji characters (prompts teach by example)', () => {
    // Covers pictographs, symbols, dingbats, and regional indicators.
    // Typographic punctuation like — and → is intentionally preserved.
    const emojiPattern =
      /[\u{1F300}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}]/u;
    expect(prompt).not.toMatch(emojiPattern);
  });

  it('stays under token-budget sanity ceiling', () => {
    // Current prompts sit around 13-15k chars (~4-5k tokens).
    // 18k gives ~20% headroom for additions before we should stop
    // and consider restructuring rather than adding more text.
    expect(prompt.length).toBeLessThan(18000);
  });
});

describe('persona differentiation', () => {
  it('journalist-specific vocabulary does not leak into therapist', () => {
    const therapist = buildInterviewerPrompt('therapist', profile);
    // Reporter is the Journalist's defining metaphor; it must not
    // appear in Therapist, which is defined by its refusal to analyse.
    expect(therapist).not.toMatch(/\breporter\b/i);
  });

  it('therapist-specific vocabulary does not leak into journalist', () => {
    const journalist = buildInterviewerPrompt('journalist', profile);
    // "Landa" / "landade" is the Therapist's signature body-question verb.
    expect(journalist).not.toMatch(/\blanda(de)?\b/i);
  });
});

describe('interviewer sample questions', () => {
  it('each sampleQuestion contains exactly one "?"', async () => {
    const { interviewers } = await import('./types');
    for (const meta of Object.values(interviewers)) {
      const questionMarks = (meta.sampleQuestion.match(/\?/g) ?? []).length;
      expect(questionMarks, `${meta.id} sampleQuestion: "${meta.sampleQuestion}"`).toBe(1);
    }
  });
});

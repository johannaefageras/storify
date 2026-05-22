import { describe, it, expect } from 'vitest';
import { parseExtractorResponse, formatThreadsForPrompt, type ActiveThread } from './threads';

describe('parseExtractorResponse', () => {
  it('parses a valid threads payload', () => {
    const raw = JSON.stringify({
      threads: [
        { type: 'upcoming_event', text: 'Möte med chefen imorgon' },
        { type: 'ongoing_concern', text: 'Stressad över deadlinen' }
      ]
    });
    const out = parseExtractorResponse(raw);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ type: 'upcoming_event', text: 'Möte med chefen imorgon' });
  });

  it('returns [] for empty threads array', () => {
    expect(parseExtractorResponse('{"threads": []}')).toEqual([]);
  });

  it('strips code fences', () => {
    const raw = '```json\n{"threads":[{"type":"goal","text":"Springa varje dag"}]}\n```';
    const out = parseExtractorResponse(raw);
    expect(out).toEqual([{ type: 'goal', text: 'Springa varje dag' }]);
  });

  it('filters out unknown types', () => {
    const raw = JSON.stringify({
      threads: [
        { type: 'made_up_type', text: 'x' },
        { type: 'goal', text: 'Läsa mer' }
      ]
    });
    expect(parseExtractorResponse(raw)).toEqual([{ type: 'goal', text: 'Läsa mer' }]);
  });

  it('caps at 3 threads', () => {
    const raw = JSON.stringify({
      threads: Array.from({ length: 5 }, (_, i) => ({ type: 'goal', text: `mål ${i}` }))
    });
    expect(parseExtractorResponse(raw)).toHaveLength(3);
  });

  it('returns [] on malformed JSON', () => {
    expect(parseExtractorResponse('not json')).toEqual([]);
  });

  it('returns [] when threads is missing', () => {
    expect(parseExtractorResponse('{"foo": "bar"}')).toEqual([]);
  });

  it('skips entries without required fields', () => {
    const raw = JSON.stringify({
      threads: [{ type: 'goal' }, { text: 'no type' }, { type: 'goal', text: '   ' }]
    });
    expect(parseExtractorResponse(raw)).toEqual([]);
  });
});

describe('formatThreadsForPrompt', () => {
  it('returns empty string for no threads', () => {
    expect(formatThreadsForPrompt([])).toBe('');
  });

  it('formats relative dates', () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const threads: ActiveThread[] = [
      { type: 'upcoming_event', text: 'Möte imorgon', created_at: today },
      { type: 'ongoing_concern', text: 'Bråk med mamma', created_at: yesterday }
    ];
    const out = formatThreadsForPrompt(threads);
    expect(out).toContain('nämnt idag');
    expect(out).toContain('nämnt igår');
    expect(out).toContain('Möte imorgon');
    expect(out).toContain('ÖPPNA TRÅDAR');
  });
});

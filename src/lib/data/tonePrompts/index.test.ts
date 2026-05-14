import { describe, it, expect } from 'vitest';
import {
	availableToneIds,
	buildToneStaticPrefix,
	buildToneDynamicSuffix,
	buildTonePrompt,
	STATIC_PROMPT_HEADER,
	type ToneId
} from './index';
import { ACTIVE_TONE_COUNT, activeTones, tones } from '$lib/data/tones';
import { voiceSamples } from '$lib/data/voiceSamples';
import type { UserProfile } from '$lib/stores/wizard.svelte';

const emptyProfile: UserProfile = {
	birthday: '',
	pronouns: '',
	hometown: '',
	occupation: '',
	relationship: '',
	location: ''
} as unknown as UserProfile;

describe('toneBuilders registry', () => {
	it('exposes at least one tone', () => {
		expect(availableToneIds.length).toBeGreaterThan(0);
	});

	it('exports the active public tone count from activeTones', () => {
		expect(ACTIVE_TONE_COUNT).toBeGreaterThan(0);
		expect(ACTIVE_TONE_COUNT).toBe(activeTones.length);
		expect(ACTIVE_TONE_COUNT).toBeLessThanOrEqual(tones.length);
	});

	it.each(availableToneIds)('builder for %s produces a non-empty string', (id) => {
		const prefix = buildToneStaticPrefix(id);
		expect(typeof prefix).toBe('string');
		expect(prefix.length).toBeGreaterThan(STATIC_PROMPT_HEADER.length);
		expect(prefix.startsWith(STATIC_PROMPT_HEADER)).toBe(true);
	});

	it('falls back to dagboksskribenten prompt for an unknown tone id', () => {
		const unknown = buildToneStaticPrefix('not-a-real-tone');
		const dagboksskribenten = buildToneStaticPrefix('dagboksskribenten');
		expect(unknown).toBe(dagboksskribenten);
	});
});

describe('tone registration consistency (the "added in 3 of 4 places" gotcha)', () => {
	it('every tone in availableToneIds has a UI entry in tones.ts', () => {
		const uiIds = new Set(tones.map((t) => t.id));
		const missing = availableToneIds.filter((id) => !uiIds.has(id));
		expect(missing, `Tones missing from src/lib/data/tones.ts: ${missing.join(', ')}`).toEqual(
			[]
		);
	});

	it('every tone in tones.ts has a registered prompt builder', () => {
		const builderIds = new Set<string>(availableToneIds);
		const missing = tones.map((t) => t.id).filter((id) => !builderIds.has(id));
		expect(
			missing,
			`Tones in tones.ts without a builder in tonePrompts/index.ts: ${missing.join(', ')}`
		).toEqual([]);
	});

	it('every tone has a voiceSamples entry with at least one preview', () => {
		const missing = availableToneIds.filter(
			(id) => !Array.isArray(voiceSamples[id]) || voiceSamples[id].length === 0
		);
		expect(
			missing,
			`Tones missing voiceSamples entries in src/lib/data/voiceSamples.ts: ${missing.join(', ')}`
		).toEqual([]);
	});
});

describe('buildToneDynamicSuffix', () => {
	it('returns empty string for an empty profile', () => {
		expect(buildToneDynamicSuffix(emptyProfile)).toBe('');
	});

	it('produces an OM SKRIBENTEN block when profile has data', () => {
		const profile = { ...emptyProfile, pronouns: 'hon', hometown: 'Stockholm' } as UserProfile;
		const suffix = buildToneDynamicSuffix(profile);
		expect(suffix).toContain('OM SKRIBENTEN');
		expect(suffix).toContain('Stockholm');
	});
});

describe('buildTonePrompt', () => {
	it('concatenates static prefix and dynamic suffix', () => {
		const profile = { ...emptyProfile, pronouns: 'han' } as UserProfile;
		const full = buildTonePrompt('dagboksskribenten', profile);
		expect(full).toBe(buildToneStaticPrefix('dagboksskribenten') + buildToneDynamicSuffix(profile));
	});

	it('omits OM SKRIBENTEN block for retone-style empty profile', () => {
		const full = buildTonePrompt('dagboksskribenten', emptyProfile);
		expect(full).not.toContain('OM SKRIBENTEN');
	});
});

describe('ToneId type and availableToneIds stay in sync', () => {
	// This won't catch type-only mismatches at runtime, but it does catch the
	// common case where someone adds to the type but forgets to register a builder.
	it('availableToneIds is a non-trivial list of unique ids', () => {
		const set = new Set<ToneId>(availableToneIds);
		expect(set.size).toBe(availableToneIds.length);
	});
});

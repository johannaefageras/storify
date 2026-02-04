import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the store
vi.mock('$app/environment', () => ({
	browser: false
}));

vi.mock('@capacitor/preferences', () => ({
	Preferences: {
		get: vi.fn().mockResolvedValue({ value: null }),
		set: vi.fn().mockResolvedValue(undefined),
		remove: vi.fn().mockResolvedValue(undefined)
	}
}));

vi.mock('$lib/utils/weather', () => ({
	fetchWeather: vi.fn().mockResolvedValue(null)
}));

vi.mock('$lib/utils/geolocation', () => ({
	getCurrentPosition: vi.fn().mockResolvedValue(null)
}));

vi.mock('$lib/utils/geocoding', () => ({
	fetchLocationName: vi.fn().mockResolvedValue(null)
}));

// Import after mocks are set up
import { wizardStore } from './wizard.svelte';

describe('wizardStore', () => {
	beforeEach(() => {
		wizardStore.fullReset();
	});

	describe('isStepValid', () => {
		it('step 0 (Profile) is always valid', () => {
			expect(wizardStore.isStepValid(0)).toBe(true);
		});

		it('step 1 (Emojis) requires at least one emoji', () => {
			expect(wizardStore.isStepValid(1)).toBe(false);

			wizardStore.updateData('emojis', ['😊']);
			expect(wizardStore.isStepValid(1)).toBe(true);
		});

		it('step 1 (Emojis) valid with multiple emojis', () => {
			wizardStore.updateData('emojis', ['😊', '🎉', '💪']);
			expect(wizardStore.isStepValid(1)).toBe(true);
		});

		it('step 2 (Sleep & Energy) is always valid (has defaults)', () => {
			expect(wizardStore.isStepValid(2)).toBe(true);
		});

		it('step 3 (Where & What) requires locations AND activities', () => {
			expect(wizardStore.isStepValid(3)).toBe(false);

			// Only locations - invalid
			wizardStore.updateData('locations', ['Home']);
			expect(wizardStore.isStepValid(3)).toBe(false);

			// Add activities - now valid
			wizardStore.updateData('activities', ['Working']);
			expect(wizardStore.isStepValid(3)).toBe(true);
		});

		it('step 3 accepts custom locations', () => {
			wizardStore.updateData('customLocations', ['My special place']);
			wizardStore.updateData('activities', ['Relaxing']);
			expect(wizardStore.isStepValid(3)).toBe(true);
		});

		it('step 3 accepts custom activities', () => {
			wizardStore.updateData('locations', ['Park']);
			wizardStore.updateData('customActivities', ['Bird watching']);
			expect(wizardStore.isStepValid(3)).toBe(true);
		});

		it('step 4 (Wins) requires at least one non-empty win', () => {
			// Default has empty strings
			wizardStore.updateData('wins', ['']);
			expect(wizardStore.isStepValid(4)).toBe(false);

			wizardStore.updateData('wins', ['   ']); // whitespace only
			expect(wizardStore.isStepValid(4)).toBe(false);

			wizardStore.updateData('wins', ['Got things done']);
			expect(wizardStore.isStepValid(4)).toBe(true);
		});

		it('step 4 valid if any win has content', () => {
			wizardStore.updateData('wins', ['', 'One good thing', '']);
			expect(wizardStore.isStepValid(4)).toBe(true);
		});

		it('step 5 (Reflections) is always valid (optional)', () => {
			expect(wizardStore.isStepValid(5)).toBe(true);
		});

		it('step 6 (Food & Music) is always valid (optional)', () => {
			expect(wizardStore.isStepValid(6)).toBe(true);
		});

		it('step 7 (Time Capsule) is always valid (optional)', () => {
			expect(wizardStore.isStepValid(7)).toBe(true);
		});

		it('step 8 (Voice) requires selected tone', () => {
			wizardStore.updateData('selectedTone', '');
			expect(wizardStore.isStepValid(8)).toBe(false);

			wizardStore.updateData('selectedTone', '   '); // whitespace only
			expect(wizardStore.isStepValid(8)).toBe(false);

			wizardStore.updateData('selectedTone', 'classic');
			expect(wizardStore.isStepValid(8)).toBe(true);
		});

		it('step 9 (Add-ons) is always valid (optional)', () => {
			expect(wizardStore.isStepValid(9)).toBe(true);
		});

		it('step 10 (Summary) is always valid', () => {
			expect(wizardStore.isStepValid(10)).toBe(true);
		});

		it('unknown steps are valid by default', () => {
			expect(wizardStore.isStepValid(99)).toBe(true);
			expect(wizardStore.isStepValid(-1)).toBe(true);
		});
	});

	describe('hasOptionalFieldsFilled', () => {
		it('step 0 (Profile) detects filled name', () => {
			expect(wizardStore.hasOptionalFieldsFilled(0)).toBe(false);
			wizardStore.updateProfile('name', 'Alice');
			expect(wizardStore.hasOptionalFieldsFilled(0)).toBe(true);
		});

		it('step 0 (Profile) detects filled birthday', () => {
			wizardStore.updateProfile('birthday', '1990-01-15');
			expect(wizardStore.hasOptionalFieldsFilled(0)).toBe(true);
		});

		it('step 0 (Profile) detects filled interests', () => {
			wizardStore.updateProfile('interests', ['Reading', 'Coding']);
			expect(wizardStore.hasOptionalFieldsFilled(0)).toBe(true);
		});

		it('step 5 (Reflections) detects filled fields', () => {
			expect(wizardStore.hasOptionalFieldsFilled(5)).toBe(false);

			wizardStore.updateData('almostHappened', 'Something almost happened');
			expect(wizardStore.hasOptionalFieldsFilled(5)).toBe(true);
		});

		it('step 5 ignores whitespace-only values', () => {
			wizardStore.updateData('almostHappened', '   ');
			expect(wizardStore.hasOptionalFieldsFilled(5)).toBe(false);
		});

		it('step 6 (Food & Music) detects meals', () => {
			expect(wizardStore.hasOptionalFieldsFilled(6)).toBe(false);

			wizardStore.updateData('meals', ['Pasta']);
			expect(wizardStore.hasOptionalFieldsFilled(6)).toBe(true);
		});

		it('step 6 (Food & Music) detects custom meals', () => {
			wizardStore.updateData('customMeals', ['Homemade pizza']);
			expect(wizardStore.hasOptionalFieldsFilled(6)).toBe(true);
		});

		it('step 6 (Food & Music) detects soundtracks', () => {
			wizardStore.updateData('soundtracks', ['Lo-fi beats']);
			expect(wizardStore.hasOptionalFieldsFilled(6)).toBe(true);
		});

		it('step 7 (Time Capsule) detects memory', () => {
			expect(wizardStore.hasOptionalFieldsFilled(7)).toBe(false);

			wizardStore.updateData('memoryFor10Years', 'A great day');
			expect(wizardStore.hasOptionalFieldsFilled(7)).toBe(true);
		});

		it('step 7 (Time Capsule) detects message to future self', () => {
			wizardStore.updateData('messageToFutureSelf', 'Keep going!');
			expect(wizardStore.hasOptionalFieldsFilled(7)).toBe(true);
		});

		it('step 9 (Add-ons) detects horoscope', () => {
			// Homework is on by default, so turn it off first
			wizardStore.updateData('includeHomework', false);
			expect(wizardStore.hasOptionalFieldsFilled(9)).toBe(false);

			wizardStore.updateData('includeHoroscope', true);
			expect(wizardStore.hasOptionalFieldsFilled(9)).toBe(true);
		});

		it('step 9 (Add-ons) detects on this day', () => {
			wizardStore.updateData('includeHomework', false);
			wizardStore.updateData('includeOnThisDay', true);
			expect(wizardStore.hasOptionalFieldsFilled(9)).toBe(true);
		});

		it('step 9 (Add-ons) detects homework (default on)', () => {
			// Homework is on by default
			expect(wizardStore.hasOptionalFieldsFilled(9)).toBe(true);

			wizardStore.updateData('includeHomework', false);
			expect(wizardStore.hasOptionalFieldsFilled(9)).toBe(false);
		});

		it('required steps return false', () => {
			expect(wizardStore.hasOptionalFieldsFilled(1)).toBe(false);
			expect(wizardStore.hasOptionalFieldsFilled(2)).toBe(false);
			expect(wizardStore.hasOptionalFieldsFilled(3)).toBe(false);
			expect(wizardStore.hasOptionalFieldsFilled(4)).toBe(false);
			expect(wizardStore.hasOptionalFieldsFilled(8)).toBe(false);
			expect(wizardStore.hasOptionalFieldsFilled(10)).toBe(false);
		});
	});

	describe('navigation', () => {
		it('starts at step 0', () => {
			expect(wizardStore.currentStep).toBe(0);
		});

		it('nextStep increments current step', () => {
			wizardStore.nextStep();
			expect(wizardStore.currentStep).toBe(1);
		});

		it('prevStep decrements current step', () => {
			wizardStore.goToStep(5);
			wizardStore.prevStep();
			expect(wizardStore.currentStep).toBe(4);
		});

		it('prevStep does not go below 0', () => {
			wizardStore.goToStep(0);
			wizardStore.prevStep();
			expect(wizardStore.currentStep).toBe(0);
		});

		it('goToStep sets specific step', () => {
			wizardStore.goToStep(7);
			expect(wizardStore.currentStep).toBe(7);
		});

		it('goToStep ignores invalid negative steps', () => {
			wizardStore.goToStep(5);
			wizardStore.goToStep(-1);
			expect(wizardStore.currentStep).toBe(5);
		});

		it('totalSteps is 11', () => {
			expect(wizardStore.totalSteps).toBe(11);
		});

		it('progress calculates correctly', () => {
			wizardStore.goToStep(0);
			expect(wizardStore.progress).toBeCloseTo((1 / 11) * 100);

			wizardStore.goToStep(5);
			expect(wizardStore.progress).toBeCloseTo((6 / 11) * 100);

			wizardStore.goToStep(10);
			expect(wizardStore.progress).toBe(100);
		});
	});

	describe('data updates', () => {
		it('updateData updates wizard data', () => {
			wizardStore.updateData('emojis', ['🎉']);
			expect(wizardStore.data.emojis).toEqual(['🎉']);
		});

		it('updateProfile updates profile data', () => {
			wizardStore.updateProfile('name', 'Test User');
			expect(wizardStore.data.profile.name).toBe('Test User');
		});

		it('updateData preserves other fields', () => {
			wizardStore.updateData('emojis', ['😊']);
			wizardStore.updateData('locations', ['Home']);
			expect(wizardStore.data.emojis).toEqual(['😊']);
			expect(wizardStore.data.locations).toEqual(['Home']);
		});
	});

	describe('reset', () => {
		it('reset preserves profile and goes to step 1', () => {
			wizardStore.updateProfile('name', 'Alice');
			wizardStore.updateData('emojis', ['😊']);
			wizardStore.goToStep(5);

			wizardStore.reset();

			expect(wizardStore.data.profile.name).toBe('Alice');
			expect(wizardStore.data.emojis).toEqual([]);
			expect(wizardStore.currentStep).toBe(1);
		});

		it('fullReset preserves profile and goes to step 0', () => {
			wizardStore.updateProfile('name', 'Alice');
			wizardStore.updateData('emojis', ['😊']);
			wizardStore.goToStep(5);

			wizardStore.fullReset();

			expect(wizardStore.data.profile.name).toBe('Alice');
			expect(wizardStore.data.emojis).toEqual([]);
			expect(wizardStore.currentStep).toBe(0);
		});

		it('reset clears daily data', () => {
			wizardStore.updateData('locations', ['Work']);
			wizardStore.updateData('activities', ['Meeting']);
			wizardStore.updateData('wins', ['Got promoted']);

			wizardStore.reset();

			expect(wizardStore.data.locations).toEqual([]);
			expect(wizardStore.data.activities).toEqual([]);
			expect(wizardStore.data.wins).toEqual(['']);
		});
	});

	describe('result view', () => {
		it('starts with isResultView false', () => {
			expect(wizardStore.isResultView).toBe(false);
		});

		it('setResultView updates the flag', () => {
			wizardStore.setResultView(true);
			expect(wizardStore.isResultView).toBe(true);

			wizardStore.setResultView(false);
			expect(wizardStore.isResultView).toBe(false);
		});

		it('reset clears isResultView', () => {
			wizardStore.setResultView(true);
			wizardStore.reset();
			expect(wizardStore.isResultView).toBe(false);
		});
	});
});

import { LIMITS, FIELD_LIMITS } from './limits';
import type { WizardData, UserProfile } from '$lib/stores/wizard.svelte';

export interface FieldError {
	field: string;
	message: string;
	code: 'TOO_LONG' | 'TOO_MANY_ITEMS' | 'SUSPICIOUS_CONTENT' | 'INVALID_FORMAT';
}

export interface ValidationResult {
	valid: boolean;
	errors: FieldError[];
}

// Email regex (same as currently used, but centralized)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pattern to detect potential script injection attempts
const SUSPICIOUS_PATTERN = /<script|javascript:|on\w+\s*=/i;

export function validateString(
	value: string,
	fieldName: string,
	maxLength?: number
): FieldError | null {
	if (!value) return null;

	const limit = maxLength ?? FIELD_LIMITS[fieldName] ?? LIMITS.SHORT_TEXT;

	if (value.length > limit) {
		return {
			field: fieldName,
			message: `Max ${limit} tecken tillåtna`,
			code: 'TOO_LONG'
		};
	}

	if (SUSPICIOUS_PATTERN.test(value)) {
		return {
			field: fieldName,
			message: 'Otillåtet innehåll',
			code: 'SUSPICIOUS_CONTENT'
		};
	}

	return null;
}

export function validateArray(
	items: string[],
	fieldName: string,
	itemLimit?: number
): FieldError | null {
	if (!items || items.length === 0) return null;

	if (items.length > LIMITS.MAX_ARRAY_SIZE) {
		return {
			field: fieldName,
			message: `Max ${LIMITS.MAX_ARRAY_SIZE} val tillåtna`,
			code: 'TOO_MANY_ITEMS'
		};
	}

	const limit = itemLimit ?? FIELD_LIMITS[fieldName] ?? LIMITS.TAG_ITEM;

	for (let i = 0; i < items.length; i++) {
		const error = validateString(items[i], `${fieldName}[${i}]`, limit);
		if (error) {
			return { ...error, field: fieldName };
		}
	}

	return null;
}

export function validateEmail(email: string): FieldError | null {
	if (!email) return null;

	if (email.length > LIMITS.EMAIL) {
		return {
			field: 'email',
			message: 'E-postadressen är för lång',
			code: 'TOO_LONG'
		};
	}

	if (!EMAIL_REGEX.test(email)) {
		return {
			field: 'email',
			message: 'Ogiltig e-postadress',
			code: 'INVALID_FORMAT'
		};
	}

	return null;
}

export function validateWizardData(data: WizardData): ValidationResult {
	const errors: FieldError[] = [];

	// Profile validation
	const profile = data.profile;
	if (profile) {
		const stringFields: (keyof UserProfile)[] = ['name', 'age', 'hometown', 'occupationDetail'];
		for (const field of stringFields) {
			const value = profile[field];
			if (typeof value === 'string') {
				const error = validateString(value, field);
				if (error) errors.push(error);
			}
		}

		// Profile arrays
		const arrayFields: (keyof UserProfile)[] = ['family', 'pets', 'interests'];
		for (const field of arrayFields) {
			const value = profile[field];
			if (Array.isArray(value)) {
				const error = validateArray(value as string[], field);
				if (error) errors.push(error);
			}
		}
	}

	// Step 3 arrays
	const step3Arrays: (keyof WizardData)[] = [
		'locations',
		'customLocations',
		'activities',
		'customActivities',
		'people'
	];
	for (const field of step3Arrays) {
		const value = data[field];
		if (Array.isArray(value)) {
			const error = validateArray(value as string[], field);
			if (error) errors.push(error);
		}
	}

	// Step 4 arrays (wins/frustrations)
	const step4Arrays: (keyof WizardData)[] = ['wins', 'frustrations'];
	for (const field of step4Arrays) {
		const value = data[field];
		if (Array.isArray(value)) {
			const error = validateArray(value as string[], field);
			if (error) errors.push(error);
		}
	}

	// Step 5 textareas
	const step5Fields: (keyof WizardData)[] = ['almostHappened', 'unnecessaryThing', 'wouldRedo'];
	for (const field of step5Fields) {
		const value = data[field];
		if (typeof value === 'string' && value) {
			const error = validateString(value, field);
			if (error) errors.push(error);
		}
	}

	// Step 6 arrays
	const step6Arrays: (keyof WizardData)[] = [
		'meals',
		'customMeals',
		'soundtracks',
		'customSoundtracks'
	];
	for (const field of step6Arrays) {
		const value = data[field];
		if (Array.isArray(value)) {
			const error = validateArray(value as string[], field);
			if (error) errors.push(error);
		}
	}

	// Step 7 textareas
	const step7Fields: (keyof WizardData)[] = ['memoryFor10Years', 'messageToFutureSelf'];
	for (const field of step7Fields) {
		const value = data[field];
		if (typeof value === 'string' && value) {
			const error = validateString(value, field);
			if (error) errors.push(error);
		}
	}

	// Emojis
	if (data.emojis && data.emojis.length > LIMITS.MAX_EMOJIS) {
		errors.push({
			field: 'emojis',
			message: `Max ${LIMITS.MAX_EMOJIS} emojis tillåtna`,
			code: 'TOO_MANY_ITEMS'
		});
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

export function validatePayloadSize(data: unknown): boolean {
	const size = new TextEncoder().encode(JSON.stringify(data)).length;
	return size <= LIMITS.MAX_PAYLOAD_BYTES;
}

import { describe, it, expect } from 'vitest';
import {
	validateString,
	validateArray,
	validateEmail,
	validatePayloadSize
} from './validators';
import { LIMITS } from './limits';

describe('validateString', () => {
	it('returns null for empty string', () => {
		expect(validateString('', 'name')).toBeNull();
	});

	it('returns null for valid string within limits', () => {
		expect(validateString('Hello', 'name')).toBeNull();
	});

	it('returns error when string exceeds limit', () => {
		const longString = 'a'.repeat(LIMITS.SHORT_TEXT + 1);
		const result = validateString(longString, 'name');
		expect(result).not.toBeNull();
		expect(result?.code).toBe('TOO_LONG');
	});

	it('detects script injection attempts', () => {
		const result = validateString('<script>alert("xss")</script>', 'name');
		expect(result).not.toBeNull();
		expect(result?.code).toBe('SUSPICIOUS_CONTENT');
	});

	it('detects javascript: protocol', () => {
		const result = validateString('javascript:alert(1)', 'name');
		expect(result).not.toBeNull();
		expect(result?.code).toBe('SUSPICIOUS_CONTENT');
	});

	it('detects event handler injection', () => {
		const result = validateString('text onclick=alert(1)', 'name');
		expect(result).not.toBeNull();
		expect(result?.code).toBe('SUSPICIOUS_CONTENT');
	});

	it('allows normal text with special characters', () => {
		expect(validateString('Café & Résumé', 'name')).toBeNull();
	});

	it('uses custom maxLength when provided', () => {
		const result = validateString('Hello', 'name', 3);
		expect(result).not.toBeNull();
		expect(result?.code).toBe('TOO_LONG');
	});
});

describe('validateArray', () => {
	it('returns null for empty array', () => {
		expect(validateArray([], 'locations')).toBeNull();
	});

	it('returns null for valid array', () => {
		expect(validateArray(['Home', 'Work'], 'locations')).toBeNull();
	});

	it('returns error when array exceeds max size', () => {
		const largeArray = Array(LIMITS.MAX_ARRAY_SIZE + 1).fill('item');
		const result = validateArray(largeArray, 'locations');
		expect(result).not.toBeNull();
		expect(result?.code).toBe('TOO_MANY_ITEMS');
	});

	it('validates individual items for suspicious content', () => {
		const result = validateArray(['normal', '<script>bad</script>'], 'locations');
		expect(result).not.toBeNull();
		expect(result?.code).toBe('SUSPICIOUS_CONTENT');
	});

	it('validates individual items length', () => {
		const longItem = 'a'.repeat(LIMITS.TAG_ITEM + 1);
		const result = validateArray([longItem], 'locations');
		expect(result).not.toBeNull();
		expect(result?.code).toBe('TOO_LONG');
	});
});

describe('validateEmail', () => {
	it('returns null for empty email', () => {
		expect(validateEmail('')).toBeNull();
	});

	it('returns null for valid email', () => {
		expect(validateEmail('test@example.com')).toBeNull();
	});

	it('returns error for invalid email format', () => {
		const result = validateEmail('not-an-email');
		expect(result).not.toBeNull();
		expect(result?.code).toBe('INVALID_FORMAT');
	});

	it('returns error for email without @', () => {
		const result = validateEmail('testexample.com');
		expect(result).not.toBeNull();
		expect(result?.code).toBe('INVALID_FORMAT');
	});

	it('returns error for email without domain', () => {
		const result = validateEmail('test@');
		expect(result).not.toBeNull();
		expect(result?.code).toBe('INVALID_FORMAT');
	});

	it('returns error for email exceeding length limit', () => {
		const longEmail = 'a'.repeat(250) + '@test.com';
		const result = validateEmail(longEmail);
		expect(result).not.toBeNull();
		expect(result?.code).toBe('TOO_LONG');
	});
});

describe('validatePayloadSize', () => {
	it('returns true for small payloads', () => {
		expect(validatePayloadSize({ name: 'test' })).toBe(true);
	});

	it('returns false for payloads exceeding limit', () => {
		const largePayload = { data: 'x'.repeat(LIMITS.MAX_PAYLOAD_BYTES + 1) };
		expect(validatePayloadSize(largePayload)).toBe(false);
	});

	it('handles nested objects', () => {
		const nested = {
			level1: {
				level2: {
					data: 'small'
				}
			}
		};
		expect(validatePayloadSize(nested)).toBe(true);
	});
});

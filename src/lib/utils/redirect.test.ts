import { describe, expect, it } from 'vitest';

import { getSameOriginRedirectPath } from './redirect';

describe('getSameOriginRedirectPath', () => {
	it('allows same-origin relative paths', () => {
		expect(getSameOriginRedirectPath('/journal?entry=123#share')).toBe('/journal?entry=123#share');
	});

	it('falls back for external redirect targets', () => {
		expect(getSameOriginRedirectPath('https://example.com')).toBe('/');
		expect(getSameOriginRedirectPath('//example.com')).toBe('/');
		expect(getSameOriginRedirectPath('/\\example.com')).toBe('/');
	});

	it('falls back for empty or malformed targets', () => {
		expect(getSameOriginRedirectPath(null)).toBe('/');
		expect(getSameOriginRedirectPath('')).toBe('/');
		expect(getSameOriginRedirectPath('/journal\nLocation: https://example.com')).toBe('/');
	});
});

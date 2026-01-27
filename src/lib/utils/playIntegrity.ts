import { Capacitor, registerPlugin } from '@capacitor/core';

interface PlayIntegrityPlugin {
	requestIntegrityToken(options: { nonce: string }): Promise<{ token: string }>;
	isAvailable(): Promise<{ available: boolean }>;
}

const PlayIntegrity = registerPlugin<PlayIntegrityPlugin>('PlayIntegrity');

/**
 * Generates a cryptographically secure nonce for Play Integrity requests.
 * The nonce should be unique per request and include server-side context.
 */
export function generateNonce(requestId?: string): string {
	const timestamp = Date.now().toString(36);
	const random = crypto.getRandomValues(new Uint8Array(16));
	const randomHex = Array.from(random)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	const base = `${timestamp}-${randomHex}`;

	if (requestId) {
		return btoa(`${base}-${requestId}`);
	}
	return btoa(base);
}

/**
 * Checks if Play Integrity is available (only on Android native app)
 */
export async function isPlayIntegrityAvailable(): Promise<boolean> {
	if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
		return false;
	}

	try {
		const result = await PlayIntegrity.isAvailable();
		return result.available;
	} catch {
		return false;
	}
}

/**
 * Requests a Play Integrity token with the given nonce.
 * Returns null if not available or if the request fails.
 */
export async function requestIntegrityToken(nonce: string): Promise<string | null> {
	if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
		return null;
	}

	try {
		const result = await PlayIntegrity.requestIntegrityToken({ nonce });
		return result.token;
	} catch (error) {
		console.error('Failed to request integrity token:', error);
		return null;
	}
}

/**
 * Cache for integrity verification result
 */
let integrityVerified: boolean | null = null;
let lastVerificationTime = 0;
const VERIFICATION_CACHE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Verifies app integrity with the server.
 * Caches the result for 5 minutes to avoid excessive API calls.
 */
export async function verifyAppIntegrity(apiBaseUrl: string): Promise<boolean> {
	// Return cached result if still valid
	const now = Date.now();
	if (integrityVerified !== null && now - lastVerificationTime < VERIFICATION_CACHE_MS) {
		return integrityVerified;
	}

	// Skip verification on non-Android platforms
	if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
		return true;
	}

	try {
		const nonce = generateNonce();
		const token = await requestIntegrityToken(nonce);

		if (!token) {
			console.warn('Could not obtain integrity token');
			integrityVerified = false;
			lastVerificationTime = now;
			return false;
		}

		const response = await fetch(`${apiBaseUrl}/api/verify-integrity`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token, nonce })
		});

		if (!response.ok) {
			console.error('Integrity verification failed:', response.status);
			integrityVerified = false;
			lastVerificationTime = now;
			return false;
		}

		const result = await response.json();
		integrityVerified = result.verified === true;
		lastVerificationTime = now;
		return integrityVerified;
	} catch (error) {
		console.error('Error during integrity verification:', error);
		integrityVerified = false;
		lastVerificationTime = now;
		return false;
	}
}

/**
 * Clears the cached integrity verification result.
 * Call this when the user logs out or when you want to force re-verification.
 */
export function clearIntegrityCache(): void {
	integrityVerified = null;
	lastVerificationTime = 0;
}

/**
 * Gets an integrity token for including in API requests.
 * Returns the token and nonce, or null if not available.
 */
export async function getIntegrityTokenForRequest(
	requestId: string
): Promise<{ token: string; nonce: string } | null> {
	if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
		return null;
	}

	try {
		const nonce = generateNonce(requestId);
		const token = await requestIntegrityToken(nonce);

		if (!token) {
			return null;
		}

		return { token, nonce };
	} catch (error) {
		console.error('Failed to get integrity token for request:', error);
		return null;
	}
}

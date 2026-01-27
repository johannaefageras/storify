import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from '$lib/config';
import {
	verifyAppIntegrity,
	getIntegrityTokenForRequest,
	clearIntegrityCache
} from '$lib/utils/playIntegrity';

interface IntegrityState {
	checked: boolean;
	verified: boolean;
	checking: boolean;
	error: string | null;
}

function createIntegrityStore() {
	let state = $state<IntegrityState>({
		checked: false,
		verified: false,
		checking: false,
		error: null
	});

	return {
		get checked() {
			return state.checked;
		},
		get verified() {
			return state.verified;
		},
		get checking() {
			return state.checking;
		},
		get error() {
			return state.error;
		},

		/**
		 * Check if the current platform requires integrity verification.
		 * Only Android native apps require verification.
		 */
		requiresVerification(): boolean {
			return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
		},

		/**
		 * Verify app integrity on startup.
		 * This should be called from the root layout's onMount.
		 */
		async init(): Promise<boolean> {
			// Skip verification on non-Android platforms
			if (!this.requiresVerification()) {
				state = {
					checked: true,
					verified: true,
					checking: false,
					error: null
				};
				return true;
			}

			state.checking = true;
			state.error = null;

			try {
				const verified = await verifyAppIntegrity(API_BASE_URL);
				state = {
					checked: true,
					verified,
					checking: false,
					error: verified ? null : 'Integrity verification failed'
				};
				return verified;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				state = {
					checked: true,
					verified: false,
					checking: false,
					error: errorMessage
				};
				return false;
			}
		},

		/**
		 * Force a re-verification of app integrity.
		 * Clears the cache and performs a fresh check.
		 */
		async recheck(): Promise<boolean> {
			clearIntegrityCache();
			return this.init();
		},

		/**
		 * Get an integrity token for an API request.
		 * Returns null if not on Android or if token generation fails.
		 */
		async getTokenForRequest(requestId: string) {
			if (!this.requiresVerification()) {
				return null;
			}
			return getIntegrityTokenForRequest(requestId);
		},

		/**
		 * Reset the store state (useful for testing or logout)
		 */
		reset() {
			clearIntegrityCache();
			state = {
				checked: false,
				verified: false,
				checking: false,
				error: null
			};
		}
	};
}

export const integrityStore = createIntegrityStore();

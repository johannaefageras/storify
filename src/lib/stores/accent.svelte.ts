import { browser } from '$app/environment';
import { Preferences } from '@capacitor/preferences';
import { supabase } from '$lib/supabase/client';
import { authStore } from '$lib/stores/auth.svelte';

export type Accent = 'pink' | 'purple' | 'amber' | 'blue';

export const ACCENTS: { id: Accent; color: string }[] = [
	{ id: 'pink', color: '#f43f7a' },
	{ id: 'purple', color: '#8B3FC4' },
	{ id: 'amber', color: '#E8862F' },
	{ id: 'blue', color: '#2B8DB8' }
];

const ACCENT_STORAGE_KEY = 'accent';

function isValidAccent(value: string | null): value is Accent {
	return value === 'pink' || value === 'purple' || value === 'amber' || value === 'blue';
}

function createAccentStore() {
	let accent = $state<Accent>('pink');

	async function init() {
		if (!browser) return;

		try {
			const { value } = await Preferences.get({ key: ACCENT_STORAGE_KEY });
			if (isValidAccent(value)) {
				accent = value;
			}
		} catch {
			// Default to pink
		}
		applyAccent();
	}

	async function syncWithAuth() {
		if (!browser || !authStore.isLoggedIn || !authStore.user) return;

		try {
			const { data } = await supabase
				.from('profiles')
				.select('accent')
				.eq('id', authStore.user.id)
				.single();

			if (data && isValidAccent(data.accent)) {
				accent = data.accent;
				applyAccent();
			}
		} catch {
			// Keep local value
		}
	}

	function applyAccent() {
		if (!browser) return;
		if (accent === 'pink') {
			document.documentElement.removeAttribute('data-accent');
		} else {
			document.documentElement.setAttribute('data-accent', accent);
		}
	}

	async function saveAccent() {
		if (!browser) return;
		try {
			await Preferences.set({ key: ACCENT_STORAGE_KEY, value: accent });
		} catch (e) {
			console.error('Failed to save accent to Preferences:', e);
		}

		if (authStore.isLoggedIn && authStore.user) {
			try {
				await supabase
					.from('profiles')
					.update({ accent })
					.eq('id', authStore.user.id);
			} catch {
				// Local save already succeeded
			}
		}
	}

	function set(newAccent: Accent) {
		accent = newAccent;
		void saveAccent();
		applyAccent();
	}

	return {
		get current() {
			return accent;
		},
		init,
		syncWithAuth,
		set
	};
}

export const accentStore = createAccentStore();

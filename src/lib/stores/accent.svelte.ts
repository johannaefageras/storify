import { browser } from '$app/environment';
import { supabase } from '$lib/supabase/client';
import { authStore } from '$lib/stores/auth.svelte';

export type Accent = 'pink' | 'amber' | 'blue' | 'lime' | 'red';

export const ACCENTS: { id: Accent; color: string }[] = [
	{ id: 'pink', color: '#f43f7a' },
	{ id: 'amber', color: '#E8862F' },
	{ id: 'blue', color: '#2B8DB8' },
	{ id: 'lime', color: '#7cb342' },
	{ id: 'red', color: '#e52020' }
];

const ACCENT_STORAGE_KEY = 'accent';

function isValidAccent(value: string | null): value is Accent {
	return value === 'pink' || value === 'amber' || value === 'blue' || value === 'lime' || value === 'red';
}

function createAccentStore() {
	let accent = $state<Accent>('pink');

	async function init() {
		if (!browser) return;

		const value = localStorage.getItem(ACCENT_STORAGE_KEY);
		if (isValidAccent(value)) {
			accent = value;
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
		localStorage.setItem(ACCENT_STORAGE_KEY, accent);

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

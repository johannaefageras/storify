import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function createThemeStore() {
	let theme = $state<Theme>('light');

	async function init() {
		if (!browser) return;

		const value = localStorage.getItem(THEME_STORAGE_KEY);
		if (value === 'light' || value === 'dark') {
			theme = value;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = 'dark';
		}
		applyTheme();
	}

	function applyTheme() {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', theme);
	}

	async function saveTheme() {
		if (!browser) return;
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}

	function toggle() {
		theme = theme === 'light' ? 'dark' : 'light';
		void saveTheme();
		applyTheme();
	}

	function set(newTheme: Theme) {
		theme = newTheme;
		void saveTheme();
		applyTheme();
	}

	return {
		get current() {
			return theme;
		},
		init,
		toggle,
		set
	};
}

export const themeStore = createThemeStore();

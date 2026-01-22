import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function createThemeStore() {
	let theme = $state<Theme>('light');

	function init() {
		if (!browser) return;

		const stored = localStorage.getItem('theme') as Theme | null;
		if (stored === 'light' || stored === 'dark') {
			theme = stored;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = 'dark';
		}
		applyTheme();
	}

	function applyTheme() {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', theme);
	}

	function toggle() {
		theme = theme === 'light' ? 'dark' : 'light';
		if (browser) {
			localStorage.setItem('theme', theme);
		}
		applyTheme();
	}

	function set(newTheme: Theme) {
		theme = newTheme;
		if (browser) {
			localStorage.setItem('theme', theme);
		}
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

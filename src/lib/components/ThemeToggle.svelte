<script lang="ts">
	import { themeStore } from '$lib/stores/theme.svelte';

	export let variant: 'fixed' | 'inline' = 'fixed';
</script>

<button
	class="theme-toggle"
	class:inline={variant === 'inline'}
	class:dark={themeStore.current === 'dark'}
	onclick={() => themeStore.toggle()}
	aria-label={themeStore.current === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
	title={themeStore.current === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
>
	<span class="toggle-track">
		<span class="toggle-thumb"></span>
	</span>
</button>

<style>
	.theme-toggle {
		position: fixed;
		top: calc(env(safe-area-inset-top, 0px) + 1.25rem);
		right: calc(env(safe-area-inset-right, 0px) + 1.25rem);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			transform 0.1s ease;
	}

	.theme-toggle:hover {
		background-color: var(--color-neutral);
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}

	.theme-toggle.inline {
		position: static;
		top: auto;
		right: auto;
	}

	.toggle-track {
		display: block;
		width: 2.25rem;
		height: 1.25rem;
		background-color: var(--color-neutral);
		border-radius: 999px;
		position: relative;
		transition: background-color 0.2s ease;
	}

	.theme-toggle.dark .toggle-track {
		background-color: var(--color-accent);
	}

	.toggle-thumb {
		position: absolute;
		top: 0.125rem;
		left: 0.125rem;
		width: 1rem;
		height: 1rem;
		background-color: var(--color-bg-elevated);
		border-radius: 50%;
		transition: transform 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}

	.theme-toggle.dark .toggle-thumb {
		transform: translateX(1rem);
	}
</style>

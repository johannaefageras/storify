<script lang="ts">
	import { goto } from '$app/navigation';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import EmojiAppRosePinkLight from '$lib/components/emojis/EmojiAppRosePinkLight.svelte';
	import EmojiAppRosePinkDark from '$lib/components/emojis/EmojiAppRosePinkDark.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let showTooltip = $state(false);

	function startWizard() {
		goto('/wizard');
	}

	async function resetCache() {
		await wizardStore.clearAll();
		showTooltip = true;
		setTimeout(() => {
			showTooltip = false;
		}, 2500);
	}
</script>

<main class="landing">
	<div class="landing-header">
		<ThemeToggle variant="inline" />
	</div>
	<div class="container">
		<header class="hero">
			<div class="logo">
				{#if themeStore.current === 'dark'}
					<EmojiAppRosePinkDark size={120} />
				{:else}
					<EmojiAppRosePinkLight size={120} />
				{/if}
			</div>
			<h1 class="title">Storify</h1>
			<p class="subtitle">Du har inte tid att skriva dagbok. Perfekt – det behöver du inte heller.</p>
		</header>

		<div class="action">
			<button class="btn btn-primary btn-large" onclick={startWizard}>
				Skönt, sätt igång!
			</button>
		</div>

		<footer class="tagline">
			<p>För alla dagböcker du köpt som aldrig skrivits i</p>
			<div class="reset-wrapper">
				<button class="reset-link" onclick={resetCache}>Rensa sparad data</button>
				{#if showTooltip}
					<span class="tooltip">Data rensad!</span>
				{/if}
			</div>
			<nav class="legal-links">
				<a href="/about">Om Storify</a>
				<span class="separator">·</span>
				<a href="/contact">Kontakta oss</a>
				<span class="separator">·</span>
				<a href="/privacy">Integritetspolicy</a>
				<span class="separator">·</span>
				<a href="/cookies">Cookiepolicy</a>
				<span class="separator">·</span>
				<a href="/terms">Användarvillkor</a>
			</nav>
		</footer>
	</div>
</main>

<style>
	.landing-header {
		position: absolute;
		top: calc(env(safe-area-inset-top, 0px) + 1.25rem);
		right: calc(env(safe-area-inset-right, 0px) + 1.25rem);
		display: none;
	}

	@media (max-width: 600px) {
		.landing-header {
			display: block;
		}

		:global(.theme-toggle:not(.inline)) {
			display: none;
		}
	}

	.landing {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		padding-bottom: 0;
	}

	.container {
		flex: 1;
		display: flex;
		flex-direction: column;
		text-align: center;
		max-width: 520px;
		width: 100%;
	}

	.hero {
		margin-top: auto;
		margin-bottom: 3rem;
	}

	.logo {
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

	.title {
		font-family: var(--font-primary);
		font-size: var(--text-4xl);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		margin-bottom: 1.25rem;
		color: var(--color-text);
	}

	.subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		font-stretch: 100%;
		letter-spacing: var(--tracking-wide);
	}

	.action {
		margin-bottom: 3rem;
	}

	.tagline {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1.5rem;
		font-family: var(--font-primary);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 115%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
	}

	.tagline p {
		margin-bottom: 1.5rem;
	}

	.reset-wrapper {
		position: relative;
		display: inline-block;
		margin-top: 3rem;
	}

	.reset-link {
		background: none;
		border: none;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		opacity: 0.5;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: opacity 0.2s ease;
	}

	.reset-link:hover {
		opacity: 1;
	}

	.legal-links {
		margin-top: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		text-transform: none;
		letter-spacing: var(--tracking-normal);
		font-weight: var(--weight-book);
	}

	.legal-links a {
		color: var(--color-text-muted);
		opacity: 0.5;
		font-size: var(--text-xs);
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.legal-links a:hover {
		opacity: 1;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.legal-links .separator {
		color: var(--color-text-muted);
		opacity: 0.3;
		font-size: var(--text-xs);
	}

	.tooltip {
		position: absolute;
		bottom: calc(100% + 0.5rem);
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-text);
		color: var(--color-bg);
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-normal);
		text-transform: none;
		padding: 0.4rem 0.75rem;
		border-radius: 0.375rem;
		white-space: nowrap;
		animation: tooltip-in 0.2s ease, tooltip-out 0.3s ease 2.2s forwards;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: var(--color-text);
	}

	@keyframes tooltip-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	@keyframes tooltip-out {
		from {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
		to {
			opacity: 0;
			transform: translateX(-50%) translateY(4px);
		}
	}

	@media (min-width: 640px) {
		.title {
			font-size: 3.5rem;
			font-stretch: 120%;
		}

		.subtitle {
			font-size: var(--text-xl);
		}
	}
</style>

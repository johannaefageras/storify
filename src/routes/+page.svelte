<script lang="ts">
	import { goto } from '$app/navigation';
	import { themeStore } from '$lib/stores/theme.svelte';
	import EmojiAppRosePinkLight from '$lib/components/emojis/EmojiAppRosePinkLight.svelte';
	import EmojiAppRosePinkDark from '$lib/components/emojis/EmojiAppRosePinkDark.svelte';

	function startWizard() {
		goto('/wizard');
	}
</script>

<main class="landing">
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
			<p>För alla dagböcker du köpt men aldrig skrivit i.</p>
		</footer>
	</div>
</main>

<style>
	.landing {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.container {
		text-align: center;
		max-width: 520px;
	}

	.hero {
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
		margin-bottom: 4rem;
	}

	.tagline {
		font-family: var(--font-primary);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 115%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
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

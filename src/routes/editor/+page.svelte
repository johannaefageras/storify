<script lang="ts">
	import { EmojiFountainPen } from '$lib/assets/emojis';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import IconArrowLeft from '$lib/assets/icons/IconArrowLeft.svelte';
</script>

<main class="placeholder-page">
	<div class="placeholder-content">
		<div class="placeholder-icon">
			<EmojiFountainPen size={72} />
		</div>
		<h1 class="placeholder-title">Fri skrivning</h1>
		<p class="placeholder-description">
			Snart kan du skriva fritt i en textredigerare och låta AI förädla din text till ett
			dagboksinlägg.
		</p>
		<p class="placeholder-status">Kommer snart</p>
		<a href="/" class="btn btn-secondary">
			<IconArrowLeft size={16} /> Tillbaka
		</a>
	</div>
	<LegalFooter />
</main>

<style>
	.placeholder-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 520px;
		margin: 0 auto;
		padding: 2rem 1.25rem;
	}

	.placeholder-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 0.75rem;
	}

	.placeholder-icon {
		opacity: 0.8;
		margin-bottom: 0.5rem;
	}

	.placeholder-title {
		font-family: var(--font-primary);
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin: 0;
	}

	.placeholder-description {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		max-width: 320px;
		margin: 0;
	}

	.placeholder-status {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-accent);
		margin: 0.5rem 0 1rem;
	}
</style>

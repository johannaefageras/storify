<script lang="ts">
	import { fontStore, FONTS } from '$lib/stores/font.svelte';
</script>

<div class="font-picker" role="group" aria-label="Typsnitt">
	{#each FONTS as { id, label, family }}
		<button
			class="font-swatch"
			class:recursive={id === 'recursive'}
			class:fraunces={id === 'fraunces'}
			class:active={fontStore.current === id}
			style="font-family: {family};"
			onclick={() => fontStore.set(id)}
			aria-label="Byt till {label}"
			aria-pressed={fontStore.current === id}
			title={label}
		>
			Aa
		</button>
	{/each}
</div>

<style>
	.font-picker {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}

	.font-swatch {
		display: grid;
		place-items: center;
		min-width: 2rem;
		height: 1.75rem;
		padding: 0 0.4rem;
		font-size: 0.95rem;
		font-weight: 500;
		line-height: 1;
		color: var(--color-text-muted);
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease,
			transform 0.1s ease;
	}

	.font-swatch:hover {
		background-color: var(--color-neutral);
		color: var(--color-text);
	}

	.font-swatch:active {
		transform: scale(0.95);
	}

	.font-swatch.active {
		color: var(--color-bg-elevated);
		background-color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.font-swatch.recursive {
		font-variation-settings:
			'MONO' 0,
			'CASL' 1,
			'CRSV' 1,
			'slnt' 0;
	}

	.font-swatch.fraunces {
		font-variation-settings:
			'opsz' 32,
			'SOFT' 100,
			'WONK' 0;
	}
</style>

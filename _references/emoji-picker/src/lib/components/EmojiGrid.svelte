<script lang="ts">
	import type { Emoji } from '../types.js';

	interface Props {
		emojis: Emoji[];
		selectedIds: Set<string>;
		onToggle: (id: string) => void;
	}

	let { emojis, selectedIds, onToggle }: Props = $props();
</script>

<div class="grid">
	{#each emojis as emoji (emoji.id)}
		<button
			class="cell"
			class:selected={selectedIds.has(emoji.id)}
			onclick={() => onToggle(emoji.id)}
			title={emoji.name}
		>
			{@html emoji.svg}
		</button>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 0.5rem;
		padding: 0.75rem;
	}

	@media (max-width: 640px) {
		.grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	.cell {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-elevated);
		cursor: pointer;
		padding: 0.4rem;
		transition:
			border-color 0.15s,
			background-color 0.15s,
			box-shadow 0.15s;
	}

	.cell:hover {
		background: var(--color-neutral-hover);
	}

	.cell.selected {
		border-color: var(--color-accent);
		background: var(--color-neutral);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	.cell :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>

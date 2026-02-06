<script lang="ts">
	import type { EmojiCategory } from '../types.js';

	interface Props {
		categories: EmojiCategory[];
		activeIndex: number;
		onSelect: (index: number) => void;
	}

	let { categories, activeIndex, onSelect }: Props = $props();
</script>

<div class="tabs" role="tablist">
	{#each categories as category, i (category.name)}
		<button
			class="tab"
			class:active={activeIndex === i}
			role="tab"
			aria-selected={activeIndex === i}
			onclick={() => onSelect(i)}
		>
			<span class="tab-icon">{@html category.icon}</span>
			<span class="tab-label">{category.name}</span>
		</button>
	{/each}
</div>

<style>
	.tabs {
		display: flex;
		gap: 0.125rem;
		border-bottom: 1px solid var(--color-border);
		padding: 0 0.5rem;
		overflow-x: auto;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		white-space: nowrap;
		border-bottom: 2px solid transparent;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab.active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}

	.tab-icon {
		display: flex;
		align-items: center;
		width: 1.125rem;
		height: 1.125rem;
	}

	.tab-icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.tab-label {
		display: block;
	}

	@media (max-width: 640px) {
		.tab-label {
			display: none;
		}

		.tab.active .tab-label {
			display: block;
		}
	}
</style>

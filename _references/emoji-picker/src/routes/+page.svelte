<script lang="ts">
	import { EmojiPicker } from '$lib/index.js';
	import type { Emoji } from '$lib/types.js';
	import { jomojiCategories } from './jomojis.js';

	let selected: Emoji[] = $state([]);
</script>

<main>
	<h1>Emoji Picker</h1>

	<div class="picker-container">
		<EmojiPicker categories={jomojiCategories} bind:selected />
	</div>

	{#if selected.length > 0}
		<div class="selection-info">
			<h2>Selected ({selected.length})</h2>
			<div class="selected-list">
				{#each selected as emoji (emoji.id)}
					<span class="selected-emoji" title={emoji.name}>
						{@html emoji.svg}
					</span>
				{/each}
			</div>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 48rem;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		margin-bottom: 1rem;
	}

	.picker-container {
		margin-bottom: 2rem;
	}

	.selection-info {
		padding: 1rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	h2 {
		font-size: var(--text-base);
		margin: 0 0 0.75rem;
	}

	.selected-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.selected-emoji {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.selected-emoji :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>

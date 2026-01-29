<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { onMount, type Component } from 'svelte';
	import {
		emojiCategories,
		emojiMap,
		getRandomEmojis,
		type EmojiItem,
		type EmojiCategory
	} from '$lib/data/emojis';
	import EmojiRefresh from '$lib/components/icons/EmojiRefresh.svelte';

	const weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
	const months = [
		'januari',
		'februari',
		'mars',
		'april',
		'maj',
		'juni',
		'juli',
		'augusti',
		'september',
		'oktober',
		'november',
		'december'
	];

	const EMOJIS_PER_CATEGORY = 12;

	// Generate random emoji selections for each category
	interface DisplayCategory {
		name: string;
		emojis: EmojiItem[];
	}

	// Build display categories ensuring selected emojis are always included
	function buildDisplayCategories(): DisplayCategory[] {
		const selectedIds = wizardStore.data.emojis;

		return emojiCategories.map((category) => {
			// Find which selected emojis belong to this category
			const selectedInCategory = category.emojis.filter((e) => selectedIds.includes(e.id));
			const selectedIdsInCategory = new Set(selectedInCategory.map((e) => e.id));

			// Get random emojis excluding already selected ones
			const availableForRandom = category.emojis.filter((e) => !selectedIdsInCategory.has(e.id));
			const randomCount = Math.max(0, EMOJIS_PER_CATEGORY - selectedInCategory.length);
			const randomEmojis = getRandomEmojis(availableForRandom, randomCount);

			// Combine: selected first, then random
			return {
				name: category.name,
				emojis: [...selectedInCategory, ...randomEmojis]
			};
		});
	}

	let displayCategories: DisplayCategory[] = $state(buildDisplayCategories());

	onMount(() => {
		const now = new Date();
		const weekday = weekdays[now.getDay()];
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		const date = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, kl ${hours}:${minutes}`;

		wizardStore.updateData('weekday', weekday);
		wizardStore.updateData('date', date);
	});

	function toggleEmoji(emojiId: string) {
		const current = wizardStore.data.emojis;
		if (current.includes(emojiId)) {
			wizardStore.updateData(
				'emojis',
				current.filter((e) => e !== emojiId)
			);
		} else if (current.length < 4) {
			wizardStore.updateData('emojis', [...current, emojiId]);
		}
	}

	function isSelected(emojiId: string): boolean {
		return wizardStore.data.emojis.includes(emojiId);
	}

	function getEmojiComponent(emojiId: string): Component | undefined {
		return emojiMap.get(emojiId);
	}

	function refreshCategory(categoryIndex: number) {
		const category = emojiCategories[categoryIndex];
		const selectedIds = wizardStore.data.emojis;

		// Find which selected emojis belong to this category
		const selectedInCategory = category.emojis.filter((e) => selectedIds.includes(e.id));
		const selectedIdsInCategory = new Set(selectedInCategory.map((e) => e.id));

		// Get new random emojis excluding already selected ones
		const availableForRandom = category.emojis.filter((e) => !selectedIdsInCategory.has(e.id));
		const randomCount = Math.max(0, EMOJIS_PER_CATEGORY - selectedInCategory.length);
		const randomEmojis = getRandomEmojis(availableForRandom, randomCount);

		// Update just this category
		displayCategories[categoryIndex] = {
			name: category.name,
			emojis: [...selectedInCategory, ...randomEmojis]
		};
	}
</script>

<div class="step-content">
	<p class="emoji-prompt">Välj 1-4 emojis som sammanfattar dagen. Ibland säger en bild mer än tusen ord...</p>

	<div class="date-display">
		<div class="date-info">
			<span class="weekday">{wizardStore.data.weekday}</span>
			<span class="date">{wizardStore.data.date}</span>
		</div>
		<div class="selected-emojis">
			{#each wizardStore.data.emojis as emojiId}
				{@const EmojiComponent = getEmojiComponent(emojiId)}
				<button class="selected-emoji" onclick={() => toggleEmoji(emojiId)}>
					{#if EmojiComponent}
						<EmojiComponent size={34} />
					{/if}
				</button>
			{/each}
			{#each Array(4 - wizardStore.data.emojis.length) as _}
				<div class="emoji-placeholder"></div>
			{/each}
		</div>
	</div>

	<div class="emoji-picker">
			{#each displayCategories as category, index}
				<div class="emoji-category">
					<div class="category-header">
						<span class="category-name">{category.name}</span>
						<button class="refresh-btn" onclick={() => refreshCategory(index)} aria-label="Ladda fler {category.name}">
							<EmojiRefresh size={14} color="var(--color-text)" />
						</button>
					</div>
					<div class="emoji-grid">
						{#each category.emojis as emoji}
							<button
								class="emoji-btn"
								class:selected={isSelected(emoji.id)}
								class:disabled={wizardStore.data.emojis.length >= 4 && !isSelected(emoji.id)}
								onclick={() => toggleEmoji(emoji.id)}
							>
								<emoji.component size={28} />
							</button>
						{/each}
					</div>
				</div>
			{/each}
	</div>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.date-display {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		background-color: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.date-info {
		display: flex;
		flex-direction: column;
	}

	.weekday {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
	}

	.date {
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin-top: 0.125rem;
	}

	.selected-emojis {
		display: flex;
		gap: 0.5rem;
	}

	.selected-emoji {
		width: 3.25rem;
		height: 3.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg);
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: transform 0.15s ease;
	}

	.selected-emoji:hover {
		transform: scale(1.05);
	}

	.emoji-placeholder {
		width: 3.25rem;
		height: 3.25rem;
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
	}

	.emoji-prompt {
		text-align: center;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}

	.emoji-picker {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.emoji-category {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.refresh-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.15s ease, transform 0.15s ease, background-color 0.15s ease;
	}

	.refresh-btn:hover {
		opacity: 1;
		transform: rotate(45deg);
	}

	.refresh-btn:active {
		opacity: 1;
		transform: rotate(180deg);
		background-color: var(--color-border);
	}

	.category-name {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 115%;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.emoji-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0.375rem;
	}

	.emoji-btn {
		width: 100%;
		aspect-ratio: 1;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition:
			transform 0.1s ease,
			border-color 0.1s ease,
			background-color 0.1s ease;
	}

	.emoji-btn :global(svg) {
		width: 1.75rem;
		height: 1.75rem;
		pointer-events: none;
	}

	.emoji-btn:hover:not(.disabled) {
		transform: scale(1.1);
		border-color: var(--color-accent);
	}

	.emoji-btn.selected {
		border: 2px solid var(--color-accent);
	}

	.emoji-btn.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	@media (max-width: 600px) {
		.date-display {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.selected-emojis {
			flex-wrap: wrap;
		}

		.refresh-btn {
			width: 2.5rem;
			height: 2.5rem;
		}
	}

	@media (max-width: 420px) {
		.emoji-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (min-width: 480px) {
		.emoji-grid {
			grid-template-columns: repeat(12, 1fr);
		}
	}
</style>

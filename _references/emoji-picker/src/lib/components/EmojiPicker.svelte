<script lang="ts">
	import type { Emoji, EmojiCategory } from '../types.js';
	import { shuffleAndPick } from '../utils.js';
	import CategoryTabs from './CategoryTabs.svelte';
	import EmojiGrid from './EmojiGrid.svelte';

	interface Props {
		categories: EmojiCategory[];
		count?: number;
		selected?: Emoji[];
	}

	let { categories, count = 84, selected = $bindable([]) }: Props = $props();

	let activeIndex = $state(0);
	let selectedIds = $state(new Set<string>());

	// Shuffle once on mount, cache per category so tab-switching doesn't re-shuffle
	let displayedEmojis: Map<number, Emoji[]> = $derived.by(() => {
		const map = new Map<number, Emoji[]>();
		for (let i = 0; i < categories.length; i++) {
			map.set(i, shuffleAndPick(categories[i].emojis, count));
		}
		return map;
	});

	let currentEmojis: Emoji[] = $derived(displayedEmojis.get(activeIndex) ?? []);

	// Build a lookup for all emojis across all categories
	let emojiLookup: Map<string, Emoji> = $derived.by(() => {
		const lookup = new Map<string, Emoji>();
		for (const cat of categories) {
			for (const emoji of cat.emojis) {
				lookup.set(emoji.id, emoji);
			}
		}
		return lookup;
	});

	function toggleEmoji(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedIds = next;
		selected = [...next].map((eid) => emojiLookup.get(eid)!).filter(Boolean);
	}
</script>

<div class="emoji-picker">
	<CategoryTabs {categories} {activeIndex} onSelect={(i) => (activeIndex = i)} />
	<EmojiGrid emojis={currentEmojis} {selectedIds} onToggle={toggleEmoji} />
</div>

<style>
	.emoji-picker {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--color-bg-elevated);
		width: 100%;
	}
</style>

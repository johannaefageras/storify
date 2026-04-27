<script lang="ts">
	import { tones } from '$lib/data/tones';
	import { accentStore, type Accent } from '$lib/stores/accent.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';
	import type { Snippet } from 'svelte';
	interface Props {
		currentToneId: string;
		isRegenerating?: boolean;
		onSelectTone: (toneId: string) => void;
		trigger?: Snippet<[{ toggle: (event: MouseEvent) => void; isOpen: boolean; isRegenerating: boolean; icon: string }]>;
	}

	let { currentToneId, isRegenerating = false, onSelectTone, trigger }: Props = $props();

	let isOpen = $state(false);

	const regenerateIcons: Record<Accent, string> = {
		pink: 'regenerate-pink',
		amber: 'regenerate-amber',
		blue: 'regenerate-blue',
		emerald: 'regenerate-emerald',
		purple: 'regenerate-purple',
		rust: 'regenerate-rust'
	};

	const toneIconMap: Record<string, string> = {
		'ai-robot': 'robot',
		'bored': 'face-yawning',
		'british': 'flag-uk',
		'bureaucratic': 'archive',
		'cat-perspective': 'cat',
		'chaotic': 'tornado',
		'classic': 'ledger',
		'cringe': 'face-rolling-eyes',
		'cynical': 'face-unamused',
		'drama-queen': 'crown',
		'formal': 'top-hat',
		'nature-documentary': 'earth',
		'nerd': 'face-nerd',
		'overthinker': 'face-exploding-head',
		'passive-aggressive': 'headstone',
		'philosophical': 'owl',
		'quest-log': 'video-game',
		'self-help': 'woman-meditating',
		'shakespeare': 'theater-masks',
		'sportscaster': 'studio-microphone',
		'storytelling': 'open-book',
		'tabloid': 'newspaper',
		'therapist': 'brain',
		'tinfoil-hat': 'satellite',
		'bro': 'shorts',
		'action-hero': 'collision',
		'influencer': 'loudspeaker',
		'six-year-old': 'teddy-bear'
	};

	const RegenerateIcon = $derived(regenerateIcons[accentStore.current] || 'regenerate-pink');

	function handleSelect(toneId: string) {
		isOpen = false;
		onSelectTone(toneId);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.tone-picker-wrapper')) {
			isOpen = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div class="tone-picker-wrapper">
	{#if trigger}
		{@render trigger({
			toggle: (e: MouseEvent) => { e.stopPropagation(); isOpen = !isOpen; },
			isOpen,
			isRegenerating,
			icon: RegenerateIcon
		})}
	{:else}
		<button
			class="regenerate-btn"
			onclick={(e) => { e.stopPropagation(); isOpen = !isOpen; }}
			disabled={isRegenerating}
			title="Byt röst och generera om"
			aria-expanded={isOpen}
			aria-haspopup="true"
			data-no-export
		>
			{#if isRegenerating}
				<span class="regenerate-spinner"></span>
			{:else}
				<Emoji name={RegenerateIcon} size={28} />
			{/if}
		</button>
	{/if}

	{#if isOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="tone-dropdown" role="listbox" tabindex="-1" aria-label="Välj ny ton" onclick={(e) => e.stopPropagation()}>
			<div class="dropdown-header">
				<span class="dropdown-title">Byt röst</span>
			</div>
			<div class="tone-grid">
				{#each tones as tone}
					{@const ToneIcon = toneIconMap[tone.id]}
					<button
						class="tone-option"
						class:tone-option--current={tone.id === currentToneId}
						onclick={() => handleSelect(tone.id)}
						disabled={tone.id === currentToneId}
						role="option"
						aria-selected={tone.id === currentToneId}
						title={tone.name}
					>
						{#if ToneIcon}
							<span class="tone-option-icon"><UniqueEmoji><Emoji name={ToneIcon} size={22} /></UniqueEmoji></span>
						{/if}
						<span class="tone-option-name">{tone.name}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.tone-picker-wrapper {
		position: relative;
		display: grid;
	}

	.regenerate-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		background: none;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: transform 0.2s ease, opacity 0.15s ease;
	}

	.regenerate-btn:hover:not(:disabled) {
		transform: scale(1.1);
	}

	.regenerate-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.regenerate-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.regenerate-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.tone-dropdown {
		position: absolute;
		bottom: calc(100% + 8px);
		right: 0;
		width: 280px;
		max-height: 360px;
		overflow-y: auto;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
		z-index: 10;
		animation: dropdownIn 0.15s ease;
	}

	@keyframes dropdownIn {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.dropdown-header {
		padding: 0.75rem 0.875rem 0.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.dropdown-title {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.tone-grid {
		display: flex;
		flex-direction: column;
		padding: 0.375rem;
	}

	.tone-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.625rem;
		background: none;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		text-align: left;
		transition: background-color 0.1s ease;
		width: 100%;
	}

	.tone-option:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
	}

	.tone-option--current {
		opacity: 0.4;
		cursor: default;
	}

	.tone-option-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.tone-option-name {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 640px) {
		.tone-dropdown {
			width: 240px;
			max-height: 300px;
		}
	}
</style>

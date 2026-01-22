<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import type { Component } from 'svelte';
	import EmojiSleep1 from '$lib/components/emojis/EmojiSleep1.svelte';
	import EmojiSleep2 from '$lib/components/emojis/EmojiSleep2.svelte';
	import EmojiSleep3 from '$lib/components/emojis/EmojiSleep3.svelte';
	import EmojiSleep4 from '$lib/components/emojis/EmojiSleep4.svelte';
	import EmojiSleep5 from '$lib/components/emojis/EmojiSleep5.svelte';
	import EmojiSleep6 from '$lib/components/emojis/EmojiSleep6.svelte';
	import EmojiSleep7 from '$lib/components/emojis/EmojiSleep7.svelte';
	import EmojiSleep8 from '$lib/components/emojis/EmojiSleep8.svelte';
	import EmojiSleep9 from '$lib/components/emojis/EmojiSleep9.svelte';
	import EmojiSleep10 from '$lib/components/emojis/EmojiSleep10.svelte';
	import EmojiEnergy1 from '$lib/components/emojis/EmojiEnergy1.svelte';
	import EmojiEnergy2 from '$lib/components/emojis/EmojiEnergy2.svelte';
	import EmojiEnergy3 from '$lib/components/emojis/EmojiEnergy3.svelte';
	import EmojiEnergy4 from '$lib/components/emojis/EmojiEnergy4.svelte';
	import EmojiEnergy5 from '$lib/components/emojis/EmojiEnergy5.svelte';
	import EmojiEnergy6 from '$lib/components/emojis/EmojiEnergy6.svelte';
	import EmojiEnergy7 from '$lib/components/emojis/EmojiEnergy7.svelte';
	import EmojiEnergy8 from '$lib/components/emojis/EmojiEnergy8.svelte';
	import EmojiEnergy9 from '$lib/components/emojis/EmojiEnergy9.svelte';
	import EmojiEnergy10 from '$lib/components/emojis/EmojiEnergy10.svelte';
	import EmojiMood1 from '$lib/components/emojis/EmojiMood1.svelte';
	import EmojiMood2 from '$lib/components/emojis/EmojiMood2.svelte';
	import EmojiMood3 from '$lib/components/emojis/EmojiMood3.svelte';
	import EmojiMood4 from '$lib/components/emojis/EmojiMood4.svelte';
	import EmojiMood5 from '$lib/components/emojis/EmojiMood5.svelte';
	import EmojiMood6 from '$lib/components/emojis/EmojiMood6.svelte';
	import EmojiMood7 from '$lib/components/emojis/EmojiMood7.svelte';
	import EmojiMood8 from '$lib/components/emojis/EmojiMood8.svelte';
	import EmojiMood9 from '$lib/components/emojis/EmojiMood9.svelte';
	import EmojiMood10 from '$lib/components/emojis/EmojiMood10.svelte';

	const sleepEmojis: Component[] = [
		EmojiSleep1,
		EmojiSleep2,
		EmojiSleep3,
		EmojiSleep4,
		EmojiSleep5,
		EmojiSleep6,
		EmojiSleep7,
		EmojiSleep8,
		EmojiSleep9,
		EmojiSleep10
	];

	const energyEmojis: Component[] = [
		EmojiEnergy1,
		EmojiEnergy2,
		EmojiEnergy3,
		EmojiEnergy4,
		EmojiEnergy5,
		EmojiEnergy6,
		EmojiEnergy7,
		EmojiEnergy8,
		EmojiEnergy9,
		EmojiEnergy10
	];

	const moodEmojis: Component[] = [
		EmojiMood1,
		EmojiMood2,
		EmojiMood3,
		EmojiMood4,
		EmojiMood5,
		EmojiMood6,
		EmojiMood7,
		EmojiMood8,
		EmojiMood9,
		EmojiMood10
	];

	const sliders = [
		{
			key: 'sleepQuality' as const,
			label: 'Hur sov du inatt?',
			low: 'Inte alls',
			high: 'Utmärkt',
			emojis: sleepEmojis
		},
		{
			key: 'energyLevel' as const,
			label: 'Hur var dagens energinivå?',
			low: 'Omätbar',
			high: 'Maxad',
			emojis: energyEmojis
		},
		{
			key: 'mood' as const,
			label: 'Hur var humöret idag?',
			low: 'Botten',
			high: 'Toppen',
			emojis: moodEmojis
		}
	];

	function getEmojiComponent(emojis: Component[], value: number): Component {
		// value is 1-10, array is 0-indexed, round for smooth slider
		const index = Math.round(value) - 1;
		return emojis[Math.min(Math.max(index, 0), 9)];
	}
</script>

<div class="step-content">
	<p class="step-intro">Det finns inga rätt eller fel här. Bara hur det faktiskt kändes idag – i kroppen och i huvudet.</p>

	{#each sliders as slider}
		<div class="slider-group">
			<label class="slider-label" for={slider.key}>
				{slider.label}
			</label>

			<div class="slider-emoji">
				{#key wizardStore.data[slider.key]}
					{@const EmojiComponent = getEmojiComponent(slider.emojis, wizardStore.data[slider.key])}
					<EmojiComponent size={32} />
				{/key}
			</div>

			<div class="slider-container">
				<span class="slider-bound">{slider.low}</span>
				<input
					type="range"
					id={slider.key}
					min="1"
					max="10"
					step="0.01"
					bind:value={wizardStore.data[slider.key]}
					class="slider"
				/>
				<span class="slider-bound">{slider.high}</span>
			</div>
		</div>
	{/each}
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.step-intro {
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		margin-top: 0;
	}

	.slider-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.slider-label {
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.slider-emoji {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.slider-container {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.slider-bound {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-wider);
		color: var(--color-text-muted);
		min-width: 4rem;
	}

	.slider-bound:first-child {
		text-align: right;
	}

	.slider-bound:last-child {
		text-align: left;
	}

	.slider {
		flex: 1;
		-webkit-appearance: none;
		appearance: none;
		height: 6px;
		background: var(--color-neutral);
		border-radius: 3px;
		outline: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		background: var(--color-accent);
		border-radius: 50%;
		cursor: pointer;
		transition: transform 0.1s ease;
	}

	.slider::-webkit-slider-thumb:hover {
		transform: scale(1.15);
	}

	.slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: var(--color-accent);
		border: none;
		border-radius: 50%;
		cursor: pointer;
	}

	@media (max-width: 560px) {
		.slider-container {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}

		.slider-bound {
			min-width: 0;
			text-align: center;
		}
	}
</style>

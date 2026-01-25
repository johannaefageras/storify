<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import {
	EmojiShortcake,
	EmojiHeadphones
} from '$lib/components/emojis/assorted';
	import { FIELD_LIMITS } from '$lib/validation';

	const mealOptions = ['Frukost', 'Lunch', 'Middag', 'Fika', 'För lite', 'För mycket', 'Oregelbundet', 'Skräp'];
	const soundtrackOptions = ['Spotify', 'Tystnaden', 'Samma låt på repeat', 'Tinnitus', 'Grannarnas renovering'];

	let customMealInput = $state('');
	let customSoundtrackInput = $state('');

	function toggleMeal(meal: string) {
		const current = wizardStore.data.meals;
		if (current.includes(meal)) {
			wizardStore.updateData(
				'meals',
				current.filter((m) => m !== meal)
			);
		} else {
			wizardStore.updateData('meals', [...current, meal]);
		}
	}

	function addCustomMeal() {
		if (customMealInput.trim()) {
			wizardStore.updateData('customMeals', [
				...wizardStore.data.customMeals,
				customMealInput.trim()
			]);
			customMealInput = '';
		}
	}

	function removeCustomMeal(meal: string) {
		wizardStore.updateData(
			'customMeals',
			wizardStore.data.customMeals.filter((m) => m !== meal)
		);
	}

	function toggleSoundtrack(option: string) {
		const current = wizardStore.data.soundtracks;
		if (current.includes(option)) {
			wizardStore.updateData(
				'soundtracks',
				current.filter((s) => s !== option)
			);
		} else {
			wizardStore.updateData('soundtracks', [...current, option]);
		}
	}

	function addCustomSoundtrack() {
		if (customSoundtrackInput.trim()) {
			wizardStore.updateData('customSoundtracks', [
				...wizardStore.data.customSoundtracks,
				customSoundtrackInput.trim()
			]);
			customSoundtrackInput = '';
		}
	}

	function removeCustomSoundtrack(soundtrack: string) {
		wizardStore.updateData(
			'customSoundtracks',
			wizardStore.data.customSoundtracks.filter((s) => s !== soundtrack)
		);
	}

	function handleKeydown(event: KeyboardEvent, action: () => void) {
		if (event.key === 'Enter') {
			event.preventDefault();
			action();
		}
	}
</script>

<div class="step-content">
	<p class="step-intro">Vad åt du? Vad lyssnade du på? Det är de små detaljerna som gör att man minns hur dagen faktiskt kändes.</p>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiShortcake size={23} /></span>
			Vad åt du idag?
		</span>
		<div class="pill-cloud">
			{#each mealOptions as meal}
				<button
					class="pill"
					class:selected={wizardStore.data.meals.includes(meal)}
					onclick={() => toggleMeal(meal)}
				>
					{meal}
					{#if wizardStore.data.meals.includes(meal)}
						<span class="remove">×</span>
					{/if}
				</button>
			{/each}
			{#each wizardStore.data.customMeals as meal}
				<button class="pill selected custom" onclick={() => removeCustomMeal(meal)}>
					{meal} <span class="remove">×</span>
				</button>
			{/each}
		</div>
		<div class="add-custom">
			<input
				type="text"
				placeholder="Det där man äter stående vid diskbänken, femte koppen kaffe..."
				bind:value={customMealInput}
				onkeydown={(e) => handleKeydown(e, addCustomMeal)}
				maxlength={FIELD_LIMITS.customMeals}
			/>
			<button class="add-btn" onclick={addCustomMeal} disabled={!customMealInput.trim()}>+</button>
		</div>
	</div>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiHeadphones size={23} /></span>
			Dagens soundtrack?
		</span>
		<div class="pill-cloud">
			{#each soundtrackOptions as option}
				<button
					class="pill"
					class:selected={wizardStore.data.soundtracks.includes(option)}
					onclick={() => toggleSoundtrack(option)}
				>
					{option}
					{#if wizardStore.data.soundtracks.includes(option)}
						<span class="remove">×</span>
					{/if}
				</button>
			{/each}
			{#each wizardStore.data.customSoundtracks as soundtrack}
				<button class="pill selected custom" onclick={() => removeCustomSoundtrack(soundtrack)}>
					{soundtrack} <span class="remove">×</span>
				</button>
			{/each}
		</div>
		<div class="add-custom">
			<input
				type="text"
				placeholder="Den där låten TikTok förstört, regnet mot fönstret..."
				bind:value={customSoundtrackInput}
				onkeydown={(e) => handleKeydown(e, addCustomSoundtrack)}
				maxlength={FIELD_LIMITS.customSoundtracks}
			/>
			<button class="add-btn" onclick={addCustomSoundtrack} disabled={!customSoundtrackInput.trim()}>+</button>
		</div>
	</div>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
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

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-label {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.label-emoji {
		display: flex;
		align-items: center;
	}

	.pill-cloud {
		display: flex;
		flex-wrap: wrap;
		gap: 0.325rem;
	}

	.pill {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-news);
		letter-spacing: var(--tracking-wide);
		padding: 0.25rem 0.5rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
		color: var(--color-text);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease;
	}

	.pill:hover {
		border-color: var(--color-accent);
	}

	.pill.selected {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background-color: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}

	.pill .remove {
		font-size: 0.875rem;
		line-height: 1;
		opacity: 0.8;
		transition: opacity 0.15s ease;
	}

	.pill:hover .remove {
		opacity: 1;
	}

	.add-custom {
		display: flex;
		gap: 0.5rem;
	}

	.add-custom input {
		flex: 1;
		padding: 0.75rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-normal);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-elevated);
		outline: none;
		transition: border-color 0.15s ease;
	}

	.add-custom input:focus {
		border-color: var(--color-accent);
	}

	.add-custom input::placeholder {
		color: var(--color-text-muted);
		font-weight: var(--weight-light);
		letter-spacing: var(--tracking-wider);
	}

	.add-btn {
		width: 2.5rem;
		font-family: var(--font-primary);
		font-size: 1.25rem;
		font-weight: var(--weight-medium);
		background-color: var(--color-accent);
		color: white;
		border-radius: var(--radius-sm);
		transition:
			background-color 0.15s ease,
			opacity 0.15s ease;
	}

	.add-btn:hover:not(:disabled) {
		background-color: var(--color-accent-hover);
	}

	.add-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	@media (max-width: 480px) {
		.add-custom {
			flex-direction: column;
		}

		.add-btn {
			width: 100%;
		}
	}
</style>

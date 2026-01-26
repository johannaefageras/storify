<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import {
		EmojiShortcake,
		EmojiHeadphones
	} from '$lib/components/emojis/assorted';
	import { FIELD_LIMITS } from '$lib/validation';

	let mealInput = $state('');
	let soundtrackInput = $state('');

	function addMeal() {
		const value = mealInput.trim();
		if (!value || wizardStore.data.customMeals.includes(value)) {
			mealInput = '';
			return;
		}
		wizardStore.updateData('customMeals', [...wizardStore.data.customMeals, value]);
		mealInput = '';
	}

	function removeMeal(meal: string) {
		wizardStore.updateData(
			'customMeals',
			wizardStore.data.customMeals.filter((m) => m !== meal)
		);
	}

	function addSoundtrack() {
		const value = soundtrackInput.trim();
		if (!value || wizardStore.data.customSoundtracks.includes(value)) {
			soundtrackInput = '';
			return;
		}
		wizardStore.updateData('customSoundtracks', [...wizardStore.data.customSoundtracks, value]);
		soundtrackInput = '';
	}

	function removeSoundtrack(soundtrack: string) {
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

	function focusInput(event: MouseEvent) {
		const container = event.currentTarget as HTMLElement;
		const input = container.querySelector('input');
		if (input) input.focus();
	}
</script>

<div class="step-content">
	<p class="step-intro">Vad åt du? Vad lyssnade du på? Det är de små detaljerna som gör att man minns hur dagen faktiskt kändes.</p>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiShortcake size={23} /></span>
			Vad har du ätit idag?
		</span>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
			{#each wizardStore.data.customMeals as meal}
				<span class="tag">
					{meal}
					<button class="tag-remove" onclick={() => removeMeal(meal)}>×</button>
				</span>
			{/each}
			<input
				type="text"
				placeholder={wizardStore.data.customMeals.length === 0 ? 'Brunch på hotellet, fika med farmor, fem koppar kaffe...' : ''}
				bind:value={mealInput}
				onkeydown={(e) => handleKeydown(e, addMeal)}
				maxlength={FIELD_LIMITS.customMeals}
			/>
		</div>
	</div>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiHeadphones size={23} /></span>
			Vad var dagens soundtrack?
		</span>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
			{#each wizardStore.data.customSoundtracks as soundtrack}
				<span class="tag">
					{soundtrack}
					<button class="tag-remove" onclick={() => removeSoundtrack(soundtrack)}>×</button>
				</span>
			{/each}
			<input
				type="text"
				placeholder={wizardStore.data.customSoundtracks.length === 0 ? 'Samma låt på repeat, regnet, grannarnas renovering...' : ''}
				bind:value={soundtrackInput}
				onkeydown={(e) => handleKeydown(e, addSoundtrack)}
				maxlength={FIELD_LIMITS.customSoundtracks}
			/>
		</div>
	</div>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
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
		gap: 0.25rem;
	}

	.field-label {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.label-emoji {
		display: flex;
		align-items: center;
	}

	.tag-input {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		min-height: 2.75rem;
		padding: 0.375rem 0.625rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-elevated);
		cursor: text;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.tag-input:focus-within {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
	}

	.tag-input input {
		flex: 1;
		min-width: 60px;
		height: 1.75rem;
		padding: 0 0.25rem;
		border: none;
		background: transparent;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text);
	}

	.tag-input input:focus {
		border: none;
		outline: none;
		box-shadow: none;
	}

	.tag-input input::placeholder {
		color: var(--color-text-muted);
		font-weight: var(--weight-light);
		letter-spacing: var(--tracking-wider);
		opacity: 0.6;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		padding: 0.12rem 0.5rem;
		background-color: var(--color-accent);
		border-radius: 0.325rem;
		color: white;
		white-space: nowrap;
	}

	.tag-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 0.875rem;
		height: 0.875rem;
		font-size: 0.875rem;
		line-height: 1;
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		opacity: 0.8;
		transition: opacity 0.15s ease;
	}

	.tag-remove:hover {
		opacity: 1;
	}
</style>

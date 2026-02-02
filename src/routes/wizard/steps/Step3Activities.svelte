<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { EmojiPushpinRound, EmojiPushpin, EmojiHandWave } from '$lib/components/emojis';
	import RequiredIndicator from '$lib/components/RequiredIndicator.svelte';
	import { FIELD_LIMITS } from '$lib/validation';

	let locationInput = $state('');
	let activityInput = $state('');
	let personInput = $state('');

	function addLocation() {
		const value = locationInput.trim();
		if (!value || wizardStore.data.locations.includes(value)) {
			locationInput = '';
			return;
		}
		wizardStore.updateData('locations', [...wizardStore.data.locations, value]);
		locationInput = '';
	}

	function removeLocation(location: string) {
		wizardStore.updateData(
			'locations',
			wizardStore.data.locations.filter((l) => l !== location)
		);
	}

	function removeLastLocation() {
		const arr = wizardStore.data.locations;
		if (arr.length > 0) {
			wizardStore.updateData('locations', arr.slice(0, -1));
		}
	}

	function addActivity() {
		const value = activityInput.trim();
		if (!value || wizardStore.data.activities.includes(value)) {
			activityInput = '';
			return;
		}
		wizardStore.updateData('activities', [...wizardStore.data.activities, value]);
		activityInput = '';
	}

	function removeActivity(activity: string) {
		wizardStore.updateData(
			'activities',
			wizardStore.data.activities.filter((a) => a !== activity)
		);
	}

	function removeLastActivity() {
		const arr = wizardStore.data.activities;
		if (arr.length > 0) {
			wizardStore.updateData('activities', arr.slice(0, -1));
		}
	}

	function addPerson() {
		const value = personInput.trim();
		if (!value || wizardStore.data.people.includes(value)) {
			personInput = '';
			return;
		}
		wizardStore.updateData('people', [...wizardStore.data.people, value]);
		personInput = '';
	}

	function removePerson(person: string) {
		wizardStore.updateData(
			'people',
			wizardStore.data.people.filter((p) => p !== person)
		);
	}

	function removeLastPerson() {
		const arr = wizardStore.data.people;
		if (arr.length > 0) {
			wizardStore.updateData('people', arr.slice(0, -1));
		}
	}

	function handleKeydown(event: KeyboardEvent, action: () => void, removeLastAction?: () => void) {
		if (event.key === 'Enter') {
			event.preventDefault();
			action();
		} else if (event.key === 'Backspace' && removeLastAction) {
			const input = event.currentTarget as HTMLInputElement;
			if (input.value === '' || (input.selectionStart === 0 && input.selectionEnd === 0)) {
				event.preventDefault();
				removeLastAction();
			}
		}
	}

	function handleCommaInput(
		event: Event,
		inputSetter: (v: string) => void,
		action: () => void
	) {
		const input = event.currentTarget as HTMLInputElement;
		const value = input.value;
		if (value.includes(',')) {
			const parts = value.split(',');
			const beforeComma = parts[0];
			const afterComma = parts.slice(1).join(',').trimStart();

			// Must set input.value directly so Svelte's bind:value reads the correct value
			input.value = beforeComma;
			inputSetter(beforeComma);
			action();

			input.value = afterComma;
			inputSetter(afterComma);
		}
	}

	function focusInput(event: MouseEvent) {
		const container = event.currentTarget as HTMLElement;
		const input = container.querySelector('input');
		if (input) input.focus();
	}
</script>

<div class="step-content">
	<p class="step-intro">Var utspelade sig dagen? Vad hände? Vilka var med? Fyll i det du minns – stora som små detaljer.</p>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiPushpinRound size={23} /></span>
			<span>Var har du varit idag?<RequiredIndicator tooltip="Lägg till minst en plats" /></span>
		</span>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
			{#each wizardStore.data.locations as location}
				<span class="tag">
					{location}
					<button class="tag-remove" onclick={() => removeLocation(location)}>×</button>
				</span>
			{/each}
			<input
				type="text"
				placeholder={wizardStore.data.locations.length === 0 ? 'I köket, vid samma skolbänk som vanligt, i sängen...' : ''}
				bind:value={locationInput}
				onkeydown={(e) => handleKeydown(e, addLocation, removeLastLocation)}
				oninput={(e) => handleCommaInput(e, (v) => locationInput = v, addLocation)}
				onblur={addLocation}
				maxlength={FIELD_LIMITS.locations}
			/>
		</div>
	</div>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiPushpin size={23} /></span>
			<span>Vad hände idag?<RequiredIndicator tooltip="Lägg till minst en händelse" /></span>
		</span>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
			{#each wizardStore.data.activities as activity}
				<span class="tag">
					{activity}
					<button class="tag-remove" onclick={() => removeActivity(activity)}>×</button>
				</span>
			{/each}
			<input
				type="text"
				placeholder={wizardStore.data.activities.length === 0 ? 'Stirrade på ett dokument, åt lunch ensam...' : ''}
				bind:value={activityInput}
				onkeydown={(e) => handleKeydown(e, addActivity, removeLastActivity)}
				oninput={(e) => handleCommaInput(e, (v) => activityInput = v, addActivity)}
				onblur={addActivity}
				maxlength={FIELD_LIMITS.activities}
			/>
		</div>
	</div>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiHandWave size={23} /></span>
			Vilka var med idag?
		</span>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
			{#each wizardStore.data.people as person}
				<span class="tag">
					{person}
					<button class="tag-remove" onclick={() => removePerson(person)}>×</button>
				</span>
			{/each}
			<input
				type="text"
				placeholder={wizardStore.data.people.length === 0 ? 'Lägg till person...' : ''}
				bind:value={personInput}
				onkeydown={(e) => handleKeydown(e, addPerson, removeLastPerson)}
				oninput={(e) => handleCommaInput(e, (v) => personInput = v, addPerson)}
				onblur={addPerson}
				maxlength={FIELD_LIMITS.people}
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

	.label-emoji :global(svg) {
		width: 23px !important;
		height: 23px !important;
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
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
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

<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { EmojiPushpinRound, EmojiCalendar, EmojiWavingHand } from '$lib/components/emojis/assorted';

	const locationOptions = [
		'Hemma',
		'Skolan',
		'Jobbet',
		'Utomhus',
		'Överallt',
		'Ingenstans'
	];

	const activityOptions = [
		'Jobbade',
		'Pluggade',
		'Scrollade',
		'Prokrastinerade',
		'Inget särskilt'
	];

	const appearencesOptions = [
		'Kompisar',
		'Familjen',
		'Kollegor',
		'Främlingar',
		'Någon ny',
		'Ingen'
	];

	let customLocationInput = $state('');
	let customActivityInput = $state('');
	let personInput = $state('');

	function toggleLocation(location: string) {
		const current = wizardStore.data.locations;
		if (current.includes(location)) {
			wizardStore.updateData(
				'locations',
				current.filter((l) => l !== location)
			);
		} else {
			wizardStore.updateData('locations', [...current, location]);
		}
	}

	function toggleActivity(activity: string) {
		const current = wizardStore.data.activities;
		if (current.includes(activity)) {
			wizardStore.updateData(
				'activities',
				current.filter((a) => a !== activity)
			);
		} else {
			wizardStore.updateData('activities', [...current, activity]);
		}
	}

	function addCustomLocation() {
		if (customLocationInput.trim()) {
			wizardStore.updateData('customLocations', [
				...wizardStore.data.customLocations,
				customLocationInput.trim()
			]);
			customLocationInput = '';
		}
	}

	function removeCustomLocation(location: string) {
		wizardStore.updateData(
			'customLocations',
			wizardStore.data.customLocations.filter((l) => l !== location)
		);
	}

	function addCustomActivity() {
		if (customActivityInput.trim()) {
			wizardStore.updateData('customActivities', [
				...wizardStore.data.customActivities,
				customActivityInput.trim()
			]);
			customActivityInput = '';
		}
	}

	function removeCustomActivity(activity: string) {
		wizardStore.updateData(
			'customActivities',
			wizardStore.data.customActivities.filter((a) => a !== activity)
		);
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

	function toggleAppearance(personType: string) {
		const current = wizardStore.data.people;
		if (current.includes(personType)) {
			wizardStore.updateData(
				'people',
				current.filter((p) => p !== personType)
			);
		} else {
			wizardStore.updateData('people', [...current, personType]);
		}
	}

	function removePerson(person: string) {
		wizardStore.updateData(
			'people',
			wizardStore.data.people.filter((p) => p !== person)
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
	<p class="step-intro">Var utspelade sig dagen? Vad hände? Vilka var med? Fyll i det du minns – stora som små detaljer.</p>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiPushpinRound size={23} /></span>
			Var har du varit idag?
		</span>
		<div class="pill-cloud">
			{#each locationOptions as location}
				<button
					class="pill"
					class:selected={wizardStore.data.locations.includes(location)}
					onclick={() => toggleLocation(location)}
				>
					{location}
					{#if wizardStore.data.locations.includes(location)}
						<span class="remove">×</span>
					{/if}
				</button>
			{/each}
			{#each wizardStore.data.customLocations as location}
				<button class="pill selected custom" onclick={() => removeCustomLocation(location)}>
					{location} <span class="remove">×</span>
				</button>
			{/each}
		</div>
		<div class="add-custom">
			<input
				type="text"
				placeholder="I köket, vid samma skolbänk som vanligt, i sängen..."
				bind:value={customLocationInput}
				onkeydown={(e) => handleKeydown(e, addCustomLocation)}
			/>
			<button class="add-btn" onclick={addCustomLocation} disabled={!customLocationInput.trim()}>
				+
			</button>
		</div>
	</div>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiCalendar size={23} /></span>
			Vad hände idag?
		</span>
		<div class="pill-cloud">
			{#each activityOptions as activity}
				<button
					class="pill"
					class:selected={wizardStore.data.activities.includes(activity)}
					onclick={() => toggleActivity(activity)}
				>
					{activity}
					{#if wizardStore.data.activities.includes(activity)}
						<span class="remove">×</span>
					{/if}
				</button>
			{/each}
			{#each wizardStore.data.customActivities as activity}
				<button class="pill selected custom" onclick={() => removeCustomActivity(activity)}>
					{activity} <span class="remove">×</span>
				</button>
			{/each}
		</div>
		<div class="add-custom">
			<input
				type="text"
				placeholder="Stirrade på ett dokument, åt lunch ensam..."
				bind:value={customActivityInput}
				onkeydown={(e) => handleKeydown(e, addCustomActivity)}
			/>
			<button class="add-btn" onclick={addCustomActivity} disabled={!customActivityInput.trim()}>
				+
			</button>
		</div>
	</div>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiWavingHand size={23} /></span>
			 Vilka var med idag?
		</span>
		<div class="pill-cloud">
			{#each appearencesOptions as personType}
				<button
					class="pill"
					class:selected={wizardStore.data.people.includes(personType)}
					onclick={() => toggleAppearance(personType)}
				>
					{personType}
					{#if wizardStore.data.people.includes(personType)}
						<span class="remove">×</span>
					{/if}
				</button>
			{/each}
			{#each wizardStore.data.people.filter((p) => !appearencesOptions.includes(p)) as person}
				<button class="pill selected custom" onclick={() => removePerson(person)}>
					{person} <span class="remove">×</span>
				</button>
			{/each}
		</div>
		<div class="add-custom">
			<input
				type="text"
				placeholder="Lägg till person..."
				bind:value={personInput}
				onkeydown={(e) => handleKeydown(e, addPerson)}
			/>
			<button class="add-btn" onclick={addPerson} disabled={!personInput.trim()}>+</button>
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
		margin-top: 0.25rem;
	}

	.add-custom input {
		flex: 1;
		padding: 0.625rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
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

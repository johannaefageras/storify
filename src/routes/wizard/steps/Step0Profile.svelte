<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';

	const pronounOptions = [
		{ value: 'hon', label: 'Hon' },
		{ value: 'han', label: 'Han' },
		{ value: 'hen', label: 'Hen' },
		{ value: 'none', label: 'Vill inte uppge' }
	];

	const occupationSuggestions = [
		'Jobbar',
		'Pluggar',
		'Sjukskriven',
		'Pensionär',
		'Lite av varje'
	];

	const familySuggestions = ['Mamma', 'Pappa', 'Sambo', 'Bror', 'Syster'];

	const petSuggestions = ['Hund', 'Katt', 'Kanin', 'Hamster', 'Fisk'];

	const interestSuggestions = ['Gaming', 'Träning', 'Hästar', 'Matlagning', 'Sova', 'TikTok'];

	let familyInput = $state('');
	let petInput = $state('');
	let interestInput = $state('');

	function addFamily() {
		const value = familyInput.trim();
		if (!value || wizardStore.data.profile.family.includes(value)) {
			familyInput = '';
			return;
		}
		wizardStore.updateProfile('family', [...wizardStore.data.profile.family, value]);
		familyInput = '';
	}

	function removeFamily(member: string) {
		wizardStore.updateProfile(
			'family',
			wizardStore.data.profile.family.filter((f) => f !== member)
		);
	}

	function addPet() {
		const value = petInput.trim();
		if (!value || wizardStore.data.profile.pets.includes(value)) {
			petInput = '';
			return;
		}
		wizardStore.updateProfile('pets', [...wizardStore.data.profile.pets, value]);
		petInput = '';
	}

	function removePet(pet: string) {
		wizardStore.updateProfile(
			'pets',
			wizardStore.data.profile.pets.filter((p) => p !== pet)
		);
	}

	function addInterest() {
		const value = interestInput.trim();
		if (!value || wizardStore.data.profile.interests.includes(value)) {
			interestInput = '';
			return;
		}
		wizardStore.updateProfile('interests', [...wizardStore.data.profile.interests, value]);
		interestInput = '';
	}

	function removeInterest(interest: string) {
		wizardStore.updateProfile(
			'interests',
			wizardStore.data.profile.interests.filter((i) => i !== interest)
		);
	}

	function handleKeydown(event: KeyboardEvent, action: () => void) {
		if (event.key === 'Enter') {
			event.preventDefault();
			action();
		}
	}

	function handleTextInput(key: 'name' | 'age' | 'hometown' | 'occupationDetail', value: string) {
		wizardStore.updateProfile(key, value);
	}

	function toggleOccupationSuggestion(suggestion: string) {
		if (wizardStore.data.profile.occupationDetail === suggestion) {
			wizardStore.updateProfile('occupationDetail', '');
		} else {
			wizardStore.updateProfile('occupationDetail', suggestion);
		}
	}

	function toggleFamilySuggestion(suggestion: string) {
		if (wizardStore.data.profile.family.includes(suggestion)) {
			removeFamily(suggestion);
		} else {
			wizardStore.updateProfile('family', [...wizardStore.data.profile.family, suggestion]);
		}
	}

	function togglePetSuggestion(suggestion: string) {
		if (wizardStore.data.profile.pets.includes(suggestion)) {
			removePet(suggestion);
		} else {
			wizardStore.updateProfile('pets', [...wizardStore.data.profile.pets, suggestion]);
		}
	}

	function toggleInterestSuggestion(suggestion: string) {
		if (wizardStore.data.profile.interests.includes(suggestion)) {
			removeInterest(suggestion);
		} else {
			wizardStore.updateProfile('interests', [...wizardStore.data.profile.interests, suggestion]);
		}
	}
</script>

<div class="step-content">
	<p class="step-intro">
		Fyll i det du vill – lite eller mycket, det är upp till dig. Hoppa över det som känns irrelevant.
	</p>

	<div class="form-grid">
		<div class="field-group">
			<label class="field-label" for="name">Namn</label>
			<input
				id="name"
				type="text"
				placeholder="Ditt namn eller smeknamn"
				value={wizardStore.data.profile.name}
				oninput={(e) => handleTextInput('name', e.currentTarget.value)}
			/>
		</div>

		<div class="field-row">
			<div class="field-group compact">
				<label class="field-label" for="age">Ålder</label>
				<input
					id="age"
					type="text"
					placeholder="T.ex. 12"
					value={wizardStore.data.profile.age}
					oninput={(e) => handleTextInput('age', e.currentTarget.value)}
				/>
			</div>

			<div class="field-group compact">
				<label class="field-label" for="pronouns">Pronomen</label>
				<select
					id="pronouns"
					value={wizardStore.data.profile.pronouns}
					onchange={(e) => wizardStore.updateProfile('pronouns', e.currentTarget.value)}
				>
					<option value="" disabled selected={wizardStore.data.profile.pronouns === ''}
						>-- Välj --</option
					>
					{#each pronounOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="field-group">
			<label class="field-label" for="hometown">Hemstad</label>
			<input
				id="hometown"
				type="text"
				placeholder="Var bor du?"
				value={wizardStore.data.profile.hometown}
				oninput={(e) => handleTextInput('hometown', e.currentTarget.value)}
			/>
		</div>

		<div class="field-group">
			<label class="field-label" for="occupation">Sysselsättning</label>
			<div class="suggestion-pills">
				{#each occupationSuggestions as suggestion}
					<button
						class="suggestion-pill"
						class:selected={wizardStore.data.profile.occupationDetail === suggestion}
						onclick={() => toggleOccupationSuggestion(suggestion)}
					>
						{suggestion}
						{#if wizardStore.data.profile.occupationDetail === suggestion}
							<span class="pill-remove">×</span>
						{/if}
					</button>
				{/each}
			</div>
			<input
				id="occupation"
				type="text"
				placeholder="Sjunde klass, frilansare, mellan två grejer..."
				value={wizardStore.data.profile.occupationDetail}
				oninput={(e) => handleTextInput('occupationDetail', e.currentTarget.value)}
			/>
		</div>

		<div class="field-row">
			<div class="field-group compact">
				<label class="field-label" for="family">Familj</label>
				<div class="suggestion-pills">
					{#each familySuggestions as suggestion}
						<button
							class="suggestion-pill"
							class:selected={wizardStore.data.profile.family.includes(suggestion)}
							onclick={() => toggleFamilySuggestion(suggestion)}
						>
							{suggestion}
							{#if wizardStore.data.profile.family.includes(suggestion)}
								<span class="pill-remove">×</span>
							{/if}
						</button>
					{/each}
				</div>
				<div class="tag-container">
					{#each wizardStore.data.profile.family.filter((m) => !familySuggestions.includes(m)) as member}
						<span class="tag">
							{member}
							<button class="tag-remove" onclick={() => removeFamily(member)}>×</button>
						</span>
					{/each}
				</div>
				<div class="add-custom">
					<input
						id="family"
						type="text"
						placeholder="En mormor som alltid ringer..."
						bind:value={familyInput}
						onkeydown={(e) => handleKeydown(e, addFamily)}
					/>
					<button class="add-btn" onclick={addFamily} disabled={!familyInput.trim()}>+</button>
				</div>
			</div>

			<div class="field-group compact">
				<label class="field-label" for="pets">Husdjur</label>
				<div class="suggestion-pills">
					{#each petSuggestions as suggestion}
						<button
							class="suggestion-pill"
							class:selected={wizardStore.data.profile.pets.includes(suggestion)}
							onclick={() => togglePetSuggestion(suggestion)}
						>
							{suggestion}
							{#if wizardStore.data.profile.pets.includes(suggestion)}
								<span class="pill-remove">×</span>
							{/if}
						</button>
					{/each}
				</div>
				<div class="tag-container">
					{#each wizardStore.data.profile.pets.filter((p) => !petSuggestions.includes(p)) as pet}
						<span class="tag">
							{pet}
							<button class="tag-remove" onclick={() => removePet(pet)}>×</button>
						</span>
					{/each}
				</div>
				<div class="add-custom">
					<input
						id="pets"
						type="text"
						placeholder="En guldfisk som vägrar dö..."
						bind:value={petInput}
						onkeydown={(e) => handleKeydown(e, addPet)}
					/>
					<button class="add-btn" onclick={addPet} disabled={!petInput.trim()}>+</button>
				</div>
			</div>
		</div>

		<div class="field-group">
			<label class="field-label" for="interests">Intressen & hobbies</label>
			<div class="suggestion-pills">
				{#each interestSuggestions as suggestion}
					<button
						class="suggestion-pill"
						class:selected={wizardStore.data.profile.interests.includes(suggestion)}
						onclick={() => toggleInterestSuggestion(suggestion)}
					>
						{suggestion}
						{#if wizardStore.data.profile.interests.includes(suggestion)}
							<span class="pill-remove">×</span>
						{/if}
					</button>
				{/each}
			</div>
			<div class="tag-container">
				{#each wizardStore.data.profile.interests.filter((i) => !interestSuggestions.includes(i)) as interest}
					<span class="tag">
						{interest}
						<button class="tag-remove" onclick={() => removeInterest(interest)}>×</button>
					</span>
				{/each}
			</div>
			<div class="add-custom">
				<input
					id="interests"
					type="text"
					placeholder="Saker du gör för att du vill, inte för att du måste..."
					bind:value={interestInput}
					onkeydown={(e) => handleKeydown(e, addInterest)}
				/>
				<button class="add-btn" onclick={addInterest} disabled={!interestInput.trim()}>+</button>
			</div>
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

	.form-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field-row {
		display: flex;
		gap: 1rem;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field-group.compact {
		flex: 1;
		min-width: 0;
	}

	.field-label {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	input[type='text'] {
		width: 100%;
		height: 2.5rem;
		padding: 0 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-normal);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-elevated);
		color: var(--color-text);
		outline: none;
		transition: border-color 0.15s ease;
		box-sizing: border-box;
	}

	input[type='text']:focus {
		border-color: var(--color-accent);
	}

	input[type='text']::placeholder {
		color: var(--color-text-muted);
		font-weight: var(--weight-light);
		letter-spacing: var(--tracking-wider);
	}

	select {
		width: 100%;
		height: 2.5rem;
		padding: 0 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-normal);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-elevated);
		color: var(--color-text);
		outline: none;
		cursor: pointer;
		transition: border-color 0.15s ease;
		box-sizing: border-box;
	}

	select:focus {
		border-color: var(--color-accent);
	}

	.suggestion-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.suggestion-pill {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		padding: 0.25rem 0.5rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease;
	}

	.suggestion-pill:hover {
		border-color: var(--color-accent);
		color: var(--color-text);
	}

	.suggestion-pill.selected {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background-color: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}

	.pill-remove {
		font-size: 0.875rem;
		line-height: 1;
		opacity: 0.8;
		transition: opacity 0.15s ease;
	}

	.suggestion-pill:hover .pill-remove {
		opacity: 1;
	}

	.tag-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.tag-container:empty {
		display: none;
	}

	.tag {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		padding: 0.2rem 0.4rem;
		background-color: var(--color-accent);
		border-radius: 0.375rem;
		color: white;
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

	.add-custom {
		display: flex;
		gap: 0.375rem;
	}

	.add-custom input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		font-size: var(--text-sm);
	}

	.add-btn {
		width: 2rem;
		font-family: var(--font-primary);
		font-size: 1rem;
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

	@media (max-width: 600px) {
		.field-row {
			flex-direction: column;
		}
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

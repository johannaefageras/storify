<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { FIELD_LIMITS } from '$lib/validation';

	const pronounOptions = [
		{ value: 'hon', label: 'Hon' },
		{ value: 'han', label: 'Han' },
		{ value: 'hen', label: 'Hen' },
		{ value: 'none', label: 'Vill inte uppge' }
	];

	let familyInput = $state('');
	let occupationInput = $state('');
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

	function removeLastFamily() {
		const arr = wizardStore.data.profile.family;
		if (arr.length > 0) {
			wizardStore.updateProfile('family', arr.slice(0, -1));
		}
	}

	function addOccupation() {
		const value = occupationInput.trim();
		if (!value || wizardStore.data.profile.occupationDetail.includes(value)) {
			occupationInput = '';
			return;
		}
		wizardStore.updateProfile('occupationDetail', [
			...wizardStore.data.profile.occupationDetail,
			value
		]);
		occupationInput = '';
	}

	function removeOccupation(occupation: string) {
		wizardStore.updateProfile(
			'occupationDetail',
			wizardStore.data.profile.occupationDetail.filter((o) => o !== occupation)
		);
	}

	function removeLastOccupation() {
		const arr = wizardStore.data.profile.occupationDetail;
		if (arr.length > 0) {
			wizardStore.updateProfile('occupationDetail', arr.slice(0, -1));
		}
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

	function removeLastPet() {
		const arr = wizardStore.data.profile.pets;
		if (arr.length > 0) {
			wizardStore.updateProfile('pets', arr.slice(0, -1));
		}
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

	function removeLastInterest() {
		const arr = wizardStore.data.profile.interests;
		if (arr.length > 0) {
			wizardStore.updateProfile('interests', arr.slice(0, -1));
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

	function handleTextInput(key: 'name' | 'age' | 'hometown', value: string) {
		wizardStore.updateProfile(key, value);
	}

	function focusInput(event: MouseEvent) {
		const container = event.currentTarget as HTMLElement;
		const input = container.querySelector('input');
		if (input) input.focus();
	}
</script>

<div class="step-content">
	<p class="step-intro">
		Fyll i det du vill – lite eller mycket, det är upp till dig. Hoppa över sådant som inte känns relevant.
	</p>

	<div class="form-grid">
		<div class="field-group">
			<label class="field-label" for="name">Tilltalsnamn</label>
			<input
				id="name"
				type="text"
				placeholder="Vad du heter eller vill bli kallad..."
				value={wizardStore.data.profile.name}
				oninput={(e) => handleTextInput('name', e.currentTarget.value)}
				maxlength={FIELD_LIMITS.name}
			/>
		</div>

		<div class="field-row">
			<div class="field-group compact">
				<label class="field-label" for="age">Ålder</label>
				<input
					id="age"
					type="text"
					placeholder="Snart 12 år, 30+, mitt i livet..."
					value={wizardStore.data.profile.age}
					oninput={(e) => handleTextInput('age', e.currentTarget.value)}
					maxlength={FIELD_LIMITS.age}
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
						>-- Välj hur du vill bli tilltalad --</option
					>
					{#each pronounOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="field-group">
			<label class="field-label" for="hometown">Hemstad / ort</label>
			<input
				id="hometown"
				type="text"
				placeholder="Lägenhet i Göteborg, hus på landsbygden..."
				value={wizardStore.data.profile.hometown}
				oninput={(e) => handleTextInput('hometown', e.currentTarget.value)}
				maxlength={FIELD_LIMITS.hometown}
			/>
		</div>

		<div class="field-group">
			<label class="field-label" for="occupation">Sysselsättning</label>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
				{#each wizardStore.data.profile.occupationDetail as occupation}
					<span class="tag">
						{occupation}
						<button class="tag-remove" onclick={() => removeOccupation(occupation)}>×</button>
					</span>
				{/each}
				<input
					id="occupation"
					type="text"
					placeholder={wizardStore.data.profile.occupationDetail.length === 0 ? 'Jobbar, pluggar, pensionär, lite av varje...' : ''}
					bind:value={occupationInput}
					onkeydown={(e) => handleKeydown(e, addOccupation, removeLastOccupation)}
					oninput={(e) => handleCommaInput(e, (v) => occupationInput = v, addOccupation)}
					onblur={addOccupation}
					maxlength={FIELD_LIMITS.occupationDetail}
				/>
			</div>
		</div>

		<div class="field-row">
			<div class="field-group compact">
				<label class="field-label" for="family">Familjemedlemmar</label>
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
					{#each wizardStore.data.profile.family as member}
						<span class="tag">
							{member}
							<button class="tag-remove" onclick={() => removeFamily(member)}>×</button>
						</span>
					{/each}
					<input
						id="family"
						type="text"
						placeholder={wizardStore.data.profile.family.length === 0 ? 'Sambon, mormor som alltid ringer...' : ''}
						bind:value={familyInput}
						onkeydown={(e) => handleKeydown(e, addFamily, removeLastFamily)}
						oninput={(e) => handleCommaInput(e, (v) => familyInput = v, addFamily)}
						onblur={addFamily}
						maxlength={FIELD_LIMITS.family}
					/>
				</div>
			</div>

			<div class="field-group compact">
				<label class="field-label" for="pets">Husdjur</label>
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
					{#each wizardStore.data.profile.pets as pet}
						<span class="tag">
							{pet}
							<button class="tag-remove" onclick={() => removePet(pet)}>×</button>
						</span>
					{/each}
					<input
						id="pets"
						type="text"
						placeholder={wizardStore.data.profile.pets.length === 0 ? 'Katten Mats, fågeln Pelle...' : ''}
						bind:value={petInput}
						onkeydown={(e) => handleKeydown(e, addPet, removeLastPet)}
						oninput={(e) => handleCommaInput(e, (v) => petInput = v, addPet)}
						onblur={addPet}
						maxlength={FIELD_LIMITS.pets}
					/>
				</div>
			</div>
		</div>

		<div class="field-group">
			<label class="field-label" for="interests">Intressen & hobbies</label>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
				{#each wizardStore.data.profile.interests as interest}
					<span class="tag">
						{interest}
						<button class="tag-remove" onclick={() => removeInterest(interest)}>×</button>
					</span>
				{/each}
				<input
					id="interests"
					type="text"
					placeholder={wizardStore.data.profile.interests.length === 0 ? 'Träning, WoW, TikTok, bygga appar...' : ''}
					bind:value={interestInput}
					onkeydown={(e) => handleKeydown(e, addInterest, removeLastInterest)}
					oninput={(e) => handleCommaInput(e, (v) => interestInput = v, addInterest)}
					onblur={addInterest}
					maxlength={FIELD_LIMITS.interests}
				/>
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
		gap: 0.875rem;
	}

	.field-row {
		display: flex;
		gap: 0.75rem;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-group.compact {
		flex: 1;
		min-width: 0;
	}

	.field-label {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	input[type='text'] {
		width: 100%;
		height: 2.75rem;
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
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
		box-sizing: border-box;
	}

	input[type='text']:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
	}

	input[type='text']::placeholder {
		color: var(--color-text-muted);
		font-weight: var(--weight-light);
		letter-spacing: var(--tracking-wider);
		opacity: 0.7;
	}

	select {
		width: 100%;
		height: 2.75rem;
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
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
		box-sizing: border-box;
	}

	select:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
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
		font-size: var(--text-sm);
	}

	.tag-input input:focus {
		border: none;
		outline: none;
		box-shadow: none;
	}

	.tag-input input::placeholder {
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

	@media (max-width: 600px) {
		.field-row {
			flex-direction: column;
		}
	}
</style>

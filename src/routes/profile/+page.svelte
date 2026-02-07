<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { authStore } from '$lib/stores/auth.svelte';
	import { FIELD_LIMITS } from '$lib/validation';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';

	// Profile state
	let name = $state('');
	let birthday = $state<string | null>(null);
	let pronouns = $state('');
	let hometown = $state('');
	let family = $state<string[]>([]);
	let pets = $state<string[]>([]);
	let occupationType = $state('');
	let occupationDetail = $state<string[]>([]);
	let interests = $state<string[]>([]);
	let avatarUrl = $state<string | null>(null);

	// UI state
	let loading = $state(true);
	let saving = $state(false);
	let avatarUploading = $state(false);
	let error = $state('');
	let success = $state('');

	// Tag inputs
	let familyInput = $state('');
	let occupationInput = $state('');
	let petInput = $state('');
	let interestInput = $state('');

	const pronounOptions = [
		{ value: 'hon', label: 'Hon / Henne' },
		{ value: 'han', label: 'Han / Honom' },
		{ value: 'hen', label: 'Hen / Henom' },
		{ value: 'none', label: 'Vill inte uppge' }
	];

	const swedishMonths = [
		{ value: 1, label: 'Januari' },
		{ value: 2, label: 'Februari' },
		{ value: 3, label: 'Mars' },
		{ value: 4, label: 'April' },
		{ value: 5, label: 'Maj' },
		{ value: 6, label: 'Juni' },
		{ value: 7, label: 'Juli' },
		{ value: 8, label: 'Augusti' },
		{ value: 9, label: 'September' },
		{ value: 10, label: 'Oktober' },
		{ value: 11, label: 'November' },
		{ value: 12, label: 'December' }
	];

	function parseBirthday(dateStr: string | null) {
		if (!dateStr) return { year: '', month: '', day: '' };
		const [year, month, day] = dateStr.split('-');
		return {
			year: year || '',
			month: month ? parseInt(month, 10).toString() : '',
			day: day ? parseInt(day, 10).toString() : ''
		};
	}

	let birthdayParts = $state(parseBirthday(null));

	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 126 }, (_, i) => 2025 - i);

	function getDaysInMonth(year: number, month: number): number {
		if (!year || !month) return 31;
		return new Date(year, month, 0).getDate();
	}

	let daysInSelectedMonth = $derived(
		getDaysInMonth(
			birthdayParts.year ? parseInt(birthdayParts.year, 10) : currentYear,
			birthdayParts.month ? parseInt(birthdayParts.month, 10) : 1
		)
	);

	function updateBirthdayFromParts() {
		const { year, month, day } = birthdayParts;
		if (year && month && day) {
			const paddedMonth = month.padStart(2, '0');
			const paddedDay = day.padStart(2, '0');
			birthday = `${year}-${paddedMonth}-${paddedDay}`;
		} else {
			birthday = null;
		}
	}

	function handleBirthdayPartChange(part: 'year' | 'month' | 'day', value: string) {
		birthdayParts[part] = value;
		if (part === 'month' || part === 'year') {
			const maxDay = getDaysInMonth(
				parseInt(birthdayParts.year, 10) || currentYear,
				parseInt(birthdayParts.month, 10) || 1
			);
			if (birthdayParts.day && parseInt(birthdayParts.day, 10) > maxDay) {
				birthdayParts.day = maxDay.toString();
			}
		}
		updateBirthdayFromParts();
	}

	// Tag helpers
	function addTag(arr: string[], value: string, setter: (v: string[]) => void, inputClear: () => void) {
		const trimmed = value.trim();
		if (!trimmed || arr.includes(trimmed)) {
			inputClear();
			return;
		}
		setter([...arr, trimmed]);
		inputClear();
	}

	function removeTag(arr: string[], value: string, setter: (v: string[]) => void) {
		setter(arr.filter((item) => item !== value));
	}

	function removeLastTag(arr: string[], setter: (v: string[]) => void) {
		if (arr.length > 0) setter(arr.slice(0, -1));
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

	// Add helpers for each tag field
	function addFamily() {
		addTag(family, familyInput, (v) => (family = v), () => (familyInput = ''));
	}
	function addOccupation() {
		addTag(occupationDetail, occupationInput, (v) => (occupationDetail = v), () => (occupationInput = ''));
	}
	function addPet() {
		addTag(pets, petInput, (v) => (pets = v), () => (petInput = ''));
	}
	function addInterest() {
		addTag(interests, interestInput, (v) => (interests = v), () => (interestInput = ''));
	}

	// Avatar upload
	async function handleAvatarUpload(file: File) {
		if (!authStore.user) return;
		avatarUploading = true;

		try {
			const path = `${authStore.user.id}/avatar.jpg`;

			const { error: uploadError } = await supabase.storage
				.from('avatars')
				.upload(path, file, { upsert: true, contentType: 'image/jpeg' });

			if (uploadError) {
				error = 'Kunde inte ladda upp bilden. Försök igen.';
				avatarUploading = false;
				return;
			}

			const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
			const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

			await supabase
				.from('profiles')
				.update({ avatar_url: newUrl, updated_at: new Date().toISOString() })
				.eq('id', authStore.user.id);

			avatarUrl = newUrl;
		} catch {
			error = 'Kunde inte ladda upp bilden. Försök igen.';
		}

		avatarUploading = false;
	}

	async function handleAvatarRemove() {
		if (!authStore.user) return;
		avatarUploading = true;

		try {
			const path = `${authStore.user.id}/avatar.jpg`;
			await supabase.storage.from('avatars').remove([path]);
			await supabase
				.from('profiles')
				.update({ avatar_url: null, updated_at: new Date().toISOString() })
				.eq('id', authStore.user.id);
			avatarUrl = null;
		} catch {
			error = 'Kunde inte ta bort bilden. Försök igen.';
		}

		avatarUploading = false;
	}

	// Load profile from Supabase
	async function loadProfile() {
		if (!authStore.user) return;

		const { data, error: fetchError } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', authStore.user.id)
			.single();

		if (fetchError) {
			error = 'Kunde inte ladda profilen.';
			loading = false;
			return;
		}

		if (data) {
			name = data.name || '';
			birthday = data.birthday || null;
			pronouns = data.pronouns || '';
			hometown = data.hometown || '';
			family = data.family || [];
			pets = data.pets || [];
			occupationType = data.occupation_type || '';
			occupationDetail = data.occupation_detail || [];
			interests = data.interests || [];
			avatarUrl = data.avatar_url || null;
			birthdayParts = parseBirthday(birthday);
		}

		loading = false;
	}

	// Save profile to Supabase
	async function handleSave() {
		if (!authStore.user) return;

		saving = true;
		error = '';
		success = '';

		const { error: updateError } = await supabase
			.from('profiles')
			.update({
				name,
				birthday,
				pronouns,
				hometown,
				family,
				pets,
				occupation_type: occupationType,
				occupation_detail: occupationDetail,
				interests,
				updated_at: new Date().toISOString()
			})
			.eq('id', authStore.user.id);

		if (updateError) {
			error = 'Kunde inte spara profilen. Försök igen.';
		} else {
			success = 'Profilen har sparats!';
			setTimeout(() => (success = ''), 3000);
		}

		saving = false;
	}

	onMount(() => {
		const checkAuth = () => {
			if (authStore.isLoading) {
				setTimeout(checkAuth, 50);
				return;
			}
			if (!authStore.isLoggedIn) {
				goto('/login');
				return;
			}
			loadProfile();
		};
		checkAuth();
	});
</script>

<main class="profile-page">
	{#if loading}
		<div class="loading-wrapper">
			<p class="loading-text">Laddar profil...</p>
		</div>
	{:else}
		<!-- Hero section with avatar -->
		<div class="profile-hero">
			<div class="hero-bg"></div>
			<div class="hero-content">
				<AvatarUpload
					{avatarUrl}
					{name}
					size={120}
					editable={true}
					uploading={avatarUploading}
					onUpload={handleAvatarUpload}
					onRemove={handleAvatarRemove}
				/>
				<div class="hero-info">
					<h1 class="hero-name">{name || 'Min profil'}</h1>
					{#if authStore.user?.email}
						<p class="hero-email">{authStore.user.email}</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="profile-body">
			{#if error}
				<div class="profile-alert profile-alert-error">{error}</div>
			{/if}
			{#if success}
				<div class="profile-alert profile-alert-success">{success}</div>
			{/if}

			<form class="profile-form" onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
				<!-- Section 1: Basic info -->
				<section class="profile-section">
					<h2 class="section-title">Grundläggande uppgifter</h2>

					<div class="section-fields">
						<div class="field-group">
							<label class="field-label" for="name">Tilltalsnamn</label>
							<input
								id="name"
								type="text"
								placeholder="Vad du heter eller vill bli kallad..."
								bind:value={name}
								maxlength={FIELD_LIMITS.name}
							/>
						</div>

						<div class="field-row birthday-row">
							<div class="field-group birthday-group">
								<span class="field-label" id="birthday-label">Födelsedag</span>
								<div class="birthday-selects" role="group" aria-labelledby="birthday-label">
									<select
										id="birthday-day"
										class="birthday-day"
										aria-label="Dag"
										value={birthdayParts.day}
										onchange={(e) => handleBirthdayPartChange('day', e.currentTarget.value)}
									>
										<option value="" disabled selected={birthdayParts.day === ''}>Dag</option>
										{#each Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1) as day}
											<option value={day.toString()}>{day}</option>
										{/each}
									</select>
									<select
										id="birthday-month"
										class="birthday-month"
										aria-label="Månad"
										value={birthdayParts.month}
										onchange={(e) => handleBirthdayPartChange('month', e.currentTarget.value)}
									>
										<option value="" disabled selected={birthdayParts.month === ''}>Månad</option>
										{#each swedishMonths as month}
											<option value={month.value.toString()}>{month.label}</option>
										{/each}
									</select>
									<select
										id="birthday-year"
										class="birthday-year"
										aria-label="År"
										value={birthdayParts.year}
										onchange={(e) => handleBirthdayPartChange('year', e.currentTarget.value)}
									>
										<option value="" disabled selected={birthdayParts.year === ''}>År</option>
										{#each yearOptions as year}
											<option value={year.toString()}>{year}</option>
										{/each}
									</select>
								</div>
							</div>

							<div class="field-group compact">
								<label class="field-label" for="pronouns">Pronomen</label>
								<select
									id="pronouns"
									bind:value={pronouns}
								>
									<option value="" disabled selected={pronouns === ''}>-- Välj pronomen --</option>
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
								bind:value={hometown}
								maxlength={FIELD_LIMITS.hometown}
							/>
						</div>
					</div>
				</section>

				<!-- Section 2: Lifestyle -->
				<section class="profile-section">
					<h2 class="section-title">Vardag & Intressen</h2>

					<div class="section-fields">
						<div class="field-group">
							<label class="field-label" for="occupation">Sysselsättning</label>
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
							<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
								{#each occupationDetail as occupation}
									<span class="tag">
										{occupation}
										<button type="button" class="tag-remove" onclick={() => removeTag(occupationDetail, occupation, (v) => (occupationDetail = v))}>×</button>
									</span>
								{/each}
								<input
									id="occupation"
									type="text"
									placeholder={occupationDetail.length === 0 ? 'Jobbar, pluggar, pensionär, lite av varje...' : ''}
									bind:value={occupationInput}
									onkeydown={(e) => handleKeydown(e, addOccupation, () => removeLastTag(occupationDetail, (v) => (occupationDetail = v)))}
									oninput={(e) => handleCommaInput(e, (v) => (occupationInput = v), addOccupation)}
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
									{#each family as member}
										<span class="tag">
											{member}
											<button type="button" class="tag-remove" onclick={() => removeTag(family, member, (v) => (family = v))}>×</button>
										</span>
									{/each}
									<input
										id="family"
										type="text"
										placeholder={family.length === 0 ? 'Sambon, mormor som alltid ringer...' : ''}
										bind:value={familyInput}
										onkeydown={(e) => handleKeydown(e, addFamily, () => removeLastTag(family, (v) => (family = v)))}
										oninput={(e) => handleCommaInput(e, (v) => (familyInput = v), addFamily)}
										onblur={addFamily}
										maxlength={FIELD_LIMITS.family}
									/>
								</div>
							</div>

							<div class="field-group compact">
								<label class="field-label" for="pets">Husdjur</label>
								<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
								<div class="tag-input" role="group" onclick={focusInput} onkeydown={(e) => e.key === 'Enter' && focusInput(e as unknown as MouseEvent)}>
									{#each pets as pet}
										<span class="tag">
											{pet}
											<button type="button" class="tag-remove" onclick={() => removeTag(pets, pet, (v) => (pets = v))}>×</button>
										</span>
									{/each}
									<input
										id="pets"
										type="text"
										placeholder={pets.length === 0 ? 'Katten Mats, fågeln Pelle...' : ''}
										bind:value={petInput}
										onkeydown={(e) => handleKeydown(e, addPet, () => removeLastTag(pets, (v) => (pets = v)))}
										oninput={(e) => handleCommaInput(e, (v) => (petInput = v), addPet)}
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
								{#each interests as interest}
									<span class="tag">
										{interest}
										<button type="button" class="tag-remove" onclick={() => removeTag(interests, interest, (v) => (interests = v))}>×</button>
									</span>
								{/each}
								<input
									id="interests"
									type="text"
									placeholder={interests.length === 0 ? 'Träning, WoW, TikTok, bygga appar...' : ''}
									bind:value={interestInput}
									onkeydown={(e) => handleKeydown(e, addInterest, () => removeLastTag(interests, (v) => (interests = v)))}
									oninput={(e) => handleCommaInput(e, (v) => (interestInput = v), addInterest)}
									onblur={addInterest}
									maxlength={FIELD_LIMITS.interests}
								/>
							</div>
						</div>
					</div>
				</section>

				<button class="btn btn-primary btn-large profile-save" type="submit" disabled={saving}>
					{saving ? 'Sparar...' : 'Spara profil'}
				</button>
			</form>
		</div>
	{/if}
	<LegalFooter />
</main>

<style>
	.profile-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.loading-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-text {
		color: var(--color-text-muted);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
	}

	/* Hero section */
	.profile-hero {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: 1.5rem;
	}

	.hero-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100px;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-accent) 8%, var(--color-bg)),
			color-mix(in srgb, var(--color-accent) 3%, var(--color-bg))
		);
		border-bottom: 1px solid var(--color-border);
	}

	.hero-content {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding-top: 40px;
	}

	.hero-info {
		text-align: center;
	}

	.hero-name {
		font-family: var(--font-primary);
		font-size: var(--text-xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-snug);
		color: var(--color-text);
		margin: 0;
	}

	.hero-email {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		margin: 0.125rem 0 0;
	}

	/* Body */
	.profile-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-width: 520px;
		width: 100%;
		padding: 1.5rem 1.5rem 2rem;
		gap: 1rem;
	}

	/* Alerts */
	.profile-alert {
		padding: 0.75rem 1rem;
		border-radius: var(--radius-sm);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
	}

	.profile-alert-error {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		color: var(--color-accent);
	}

	.profile-alert-success {
		background: color-mix(in srgb, #22c55e 10%, transparent);
		color: #16a34a;
	}

	/* Form */
	.profile-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	/* Sections */
	.profile-section {
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 1.25rem;
	}

	.section-title {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		margin: 0 0 1rem;
		padding-bottom: 0.625rem;
		border-bottom: 1px solid var(--color-border);
	}

	.section-fields {
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
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
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

	.birthday-row {
		flex-wrap: wrap;
	}

	.birthday-group {
		flex: 2;
		min-width: 0;
	}

	.birthday-selects {
		display: flex;
		gap: 0.5rem;
	}

	.birthday-day,
	.birthday-month,
	.birthday-year {
		width: auto;
		appearance: none;
		-webkit-appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f5f5f' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		padding-right: 1.75rem;
	}

	.birthday-day {
		flex: 0 0 4.5rem;
	}

	.birthday-month {
		flex: 1;
		min-width: 6rem;
	}

	.birthday-year {
		flex: 0 0 5rem;
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
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
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
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
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

	.profile-save {
		margin-top: 0.25rem;
		width: 100%;
		justify-content: center;
	}

	@media (max-width: 600px) {
		.hero-name {
			font-size: var(--text-lg);
		}

		.hero-bg {
			height: 80px;
		}

		.hero-content {
			padding-top: 20px;
		}

		.profile-body {
			padding: 1.25rem 1rem 2rem;
		}

		.profile-section {
			padding: 1rem;
		}

		.field-row {
			flex-direction: column;
		}

		.birthday-row {
			flex-direction: column;
		}

		.birthday-selects {
			flex-wrap: wrap;
		}

		.birthday-day {
			flex: 0 0 4rem;
		}

		.birthday-month {
			flex: 1;
			min-width: 5.5rem;
		}

		.birthday-year {
			flex: 0 0 4.5rem;
		}
	}
</style>

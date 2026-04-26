<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { authStore } from '$lib/stores/auth.svelte';
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { FIELD_LIMITS } from '$lib/validation';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import ProfileBadgeStrip from '$lib/components/ProfileBadgeStrip.svelte';
	import { fireBadgeEvent } from '$lib/gamification/client';
	import arrowLeftSvg from '$lib/assets/icons/arrow-left.svg?raw';
	import '../profile.css';

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
	const yearOptions = Array.from({ length: 126 }, (_, i) => currentYear - i);

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
			void fireBadgeEvent('profile-photo-uploaded');
		} catch {
			error = 'Kunde inte ladda upp bilden. Försök igen.';
		}

		avatarUploading = false;
	}

	async function loadProfile() {
		if (!authStore.user) return;

		const { data, error: fetchError } = await supabase
			.from('profiles')
			.select('name, birthday, pronouns, hometown, family, pets, occupation_type, occupation_detail, interests, avatar_url')
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
			// Re-sync wizard store so profile data (e.g. birthday for horoscope) is available
			wizardStore.initProfile();
			void fireBadgeEvent('profile-updated');
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
		<div class="profile-hero">
			<div class="hero-content">
				<AvatarUpload
					{avatarUrl}
					{name}
					size={130}
					editable={true}
					uploading={avatarUploading}
					onUpload={handleAvatarUpload}
				/>
				<div class="hero-info">
					<h1 class="hero-name">{name ? `${name}s Profil` : 'Min Profil'}</h1>
					<ProfileBadgeStrip />
				</div>
			</div>
		</div>

		<div class="profile-body">
			<a href="/profile" class="back-link">
				<span class="back-link-icon">{@html arrowLeftSvg}</span>
				Tillbaka till profil
			</a>

			{#if error}
				<div class="profile-alert profile-alert-error">{error}</div>
			{/if}
			{#if success}
				<div class="profile-alert profile-alert-success">{success}</div>
			{/if}

			<form class="profile-form" onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
				<section class="profile-section">
					<h2 class="section-title">Profilinformation</h2>

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

					<h3 class="section-subtitle">Vardag & Intressen</h3>

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

					<button class="btn btn-primary btn-large profile-save" type="submit" disabled={saving}>
						{saving ? 'Sparar...' : 'Spara profil'}
					</button>
				</section>
			</form>
		</div>
	{/if}
	<LegalFooter />
</main>

<style>
	.profile-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
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
	.birthday-year,
	#pronouns {
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
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
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
		margin-top: 0.75rem;
		width: 100%;
		justify-content: center;
	}

	@media (max-width: 600px) {
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

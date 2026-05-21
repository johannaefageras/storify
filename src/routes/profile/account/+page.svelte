<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { authStore } from '$lib/stores/auth.svelte';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import arrowLeftSvg from '$lib/assets/icons/arrow-left.svg?raw';
	import '../profile.css';

	let loading = $state(true);

	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordError = $state('');
	let passwordSuccess = $state('');
	let changingPassword = $state(false);
	let timezone = $state('Europe/Stockholm');
	let timezoneOptions = $state<string[]>([]);
	let settingsError = $state('');

	async function loadAccountSettings() {
		if (!authStore.user) return;

		const { data, error: fetchError } = await supabase
			.from('profiles')
			.select('timezone')
			.eq('id', authStore.user.id)
			.single();

		if (fetchError) {
			settingsError = 'Kunde inte ladda inställningarna.';
			loading = false;
			return;
		}

		if (data) {
			timezone = data.timezone || 'Europe/Stockholm';

			// Auto-detect timezone on first visit (only if still at default)
			if (timezone === 'Europe/Stockholm') {
				try {
					const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
					if (detected && detected !== timezone) {
						timezone = detected;
						await supabase
							.from('profiles')
							.update({ timezone: detected, updated_at: new Date().toISOString() })
							.eq('id', authStore.user.id);
					}
				} catch {
					// Intl unavailable — keep default
				}
			}
		}

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const supported = (Intl as any).supportedValuesOf?.('timeZone');
			if (Array.isArray(supported) && supported.length > 0) {
				timezoneOptions = supported;
			}
		} catch {
			// ignored
		}
		if (timezoneOptions.length === 0) {
			timezoneOptions = [
				'Europe/Stockholm',
				'Europe/Oslo',
				'Europe/Copenhagen',
				'Europe/Helsinki',
				'Europe/London',
				'Europe/Berlin',
				'Europe/Paris',
				'Europe/Madrid',
				'UTC',
				'America/New_York',
				'America/Los_Angeles'
			];
		}
		if (!timezoneOptions.includes(timezone)) {
			timezoneOptions = [timezone, ...timezoneOptions];
		}

		loading = false;
	}

	async function handleTimezoneChange(value: string) {
		if (!authStore.user) return;
		const prev = timezone;
		timezone = value;
		settingsError = '';

		const { error: err } = await supabase
			.from('profiles')
			.update({ timezone: value, updated_at: new Date().toISOString() })
			.eq('id', authStore.user.id);

		if (err) {
			settingsError = 'Kunde inte spara tidszonen. Försök igen.';
			timezone = prev;
		}
	}

	async function handleChangePassword() {
		passwordError = '';
		passwordSuccess = '';

		if (newPassword.length < 6) {
			passwordError = 'Lösenordet måste vara minst 6 tecken.';
			return;
		}

		if (newPassword !== confirmPassword) {
			passwordError = 'Lösenorden matchar inte.';
			return;
		}

		changingPassword = true;

		const { error: updateError } = await supabase.auth.updateUser({
			password: newPassword
		});

		if (updateError) {
			passwordError = 'Kunde inte ändra lösenordet. Försök igen.';
		} else {
			passwordSuccess = 'Lösenordet har ändrats!';
			newPassword = '';
			confirmPassword = '';
			setTimeout(() => (passwordSuccess = ''), 3000);
		}

		changingPassword = false;
	}

	async function handleSignOut() {
		await authStore.signOut();
		goto('/');
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
			loadAccountSettings();
		};
		checkAuth();
	});
</script>

<SeoHead
	title="Kontoinställningar – Storify"
	description="Hantera lösenord, tidszon och kontoinställningar för ditt privata Storify-konto."
	path="/profile/account"
	noindex
/>

<main class="profile-page">
	{#if loading}
		<div class="loading-wrapper">
			<p class="loading-text">Laddar konto...</p>
		</div>
	{:else}
		<div class="profile-body">
			<a href="/profile" class="back-link">
				<span class="back-link-icon">{@html arrowLeftSvg}</span>
				Tillbaka till profil
			</a>

			<section class="profile-section">
				<h2 class="section-title">Kontoinställningar</h2>

				<div class="section-fields">
					<div class="field-group">
						<label class="field-label" for="email">E-postadress</label>
						<input
							id="email"
							type="email"
							value={authStore.user?.email ?? ''}
							disabled
							class="field-disabled"
						/>
					</div>

					<div class="field-group">
						<label class="field-label" for="timezone">Tidszon</label>
						<select
							id="timezone"
							value={timezone}
							onchange={(e) => handleTimezoneChange(e.currentTarget.value)}
						>
							{#each timezoneOptions as tz}
								<option value={tz}>{tz}</option>
							{/each}
						</select>
					</div>

					{#if settingsError}
						<div class="profile-alert profile-alert-error">{settingsError}</div>
					{/if}

					<form class="password-form" onsubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
						<div class="field-group">
							<label class="field-label" for="new-password">Nytt lösenord</label>
							<input
								id="new-password"
								type="password"
								placeholder="Minst 6 tecken..."
								bind:value={newPassword}
							/>
						</div>

						<div class="field-group">
							<label class="field-label" for="confirm-password">Bekräfta lösenord</label>
							<input
								id="confirm-password"
								type="password"
								placeholder="Upprepa lösenordet..."
								bind:value={confirmPassword}
							/>
						</div>

						{#if passwordError}
							<div class="profile-alert profile-alert-error">{passwordError}</div>
						{/if}
						{#if passwordSuccess}
							<div class="profile-alert profile-alert-success">{passwordSuccess}</div>
						{/if}

						<button class="btn btn-secondary btn-change-password" type="submit" disabled={changingPassword || !newPassword || !confirmPassword}>
							{changingPassword ? 'Ändrar...' : 'Ändra lösenord'}
						</button>
					</form>
				</div>
			</section>

			<button class="btn-logout" onclick={handleSignOut}>
				Logga ut
			</button>
		</div>
	{/if}
	<LegalFooter />
</main>

<style>
	#timezone {
		appearance: none;
		-webkit-appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f5f5f' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		padding-right: 1.75rem;
	}

	.password-form {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.btn-change-password {
		width: 100%;
		justify-content: center;
	}

	.btn-logout {
		width: 100%;
		height: 2.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		cursor: pointer;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.btn-logout:hover {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 10%, transparent);
	}
</style>

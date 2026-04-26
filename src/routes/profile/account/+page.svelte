<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { authStore } from '$lib/stores/auth.svelte';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import arrowLeftSvg from '$lib/assets/icons/arrow-left.svg?raw';
	import '../profile.css';

	let loading = $state(true);

	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordError = $state('');
	let passwordSuccess = $state('');
	let changingPassword = $state(false);

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
			loading = false;
		};
		checkAuth();
	});
</script>

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

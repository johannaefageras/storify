<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import LegalFooter from '$lib/components/LegalFooter.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		loading = true;

		const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

		if (authError) {
			error = authError.message === 'Invalid login credentials'
				? 'Felaktiga inloggningsuppgifter'
				: authError.message;
			loading = false;
			return;
		}

		goto('/');
	}

	async function handleGoogleLogin() {
		const { error: authError } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo: `${window.location.origin}/auth/callback` }
		});

		if (authError) {
			error = authError.message;
		}
	}
</script>

<main class="auth-page">
	<div class="auth-container">
		<header class="auth-header">
			<h1 class="auth-title">Logga in</h1>
			<p class="auth-subtitle">Välkommen tillbaka till Storify</p>
		</header>

		<form class="auth-form" onsubmit={handleLogin}>
			{#if error}
				<div class="auth-error">{error}</div>
			{/if}

			<div class="field-group">
				<label class="field-label" for="email">E-post</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="din@email.se"
					required
					autocomplete="email"
				/>
			</div>

			<div class="field-group">
				<label class="field-label" for="password">Lösenord</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					required
					autocomplete="current-password"
				/>
			</div>

			<button class="btn btn-primary btn-large auth-submit" type="submit" disabled={loading}>
				{loading ? 'Loggar in...' : 'Logga in'}
			</button>

			<div class="auth-divider">
				<span>eller</span>
			</div>

			<button class="btn btn-outline" type="button" onclick={handleGoogleLogin}>
				Fortsätt med Google
			</button>
		</form>

		<nav class="auth-links">
			<a href="/forgot-password">Glömt lösenordet?</a>
			<a href="/register">Skapa konto</a>
		</nav>

		<div class="auth-back">
			<a href="/">Tillbaka till startsidan</a>
		</div>
	</div>
	<LegalFooter />
</main>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		padding-bottom: 0;
	}

	.auth-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: 400px;
		width: 100%;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.auth-title {
		font-family: var(--font-primary);
		font-size: var(--text-3xl);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		color: var(--color-text);
		margin-bottom: 0.5rem;
	}

	.auth-subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.field-label {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
	}

	input {
		height: 2.75rem;
		padding: 0 0.875rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg);
		color: var(--color-text);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
	}

	input::placeholder {
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.auth-submit {
		margin-top: 0.5rem;
		width: 100%;
		justify-content: center;
	}

	.auth-divider {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 0.25rem 0;
	}

	.auth-divider::before,
	.auth-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--color-border);
	}

	.auth-divider span {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
	}

	.btn-outline {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 2.75rem;
		padding: 0.625rem 1.25rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg);
		color: var(--color-text);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-wider);
		cursor: pointer;
		transition: border-color 0.15s ease, background 0.15s ease;
	}

	.btn-outline:hover {
		border-color: var(--color-text-muted);
		background: var(--color-surface);
	}

	.btn-outline:active {
		transform: scale(0.98);
	}

	.auth-links {
		display: flex;
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	.auth-links a {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-accent);
		font-weight: var(--weight-medium);
		text-decoration: none;
		letter-spacing: var(--tracking-normal);
		transition: opacity 0.15s ease;
	}

	.auth-links a:hover {
		opacity: 0.75;
	}

	.auth-back {
		margin-top: 2rem;
	}

	.auth-back a {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-weight: var(--weight-medium);
		text-decoration: underline;
		text-underline-offset: 2px;
		opacity: 0.75;
		transition: opacity 0.15s ease;
	}

	.auth-back a:hover {
		opacity: 1;
	}

	.auth-error {
		padding: 0.75rem 1rem;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		color: var(--color-accent);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
	}
</style>

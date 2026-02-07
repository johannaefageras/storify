<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	let menuOpen = $state(false);
	let pathname: string = $derived(page.url.pathname);

	function closeMenu() {
		menuOpen = false;
	}

	async function handleSignOut() {
		closeMenu();
		await authStore.signOut();
		goto('/');
	}

	// Close menu on navigation
	$effect(() => {
		pathname;
		menuOpen = false;
	});
</script>

<nav class="navbar">
	<a href="/" class="navbar-brand">Storify</a>

	<button
		class="hamburger"
		class:open={menuOpen}
		onclick={() => (menuOpen = !menuOpen)}
		aria-label={menuOpen ? 'Stäng meny' : 'Öppna meny'}
	>
		<span class="hamburger-line"></span>
		<span class="hamburger-line"></span>
		<span class="hamburger-line"></span>
	</button>

	<div class="navbar-menu" class:open={menuOpen}>
		<a href="/wizard" class="navbar-link" class:active={pathname.startsWith('/wizard')} onclick={closeMenu}>Ny anteckning</a>

		{#if authStore.isLoggedIn}
			<a href="/journal" class="navbar-link" class:active={pathname === '/journal'} onclick={closeMenu}>Dagboksarkiv</a>
			<a href="/profile" class="navbar-link" class:active={pathname === '/profile'} onclick={closeMenu}>Min profil</a>
			<button class="navbar-link navbar-btn" onclick={handleSignOut}>Logga ut</button>
		{:else}
			<a href="/login" class="navbar-link" class:active={pathname === '/login'} onclick={closeMenu}>Logga in</a>
		{/if}

		<div class="navbar-theme">
			<ThemeToggle variant="inline" />
		</div>
	</div>
</nav>

{#if menuOpen}
	<button class="overlay" onclick={closeMenu} aria-label="Stäng meny"></button>
{/if}

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.25rem;
		padding-top: calc(env(safe-area-inset-top, 0px) + 0.75rem);
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
	}

	.navbar-brand {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		color: var(--color-text);
		text-decoration: none;
	}

	.navbar-menu {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.navbar-link {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		text-decoration: none;
		transition: color 0.15s ease;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.navbar-link:hover,
	.navbar-link.active {
		color: var(--color-text);
	}

	.navbar-theme {
		display: flex;
		align-items: center;
		margin-left: 0.25rem;
	}

	/* Hamburger */
	.hamburger {
		display: none;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
		width: 2rem;
		height: 2rem;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
	}

	.hamburger-line {
		display: block;
		width: 100%;
		height: 2px;
		background: var(--color-text);
		border-radius: 1px;
		transition: transform 0.2s ease, opacity 0.2s ease;
	}

	.hamburger.open .hamburger-line:nth-child(1) {
		transform: translateY(6px) rotate(45deg);
	}

	.hamburger.open .hamburger-line:nth-child(2) {
		opacity: 0;
	}

	.hamburger.open .hamburger-line:nth-child(3) {
		transform: translateY(-6px) rotate(-45deg);
	}

	.overlay {
		display: none;
	}

	@media (max-width: 600px) {
		.hamburger {
			display: flex;
		}

		.navbar-menu {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			flex-direction: column;
			align-items: flex-start;
			gap: 0;
			padding: 0.5rem 0;
			background: var(--color-bg);
			border-bottom: 1px solid var(--color-border);
			box-shadow: var(--shadow-sm);
		}

		.navbar-menu.open {
			display: flex;
		}

		.navbar-link {
			width: 100%;
			padding: 0.75rem 1.25rem;
			font-size: var(--text-base);
		}

		.navbar-theme {
			padding: 0.75rem 1.25rem;
			margin-left: 0;
		}

		.overlay {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 40;
			background: transparent;
			border: none;
			cursor: default;
		}
	}
</style>

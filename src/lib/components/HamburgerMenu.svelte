<script lang="ts">
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/auth.svelte';
	import { accentStore } from '$lib/stores/accent.svelte';
	import type { Accent } from '$lib/stores/accent.svelte';
	import { Emoji } from '$lib/assets/emojis';

	const hamburgerComponents: Record<Accent, string> = {
		pink: 'menu-pink',
		amber: 'menu-amber',
		blue: 'menu-blue',
		lime: 'menu-lime',
		red: 'menu-red'
	};

	let HamburgerIcon = $derived(hamburgerComponents[accentStore.current]);

	let open = $state(false);

	const links = [
		{ href: '/community', label: 'Gemenskapen' },
		{ href: '/about', label: 'Om Storify' },
		{ href: '/guide', label: 'Användarguide' },
		{ href: '/contact', label: 'Kontaktsida' },
		{ href: '/privacy', label: 'Integritetspolicy' },
		{ href: '/cookies', label: 'Cookiepolicy' },
		{ href: '/terms', label: 'Användarvillkor' }
	];

	const authLink = $derived(
		authStore.isLoggedIn
			? { href: '/profile', label: 'Mina sidor' }
			: { href: '/login', label: 'Logga in' }
	);

	const allLinks = $derived([authLink, ...links]);
	const visibleLinks = $derived(allLinks.filter((link) => link.href !== page.url.pathname));

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={close} onkeydown={close}></div>
{/if}

<div class="hamburger-menu">
	<button
		class="hamburger-button"
		onclick={toggle}
		aria-label={open ? 'Stäng meny' : 'Öppna meny'}
		aria-expanded={open}
	>
		<Emoji name={HamburgerIcon} size={30} />
	</button>

	{#if open}
		<nav class="dropdown" aria-label="Huvudmeny">
			<div class="dropdown-header">
				<span class="dropdown-kicker">Storify</span>
				<h2 class="dropdown-title">Huvudmeny</h2>
			</div>

			<div class="dropdown-links">
				{#each visibleLinks as link}
					<a href={link.href} class="dropdown-link" onclick={close}>
						<span class="dropdown-link-marker" aria-hidden="true"></span>
						<span class="dropdown-link-label">{link.label}</span>
						<span class="dropdown-link-trim" aria-hidden="true"></span>
					</a>
				{/each}
			</div>
		</nav>
	{/if}
</div>

<style>
	.hamburger-menu {
		position: relative;
	}

	.hamburger-button {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		transition: transform 0.1s ease;
	}

	.hamburger-button:hover {
		opacity: 0.8;
	}

	.hamburger-button:active {
		transform: scale(0.9);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 99;
		background: color-mix(in srgb, var(--color-bg) 18%, transparent);
		backdrop-filter: blur(6px);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		z-index: 100;
		display: flex;
		flex-direction: column;
		width: min(16rem, calc(100vw - 2.5rem));
		padding: 0.5rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow:
			0 18px 40px rgba(0, 0, 0, 0.12),
			0 0 0 1px color-mix(in srgb, var(--color-border) 70%, transparent),
			inset 0 1px 0 color-mix(in srgb, var(--color-bg) 75%, white);
		transform-origin: top right;
		animation: dropdown-in 0.16s ease-out;
	}

	.dropdown-header {
		display: flex;
		flex-direction: column;
		gap: 0.28rem;
		padding: 0.4rem 0.45rem 0.7rem;
		border-bottom: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
	}

	.dropdown-kicker {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		line-height: 1;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent);
	}

	.dropdown-title {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		line-height: 1;
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-tighter);
		color: var(--color-text);
	}

	.dropdown-links {
		display: flex;
		flex-direction: column;
		padding-top: 0.35rem;
	}

	.dropdown-link {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		column-gap: 0.75rem;
		padding: 0.8rem 0.8rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		text-decoration: none;
		border-radius: var(--radius-md);
		transition:
			background-color 0.14s ease,
			transform 0.14s ease,
			color 0.14s ease;
	}

	.dropdown-link:hover {
		background: color-mix(in srgb, var(--color-accent) 9%, var(--color-bg-elevated));
		transform: translateX(-2px);
	}

	.dropdown-link:focus-visible {
		outline: none;
		background: color-mix(in srgb, var(--color-accent) 10%, var(--color-bg-elevated));
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 22%, transparent);
	}

	.dropdown-link-marker {
		width: 0.42rem;
		height: 0.42rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-accent) 72%, var(--color-bg-elevated));
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 12%, transparent);
		transition:
			transform 0.14s ease,
			box-shadow 0.14s ease;
	}

	.dropdown-link-label {
		min-width: 0;
	}

	.dropdown-link-trim {
		width: 0.8rem;
		height: 0.8rem;
		border-top: 1.5px solid color-mix(in srgb, var(--color-text-muted) 65%, transparent);
		border-right: 1.5px solid color-mix(in srgb, var(--color-text-muted) 65%, transparent);
		transform: rotate(45deg) scale(0.82);
		transition:
			transform 0.14s ease,
			border-color 0.14s ease;
	}

	.dropdown-link:hover .dropdown-link-marker {
		transform: scale(1.18);
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-accent) 16%, transparent);
	}

	.dropdown-link:hover .dropdown-link-trim {
		border-color: var(--color-accent);
		transform: translateX(2px) rotate(45deg) scale(0.82);
	}

	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: translateY(-0.3rem) scale(0.97);
		}

		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>

<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	import HamburgerMenu from './HamburgerMenu.svelte';

	let pathname: string = $derived(page.url.pathname);
	const staticPagePaths = new Set(['/about', '/cookies', '/privacy', '/terms']);
	const staticLinks = [
		{ href: '/', label: 'Hem' },
		{ href: '/guide', label: 'Guide' },
		{ href: '/contact', label: 'Kontakt' }
	];
	let useStaticNav = $derived(staticPagePaths.has(pathname));
</script>

<nav class="navbar" class:no-border={pathname.startsWith('/wizard')}>
	<div class="navbar-inner">
		<div class="navbar-left">
			<a href="/" class="navbar-brand">Storify</a>
		</div>

		{#if useStaticNav}
			<div class="navbar-actions navbar-links" aria-label="Snabblänkar">
				{#each staticLinks as link}
					{#if link.href !== pathname}
						<a href={link.href} class="navbar-link">{link.label}</a>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="navbar-actions">
				<ThemeToggle variant="inline" />
				<HamburgerMenu />
			</div>
		{/if}
	</div>
</nav>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		padding: 0.75rem 1.25rem;
		padding-top: calc(env(safe-area-inset-top, 0px) + 0.75rem);
		background: var(--color-bg);
	}

	.navbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: var(--content-width);
		margin: 0 auto;
		width: 100%;
	}

	.navbar.no-border {
		border-bottom: none;
	}

	.navbar-left {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.navbar-brand {
		display: flex;
		align-items: center;
		min-height: 2.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-xl);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		line-height: 1;
		color: var(--color-text);
		text-decoration: none;
	}

	.navbar-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.navbar-links {
		gap: 1rem;
	}

	.navbar-link {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.navbar-link:hover {
		color: var(--color-text);
		text-decoration: underline;
		text-underline-offset: 0.2rem;
	}

	@media (max-width: 480px) {
		.navbar-links {
			gap: 0.75rem;
		}

		.navbar-link {
			font-size: var(--text-xs);
		}
	}
</style>

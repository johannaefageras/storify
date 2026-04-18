<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	import HamburgerMenu from './HamburgerMenu.svelte';

	let pathname: string = $derived(page.url.pathname);
</script>

<nav class="navbar" class:no-border={pathname.startsWith('/wizard')}>
	<div class="navbar-inner">
		<div class="navbar-left">
			<a href="/" class="navbar-brand">Storify</a>
		</div>

		<div class="navbar-actions">
			<ThemeToggle variant="inline" />
			<HamburgerMenu />
		</div>
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
		background-image: linear-gradient(var(--color-accent), var(--color-accent));
		background-size: 0% 3px;
		background-repeat: no-repeat;
		background-position: 0 94%;
		transition: background-size 0.3s ease;
	}

	.navbar-brand:hover {
		background-size: 100% 3px;
	}

	.navbar-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

</style>

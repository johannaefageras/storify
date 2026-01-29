<script>
	import { page } from '$app/state';

	const links = [
		{ href: '/', label: 'Start' },
		{ href: '/about', label: 'Om' },
		{ href: '/guide', label: 'Guide' },
		{ href: '/contact', label: 'Kontakt' },
		{ href: '/privacy', label: 'Integritet' },
		{ href: '/cookies', label: 'Kakor' },
		{ href: '/terms', label: 'Villkor' }
	];

	const visibleLinks = $derived(links.filter(link => link.href !== page.url.pathname));
</script>

<footer class="legal-footer">
	<nav class="legal-links">
		{#each visibleLinks as link}
			<a href={link.href}>{link.label}</a>
		{/each}
	</nav>
	<div class="copyright">
		Upphovsrätt © Storify 2026
	</div>
</footer>

<style>
	.legal-footer {
		margin-top: 3rem;
		padding-top: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		align-self: center;
		gap: 1rem;
		font-family: var(--font-primary);
		width: 100%;
		max-width: 720px;
	}

	.legal-links {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.legal-links a {
		color: var(--color-text-muted);
		opacity: 0.5;
		font-size: var(--text-xs);
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.legal-links a:hover {
		opacity: 1;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.legal-links a:not(:first-child)::before {
		content: '·';
		margin-right: 0.5rem;
		opacity: 0.6;
	}

	.copyright {
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
		width: 100%;
		text-align: center;
		color: var(--color-text-muted);
		opacity: 0.4;
		font-size: var(--text-xs);
	}
</style>

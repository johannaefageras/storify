<footer class="legal-footer">
	<nav class="footer-links" aria-label="Juridisk information">
		<a href="/privacy">Integritetspolicy</a>
		<span class="separator" aria-hidden="true">·</span>
		<a href="/terms">Användarvillkor</a>
		<span class="separator" aria-hidden="true">·</span>
		<a href="/cookies">Cookiepolicy</a>
	</nav>
</footer>

<style>
	.legal-footer {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		align-self: center;
		font-family: var(--font-primary);
		width: 100%;
		max-width: 720px;
	}

	.footer-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		padding-top: 1rem;
		padding-bottom: 1.5rem;
		width: 100%;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		opacity: 0.6;
	}

	.footer-links a {
		color: inherit;
		text-decoration: none;
		transition: opacity 0.15s ease, color 0.15s ease;
	}

	.footer-links a:hover {
		color: var(--color-accent);
		opacity: 1;
	}

	.separator {
		user-select: none;
	}
</style>

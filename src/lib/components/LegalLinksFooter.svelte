<footer class="legal-footer">
	<nav class="legal-links">
		<a href="/">Start</a>
		<span class="separator">&middot;</span>
		<a href="/guide">Guide</a>
		<span class="separator">&middot;</span>
		<a href="/about">Om</a>
		<span class="separator">&middot;</span>
		<a href="/contact">Kontakt</a>
		<span class="separator">&middot;</span>
		<a href="/privacy">Integritet</a>
		<span class="separator">&middot;</span>
		<a href="/cookies">Kakor</a>
		<span class="separator">&middot;</span>
		<a href="/terms">Villkor</a>
	</nav>
</footer>

<style>
	.legal-footer {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		font-family: var(--font-primary);
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

	.legal-links .separator {
		color: var(--color-text-muted);
		opacity: 0.3;
		font-size: var(--text-xs);
	}
</style>

<script lang="ts">
	import { CONTACT_EMAIL, LEGAL_ORG_NUMBER, SOURCE_CODE_URL } from '$lib/data/legal';
	import { Emoji } from '$lib/assets/emojis';
	import { accentStore } from '$lib/stores/accent.svelte';
	import facebookIcon from '$lib/assets/icons/social-facebook.svg';
	import githubIcon from '$lib/assets/icons/social-github.svg?raw';
	import instagramIcon from '$lib/assets/icons/social-instagram.svg';
	import discordIcon from '$lib/assets/icons/social-discord.svg';
	import tiktokIcon from '$lib/assets/icons/social-tiktok.svg?raw';

	const flowerByAccent = {
		pink: 'rose',
		amber: 'sunflower',
		blue: 'tulip',
		emerald: 'herb',
		purple: 'hyacinth',
		rust: 'hibiscus'
	} as const;

	const socialLinks = [
		{ label: 'Facebook', href: '#', icon: facebookIcon },
		{ label: 'GitHub', href: '#', icon: githubIcon, inline: true },
		{ label: 'Instagram', href: '#', icon: instagramIcon },
		{ label: 'Discord', href: '#', icon: discordIcon },
		{ label: 'TikTok', href: '#', icon: tiktokIcon, inline: true }
	];

	let flower = $derived(flowerByAccent[accentStore.current]);
</script>

<footer class="legal-footer">
	<div class="footer-grid">
		<nav class="footer-col footer-links" aria-label="Sidfotslänkar">
			<a href="/about">Om Storify</a>
			<a href="/guide">Användarguide</a>
			<a href="/contact">Kontaktsida</a>
			<a href="/changelog">Uppdateringar</a>
		</nav>
		<nav class="footer-col footer-links" aria-label="Juridiska länkar">
			<a href="/privacy">Integritetspolicy</a>
			<a href="/terms">Användarvillkor</a>
			<a href="/cookies">Cookiepolicy</a>
			<a href="/accessibility">Tillgänglighet</a>
		</nav>
		<div class="footer-col footer-identity">
			<p>© Storify 2026</p>
			<p>Johanna Fagerås</p>
			<p>Org.nr. {LEGAL_ORG_NUMBER}</p>
			<p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
			<div class="social-links" aria-label="Sociala länkar">
				{#each socialLinks as link}
					<a href={link.href} aria-label={link.label}>
						{#if link.inline}
							{@html link.icon}
						{:else}
							<img src={link.icon} alt="" width="18" height="18" />
						{/if}
					</a>
				{/each}
			</div>
		</div>
		<div class="footer-col footer-flower">
			<a href="/" aria-label="Gå till startsidan">
				<Emoji name={flower} size="6.9rem" />
			</a>
		</div>
	</div>
</footer>

<style>
	.legal-footer {
		margin: 0 calc(50% - 50vw);
		padding: 2rem 1.25rem max(2rem, env(safe-area-inset-bottom, 0px));
		width: 100vw;
		font-family: var(--font-primary);
		background: var(--footer-bg);
	}

	.footer-grid {
		width: 100%;
		max-width: var(--content-width);
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr 1.25fr 1fr;
		gap: 2rem;
		align-items: start;
	}

	.footer-col {
		font-size: var(--text-xs);
		line-height: 1.6;
		color: var(--color-text-muted);
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		text-align: center;
		opacity: 0.7;
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

	.footer-identity {
		text-align: center;
	}

	.footer-identity p {
		margin: 0;
		font-size: inherit;
		line-height: inherit;
		opacity: 0.5;
	}

	.footer-identity a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.footer-identity p a:hover {
		color: var(--color-accent);
	}

	.social-links {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.45rem;
	}

	.social-links a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		color: var(--color-text);
		opacity: 1;
		transition: color 0.15s ease, transform 0.15s ease;
	}

	.social-links a:hover {
		transform: translateY(-1px);
	}

	.social-links img,
	.social-links :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.footer-flower {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.footer-flower a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		transition: transform 0.15s ease;
	}

	.footer-flower a:hover {
		transform: translateY(-1px);
	}

	@media (max-width: 720px) {
		.footer-grid {
			grid-template-columns: 1fr 1fr;
			gap: 1.5rem;
		}

		.footer-flower {
			grid-column: 1 / -1;
			justify-content: center;
		}
	}

	@media (max-width: 420px) {
		.footer-grid {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.footer-links {
			align-items: center;
		}

		.footer-flower {
			justify-content: center;
		}
	}
</style>

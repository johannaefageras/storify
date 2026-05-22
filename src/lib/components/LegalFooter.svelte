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
	<div class="footer-inner">
		<div class="footer-links-row">
			<div class="link-stack">
				<nav class="link-cluster" aria-label="Sidfotslänkar">
					<a href="/about">Om Storify</a>
					<span aria-hidden="true">·</span>
					<a href="/guide">Användarguide</a>
					<span aria-hidden="true">·</span>
					<a href="/contact">Kontakt</a>
					<span aria-hidden="true">·</span>
					<a href="/changelog">Uppdateringar</a>
				</nav>
				<nav class="link-cluster" aria-label="Juridiska länkar">
					<a href="/privacy">Integritetspolicy</a>
					<span aria-hidden="true">·</span>
					<a href="/terms">Användarvillkor</a>
					<span aria-hidden="true">·</span>
					<a href="/cookies">Cookiepolicy</a>
					<span aria-hidden="true">·</span>
					<a href="/accessibility">Tillgänglighet</a>
				</nav>
			</div>
			<a href="/" class="links-flower" aria-label="Gå till startsidan">
				<Emoji name={flower} size="4.5rem" />
			</a>
		</div>

		<div class="footer-rule" aria-hidden="true"></div>

		<div class="footer-colophon">
			<p class="colophon-text">
				<span>© Storify 2026</span>
				<span class="sep" aria-hidden="true">·</span>
				<span>Johanna Fagerås</span>
				<span class="sep" aria-hidden="true">·</span>
				<span>Org.nr. {LEGAL_ORG_NUMBER}</span>
				<span class="sep" aria-hidden="true">·</span>
				<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
			</p>
			<div class="social-links" aria-label="Sociala länkar">
				{#each socialLinks as link}
					<a href={link.href} aria-label={link.label}>
						{#if link.inline}
							{@html link.icon}
						{:else}
							<img src={link.icon} alt="" width="16" height="16" />
						{/if}
					</a>
				{/each}
			</div>
		</div>
	</div>
</footer>

<style>
	.legal-footer {
		margin: 4rem calc(50% - 50vw) 0;
		padding: 3rem 1.5rem max(2.25rem, env(safe-area-inset-bottom, 0px));
		width: 100vw;
		font-family: var(--font-primary);
		background: var(--footer-bg);
		color: var(--color-text-muted);
	}

	.footer-inner {
		width: 100%;
		max-width: var(--content-width);
		margin: 0 auto;
	}

	.footer-rule {
		height: 1px;
		background: currentColor;
		opacity: 0.15;
	}

	.footer-links-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem 2rem;
		padding-bottom: 1.5rem;
		font-size: var(--text-sm);
	}

	.link-stack {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.links-flower {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}

	.links-flower:hover {
		transform: rotate(-4deg);
	}

	.link-cluster {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		opacity: 0.85;
	}

	.link-cluster a {
		color: inherit;
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.link-cluster a:hover {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.link-cluster span {
		opacity: 0.4;
	}

	.footer-colophon {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem 1.5rem;
		padding-top: 1.25rem;
		font-size: var(--text-xs);
	}

	.colophon-text {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		opacity: 0.6;
		line-height: 1.5;
	}

	.colophon-text .sep {
		opacity: 0.5;
	}

	.colophon-text a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.colophon-text a:hover {
		color: var(--color-accent);
	}

	.social-links {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.social-links a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		color: var(--color-text);
		opacity: 0.7;
		transition: opacity 0.15s ease, transform 0.15s ease, color 0.15s ease;
	}

	.social-links a:hover {
		opacity: 1;
		color: var(--color-accent);
		transform: translateY(-1px);
	}

	.social-links img,
	.social-links :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	@media (max-width: 640px) {
		.legal-footer {
			padding: 2.25rem 1.25rem max(2rem, env(safe-area-inset-bottom, 0px));
		}

		.footer-links-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.footer-colophon {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>

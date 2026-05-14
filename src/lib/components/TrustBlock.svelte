<script lang="ts">
	import { Emoji } from '$lib/assets/emojis';
	import { SOURCE_CODE_URL } from '$lib/data/legal';

	const trustItems = [
		{
			icon: 'shield',
			title: 'Privat som standard',
			description:
				'Dina dagboksinlägg är privata tills du väljer att dela i Gemenskapen.',
			href: '/privacy',
			linkText: 'Läs integritetspolicyn'
		},
		{
			icon: 'magic-wand',
			title: 'Ingen AI-träning',
			description: 'Vi använder inte din dagbokstext för att träna AI-modeller.',
			href: '/privacy',
			linkText: 'Så hanteras data'
		},
		{
			icon: 'delivery-truck',
			title: 'Tydliga leverantörer',
			description: 'AI, inloggning, lagring och e-post listas öppet i integritetspolicyn.',
			href: '/privacy',
			linkText: 'Se leverantörer'
		},
		{
			icon: 'tools',
			title: 'Öppen källkod',
			description: 'Koden finns publikt på GitHub och kan granskas av den som vill.',
			href: SOURCE_CODE_URL,
			linkText: 'Se källkoden',
			external: true
		}
	];
</script>

<section class="trust-block" aria-labelledby="trust-heading">
	<div class="trust-header">
		<p class="trust-eyebrow">Trygghet</p>
		<h2 id="trust-heading">Byggt för privata texter</h2>
		<p>
			Storify hanterar dagbokstext som känsligt material. Det ska vara tydligt vad som är
			privat, vilka tjänster appen använder och hur du kan granska projektet.
		</p>
	</div>

	<div class="trust-grid">
		{#each trustItems as item}
			<article class="trust-item">
				<div class="trust-icon">
					<Emoji name={item.icon} size={34} />
				</div>
				<h3>{item.title}</h3>
				<p>{item.description}</p>
				{#if item.external}
					<a href={item.href} target="_blank" rel="noopener noreferrer">{item.linkText}</a>
				{:else}
					<a href={item.href}>{item.linkText}</a>
				{/if}
			</article>
		{/each}
	</div>
</section>

<style>
	.trust-block {
		width: 100%;
	}

	.trust-header {
		max-width: 680px;
		margin: 0 auto 2rem;
		text-align: center;
	}

	.trust-eyebrow {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-accent);
		margin: 0 0 0.75rem;
	}

	h2 {
		font-family: var(--font-primary);
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 110%;
		color: var(--color-text);
		margin: 0 0 1rem;
	}

	.trust-header p {
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-book);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}

	.trust-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.trust-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.65rem;
		min-height: 100%;
		padding: 1.25rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.trust-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 42px;
	}

	h3 {
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin: 0;
	}

	.trust-item p {
		flex: 1;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}

	a {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--color-accent);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	@media (max-width: 640px) {
		.trust-header {
			text-align: left;
		}

		h2 {
			font-size: var(--text-xl);
		}
	}
</style>

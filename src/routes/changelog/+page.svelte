<script lang="ts">
	import { Emoji } from '$lib/assets/emojis';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { changelogEntries } from '$lib/data/changelog';

	const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	function formatDate(date: string) {
		const parsed = new Date(date);
		return Number.isNaN(parsed.getTime()) ? date : dateFormatter.format(parsed);
	}
</script>

<SeoHead
	title="Uppdateringar – Storify"
	description="Se vad som är nytt i Storify: förbättringar, produktuppdateringar och tydligare information för användare."
	path="/changelog"
/>

<main class="changelog-page">
	<header class="page-header">
		<Emoji name="calendar-spiral" size={80} />
		<p class="eyebrow">Produktnytt</p>
		<h1>Uppdateringar</h1>
		<p class="lede">
			Korta anteckningar om vad som ändras i Storify. Fokus ligger på sådant du som användare
			märker: tydligare information, nya ytor, tryggare flöden och produktförbättringar.
		</p>
	</header>

	<ol class="entries">
		{#each changelogEntries as entry}
			<li class="entry">
				<time datetime={entry.date}>{formatDate(entry.date)}</time>
				<h2>{entry.title}</h2>
				<ul>
					{#each entry.notes as note}
						<li>{note}</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ol>

	<LegalFooter />
</main>

<style>
	.changelog-page {
		flex: 1;
		max-width: 48rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 0;
		padding-top: calc(env(safe-area-inset-top, 0px) + 2rem);
		font-family: var(--font-primary);
		color: var(--color-text);
	}

	.page-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.eyebrow {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-accent);
		margin: 0;
	}

	h1 {
		font-family: var(--font-primary);
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 110%;
		color: var(--color-text);
		margin: 0;
	}

	.lede {
		max-width: 40rem;
		font-size: var(--text-md);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}

	.entries {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 0 0 2rem;
		padding: 0;
	}

	.entry {
		padding: 1.25rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	time {
		display: block;
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
		margin-bottom: 0.4rem;
	}

	h2 {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin: 0 0 0.75rem;
	}

	.entry ul {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin: 0;
		padding-left: 1.15rem;
	}

	.entry li {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
	}

	@media (max-width: 520px) {
		.page-header {
			align-items: flex-start;
			text-align: left;
		}

		.entry {
			padding: 1rem;
		}
	}
</style>

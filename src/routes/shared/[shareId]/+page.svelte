<script lang="ts">
	import DiaryCard from '$lib/components/DiaryCard.svelte';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const swedishMonths: Record<string, string> = {
		'01': 'januari', '02': 'februari', '03': 'mars', '04': 'april',
		'05': 'maj', '06': 'juni', '07': 'juli', '08': 'augusti',
		'09': 'september', '10': 'oktober', '11': 'november', '12': 'december'
	};

	const swedishWeekdays: Record<string, string> = {
		'0': 'Söndag', '1': 'Måndag', '2': 'Tisdag', '3': 'Onsdag',
		'4': 'Torsdag', '5': 'Fredag', '6': 'Lördag'
	};

	function formatDate(dateStr: string): { weekday: string; date: string } {
		const d = new Date(dateStr + 'T00:00:00');
		const weekday = swedishWeekdays[String(d.getDay())] || '';
		const day = d.getDate();
		const month = swedishMonths[String(d.getMonth() + 1).padStart(2, '0')] || '';
		const year = d.getFullYear();
		return { weekday, date: `${day} ${month} ${year}` };
	}

	const { weekday, date } = formatDate(data.entry.entry_date);
	const displayWeekday = weekday || data.entry.weekday || '';

	const excerpt = data.entry.generated_text.replace(/\s+/g, ' ').trim().slice(0, 180);
	const ogDescription = excerpt.length === 180 ? excerpt + '…' : excerpt;
	const ogTitle = `Dagbok – ${displayWeekday} ${date}`;
	const canonical = $derived($page.url.origin + $page.url.pathname);
</script>

<svelte:head>
	<title>{ogTitle} · Storify</title>
	<meta name="description" content={ogDescription} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={ogTitle} />
	<meta property="og:description" content={ogDescription} />
	<meta property="og:url" content={canonical} />
	<meta property="og:site_name" content="Storify" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={ogTitle} />
	<meta name="twitter:description" content={ogDescription} />
</svelte:head>

<div class="shared-page">
	<div class="shared-container">
		<DiaryCard
			weekday={displayWeekday}
			{date}
			emojis={data.entry.emojis || []}
			toneId={data.entry.tone_id}
			generatedText={data.entry.generated_text}
		/>

		<div class="shared-cta">
			<p class="cta-text">Skapa din egen AI-dagbok</p>
			<a class="btn btn-primary" href="/">Kom igång</a>
		</div>
	</div>
	<LegalFooter />
</div>

<style>
	.shared-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem 1rem;
	}

	.shared-container {
		flex: 1;
		width: 100%;
		max-width: var(--content-width);
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.shared-cta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-align: center;
	}

	.cta-text {
		margin: 0;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { accentStore } from '$lib/stores/accent.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import { getGreeting, getSubtitle } from '$lib/data/greetings';
	import { getLandingTonePreview } from '$lib/data/landingTonePreviews';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import DiaryCard from '$lib/components/DiaryCard.svelte';
	import TrustBlock from '$lib/components/TrustBlock.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { ACTIVE_TONE_COUNT } from '$lib/data/tones';

	const roseComponents = {
		pink: 'rose',
		amber: 'sunflower',
		blue: 'tulip',
		emerald: 'herb',
		purple: 'hyacinth',
		rust: 'hibiscus'
	};

	let RoseIcon = $derived(roseComponents[accentStore.current]);

	let isLoggedIn = $derived(authStore.isLoggedIn);
	let firstName = $derived(wizardStore.data.profile.name.split(' ')[0]);
	let greeting = $derived(isLoggedIn && firstName ? getGreeting(firstName) : '');
	let subtitle = $derived(isLoggedIn && firstName ? getSubtitle() : '');
	const metaDescription = `Tom dagbokssida-panik är på riktigt, och "börja bara skriva" är ett värdelöst råd. Storify är en AI-dagbok som ställer frågor som faktiskt går att svara på. ${ACTIVE_TONE_COUNT} röster. Helt privat. Inget flum.`;
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Storify',
		description: 'Skapa personliga dagboksinlägg med AI. Besvara frågor om din dag och få en unik dagboksanteckning i din valda berättarröst.',
		url: 'https://mystorify.se',
		applicationCategory: 'LifestyleApplication',
		operatingSystem: 'Web, Android',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'SEK'
		},
		inLanguage: 'sv'
	};

	interface ModeCard {
		id: string;
		title: string;
		description: string;
		href: string;
		icon: string;
		comingSoon: boolean;
	}

	const modeCards: ModeCard[] = [
		{
			id: 'interview',
			title: 'AI-intervju',
			description: 'Chatta med AI som ställer relevanta frågor om din dag.',
			href: '/interview',
			icon: 'speaking-head',
			comingSoon: false
		},
		{
			id: 'speak',
			title: 'Tala in',
			description: 'Diktera dagens tankar istället för att skriva.',
			href: '/speak',
			icon: 'studio-microphone',
			comingSoon: false
		},
		{
			id: 'quick',
			title: 'Snabbläge',
			description: 'Fånga dagens känsla på under en minut, utan krångel.',
			href: '/quick',
			icon: 'rocket',
			comingSoon: false
		},
		{
			id: 'wizard',
			title: 'Steg-för-steg',
			description: 'Svara på frågor om din dag och få en detaljerad dagbokstext.',
			href: '/wizard',
			icon: 'compass',
			comingSoon: false
		},
		{
			id: 'editor',
			title: 'Skriv fritt',
			description: 'Skriv fritt med AI-stöd som förfinar din text, när du vill.',
			href: '/editor',
			icon: 'pencil',
			comingSoon: false
		}
	];

	const steps = [
		{
			number: '01',
			icon: 'speaking-head',
			title: 'Berätta',
			description: 'Svara på några korta frågor – eller chatta fritt – om din dag.'
		},
		{
			number: '02',
			icon: 'magic-wand',
			title: 'AI förvandlar',
			description: 'Stödorden blir till en sammanhängande text i din valda berättarröst.'
		},
		{
			number: '03',
			icon: 'open-book',
			title: 'Spara minnet',
			description: 'Din dagbokssida läggs i din privata journal. Exportera som PDF om du vill.'
		}
	];

	const featuredTones = [
		{ id: 'martyren', name: 'Martyren', icon: 'headstone', preview: 'Jag tog det själv. Någon behövde ju bära dagens lilla börda.' },
		{ id: 'cynikern', name: 'Cynikern', icon: 'face-unamused', preview: 'Det gick bra. Inte för att jag förväntade mig det, men ibland har världen sina ögonblick.' },
		{ id: 'livscoachen', name: 'Livscoachen', icon: 'woman-meditating', preview: 'Ibland är de långsamma dagarna de viktigaste. Du är nog. Precis som du är.' },
		{ id: 'akademikern', name: 'Akademikern', icon: 'top-hat', preview: 'Dagens preliminära tes: även en tisdag kan erbjuda intressant empiri.' },
		{ id: 'shakespeare', name: 'Shakespeare', icon: 'theater-masks', preview: 'Hör, vad ljus från morgonfönstret bryter? Det är alarmet, och jag är trött.' },
		{ id: 'roboten', name: 'AI-Roboten', icon: 'robot', preview: 'SYSTEMLOGG: Ny dag initierad. Status: operationell.' },
		{ id: 'psykologen', name: 'Psykologen', icon: 'brain', preview: 'Jag hör att det var en utmanande dag. Det är okej att känna så.' },
		{ id: 'gamern', name: 'Gamern', icon: 'video-game', preview: '[QUEST ACCEPTED] Överlev måndagen. Reward: +10 XP' },
		{ id: 'britten', name: 'Britten', icon: 'flag-uk', preview: 'Rather uneventful day, I must say. Not bad though.' },
		{ id: 'filosofen', name: 'Filosofen', icon: 'owl', preview: 'Vad är egentligen en dag, om inte en samling ögonblick...' },
		{ id: 'berattaren', name: 'Berättaren', icon: 'open-book', preview: 'Det var en grå tisdag när allt förändrades...' },
		{ id: 'sportkommentatorn', name: 'Sportkommentatorn', icon: 'soccer-ball', preview: 'OCH HAN KLIVER UPP UR SÄNGEN! Vilken start på dagen!' }
	];
	const additionalToneCount = Math.max(ACTIVE_TONE_COUNT - featuredTones.length, 0);

	let randomizedTonePreviews = $state<Record<string, string>>({});

	onMount(() => {
		randomizedTonePreviews = Object.fromEntries(
			featuredTones.map((tone) => [tone.id, getLandingTonePreview(tone.id, tone.preview)])
		);
	});

	const features: Array<{ icon: string; title: string; description: string; href?: string }> = [
		{ icon: 'studio-microphone', title: 'Tala in', description: 'Diktera dagens tankar istället för att skriva – AI:n gör om rösten till text.' },
		{ icon: 'page', title: 'PDF-export', description: 'Skriv ut eller spara dina sidor som vackra PDF:er.' },
		{ icon: 'old-key', title: 'Privat dagbok', description: 'Alla dina dagboksinlägg samlade och sökbara på ett ställe.' },
		{ icon: 'palette', title: 'Personlig stil', description: 'Välj accentfärg, typsnitt och tema som passar dig.' },
		{ icon: 'crystal-ball', title: 'Tillägg', description: 'Lägg till horoskop, "denna dag i historien" eller en kort reflektionsuppgift.' },
		{ icon: 'users-silhouette', title: 'Community', description: 'Dela utvalda inlägg anonymt om du vill – eller behåll allt för dig själv.' }
	];

	const proofInput = [
		'Vaknade före alarmet och låg kvar en stund.',
		'Regn mot fönstret, kallt kaffe, svårt att fokusera.',
		'Petra ringde och vi pratade om nästan ingenting.',
		'Blev kvar med boken i knät på kvällen.'
	];

	const proofEntries = [
		{
			label: 'Dagboksskribenten',
			weekday: 'Tisdag',
			date: '12 mars 2026',
			emojis: ['hot-beverage', 'rain-cloud', 'open-book'],
			toneId: 'dagboksskribenten',
			title: 'En lugn tisdag hemma',
			generatedText:
				'Vaknade före alarmet idag, vilket nästan aldrig händer. Låg bara kvar en stund och lyssnade på regnet mot rutan. Skönt på något sätt, men också svårt att riktigt komma igång.\n\nKaffet hann bli kallt innan jag drack upp det. Det är en sån där förmiddag där tankarna inte vill samarbeta — man läser samma rad tre gånger och ändå fastnar inget.\n\nPetra ringde efter lunch. Vi pratade om nästan ingenting, ärligt talat. Lite om vädret, lite om en gemensam bekant. Men det var skönt att höra hennes röst. Sånt räknas.\n\nTog kvällen lugnt. Satt med boken i knät utan att läsa särskilt mycket. Det fick vara så. Inte alla dagar måste vara produktiva.'
		},
		{
			label: 'Filosofen',
			weekday: 'Tisdag',
			date: '12 mars 2026',
			emojis: ['hot-beverage', 'rain-cloud', 'open-book'],
			toneId: 'filosofen',
			title: 'Det stilla i en grå dag',
			generatedText:
				'Det är något särskilt med dagar då man vaknar innan alarmet. Som om kroppen vet något som klockan ännu inte hunnit ifatt. Jag låg kvar en stund och lyssnade på regnet, utan att riktigt veta vad jag väntade på.\n\nKaffet kallnade medan jag tittade ut. Det är märkligt hur fokus är något man inte kan tvinga fram. Det kommer när det vill, och idag ville det inte.\n\nSen ringde Petra och vi pratade om nästan ingenting. Det är kanske ofta i de samtalen som något egentligen finns — inte i orden, utan i att någon valde att höra av sig utan ärende.\n\nPå kvällen låg boken i mitt knä, mest oläst. Jag undrar om det är så lugn ser ut. Eller om jag bara inte hade märkt den förrän nu.'
		},
		{
			label: 'Foliehatten',
			weekday: 'Tisdag',
			date: '12 mars 2026',
			emojis: ['hot-beverage', 'rain-cloud', 'open-book'],
			toneId: 'foliehatten',
			title: 'Något stämde inte idag',
			generatedText:
				'Vaknade *exakt* tre minuter före alarmet. Tre. Som i triangel. Jag säger bara.\n\nRegnet började *precis* när jag steg ur sängen. Inte innan. Inte efter. Sammanträffande? Tänk efter.\n\nKaffet blev kallt ovanligt snabbt. Som om någon ville att jag skulle vara okoncentrerad just idag, av alla dagar. *Bekvämt*, eller hur?\n\nSen ringde Petra. Det här är inte om henne. Det här är om *timingen*. Klockan var 14:14 — samma siffra två gånger. Vi pratade om nästan ingenting, vilket är *exakt* vad man säger när det egentligen handlar om allt.\n\nPå kvällen låg boken i mitt knä. Oläst. Imorgon gräver jag djupare. Om de låter mig.'
		}
	];

</script>

<SeoHead
	title="Privat AI-dagbok som ställer frågor | Storify"
	description={metaDescription}
	path="/"
/>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

{#if isLoggedIn}
	<main class="dashboard">
		<div class="dashboard-container">
			<div class="dashboard-main">
				<header class="dashboard-hero">
					<div class="dashboard-logo">
						<Emoji name={RoseIcon} size={96} />
					</div>
					{#if firstName}
						<h1 class="dashboard-title">{greeting}</h1>
						<p class="dashboard-subtitle">{subtitle}</p>
					{:else}
						<h1 class="dashboard-title">Storify</h1>
						<p class="dashboard-subtitle">Vad vill du göra idag?</p>
					{/if}
				</header>

				<div class="mode-grid">
					{#each modeCards as card}
						<a href={card.href} class="mode-card" class:coming-soon={card.comingSoon}>
							<div class="mode-card-icon">
								<Emoji name={card.icon} size={36} />
							</div>
							<div class="mode-card-content">
								<h2 class="mode-card-title">{card.title}</h2>
								<p class="mode-card-description">{card.description}</p>
							</div>
							{#if card.comingSoon}
								<span class="mode-card-badge">Snart</span>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		</div>

		<div class="dashboard-footer">
			<LegalFooter />
		</div>
	</main>
{:else}
	<main class="landing">
		<!-- Hero -->
		<section class="hero">
			<div class="hero-inner">
				<div class="hero-logo">
					<Emoji name={RoseIcon} size={120} />
				</div>
				<h1 class="hero-title">Du har inte tid att skriva dagbok.</h1>
				<p class="hero-tagline">Perfekt – det behöver du inte heller.</p>
				<p class="hero-subtitle">
					Storify är en privat AI-dagbok som ställer frågor som faktiskt går att svara på.
					Berätta i två minuter. Få tillbaka en text du faktiskt vill läsa om tio år.
				</p>
				<div class="hero-cta">
					<a href="/interview" class="btn btn-primary">Kom igång</a>
					<a href="/login" class="btn btn-secondary">Logga in</a>
				</div>
				<p class="hero-meta">Gratis under beta · Ingen app att ladda ner · Helt på svenska</p>
			</div>
		</section>

		<!-- Problem -->
		<section class="section section-problem">
			<div class="section-inner narrow">
				<p class="eyebrow">Känner du igen dig?</p>
				<h2 class="section-title">Glömmer dina dagar bort sig?</h2>
				<p class="section-lede">
					Du tänker att du borde skriva ner det – möten, samtal, små ögonblick som faktiskt
					betydde något. Sen är det kväll och du är trött och den blanka sidan stirrar
					tillbaka. Så blir det aldrig av.
				</p>
				<p class="section-lede muted">
					"Börja bara skriva" är ett värdelöst råd. Storify ställer frågorna åt dig.
				</p>
			</div>
		</section>

		<!-- How it works -->
		<section class="section section-steps">
			<div class="section-inner">
				<p class="eyebrow">Så funkar det</p>
				<h2 class="section-title">Tre minuter. Tre steg.</h2>
				<div class="steps-grid">
					{#each steps as step}
						<div class="step-card">
							<div class="step-number">{step.number}</div>
							<div class="step-icon">
								<Emoji name={step.icon} size={48} />
							</div>
							<h3 class="step-title">{step.title}</h3>
							<p class="step-description">{step.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Modes -->
		<section class="section section-modes">
			<div class="section-inner">
				<p class="eyebrow">Lägen</p>
				<h2 class="section-title">Hitta ditt sätt att skriva</h2>
				<p class="section-lede center">
					Vissa dagar vill du prata, andra dagar vill du bara klicka i kryssrutor.
					Välj fritt – byt när du vill.
				</p>
				<div class="mode-grid mode-grid-landing">
					{#each modeCards as card}
						<a href={card.href} class="mode-card" class:coming-soon={card.comingSoon}>
							<div class="mode-card-icon">
								<Emoji name={card.icon} size={40} />
							</div>
							<div class="mode-card-content">
								<h3 class="mode-card-title">{card.title}</h3>
								<p class="mode-card-description">{card.description}</p>
							</div>
							{#if card.comingSoon}
								<span class="mode-card-badge">Snart</span>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		</section>

		<!-- Tones -->
		<section class="section section-tones">
			<div class="section-inner">
				<p class="eyebrow">Berättarröster</p>
				<h2 class="section-title">Din dag, i {ACTIVE_TONE_COUNT} olika röster</h2>
				<p class="section-lede center">
					Klassisk dagbok? Klart. Eller berätta som en pirat, en sportkommentator, en katt
					eller en filosof. Samma dag – helt olika minne.
				</p>
				<div class="tones-grid">
					{#each featuredTones as tone}
						<div class="tone-card">
							<span class="tone-icon">
								<Emoji name={tone.icon} size={40} />
							</span>
							<span class="tone-name">{tone.name}</span>
							<p class="tone-preview">{randomizedTonePreviews[tone.id] ?? tone.preview}</p>
						</div>
					{/each}
				</div>
				{#if additionalToneCount > 0}
					<p class="tones-footnote">
						…och {additionalToneCount} till. Influencern, Foliehatten, Tonåringen, Multitaskaren…
						<a href="/voices" class="tones-link">Utforska alla röster →</a>
					</p>
				{:else}
					<p class="tones-footnote">
						<a href="/voices" class="tones-link">Utforska alla röster →</a>
					</p>
				{/if}
			</div>
		</section>

		<!-- Sample entry -->
		<section class="section section-sample">
			<div class="section-inner">
				<p class="eyebrow">Så här ser det ut</p>
				<h2 class="section-title">Samma dag. Tre helt olika texter.</h2>
				<p class="section-lede center">
					Du lämnar stödord. Storify gör dem till en dagbokstext i den röst du väljer.
				</p>
				<div class="proof-layout">
					<article class="proof-input">
						<div class="proof-input-header">
							<Emoji name="pencil" size={28} />
							<h3>Det du berättade</h3>
						</div>
						<p class="proof-input-text">
							{proofInput.join(' ')}
						</p>
					</article>

					<div class="proof-output-grid">
						{#each proofEntries as entry}
							<article class="proof-card" aria-label={`Exempel i rösten ${entry.label}`}>
								<DiaryCard
									weekday={entry.weekday}
									date={entry.date}
									emojis={entry.emojis}
									toneId={entry.toneId}
									title={entry.title}
									generatedText={entry.generatedText}
								/>
							</article>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- Features -->
		<section class="section section-features">
			<div class="section-inner">
				<p class="eyebrow">Vad du får</p>
				<h2 class="section-title">Mer än bara text</h2>
				<div class="features-grid">
					{#each features as feature}
						{#if feature.href}
							<a class="feature-card feature-card-link" href={feature.href}>
								<div class="feature-icon">
									<Emoji name={feature.icon} size={36} />
								</div>
								<h3 class="feature-title">{feature.title}</h3>
								<p class="feature-description">{feature.description}</p>
							</a>
						{:else}
							<div class="feature-card">
								<div class="feature-icon">
									<Emoji name={feature.icon} size={36} />
								</div>
								<h3 class="feature-title">{feature.title}</h3>
								<p class="feature-description">{feature.description}</p>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</section>

		<!-- Privacy -->
		<section class="section section-privacy">
			<div class="section-inner narrow">
				<div class="privacy-icon">
					<Emoji name="shield" size={56} />
				</div>
				<h2 class="section-title">Din dagbok är din</h2>
				<p class="section-lede center">
					Allt du skriver är privat som standard. Vi tränar inga AI-modeller på din text.
					Du delar bara det du själv väljer att dela – och du kan radera allt när du vill.
				</p>
			</div>
		</section>

		<!-- Trust -->
		<section class="section section-trust">
			<div class="section-inner">
				<TrustBlock />
			</div>
		</section>

		<!-- Final CTA -->
		<section class="section section-cta">
			<div class="section-inner narrow">
				<h2 class="section-title large">Skriv din första dagbok på två minuter.</h2>
				<p class="section-lede center">
					Gratis under beta. Inget kreditkort.
				</p>
				<div class="hero-cta">
					<a href="/interview" class="btn btn-primary">Kom igång</a>
					<a href="/guide" class="btn btn-secondary">Läs guiden</a>
				</div>
			</div>
		</section>

		<div class="landing-footer">
			<LegalFooter />
		</div>
	</main>
{/if}

<style>
	/* ==========================================================================
	   Logged-in dashboard (preserves existing layout)
	   ========================================================================== */

	.dashboard {
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1.25rem;
		padding-bottom: 0;
		overflow-y: auto;
	}

	.dashboard-container {
		flex: 1 1 auto;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		text-align: center;
		max-width: 600px;
		width: 100%;
	}

	.dashboard-main {
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(1rem, 2.25vh, 1.75rem);
		padding: clamp(0.25rem, 1.4vh, 0.75rem) 0 0;
	}

	.dashboard-logo {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 84px;
		margin-bottom: 1.25rem;
	}

	.dashboard-title {
		font-family: var(--font-primary);
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		margin-bottom: 0.75rem;
		color: var(--color-text);
	}

	.dashboard-subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
	}

	.dashboard-footer {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.dashboard-footer :global(.legal-footer) {
		margin-top: 1.5rem;
	}

	@media (min-width: 640px) {
		.dashboard-title {
			font-size: 3rem;
			font-stretch: 120%;
		}
		.dashboard-subtitle {
			font-size: var(--text-lg);
		}
	}

	/* ==========================================================================
	   Marketing landing
	   ========================================================================== */

	.landing {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.section {
		width: 100%;
		padding: clamp(3rem, 8vh, 6rem) 1.25rem;
	}

	.section:nth-of-type(even) {
		background: var(--color-bg-elevated);
	}

	.section-inner {
		max-width: 960px;
		margin: 0 auto;
		width: 100%;
	}

	.section-inner.narrow {
		max-width: 640px;
		text-align: center;
	}

	.eyebrow {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-accent);
		margin: 0 0 0.75rem 0;
		text-align: center;
	}

	.section-title {
		font-family: var(--font-primary);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		color: var(--color-text);
		margin: 0 0 1.25rem 0;
		text-align: center;
	}

	.section-title.large {
		font-size: clamp(2rem, 5vw, 3rem);
	}

	.section-lede {
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-book);
		line-height: var(--leading-relaxed);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		margin: 0 0 1rem 0;
	}

	.section-lede.center {
		text-align: center;
		max-width: 560px;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 2.5rem;
	}

	.section-lede.muted {
		color: var(--color-text-muted);
	}

	/* Hero */

	.hero {
		padding: clamp(2.5rem, 7vh, 5rem) 1.25rem clamp(3rem, 8vh, 6rem);
		text-align: center;
	}

	.hero-inner {
		max-width: 720px;
		margin: 0 auto;
	}

	.hero-logo {
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

	.hero-title {
		font-family: var(--font-primary);
		font-size: clamp(2rem, 6vw, 3.5rem);
		font-weight: var(--weight-medium);
		font-stretch: 120%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.hero-tagline {
		font-family: var(--font-primary);
		font-size: clamp(1.125rem, 2.5vw, 1.5rem);
		font-weight: var(--weight-book);
		line-height: var(--leading-snug);
		letter-spacing: var(--tracking-tight);
		color: var(--color-accent);
		margin: 0 0 1.5rem 0;
	}

	.hero-subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-book);
		line-height: var(--leading-relaxed);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		max-width: 540px;
		margin: 0 auto 2rem;
	}

	.hero-cta {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 1.25rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 1.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		text-decoration: none;
		border-radius: var(--radius-md);
		border: 1px solid transparent;
		cursor: pointer;
		transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
	}

	.btn:hover {
		transform: translateY(-1px);
		text-decoration: none;
	}

	.btn:active {
		transform: scale(0.98);
	}

	.btn-primary {
		background: var(--color-accent);
		color: #fff;
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
	}

	.btn-secondary {
		background: transparent;
		color: var(--color-text);
		border-color: var(--color-border);
	}

	.btn-secondary:hover {
		background: var(--color-neutral);
	}

	.hero-meta {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-wide);
		margin: 0;
	}

	/* Steps */

	.steps-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
		margin-top: 2.5rem;
	}

	.step-card {
		text-align: center;
		padding: 1.5rem 1rem;
	}

	.step-number {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-widest);
		color: var(--color-accent);
		margin-bottom: 0.75rem;
	}

	.step-icon {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.step-title {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		font-weight: var(--weight-medium);
		font-stretch: 110%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.step-description {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}

	@media (max-width: 720px) {
		.steps-grid {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}
	}

	/* Modes */

	.mode-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
	}

	.mode-grid-landing {
		gap: 0.875rem;
		max-width: 780px;
		margin: 0 auto;
	}

	.mode-card {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		gap: 1.25rem;
		padding: clamp(1.25rem, 3vh, 1.75rem) 1.25rem;
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		text-decoration: none;
		color: inherit;
		transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
		cursor: pointer;
	}

	.section:nth-of-type(even) .mode-card {
		background: var(--color-bg);
	}

	.mode-card-content {
		text-align: left;
		flex: 1 1 auto;
		min-width: 0;
	}

	.mode-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		text-decoration: none;
		border-color: var(--color-accent);
	}

	.mode-card:active {
		transform: scale(0.98);
	}

	.mode-card.coming-soon {
		opacity: 0.6;
	}

	.mode-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.mode-card-title {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
	}

	.mode-card-description {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}

	.mode-card-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		font-family: var(--font-primary);
		font-size: 0.7rem;
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 10%, var(--color-bg-elevated));
		padding: 0.15rem 0.4rem;
		border-radius: var(--radius-sm);
	}

	@media (max-width: 420px) {
		.mode-card {
			gap: 0.875rem;
			padding: 1rem;
		}
	}

	/* Tones */

	.tones-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
	}

	@media (max-width: 720px) {
		.tones-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 420px) {
		.tones-grid {
			grid-template-columns: 1fr;
		}
	}

	.tone-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.5rem;
		padding: 1.25rem 1rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.section:nth-of-type(even) .tone-card {
		background: var(--color-bg-elevated);
	}

	.tone-icon {
		display: inline-flex;
		flex-shrink: 0;
	}

	.tone-name {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text);
	}

	.tone-preview {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		font-style: italic;
		margin: 0;
	}

	.tones-footnote {
		text-align: center;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-wide);
		margin: 1.75rem 0 0 0;
	}

	.tones-link {
		display: inline-block;
		margin-left: 0.5rem;
		color: var(--color-accent);
		font-weight: var(--weight-semibold);
		text-decoration: none;
		white-space: nowrap;
	}

	.tones-link:hover {
		text-decoration: underline;
	}

	/* Sample */

	.proof-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-top: 2rem;
	}

	.proof-input {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1.75rem 1.5rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		max-width: 640px;
		margin: 0 auto;
		text-align: center;
	}

	.proof-input-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.625rem;
	}

	.proof-input h3 {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
	}

	.proof-input-text {
		font-family: var(--font-primary);
		font-size: var(--text-md);
		line-height: var(--leading-relaxed);
		color: var(--color-text);
		font-style: italic;
		margin: 0;
		max-width: 48ch;
	}

	.proof-output-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		align-items: stretch;
	}

	.proof-card {
		min-width: 0;
	}

	.proof-card :global(.result-document) {
		height: 100%;
		min-height: 0;
		box-shadow: none;
	}

	.proof-card :global(.document-footer) {
		display: none;
	}

	.proof-card :global(.document-content) {
		font-size: var(--text-sm);
	}

	@media (max-width: 820px) {
		.proof-output-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Features */

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1rem;
		margin-top: 2.5rem;
	}

	.feature-card {
		padding: 1.5rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.section:nth-of-type(even) .feature-card {
		background: var(--color-bg-elevated);
	}

	.feature-card-link {
		display: block;
		color: inherit;
		text-decoration: none;
		transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
	}

	.feature-card-link:hover {
		border-color: var(--color-accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(244, 63, 122, 0.12);
	}

	.feature-icon {
		margin-bottom: 0.75rem;
	}

	.feature-title {
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin: 0 0 0.4rem 0;
	}

	.feature-description {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}

	/* Privacy */

	.privacy-icon {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	/* Final CTA */

	.section-cta .hero-cta {
		margin-top: 1.5rem;
		margin-bottom: 0;
	}

	/* Footer */

	.landing-footer {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}
</style>

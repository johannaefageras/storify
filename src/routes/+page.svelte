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
		{ id: 'passive-aggressive', name: 'Martyren', icon: 'headstone', preview: 'Jag tog det själv. Någon behövde ju bära dagens lilla börda.' },
		{ id: 'cynical', name: 'Cynikern', icon: 'face-unamused', preview: 'Det gick bra. Inte för att jag förväntade mig det, men ibland har världen sina ögonblick.' },
		{ id: 'self-help', name: 'Livscoachen', icon: 'woman-meditating', preview: 'Ibland är de långsamma dagarna de viktigaste. Du är nog. Precis som du är.' },
		{ id: 'formal', name: 'Akademikern', icon: 'top-hat', preview: 'Dagens preliminära tes: även en tisdag kan erbjuda intressant empiri.' },
		{ id: 'shakespeare', name: 'Shakespeare', icon: 'theater-masks', preview: 'Hör, vad ljus från morgonfönstret bryter? Det är alarmet, och jag är trött.' },
		{ id: 'ai-robot', name: 'AI-Roboten', icon: 'robot', preview: 'SYSTEMLOGG: Ny dag initierad. Status: operationell.' },
		{ id: 'therapist', name: 'Psykologen', icon: 'brain', preview: 'Jag hör att det var en utmanande dag. Det är okej att känna så.' },
		{ id: 'quest-log', name: 'Gamern', icon: 'video-game', preview: '[QUEST ACCEPTED] Överlev måndagen. Reward: +10 XP' },
		{ id: 'british', name: 'Britten', icon: 'flag-uk', preview: 'Rather uneventful day, I must say. Not bad though.' },
		{ id: 'philosophical', name: 'Filosofen', icon: 'owl', preview: 'Vad är egentligen en dag, om inte en samling ögonblick...' },
		{ id: 'storytelling', name: 'Berättaren', icon: 'open-book', preview: 'Det var en grå tisdag när allt förändrades...' },
		{ id: 'sportscaster', name: 'Sportkommentatorn', icon: 'soccer-ball', preview: 'OCH HAN KLIVER UPP UR SÄNGEN! Vilken start på dagen!' }
	];

	let randomizedTonePreviews = $state<Record<string, string>>({});

	onMount(() => {
		randomizedTonePreviews = Object.fromEntries(
			featuredTones.map((tone) => [tone.id, getLandingTonePreview(tone.id, tone.preview)])
		);
	});

	const features: Array<{ icon: string; title: string; description: string; href?: string }> = [
		{ icon: 'studio-microphone', title: 'Tala in', description: 'Diktera dagens tankar istället för att skriva – AI:n gör om rösten till text.' },
		{ icon: 'printer', title: 'PDF-export', description: 'Skriv ut eller spara dina sidor som vackra PDF:er.' },
		{ icon: 'old-key', title: 'Privat dagbok', description: 'Alla dina dagboksinlägg samlade och sökbara på ett ställe.' },
		{ icon: 'palette', title: 'Personlig stil', description: 'Välj accentfärg, typsnitt och tema som passar dig.' },
		{ icon: 'crystal-ball', title: 'Tillägg', description: 'Lägg till horoskop, "denna dag i historien" eller en kort reflektionsuppgift.' },
		{ icon: 'users-silhouette', title: 'Community', description: 'Dela utvalda inlägg anonymt om du vill – eller behåll allt för dig själv.' }
	];

	const sampleEntry = {
		weekday: 'Tisdag',
		date: '12 mars 2026',
		emojis: ['hot-beverage', 'rain-cloud', 'open-book'],
		toneId: 'storytelling',
		title: 'Regnet och boken',
		generatedText:
			'Det var en grå tisdag när jag bestämde mig för att stanna inne. Regnet trummade tålmodigt mot fönstret, och jag lät det.\n\nKaffet blev kallt två gånger innan jag hann dricka det. Boken jag tagit fram låg uppslagen i knäet, och jag insåg att jag läst samma stycke tre gånger utan att ta in ett ord. Det var inte tråkigt – det var bara stilla.\n\nIbland är det de små, oviktiga dagarna som man minns längst.'
	};
</script>

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

			<div class="dashboard-footer">
				<LegalFooter />
			</div>
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
				<p class="hero-meta">Gratis · Ingen app att ladda ner · Helt på svenska</p>
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
				<h2 class="section-title">Din dag, i 20 olika röster</h2>
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
				<p class="tones-footnote">
					…och 8 till. Influencern, Foliehatten, Tonåringen, Multitaskaren…
					<a href="/voices" class="tones-link">Utforska alla röster →</a>
				</p>
			</div>
		</section>

		<!-- Sample entry -->
		<section class="section section-sample">
			<div class="section-inner narrow">
				<p class="eyebrow">Så här ser det ut</p>
				<h2 class="section-title">Från stödord till minne</h2>
				<p class="section-lede center">
					Du skriver några ord. AI:n gör resten.
				</p>
				<div class="sample-wrapper">
					<DiaryCard
						weekday={sampleEntry.weekday}
						date={sampleEntry.date}
						emojis={sampleEntry.emojis}
						toneId={sampleEntry.toneId}
						title={sampleEntry.title}
						generatedText={sampleEntry.generatedText}
					/>
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

		<!-- Final CTA -->
		<section class="section section-cta">
			<div class="section-inner narrow">
				<h2 class="section-title large">Skriv din första dagbok på två minuter.</h2>
				<p class="section-lede center">
					Gratis. Helt på svenska. Inget kreditkort.
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
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: max(0.35rem, env(safe-area-inset-bottom, 0px));
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

	.sample-wrapper {
		margin-top: 0.5rem;
		text-align: left;
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
		align-items: center;
		padding: 0 1.25rem;
		padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0px));
	}
</style>

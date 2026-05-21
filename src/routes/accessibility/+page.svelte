<script lang="ts">
	import { accentStore } from '$lib/stores/accent.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { CONTACT_EMAIL } from '$lib/data/legal';

	const wheelchairComponents = {
		pink: 'woman-wheelchair-pink',
		amber: 'woman-wheelchair-amber',
		blue: 'woman-wheelchair-blue',
		emerald: 'woman-wheelchair-emerald',
		purple: 'woman-wheelchair-purple',
		rust: 'woman-wheelchair-rust'
	};

	let WheelchairIcon = $derived(wheelchairComponents[accentStore.current]);
</script>

<SeoHead
	title="Tillgänglighet – Storify"
	description="Storifys tillgänglighetsmål, kända begränsningar och kontaktväg för tillgänglighetsproblem."
	path="/accessibility"
/>

<main class="legal-page">
	<div class="page-header">
		<Emoji name={WheelchairIcon} size={96} />
		<h1>Tillgänglighet</h1>
	</div>
	<p class="updated">Senast uppdaterad: 14 maj 2026</p>

	<section>
		<h2>Mål</h2>
		<p>
			Storify ska kunna användas av så många som möjligt. Målet är att följa WCAG 2.2 på
			AA-nivå där det är praktiskt möjligt för en webbapp med mycket interaktivt innehåll.
		</p>
		<p>
			Det här är ett pågående arbete. Storify är fortfarande i beta, och tillgängligheten
			kommer att förbättras löpande när nya delar granskas och byggs om.
		</p>
	</section>

	<section>
		<h2>Det som redan finns på plats</h2>
		<ul>
			<li>Responsiv layout som fungerar på små och stora skärmar.</li>
			<li>Semantiska rubriker, formulärfält med labels och beskrivande länkar på centrala sidor.</li>
			<li>Alt-texter eller tomma alt-attribut på bildinnehåll där det används.</li>
			<li>Synliga textalternativ till de viktigaste produktflödena, även där emoji-ikoner används.</li>
			<li>Automatiska Svelte-kontroller körs i utvecklingsflödet med <code>npm run check</code>.</li>
		</ul>
	</section>

	<section>
		<h2>Kända begränsningar</h2>
		<p>Det finns delar som behöver granskas mer noggrant innan vi kan kalla appen fullt tillgänglig:</p>
		<ul>
			<li>Fokusmarkeringar och tangentbordsnavigering i vissa modaler, menyer och dropdowns.</li>
			<li>Kontrast på sekundärtext och diskreta UI-element i vissa teman.</li>
			<li>Vissa interaktiva vyer, som kalender, röstväljare och redigeringsflöden, behöver mer manuell testning med skärmläsare.</li>
			<li>AI-genererat innehåll kan variera i struktur, vilket kan påverka läsbarheten i enskilda dagbokstexter.</li>
		</ul>
	</section>

	<section>
		<h2>Rapportera problem</h2>
		<p>
			Om något är svårt att använda med tangentbord, skärmläsare, förstoring eller andra
			hjälpmedel vill vi gärna veta det. Skriv till
			<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> och beskriv gärna:
		</p>
		<ul>
			<li>vilken sida eller funktion det gäller,</li>
			<li>vad du försökte göra,</li>
			<li>vilken webbläsare och vilket hjälpmedel du använde, om du vill ange det.</li>
		</ul>
	</section>

	<LegalFooter />
</main>

<style>
	.legal-page {
		flex: 1;
		max-width: var(--content-width);
		margin: 0 auto;
		padding: 2rem;
		padding-top: calc(env(safe-area-inset-top, 0px) + 2rem);
		padding-bottom: 0;
	}

	.page-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	h1 {
		font-family: var(--font-primary);
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		color: var(--color-text);
		margin-bottom: 0;
		text-align: center;
	}

	.updated {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-bottom: 2.5rem;
		letter-spacing: var(--tracking-wide);
		text-align: center;
	}

	section {
		margin-bottom: 2rem;
	}

	h2 {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin-bottom: 0.75rem;
	}

	p,
	li {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
	}

	p {
		margin-bottom: 0.75rem;
	}

	p:last-child {
		margin-bottom: 0;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin: 0.75rem 0 0;
		padding-left: 1.25rem;
	}

	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.92em;
		color: var(--color-text);
	}

	a {
		color: var(--color-accent);
		text-decoration: none;
		font-weight: var(--weight-medium);
	}

	a:hover {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	@media (max-width: 480px) {
		.legal-page {
			padding-left: 1.25rem;
			padding-right: 1.25rem;
		}
	}
</style>

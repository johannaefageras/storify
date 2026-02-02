<script lang="ts">
	import { EmojiCookie, EmojiDiamond } from '$lib/components/emojis';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
</script>

<main class="legal-page">
	<a href="/" class="back-link">&larr; Tillbaka</a>
	<div class="page-header">
		<EmojiCookie size={80} />
		<h1>Cookiepolicy</h1>
	</div>
	<p class="updated">Senast uppdaterad: 2 februari 2026</p>

	<section>
		<h2>Den korta versionen</h2>
		<p>Storify använder inga cookies. Vi spårar dig inte, vi säljer ingen data, och vi använder inga tredjepartscookies för reklam eller analys. All din information stannar på din enhet.</p>
	</section>

	<section>
		<h2>Vad är cookies egentligen?</h2>
		<p>Cookies är små textfiler som webbplatser kan spara i din webbläsare. De används ofta för att komma ihåg inställningar, hålla dig inloggad, eller spåra ditt beteende för reklam och analys. Cookies skickas fram och tillbaka mellan din enhet och webbservern vid varje sidladdning.</p>
	</section>

	<section>
		<h2>Hur Storify lagrar data istället</h2>
		<p>Istället för cookies använder Storify lokal lagring direkt på din enhet. Det finns en viktig skillnad:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Cookies:</strong> Skickas till servern vid varje förfrågan, kan läsas av webbplatsen och ibland av tredje part</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Lokal lagring:</strong> Stannar på din enhet, skickas aldrig automatiskt till någon server, och är endast tillgänglig för appen själv</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Vad vi sparar lokalt</h2>
		<p>Storify sparar följande information på din enhet:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Din profil:</strong> Namn, ålder, intressen och annan information du fyller i för att personalisera dina dagbokstexter</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Temainställningar:</strong> Om du föredrar ljust eller mörkt läge</span>
			</div>
		</div>
		<p>Denna data lagras med hjälp av enhetens inbyggda lagringsfunktioner (Capacitor Preferences i appen, eller webbläsarens lokala lagring på webben). Den lämnar aldrig din enhet om du inte aktivt väljer att generera en dagbokstext.</p>
	</section>

	<section>
		<h2>Tredjepartscookies</h2>
		<p>Vi använder inga tredjepartscookies. Det betyder:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Ingen spårning från reklamtjänster</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Inga analysverktyg som Google Analytics</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Inga sociala media-knappar som laddar externa cookies</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Ingen delning av din data med annonsörer</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Så raderar du sparad data</h2>
		<p>Du kan när som helst radera all lokalt sparad data genom att trycka på "Rensa sparad data" på startsidan. Detta tar bort din profil och alla inställningar permanent från din enhet.</p>
		<p>Om du använder webbversionen kan du även rensa data via webbläsarens inställningar under "Webbplatsdata" eller "Lokal lagring".</p>
	</section>

	<section>
		<h2>Varför vi valt att inte använda cookies</h2>
		<p>Vi tror att din dagbok är privat. Genom att undvika cookies och hålla all data lokalt på din enhet minimerar vi risken för dataläckor och säkerställer att du har full kontroll över din information. Det är helt enkelt det rätta sättet att bygga en dagboksapp.</p>
	</section>

	<section>
		<h2>Frågor?</h2>
		<p>Har du funderingar kring hur vi hanterar data? Kontakta oss på <a href="mailto:johanna@mystorify.se">johanna@mystorify.se</a>.</p>
	</section>

	<LegalFooter />
</main>

<style>
	.legal-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 2rem;
		padding-top: calc(env(safe-area-inset-top, 0px) + 2rem);
		padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 2rem);
	}

	.back-link {
		display: inline-block;
		margin-bottom: 2rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.back-link:hover {
		color: var(--color-text);
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

	h2 {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin-bottom: 0.75rem;
	}

	section {
		margin-bottom: 2rem;
	}

	p {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
	}

	p:last-child {
		margin-bottom: 0;
	}

	.custom-ul {
		margin: 1rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.custom-li {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
	}

	.list-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 21px;
		padding-top: 2px;
		color: var(--color-accent);
	}

	.list-content {
		flex: 1;
	}

	.list-content strong {
		color: var(--color-text);
		font-weight: var(--weight-medium);
	}

	a {
		color: var(--color-accent);
		text-decoration: none;
		font-weight: var(--weight-medium);
		transition: color 0.2s ease;
	}

	a:hover {
		text-decoration: underline;
		text-underline-offset: 2px;
	}
</style>

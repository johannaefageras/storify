<script lang="ts">
	import { EmojiProfilePictureJudge, EmojiDiamond } from '$lib/components/emojis';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
</script>

<main class="legal-page">
	<a href="/" class="back-link">&larr; Tillbaka</a>
	<div class="page-header">
		<EmojiProfilePictureJudge size={80} />
		<h1>Användarvillkor</h1>
	</div>
	<p class="updated">Senast uppdaterad: 2 februari 2026</p>

	<section>
		<h2>Välkommen till Storify</h2>
		<p>Storify är en app som hjälper dig skriva dagbok genom att ställa frågor om din dag och sedan generera en personlig text med hjälp av AI. Genom att använda appen godkänner du dessa villkor.</p>
	</section>

	<section>
		<h2>Så fungerar tjänsten</h2>
		<p>Du fyller i information om din dag – allt från humör och aktiviteter till reflektioner och minnen. Sedan väljer du en skrivstil och låter vår AI skapa ett dagboksinlägg åt dig. All din data lagras lokalt på din enhet och du har full kontroll över den.</p>
	</section>

	<section>
		<h2>Ditt innehåll och dina rättigheter</h2>
		<p>All data du matar in och alla dagbokstexter som genereras tillhör dig. Vi gör inga anspråk på ditt innehåll. Du är fri att använda, spara, dela eller radera dina dagbokstexter precis som du vill.</p>
	</section>

	<section>
		<h2>Vad du inte får göra</h2>
		<p>För att Storify ska fungera bra för alla ber vi dig att respektera följande:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Ingen kommersiell användning:</strong> Appen är avsedd för personligt bruk. Du får inte använda tjänsten för att massproducera innehåll i kommersiellt syfte.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Ingen manipulation av AI:n:</strong> Försök inte kringgå eller manipulera AI-tjänsten på olämpliga sätt, till exempel för att generera olagligt, hatiskt eller skadligt innehåll.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Respektera andras integritet:</strong> Om du skriver om andra personer i din dagbok, tänk på deras integritet om du väljer att dela texterna offentligt.</span>
			</div>
		</div>
	</section>

	<section>
		<h2>AI-genererat innehåll</h2>
		<p>Dagbokstexterna skapas av en AI-modell baserat på den information du fyller i. Även om vi strävar efter hög kvalitet kan vi inte garantera att texterna alltid är felfria, korrekta eller passar dina förväntningar. AI:n kan ibland:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Missförstå eller feltolka den information du gett</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Lägga till detaljer som inte stämmer</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Producera text som inte matchar den valda stilen perfekt</span>
			</div>
		</div>
		<p>Vi rekommenderar att du alltid läser igenom och redigerar texten efter behov innan du sparar eller delar den.</p>
	</section>

	<section>
		<h2>Ansvarsbegränsning</h2>
		<p>Storify tillhandahålls i befintligt skick ("as is"). Vi gör vårt bästa för att appen ska fungera bra, men kan inte garantera att den alltid är tillgänglig eller felfri. Vi ansvarar inte för:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Förlust av data (kom ihåg att all data lagras lokalt på din enhet)</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Eventuella fel eller brister i AI-genererat innehåll</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Skador som kan uppstå vid användning av appen</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Problem orsakade av tredjepartstjänster</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Tredjepartstjänster</h2>
		<p>Storify använder externa tjänster för att fungera. Genom att använda appen godkänner du även dessa tjänsters villkor:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Anthropic:</strong> AI-tjänsten som genererar dagbokstexter. <a href="https://www.anthropic.com/terms" target="_blank" rel="noopener">Läs deras villkor</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Resend:</strong> E-posttjänst som används för att skicka dagbokstexter via e-post (om du väljer att använda funktionen). <a href="https://resend.com/legal/terms-of-service" target="_blank" rel="noopener">Läs deras villkor</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Väder-API:</strong> Extern tjänst som tillhandahåller väderdata baserat på din position (om du väljer att aktivera funktionen).</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Google Play:</strong> Om du laddat ner appen därifrån. <a href="https://play.google.com/intl/sv/about/play-terms/" target="_blank" rel="noopener">Läs deras villkor</a>.</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Ändringar i villkoren</h2>
		<p>Vi kan behöva uppdatera dessa villkor ibland. Om vi gör väsentliga ändringar kommer vi att uppdatera datumet högst upp på denna sida. Fortsatt användning av appen efter ändringar innebär att du godkänner de nya villkoren.</p>
	</section>

	<section>
		<h2>Kontakt</h2>
		<p>Har du frågor om villkoren? Kontakta oss på <a href="mailto:johanna@mystorify.se">johanna@mystorify.se</a>.</p>
	</section>

	<section>
		<h2>Tillämplig lag</h2>
		<p>Dessa villkor regleras av svensk lag. Eventuella tvister ska i första hand lösas genom dialog mellan parterna.</p>
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

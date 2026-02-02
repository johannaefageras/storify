<script lang="ts">
	import { EmojiShield, EmojiDiamond } from '$lib/components/emojis';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
</script>

<main class="legal-page">
	<a href="/" class="back-link">&larr; Tillbaka</a>
	<div class="page-header">
		<EmojiShield size={80} />
		<h1>Integritetspolicy</h1>
	</div>
	<p class="updated">Senast uppdaterad: 2 februari 2026</p>

	<section>
		<h2>Vem ansvarar för dina uppgifter?</h2>
		<p>Storify drivs av Johanna Fagerås. Om du har frågor om hur vi hanterar dina uppgifter kan du kontakta oss på <a href="mailto:johanna@mystorify.se">johanna@mystorify.se</a>.</p>
	</section>

	<section>
		<h2>Vilka uppgifter samlar vi in?</h2>
		<p>Storify samlar in de uppgifter du själv väljer att fylla i när du använder appen. Detta kan inkludera:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Profilinformation:</strong> namn, ålder, pronomen, hemstad, familj, husdjur, sysselsättning och intressen</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Dagboksdata:</strong> datum, väder, humör, energinivå, sömnkvalitet, platser du besökt, aktiviteter, personer du träffat, reflektioner, meddelanden till ditt framtida jag (tidskapsel) och annat du väljer att dela</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Platsdata:</strong> Om du väljer att aktivera väderdetektering kan appen begära tillgång till din ungefärliga position för att hämta aktuellt väder. Denna position används endast för att anropa vädertjänsten och sparas inte.</span>
			</div>
		</div>
		<p>All denna information lagras lokalt på din egen enhet – inte på våra servrar.</p>
	</section>

	<section>
		<h2>Hur används dina uppgifter?</h2>
		<p>Din data används för ett enda syfte: att skapa en personlig dagbokstext åt dig. När du trycker på "Skapa dagboksinlägg" skickas dina uppgifter krypterat till vår AI-tjänst (Anthropic) som genererar texten. Efter att texten skapats sparas ingen data hos Anthropic – de använder inte heller din information för att träna sina AI-modeller.</p>
		<p>Den rättsliga grunden för denna behandling enligt GDPR är ditt samtycke – du väljer själv att fylla i uppgifterna och att generera en dagbokstext.</p>
	</section>

	<section>
		<h2>Var lagras dina uppgifter?</h2>
		<p>All din data lagras lokalt på din enhet med hjälp av enhetens inbyggda lagringsfunktioner. Vi har ingen tillgång till denna data och den lämnar aldrig din enhet förutom när du aktivt väljer att generera en dagbokstext.</p>
		<p>Du kan när som helst radera all sparad data genom att trycka på "Rensa sparad data" på startsidan.</p>
	</section>

	<section>
		<h2>Tredjepartstjänster</h2>
		<p>Vi använder följande externa tjänster:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Anthropic (Claude):</strong> AI-tjänst som genererar dagbokstexter. Data skickas krypterat och sparas inte efter att texten genererats. Anthropic är baserat i USA och följer lämpliga skyddsåtgärder för internationell dataöverföring. Läs mer i <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener">Anthropics integritetspolicy</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Resend:</strong> E-posttjänst som används om du väljer att skicka din dagbokstext via e-post. Din e-postadress och dagbokstexten skickas då till Resend för leverans. Vi sparar inte din e-postadress och Resend hanterar den endast för att skicka meddelandet. Resend är baserat i USA och följer lämpliga skyddsåtgärder för internationell dataöverföring. Läs mer i <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener">Resends integritetspolicy</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Väder-API:</strong> Om du aktiverar väderdetektering skickas din ungefärliga position till en extern vädertjänst för att hämta aktuellt väder. Positionen sparas inte och används endast för denna enstaka förfrågan.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Google Play:</strong> Om du laddat ner appen via Google Play kan Google samla in viss information enligt deras egna villkor. Läs mer i <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Googles integritetspolicy</a>.</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Dina rättigheter enligt GDPR</h2>
		<p>Enligt EU:s dataskyddsförordning (GDPR) har du ett antal rättigheter när det gäller dina personuppgifter. Eftersom all din data lagras lokalt på din enhet har du redan full kontroll, men här är dina rättigheter:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Rätt till tillgång:</strong> Du kan se all din sparade data direkt i appen</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Rätt till rättelse:</strong> Du kan ändra din profilinformation när som helst</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Rätt till radering:</strong> Du kan radera all data via "Rensa sparad data" på startsidan</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Rätt till dataportabilitet:</strong> Din data finns redan på din enhet</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Rätt att återkalla samtycke:</strong> Du kan sluta använda appen och radera din data när som helst</span>
			</div>
		</div>
		<p>Om du anser att vi hanterar dina uppgifter felaktigt har du rätt att lämna in ett klagomål till Integritetsskyddsmyndigheten (IMY) på <a href="https://www.imy.se" target="_blank" rel="noopener">www.imy.se</a>.</p>
	</section>

	<section>
		<h2>Barn och unga</h2>
		<p>Storify kan användas av personer i alla åldrar. Vi samlar inte medvetet in mer information än nödvändigt, och all data stannar på användarens egen enhet. Vi uppmuntrar föräldrar och vårdnadshavare att vara delaktiga i yngre barns användning av appen.</p>
	</section>

	<section>
		<h2>Ändringar i denna policy</h2>
		<p>Om vi gör väsentliga ändringar i hur vi hanterar dina uppgifter kommer vi att uppdatera denna policy och ändra datumet högst upp. Vi rekommenderar att du tittar in här då och då.</p>
	</section>

	<section>
		<h2>Kontakt</h2>
		<p>Har du frågor eller funderingar om din integritet? Kontakta oss på <a href="mailto:johanna@mystorify.se">johanna@mystorify.se</a>.</p>
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

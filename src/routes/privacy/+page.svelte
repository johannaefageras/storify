<script lang="ts">
	import { accentStore } from '$lib/stores/accent.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import LegalFooter from '$lib/components/LegalFooter.svelte';

	const diamondComponents = {
		pink: 'diamond-pink',
		amber: 'diamond-amber',
		blue: 'diamond-blue',
		lime: 'diamond-lime',
		red: 'diamond-red'
	};

	let DiamondIcon = $derived(diamondComponents[accentStore.current]);
</script>

<main class="legal-page">
	<div class="page-header">
		<Emoji name="shield" size={96} />
		<h1>Integritetspolicy</h1>
	</div>
	<p class="updated">Senast uppdaterad: 27 mars 2026</p>

	<section>
		<h2>Vem ansvarar för dina uppgifter?</h2>
		<p>Storify drivs av Johanna Fagerås. Om du har frågor om hur vi hanterar dina uppgifter kan du kontakta oss på <a href="mailto:hi@mystorify.se">hi@mystorify.se</a>.</p>
	</section>

	<section>
		<h2>Vilka uppgifter samlar vi in?</h2>
		<p>Storify samlar in de uppgifter du själv väljer att fylla i när du använder appen. Detta kan inkludera:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Profilinformation:</strong> Namn, födelsedag, pronomen, hemstad, familj, husdjur, sysselsättning och intressen</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Dagboksdata:</strong> Datum, väder, humör, energinivå, sömnkvalitet, emojis, platser du besökt, aktiviteter, personer du träffat, vinster, motgångar, reflektioner, mat, musik, färg, meddelanden till ditt framtida jag (tidskapsel) och annat du väljer att dela</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Kontoinformation:</strong> Om du skapar ett konto sparas din e-postadress och ett krypterat lösenord hos vår databastjänst</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Platsdata:</strong> Om du väljer att aktivera väder- och platsdetektering kan appen begära tillgång till din ungefärliga position för att hämta aktuellt väder och platsnamn. Denna position används endast för dessa förfrågningar och sparas inte</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Uppgifter för Gemenskapen:</strong> Om du väljer att dela en dagboksanteckning publikt behandlar vi även visningsnamn, genererad text, kort utdrag, vald röst, datum, emojis och veckodag för att kunna visa inlägget för andra användare</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Hur lagras dina uppgifter?</h2>
		<p>Var din data lagras beror på om du använder appen med eller utan konto:</p>

		<h3>Utan konto</h3>
		<p>All din data lagras lokalt på din enhet med hjälp av enhetens inbyggda lagringsfunktioner. Vi har ingen tillgång till denna data och den lämnar aldrig din enhet förutom när du aktivt väljer att generera en dagbokstext.</p>
		<p>Om du utan konto väljer att dela en dagboksanteckning till Gemenskapen lagras just det delade inlägget i molnet för att kunna visas publikt i appen. Inlägget kan visas med det visningsnamn du anger, eller som "Anonym" om du lämnar fältet tomt.</p>
		<p>Du kan när som helst radera all lokalt sparad data genom att trycka på "Rensa sparad data" på startsidan.</p>

		<h3>Med konto</h3>
		<p>Om du skapar ett konto lagras din profil och dina sparade dagboksinlägg i molnet hos vår databastjänst. Detta gör att du kan komma åt din data från olika enheter. En funktionell cookie sätts för att hålla din session aktiv.</p>
		<p>Om du delar till Gemenskapen som inloggad lagras även kopplingen mellan inlägget och ditt konto, så att du kan hantera och ta bort ditt delade inlägg senare.</p>
	</section>

	<section>
		<h2>När du delar till Gemenskapen</h2>
		<p>Gemenskapen är en publik del av Storify. En dagboksanteckning blir aldrig offentlig automatiskt, utan bara om du själv aktivt väljer att dela den.</p>
		<p>När du delar ett inlägg kan följande information bli synlig för andra användare: din genererade dagbokstext, ett kort utdrag ur texten, valt visningsnamn eller "Anonym", datum för anteckningen, vald röst, emojis och veckodag.</p>
		<p>Om du delar som inloggad användare kopplas inlägget till ditt konto i bakgrunden. Om du delar utan konto sparas inget användarkonto tillsammans med inlägget, men själva innehållet blir ändå publikt i Gemenskapen.</p>
		<p>Dela därför inte information i Gemenskapen som du inte vill ska kunna läsas av andra användare. Om du har delat anonymt och vill begära radering i efterhand kan du kontakta oss.</p>
	</section>

	<section>
		<h2>Hur används dina uppgifter?</h2>
		<p>Din data används för följande syften:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Generera dagbokstexter:</strong> När du trycker på "Skapa dagboksinlägg" skickas dina uppgifter krypterat till vår AI-tjänst (Anthropic) som genererar texten. Efter att texten skapats sparas ingen data hos Anthropic – de använder inte heller din information för att träna sina AI-modeller.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Autentisering:</strong> Om du skapar ett konto används din e-postadress och lösenord för att logga in dig och hålla din session aktiv.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Dagboksarkiv:</strong> Om du är inloggad och väljer att spara en genererad text sparas den i ditt personliga arkiv så att du kan läsa den igen senare.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Gemenskapen:</strong> Om du väljer att dela en dagboksanteckning används uppgifterna för att publicera och visa inlägget i Gemenskapen, samt för att koppla inlägget till ditt konto om du är inloggad.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>E-postleverans:</strong> Om du väljer att skicka din dagbokstext via e-post skickas din e-postadress och texten till vår e-posttjänst för leverans.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Hastighetsbegränsning:</strong> Vi använder hastighetsbegränsning för att skydda tjänsten mot missbruk. I samband med detta behandlas en anonymiserad identifierare tillfälligt.</span>
			</div>
		</div>
		<p>Den rättsliga grunden för denna behandling enligt GDPR är ditt samtycke – du väljer själv att fylla i uppgifterna, skapa konto och generera dagbokstexter.</p>
	</section>

	<section>
		<h2>Tredjepartstjänster</h2>
		<p>Vi använder följande externa tjänster:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Anthropic (Claude):</strong> AI-tjänst som genererar dagbokstexter. Data skickas krypterat och sparas inte efter att texten genererats. Anthropic är baserat i USA och följer lämpliga skyddsåtgärder för internationell dataöverföring. Läs mer i <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener">Anthropics integritetspolicy</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Databastjänst:</strong> Om du skapar ett konto lagras din profil, kontoinformation och sparade dagboksinlägg hos vår databastjänst. Tjänsten hanterar även autentisering och sätter en funktionell cookie för att hålla din session aktiv. Om du delar till Gemenskapen lagras även det publika inlägget där. Data lagras krypterat.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>E-posttjänst:</strong> Om du väljer att skicka din dagbokstext via e-post skickas din e-postadress och dagbokstexten till vår e-posttjänst för leverans. Vi sparar inte din e-postadress och tjänsten hanterar den endast för att skicka meddelandet. Läs mer i <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener">e-posttjänstens integritetspolicy</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Väder- och platstjänster:</strong> Om du aktiverar väder- och platsdetektering skickas din ungefärliga position till externa tjänster för att hämta aktuellt väder och platsnamn. Positionen sparas inte och används endast för dessa enstaka förfrågningar. Platsautokomplettering i formuläret använder en extern söktjänst som behandlar det du skriver i fältet.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Kontaktformulär:</strong> Om du skickar ett meddelande via kontaktsidan behandlas dina uppgifter av en extern formulärtjänst för att leverera meddelandet till oss.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Google Play:</strong> Om du laddat ner appen via Google Play kan Google samla in viss information enligt deras egna villkor. Läs mer i <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Googles integritetspolicy</a>.</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Dina rättigheter enligt GDPR</h2>
		<p>Enligt EU:s dataskyddsförordning (GDPR) har du ett antal rättigheter när det gäller dina personuppgifter:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Rätt till tillgång:</strong> Du kan se all din sparade data direkt i appen – lokalt på din enhet eller i ditt konto</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Rätt till rättelse:</strong> Du kan ändra din profilinformation när som helst</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Rätt till radering:</strong> Utan konto kan du radera all data via "Rensa sparad data" på startsidan. Om du har ett konto kan du radera enskilda dagboksinlägg i ditt dagboksarkiv och dina egna delade inlägg i Gemenskapen. Vill du att all din kontodata raderas kan du kontakta oss. Har du delat anonymt till Gemenskapen kan du också kontakta oss för att begära radering.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Rätt till dataportabilitet:</strong> Utan konto finns din data redan på din enhet. Med konto kan du exportera dina dagboksinlägg som bild, PDF eller text.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Rätt att återkalla samtycke:</strong> Du kan sluta använda appen och radera din data när som helst</span>
			</div>
		</div>
		<p>Om du anser att vi hanterar dina uppgifter felaktigt har du rätt att lämna in ett klagomål till Integritetsskyddsmyndigheten (IMY) på <a href="https://www.imy.se" target="_blank" rel="noopener">www.imy.se</a>.</p>
	</section>

	<section>
		<h2>Barn och unga</h2>
		<p>Storify kan användas av personer i alla åldrar. Vi samlar inte medvetet in mer information än nödvändigt, och all data stannar på användarens egen enhet om inget konto skapas, så länge användaren inte själv väljer att dela ett inlägg till Gemenskapen. Vi uppmuntrar föräldrar och vårdnadshavare att vara delaktiga i yngre barns användning av appen, särskilt vid publik delning.</p>
	</section>

	<section>
		<h2>Ändringar i denna policy</h2>
		<p>Om vi gör väsentliga ändringar i hur vi hanterar dina uppgifter kommer vi att uppdatera denna policy och ändra datumet högst upp. Vi rekommenderar att du tittar in här då och då.</p>
	</section>

	<section>
		<h2>Kontakt</h2>
		<p>Har du frågor eller funderingar om din integritet? Kontakta oss på <a href="mailto:hi@mystorify.se">hi@mystorify.se</a>.</p>
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

	h2 {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin-bottom: 0.75rem;
	}

	h3 {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin-bottom: 0.5rem;
		margin-top: 1rem;
	}

	section h3:first-of-type {
		margin-top: 0;
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

	@media (max-width: 480px) {
		.legal-page {
			padding-left: 1.25rem;
			padding-right: 1.25rem;
		}
	}
</style>

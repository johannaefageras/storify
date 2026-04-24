<script lang="ts">
	import { accentStore } from '$lib/stores/accent.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import LegalFooter from '$lib/components/LegalFooter.svelte';

	const diamondComponents = {
		pink: 'diamond-pink',
		amber: 'diamond-amber',
		blue: 'diamond-blue',
		emerald: 'diamond-emerald',
		purple: 'diamond-purple'
	};

	let DiamondIcon = $derived(diamondComponents[accentStore.current]);
</script>

<main class="legal-page">
	<div class="page-header">
		<Emoji name="shield" size={96} />
		<h1>Integritetspolicy</h1>
	</div>
	<p class="updated">Senast uppdaterad: 24 april 2026</p>

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
				<span class="list-content"><strong>Profil- och inställningsuppgifter:</strong> Namn, födelsedag, pronomen, hemstad, familj, husdjur, sysselsättning, intressen, profilbild, accentfärg, tidszon samt val för veckobrev, månadsbrev och skrivpåminnelser</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Dagboksdata:</strong> Datum, väder, platsnamn, humör, energinivå, sömnkvalitet, emojis, platser du besökt, aktiviteter, personer du träffat, vinster, motgångar, reflektioner, mat, musik, färg, tidskapsel, fri text i redigeraren, korttext i snabbläget och innehåll från AI-intervjun</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Kontoinformation:</strong> Om du skapar ett konto sparas din e-postadress och ett krypterat lösenord hos vår databastjänst. Om du väljer Google-inloggning behandlas även den information som behövs för att koppla din Google-authentisering till ditt konto</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Platsdata:</strong> Om du väljer att aktivera väder- och platsdetektering kan appen begära tillgång till din ungefärliga position för att hämta aktuellt väder och platsnamn. Denna position används endast för dessa förfrågningar och sparas inte hos oss</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Uppgifter för Gemenskapen:</strong> Om du väljer att dela en dagboksanteckning publikt behandlar vi även visningsnamn, genererad text, kort utdrag, vald röst, datum, emojis och veckodag för att kunna visa inlägget för andra användare</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Tekniska uppgifter för appfunktioner:</strong> Lokala utkast, tema- och accentinställningar i webbläsaren, sessionsuppgifter för inloggning, samt tekniska push-uppgifter om du aktiverar skrivpåminnelser</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Kontaktuppgifter:</strong> Om du kontaktar oss via kontaktsidan behandlas de uppgifter du själv skickar in, till exempel namn, e-postadress, telefonnummer, meddelande och eventuella bilagor</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Hur lagras dina uppgifter?</h2>
		<p>Var din data lagras beror på om du använder appen med eller utan konto:</p>

		<h3>Utan konto</h3>
		<p>Din profil, dina inställningar och tillfälliga utkast lagras lokalt i din webbläsare med hjälp av webbläsarens inbyggda lagringsfunktioner. Vi har normalt ingen direkt tillgång till denna lokala data och den lämnar inte din enhet förrän du själv väljer att använda en funktion som kräver serverkontakt, till exempel att generera en dagbokstext, dela till Gemenskapen eller skicka ett meddelande via kontaktsidan.</p>
		<p>Om du utan konto väljer att dela en dagboksanteckning till Gemenskapen lagras just det delade inlägget i molnet för att kunna visas publikt i appen. Inlägget kan visas med det visningsnamn du anger, eller som "Anonym" om du lämnar fältet tomt.</p>
		<p>Om du vill radera lokalt sparad data utan konto gör du det via din webbläsares inställningar för webbplatsdata för mystorify.se.</p>

		<h3>Med konto</h3>
		<p>Om du skapar ett konto lagras din profil, dina sparade dagboksinlägg, dina badge- och communitykopplingar samt dina kontoinställningar i molnet hos vår databastjänst. Detta gör att du kan komma åt din data från olika enheter. Funktionella cookies och liknande sessionsuppgifter används för att hålla dig inloggad.</p>
		<p>Om du laddar upp en profilbild lagras den i anslutning till ditt konto hos vår lagringsleverantör. Om du aktiverar veckobrev, månadsbrev eller skrivpåminnelser lagras även dessa preferenser och den tidszon som behövs för att skicka dem vid rätt tid.</p>
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
				<span class="list-content"><strong>Generera dagbokstexter:</strong> När du väljer att skapa eller förfina en text skickas de uppgifter som behövs krypterat till vår AI-tjänst (Anthropic) för att generera resultatet</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Autentisering och konto:</strong> Om du skapar ett konto används din e-postadress, ditt lösenord eller vald inloggningsmetod för att logga in dig, verifiera ditt konto och hålla din session aktiv</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Dagboksarkiv och profil:</strong> Om du är inloggad används uppgifterna för att spara dina texter, visa dem igen senare och synka profil- och kontoinställningar mellan enheter</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Gemenskapen:</strong> Om du väljer att dela en dagboksanteckning används uppgifterna för att publicera och visa inlägget i Gemenskapen, samt för att koppla inlägget till ditt konto om du är inloggad</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Utskick och påminnelser:</strong> Om du aktiverar veckobrev, månadsbrev eller skrivpåminnelser används dina preferenser, din tidszon och tekniska push- eller e-postuppgifter för att kunna skicka dem</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Personalisering och framsteg:</strong> Profilinformation, röstval och användningshändelser används för att personalisera texter och visa utmärkelser, streaks och annan kontorelaterad funktionalitet i appen</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Kontakt:</strong> Om du kontaktar oss används dina uppgifter för att ta emot, hantera och besvara ditt meddelande</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Säkerhet och missbruksskydd:</strong> Vi använder hastighetsbegränsning och tekniska skydd för att minska spam, missbruk och angrepp mot tjänsten. I samband med detta behandlas en anonymiserad identifierare tillfälligt</span>
			</div>
		</div>
		<p>Rättslig grund enligt GDPR beror på vilken funktion som används. När vi tillhandahåller konto- och appfunktioner som du själv använder sker behandlingen normalt för att kunna leverera tjänsten. För valfria funktioner som platsåtkomst, Gemenskapen, nyhetsbrev och pushpåminnelser bygger behandlingen på dina aktiva val eller ditt samtycke. För säkerhet, felhantering och missbruksskydd kan vi också behandla uppgifter med stöd av vårt berättigade intresse att hålla tjänsten säker och fungerande. Officiell EU-vägledning om rättsliga grunder finns hos Europeiska kommissionen och Europeiska dataskyddsstyrelsen: <a href="https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/legal-grounds-processing-data/grounds-processing/when-can-personal-data-be-processed_en" target="_blank" rel="noopener">European Commission</a> och <a href="https://www.edpb.europa.eu/sme-data-protection-guide/process-personal-data-lawfully_en" target="_blank" rel="noopener">EDPB</a>.</p>
	</section>

	<section>
		<h2>Tredjepartstjänster</h2>
		<p>Vi använder följande externa tjänster:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Anthropic (Claude):</strong> AI-tjänst som genererar och förfinar dagbokstexter. Läs mer i <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener">Anthropics integritetspolicy</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Supabase:</strong> Databas-, lagrings- och autentiseringstjänst för konton, profiler, sparade inlägg, badges, push-prenumerationer och communitydata. Tjänsten hanterar även sessionscookies. Läs mer i <a href="https://supabase.com/privacy" target="_blank" rel="noopener">Supabases integritetspolicy</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Resend:</strong> E-posttjänst som används för Storifys e-postutskick, till exempel veckobrev och andra utskick när sådana används. Läs mer i <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener">Resends integritetspolicy</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>SMHI:</strong> Väderdata hämtas från SMHI:s öppna API när du använder väderfunktionen.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Google:</strong> Google Geocoding API används för platsnamn om du använder platsfunktionen. Google används också för inloggning om du väljer "Fortsätt med Google". Läs mer i <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Googles integritetspolicy</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Forminit:</strong> Kontaktformuläret på kontaktsidan använder Forminit för att ta emot och vidarebefordra meddelanden och bilagor. Läs mer i <a href="https://forminit.com" target="_blank" rel="noopener">Forminit</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Upstash Redis:</strong> Används för hastighetsbegränsning och missbruksskydd på vissa API-funktioner.</span>
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
				<span class="list-content"><strong>Rätt till radering:</strong> Utan konto kan du radera lokalt sparad data via webbläsarens inställningar för webbplatsdata. Om du har ett konto kan du radera enskilda dagboksinlägg i ditt dagboksarkiv och dina egna delade inlägg i Gemenskapen. Vill du att all din kontodata raderas kan du kontakta oss. Har du delat anonymt till Gemenskapen kan du också kontakta oss för att begära radering.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Rätt till dataportabilitet:</strong> För automatiserad behandling som grundar sig på samtycke eller avtal har du rätt att begära ut de personuppgifter du lämnat till oss. Utan konto finns lokal data redan på din enhet. Med konto kan du kontakta oss om du vill begära ett utdrag av de uppgifter vi lagrar hos oss.</span>
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
		<p>Storify kan användas av personer i alla åldrar. Vi samlar inte medvetet in mer information än nödvändigt, och lokal data stannar på användarens egen enhet så länge inget konto skapas och inget innehåll delas publikt. Vi uppmuntrar föräldrar och vårdnadshavare att vara delaktiga i yngre barns användning av appen, särskilt vid kontoanvändning, publik delning och kontaktformulär.</p>
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

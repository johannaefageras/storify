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
		<Emoji name="cookie" size={96} />
		<h1>Cookiepolicy</h1>
	</div>
	<p class="updated">Senast uppdaterad: 23 april 2026</p>

	<section>
		<h2>Den korta versionen</h2>
		<p>Storify använder inte cookies för reklam, beteendespårning eller analys. De cookies som kan förekomma är funktionella cookies från vår inloggningstjänst, så att du kan vara inloggad och komma åt ditt konto.</p>
		<p>Appen använder också lokal lagring i webbläsaren för sådant som tema, accentfärg, lokal profil och tillfälliga utkast. Om du aktiverar påminnelser eller installerar webbappen kan webbläsaren även spara teknisk appdata, till exempel push-prenumeration och cache för statiska filer.</p>
	</section>

	<section>
		<h2>Vad är cookies egentligen?</h2>
		<p>Cookies är små textfiler som webbplatser kan spara i din webbläsare. De används ofta för att komma ihåg inställningar, hålla dig inloggad, eller spåra ditt beteende för reklam och analys. Cookies skickas fram och tillbaka mellan din enhet och webbservern vid varje sidladdning.</p>
	</section>

	<section>
		<h2>Lokal lagring i appen</h2>
		<p>Storify använder lokal lagring direkt på din enhet för att appen ska kännas sammanhängande även när du inte har ett konto. Den här informationen skickas inte automatiskt till servern vid varje sidladdning, utan används av appen i din webbläsare.</p>
		<p>Det som kan sparas lokalt är:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Profil utan konto:</strong> Namn, födelsedag, pronomen, hemstad, familj, husdjur, sysselsättning, intressen och eventuell profilbildslänk som du fyller i för att personalisera dagbokstexter</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Utkast:</strong> Pågående texter och formulärdata från guiden, snabbläget, AI-intervjun och Skriv fritt. Utkast används för att du ska kunna fortsätta om du råkar lämna sidan och tas bort när de blir för gamla eller när flödet rensas</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Visuella inställningar:</strong> Ljust eller mörkt tema och vald accentfärg</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Intervjuflöde:</strong> Meddelanden, vald intervjuare, vald röst och tillägg i en pågående AI-intervju</span>
			</div>
		</div>
		<p>Om du använder Storify utan konto ligger din profil lokalt på den enhet och webbläsare du använder. Om du är inloggad hämtas profilen i stället från ditt konto, men tema och accent kan fortfarande sparas lokalt för att gränssnittet ska laddas rätt.</p>
	</section>

	<section>
		<h2>Cookies vid inloggning</h2>
		<p>När du skapar konto eller loggar in använder Storify Supabase för autentisering. Supabase kan sätta funktionella cookies och liknande sessionsdata för att hålla dig inloggad, verifiera din session och skydda kontofunktioner som profil, dagboksarkiv, kalender, utmärkelser och delade inlägg.</p>
		<p>Dessa cookies och sessionsuppgifter:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">är nödvändiga för inloggning och kontofunktioner</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Används inte för spårning, reklam eller analys</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">kan uppdateras automatiskt när sessionen förnyas</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">tas bort eller blir ogiltiga när du loggar ut eller när sessionen löper ut</span>
			</div>
		</div>
		<p>Som inloggad sparas din profil, dina sparade dagboksinlägg, dina utmärkelser och dina kontoinställningar i molnet via Supabase så att du kan komma åt dem från olika enheter.</p>
	</section>

	<section>
		<h2>Webbapp, cache och push-notiser</h2>
		<p>Storify har en service worker och en webbappmanifestfil så att appen kan installeras via webbläsaren på enheter som stödjer det. Webbläsaren kan därför spara statiska filer i sin cache, till exempel appskal, ikoner och byggfiler, för att appen ska ladda snabbare och fungera bättre som installerad webbapp.</p>
		<p>Om du som inloggad användare aktiverar skrivpåminnelser kan webbläsaren skapa en push-prenumeration. Då sparas tekniska push-uppgifter både i webbläsaren och i vår databas, kopplat till ditt konto, så att vi kan skicka påminnelsen. Du kan stänga av påminnelser i profilen och även ta bort webbplatsens notisbehörighet i webbläsarens inställningar.</p>
	</section>

	<section>
		<h2>Tredjepartscookies</h2>
		<p>Storify bäddar inte in reklam, analysverktyg eller sociala medier-widgets som sätter tredjepartscookies på våra sidor. Det betyder:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Ingen spårning från reklamtjänster</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Inga analysverktyg som Google Analytics</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Inga sociala media-knappar som laddar externa cookies</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Ingen delning av din data med annonsörer</span>
			</div>
		</div>
		<p>Om du klickar på en extern länk, till exempel till GitHub, en integritetspolicy eller en delningsfunktion utanför Storify, lämnar du vår webbplats. Då gäller den externa tjänstens egna villkor och cookiehantering.</p>
	</section>

	<section>
		<h2>Cookies, lokal lagring och cache</h2>
		<p>Det finns några olika sorters lagring i webbläsaren:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Cookies:</strong> Skickas till servern vid varje förfrågan, kan läsas av webbplatsen och ibland av tredje part</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Lokal lagring:</strong> Stannar på din enhet, skickas aldrig automatiskt till någon server, och är endast tillgänglig för appen själv</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Cache och service worker:</strong> Används av webbläsaren för att spara tekniska appfiler så att webbappen kan laddas snabbare</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Push-prenumeration:</strong> Skapas bara om du aktivt tillåter notiser och används för skrivpåminnelser</span>
			</div>
		</div>
		<p>Storify använder cookies endast för funktionella kontobehov. För appupplevelsen används i första hand lokal lagring, cache och webbläsarens egna behörigheter.</p>
	</section>

	<section>
		<h2>Så kan du radera lagrad information</h2>
		<p>Du kan alltid logga ut för att avsluta din aktiva session. Vill du rensa lokal appdata, cache eller cookies helt kan du göra det via webbläsarens inställningar för webbplatsdata för mystorify.se.</p>
		<p>Utkast i guiden, snabbläget, AI-intervjun och Skriv fritt sparas bara tillfälligt och rensas när de blir för gamla eller när du avslutar respektive flöde. Sparade dagboksinlägg i ditt konto raderas däremot i dagboksarkivet, inte genom att rensa webbläsarens cookies.</p>
	</section>

	<section>
		<h2>Varför vi valt att minimera cookies</h2>
		<p>Vi tror att din dagbok är privat. Därför använder Storify inte spårningscookies och sparar bara sådan webbläsardata som behövs för att appen ska fungera: inloggning, utkast, inställningar, installerbar webbapp och frivilliga notiser. Det är helt enkelt det rimliga sättet att bygga en dagboksapp.</p>
	</section>

	<section>
		<h2>Frågor?</h2>
		<p>Har du funderingar kring hur vi hanterar data? Kontakta oss på <a href="mailto:hi@mystorify.se">hi@mystorify.se</a>.</p>
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

<script lang="ts">
	import { accentStore } from '$lib/stores/accent.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import { tones } from '$lib/data/tones';

	const judgeComponents = {
		pink: 'woman-judge-pink',
		amber: 'woman-judge-amber',
		blue: 'woman-judge-blue',
		emerald: 'woman-judge-emerald',
		purple: 'woman-judge-purple',
		rust: 'woman-judge-rust'
	};

	const diamondComponents = {
		pink: 'diamond-pink',
		amber: 'diamond-amber',
		blue: 'diamond-blue',
		emerald: 'diamond-emerald',
		purple: 'diamond-purple',
		rust: 'diamond-rust'
	};

	let JudgeIcon = $derived(judgeComponents[accentStore.current]);
	let DiamondIcon = $derived(diamondComponents[accentStore.current]);
</script>

<main class="legal-page">
	<div class="page-header">
		<Emoji name={JudgeIcon} size={96} />
		<h1>Användarvillkor</h1>
	</div>
	<p class="updated">Senast uppdaterad: 3 maj 2026</p>

	<section>
		<h2>Välkommen till Storify</h2>
		<p>Storify är en app som hjälper dig skriva dagbok genom frågor, fri text, AI-intervju eller röstinspelning och sedan genererar en personlig text med hjälp av AI. Appen kan användas anonymt eller med ett konto, och innehåller även publika informationssidor som Bloggen och Rösterna samt en frivillig publik funktion kallad Gemenskapen där användare kan dela dagboksanteckningar med andra. Genom att använda appen godkänner du dessa villkor.</p>
	</section>

	<section>
		<h2>Så fungerar tjänsten</h2>
		<p>Du kan välja mellan fem lägen: en fullständig guide med detaljerade frågor om din dag, ett snabbläge där du fångar dagens känsla på under en minut, en AI-intervju där du väljer intervjuare och chattar med en AI som ställer frågor om din dag, Tala in där en ljudinspelning transkriberas till text, eller Skriv fritt där du skriver själv med AI-stöd och redigeringsverktyg. I samtliga lägen väljer du en av {tones.length} skrivstilar och låter vår AI skapa eller förfina ett dagboksinlägg åt dig. I den fullständiga guiden kan du även lägga till tillägg som horoskop, historiska händelser eller en personlig hemläxa.</p>
		<p>När texten är klar kan du redigera den, regenerera den i en annan röst, exportera den som PDF, spara den i ditt dagboksarkiv om du har konto eller dela den frivilligt till Gemenskapen. Med konto får du dessutom profilsynk, kalender med streak-statistik, badges, skrivpåminnelser och inställningar för veckobrev och månadsbrev.</p>
	</section>

	<section>
		<h2>Användning utan konto</h2>
		<p>Du behöver inget konto för att använda Storify. Utan konto lagras din profil, dina inställningar och tillfälliga utkast lokalt i din webbläsare och du har full kontroll över den datan på din enhet. Dagboksdata skickas till AI:n för att skapa texten, och ljudinspelningar i Tala in skickas till transkribering när du själv använder den funktionen. Innehållet sparas normalt inte hos oss efteråt, förutom om du själv väljer att dela ett inlägg till Gemenskapen eller använda en funktion som kräver serverkontakt.</p>
	</section>

	<section>
		<h2>Användning med konto</h2>
		<p>Om du skapar ett konto lagras din profil, dina sparade dagboksinlägg och relevanta kontoinställningar i molnet hos vår databastjänst. Konto kan skapas med e-post och lösenord eller via Google-inloggning. Du ansvarar för att hålla dina inloggningsuppgifter säkra. Genom att skapa ett konto godkänner du att din data lagras enligt vår <a href="/privacy">integritetspolicy</a>. Om du delar ett inlägg till Gemenskapen som inloggad användare kopplas det delade inlägget till ditt konto så att du kan hantera det senare.</p>
	</section>

	<section>
		<h2>Ditt innehåll och dina rättigheter</h2>
		<p>All data du matar in, transkriberad text från dina egna inspelningar och alla dagbokstexter som genereras tillhör dig. Vi gör inga anspråk på ditt innehåll. Du är fri att använda, spara, exportera, dela eller radera dina dagbokstexter precis som du vill.</p>
		<p>Om du väljer att dela en dagboksanteckning till Gemenskapen ger du Storify rätt att visa det innehållet publikt i appen tillsammans med valt visningsnamn eller som "Anonym". Denna rättighet gäller endast för att driva och visa Gemenskapen.</p>
		<p>Du ansvarar själv för det innehåll du väljer att dela publikt. Dela därför inte material som du inte har rätt att publicera, eller uppgifter om dig själv eller andra som du inte vill ska bli synliga för andra användare.</p>
	</section>

	<section>
		<h2>Regler för Gemenskapen</h2>
		<p>Gemenskapen är till för frivilligt delade dagboksanteckningar. För att hålla den trygg och användbar för alla får du inte dela innehåll som är olagligt, hotfullt, trakasserande, hatiskt, pornografiskt, vilseledande eller på annat sätt skadligt.</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Ingen publicering av andras känsliga uppgifter:</strong> Dela inte personuppgifter eller privat information om andra personer utan deras samtycke.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Inget olagligt eller skadligt innehåll:</strong> Inlägg får inte innehålla hot, hat, uppvigling, sexuellt exploaterande material eller annat som bryter mot lag eller rimliga säkerhetskrav.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Ingen spam eller masspublicering:</strong> Gemenskapen får inte användas för reklam, spam, automatiserad masspublicering eller annat missbruk.</span>
			</div>
		</div>
		<p>Vi förbehåller oss rätten att ta bort delade inlägg som bryter mot dessa villkor eller som vi bedömer kan skada andra användare eller tjänsten.</p>
	</section>

	<section>
		<h2>Vad du inte får göra</h2>
		<p>För att Storify ska fungera bra för alla ber vi dig att respektera följande:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Ingen kommersiell användning:</strong> Appen är avsedd för personligt bruk. Du får inte använda tjänsten för att massproducera innehåll i kommersiellt syfte.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Ingen manipulation av AI:n:</strong> Försök inte kringgå eller manipulera AI-tjänsten på olämpliga sätt, till exempel för att generera olagligt, hatiskt eller skadligt innehåll.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Inget missbruk av tjänsten:</strong> Försök inte kringgå hastighetsbegränsningar eller på annat sätt överbelasta tjänsten.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Ingen otillåten inspelning:</strong> Använd inte Tala in för att spela in andra personer utan nödvändigt samtycke eller på ett sätt som bryter mot lag eller andras integritet.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Respektera andras integritet:</strong> Om du skriver om andra personer i din dagbok, tänk på deras integritet om du väljer att dela texterna offentligt.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Ingen kringgående av moderering eller borttagning:</strong> Försök inte återpublicera innehåll som tagits bort, eller använda flera inlägg för att kringgå reglerna för Gemenskapen.</span>
			</div>
		</div>
	</section>

	<section>
		<h2>AI-genererat innehåll</h2>
		<p>Dagbokstexterna skapas av en AI-modell baserat på den information du fyller i, skriver, chattar fram eller transkriberar från en ljudinspelning. Även om vi strävar efter hög kvalitet kan vi inte garantera att texterna alltid är felfria, korrekta eller passar dina förväntningar. AI:n kan ibland:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Missförstå eller feltolka den information du gett</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Lägga till detaljer som inte stämmer</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Producera text som inte matchar den valda stilen perfekt</span>
			</div>
		</div>
		<p>Vi rekommenderar att du alltid läser igenom och redigerar texten efter behov innan du sparar eller delar den.</p>
	</section>

	<section>
		<h2>Tjänstens begränsningar</h2>
		<p>Storify använder hastighetsbegränsning och andra skydd för att motverka missbruk. Det innebär att antalet förfrågningar till vissa funktioner, till exempel textgenerering, transkribering, delning och andra serverbaserade åtgärder, kan vara begränsat under en viss tidsperiod. Om du når gränsen kan du försöka igen efter en stund.</p>
		<p>PDF-export skapas i webbläsaren från den text som visas. Vi kan inte garantera att exporten alltid blir identisk i alla webbläsare, enheter eller utskriftsmiljöer.</p>
	</section>

	<section>
		<h2>Ansvarsbegränsning</h2>
		<p>Storify tillhandahålls i befintligt skick ("as is"). Vi gör vårt bästa för att appen ska fungera bra, men kan inte garantera att den alltid är tillgänglig eller felfri. Vi ansvarar inte för:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Förlust av data (lokalt sparad data ligger på din enhet; molndata hanteras med rimliga säkerhetsåtgärder men utan garanti)</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Eventuella fel eller brister i AI-genererat innehåll</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Fel, luckor eller missförstånd i automatisk transkribering</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Formateringsproblem i exporterade PDF-filer eller utskrifter</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Skador som kan uppstå vid användning av appen</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Problem orsakade av tredjepartstjänster</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Hur andra användare tolkar eller reagerar på innehåll som du själv valt att dela publikt i Gemenskapen</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Tredjepartstjänster</h2>
		<p>Storify använder externa tjänster för att fungera. Genom att använda appen godkänner du även dessa tjänsters villkor:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Anthropic:</strong> AI-tjänsten som genererar dagbokstexter. <a href="https://www.anthropic.com/terms" target="_blank" rel="noopener">Läs deras villkor</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>OpenAI:</strong> Transkriberingstjänsten som används i Tala in-läget för att omvandla ljudinspelningar till text. <a href="https://openai.com/policies/terms-of-use" target="_blank" rel="noopener">Läs deras villkor</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Supabase:</strong> Hanterar autentisering, profillagring, dagboksarkiv för användare med konto, push-prenumerationer och lagring av delade inlägg i Gemenskapen. <a href="https://supabase.com/terms" target="_blank" rel="noopener">Läs deras villkor</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Resend:</strong> E-posttjänst som används för Storifys utskick, till exempel veckobrev, månadsbrev eller andra kontorelaterade e-postmeddelanden. <a href="https://resend.com/legal/terms-of-service" target="_blank" rel="noopener">Läs deras villkor</a>.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Google:</strong> Används för Google-inloggning och vissa platstjänster, till exempel platsnamn och geokodning när du väljer att använda dessa funktioner.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>SMHI, Forminit och Upstash Redis:</strong> SMHI används för väderdata, Forminit för kontaktformuläret och Upstash Redis för hastighetsbegränsning och missbruksskydd på vissa API-funktioner.</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Villkor för SMS och meddelanden</h2>

		<h3>Allmänt</h3>
		<p>När du anmäler dig till tjänsten skickar vi ett meddelande för att bekräfta din anmälan.</p>
		<p>Genom att tacka ja till meddelanden godkänner du att ta emot återkommande automatiserade marknadsförings- och informationssms från Storify. Automatiserade meddelanden kan skickas med ett automatiskt uppringningssystem till det mobilnummer du angav vid anmälan eller till annat nummer du anger.</p>
		<p>Meddelandefrekvensen varierar, och ytterligare mobilmeddelanden kan skickas regelbundet baserat på din interaktion med Storify. Storify förbehåller sig rätten att när som helst ändra meddelandefrekvensen, antingen genom att öka eller minska antalet skickade meddelanden. Storify förbehåller sig också rätten att ändra det kortnummer, telefonnummer eller den alfanumeriska avsändare som meddelanden skickas från.</p>
		<p>Vanliga avgifter för meddelanden och data kan tillkomma. Om du har frågor om ditt abonnemang är det bäst att kontakta din mobiloperatör. Din mobiloperatör ansvarar inte för försenade eller ej levererade meddelanden.</p>
		<p>Ditt samtycke till att ta emot marknadsföringsmeddelanden är inte ett villkor för köp.</p>

		<h3>Operatörer</h3>
		<p>Operatörer ansvarar inte för försenade eller ej levererade meddelanden.</p>

		<h3>Avregistrering</h3>
		<p>Meddelanden innehåller instruktioner om hur du avregistrerar dig, antingen genom att skicka STOP eller via en medföljande länk. När du har avregistrerat dig skickar vi ett meddelande som bekräftar att du har avregistrerats och inga fler meddelanden kommer att skickas. Om du vill ta emot meddelanden från Storify igen är det bara att anmäla dig på samma sätt som första gången, så börjar Storify skicka meddelanden till dig igen.</p>

		<h3>Information</h3>
		<p>För support gällande våra tjänster, mejla oss på <a href="mailto:support@mystorify.se">support@mystorify.se</a> eller, om det stöds, skicka "HELP" till våra meddelanden när som helst så svarar vi med instruktioner om hur du avregistrerar dig. Om vi inkluderar en länk i meddelanden vi skickar till dig från Storify kan du även följa länken för att få instruktioner om hur du avregistrerar dig och vår företagsinformation.</p>

		<h3>Byte av nummer</h3>
		<p>Du godkänner att innan du byter mobilnummer eller överlåter ditt mobilnummer till en annan person ska du antingen svara "STOP" från det ursprungliga numret, avregistrera dig via länken som finns i våra meddelanden (om en sådan tillhandahålls), eller meddela oss ditt gamla nummer på <a href="mailto:support@mystorify.se">support@mystorify.se</a>. Skyldigheten att informera oss baserat på ovanstående händelser är ett villkor för att använda denna tjänst för att ta emot meddelanden.</p>

		<h3>Integritet</h3>
		<p>Om du har frågor om dina uppgifter eller våra integritetsrutiner, se vår <a href="/privacy">integritetspolicy</a>.</p>

		<h3>Ändringar av meddelandevillkor</h3>
		<p>Vi förbehåller oss rätten att när som helst ändra eller avsluta vårt meddelandeprogram. Vi förbehåller oss också rätten att när som helst uppdatera dessa meddelandevillkor. Sådana ändringar träder i kraft omedelbart vid publicering. Om du inte godkänner en ändring av dessa meddelandevillkor bör du avregistrera dig från vårt meddelandeprogram. Fortsatt deltagande efter sådana ändringar utgör ditt godkännande av ändringarna.</p>
	</section>

	<section>
		<h2>Ändringar i villkoren</h2>
		<p>Vi kan behöva uppdatera dessa villkor ibland. Om vi gör väsentliga ändringar kommer vi att uppdatera datumet högst upp på denna sida. Fortsatt användning av appen efter ändringar innebär att du godkänner de nya villkoren.</p>
	</section>

	<section>
		<h2>Kontakt</h2>
		<p>Har du frågor om villkoren? Kontakta oss på <a href="mailto:hi@mystorify.se">hi@mystorify.se</a>.</p>
	</section>

	<section>
		<h2>Tillämplig lag</h2>
		<p>Dessa villkor regleras av svensk lag. Eventuella tvister ska i första hand lösas genom dialog mellan parterna.</p>
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
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
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

<script lang="ts">
	import {
		EmojiClipboard,
		EmojiDiamond,
		EmojiEnvelopeArrow,
		EmojiFramedPicture,
		EmojiGameDice,
		EmojiLightBulb,
		EmojiPrinter
	} from '$lib/components/emojis/assorted';
	import {
		Emoji1,
		Emoji2,
		Emoji3,
		Emoji4,
		Emoji5,
		Emoji6,
		Emoji7,
		Emoji8
	} from '$lib/components/emojis/numbers';
	import {
		EmojiBrain,
		EmojiCatTabby,
		EmojiClassicBuilding,
		EmojiCrown,
		EmojiEarth,
		EmojiFaceGrimacing,
		EmojiFaceNerd,
		EmojiFaceSmirking,
		EmojiFaceThinking,
		EmojiFaceYawning,
		EmojiFlagUK,
		EmojiLedger,
		EmojiMusicalNotes,
		EmojiNewspaper,
		EmojiOpenBook,
		EmojiPoo,
		EmojiRobot,
		EmojiStudioMicrophone,
		EmojiTheaterMasks,
		EmojiVideoGameControl
	} from '$lib/components/emojis/voices';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
</script>

<main class="legal-page">
	<a href="/" class="back-link">&larr; Tillbaka</a>
	<div class="page-header">
		<EmojiLightBulb size={80} />
		<h1>Guide</h1>
	</div>
	<p class="subtitle">Så får du ut det bästa av Storify</p>

	<section>
		<h2>Hur fungerar Storify?</h2>
		<p>Storify hjälper dig att skriva dagbok genom att omvandla dina svar på enkla frågor till en personlig dagbokstext. Du går igenom en guide med frågor om din dag, väljer en röst som passar ditt humör, och sedan skapar AI:n en text baserad på det du berättat.</p>
		<p>Tänk på det som att ha en personlig författare som lyssnar på din dag och sedan skriver ner den åt dig – men med din egen information och i den stil du väljer.</p>
		<p>Appen kan även hämta aktuellt väder baserat på din position, så du slipper fylla i det manuellt – ett litet sätt att fånga stämningen i din dag.</p>
	</section>

	<section>
		<h2>Steg för steg</h2>
		<div class="custom-ol">
			<div class="custom-li">
				<span class="list-icon number-icon"><Emoji1 size={14} /></span>
				<span class="list-content"><strong>Fyll i din profil</strong> – Namn, ålder, pronomen och lite om din livssituation. Detta hjälper AI:n förstå vem du är.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Emoji2 size={14} /></span>
				<span class="list-content"><strong>Berätta om ditt humör</strong> – Välj emojis som representerar hur du känner dig.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Emoji3 size={14} /></span>
				<span class="list-content"><strong>Ange din energinivå och sömn</strong> – Enkla skjutreglage som fångar din fysiska status.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Emoji4 size={14} /></span>
				<span class="list-content"><strong>Beskriv din dag</strong> – Aktiviteter, platser, personer du träffat.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Emoji5 size={14} /></span>
				<span class="list-content"><strong>Lägg till detaljer</strong> – Vinster och frustration, reflektioner, mat och musik.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Emoji6 size={14} /></span>
				<span class="list-content"><strong>Skriv en tidskapsel</strong> – Spara ett minne och ett meddelande till ditt framtida jag.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Emoji7 size={14} /></span>
				<span class="list-content"><strong>Välj en röst</strong> – Hur vill du att din dagbok ska låta?</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Emoji8 size={14} /></span>
				<span class="list-content"><strong>Generera</strong> – Tryck på knappen och låt magin hända!</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Så pratar du med AI:n</h2>
		<p>Du behöver inte skriva perfekt eller formulera dig fint – AI:n är bra på att tolka även korta anteckningar. Men här är några tips för att få bättre resultat:</p>

		<div class="tip-box">
			<h3>Var specifik</h3>
			<p><span class="example bad">Mindre bra:</span> "Träffade en kompis"</p>
			<p><span class="example good">Bättre:</span> "Fika med Emma på Kafferepet, pratade om hennes nya jobb"</p>
		</div>

		<div class="tip-box">
			<h3>Inkludera känslor</h3>
			<p><span class="example bad">Mindre bra:</span> "Jobbade"</p>
			<p><span class="example good">Bättre:</span> "Stressigt på jobbet, men kände mig stolt efter presentationen"</p>
		</div>

		<div class="tip-box">
			<h3>Nämn små detaljer</h3>
			<p>De bästa dagbokstexterna kommer från de små sakerna: hur kaffet smakade, vad som spelades på radion, hur solen lyste genom fönstret. Dessa detaljer gör texten levande och personlig.</p>
		</div>

		<div class="tip-box">
			<h3>Var ärlig</h3>
			<p>Dagboken är för dig. Du behöver inte skönmåla eller censurera. Om dagen var tråkig, säg det. Om något gick fel, berätta. De mest intressanta texterna kommer från äkta upplevelser.</p>
		</div>
	</section>

	<section>
		<h2>Fritext-fälten är dina vänner</h2>
		<p>I flera steg finns fritext-rutor där du kan skriva vad du vill. Använd dem! Här kan du:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Berätta om något roligt som hände</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Ventilera frustration</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Spela in en tanke du vill komma ihåg</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Beskriva ett ögonblick som betydde något</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Skriva ner ett citat någon sa</span>
			</div>
		</div>
		<p>Ju mer kontext du ger, desto bättre kan AI:n fånga din dag.</p>
	</section>

	<section>
		<h2>Tidskapseln – ett brev till framtiden</h2>
		<p>I steg 7 hittar du "Tidskapseln" – en plats för att skriva ner något du vill minnas och ett meddelande till ditt framtida jag. Det kan vara:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Ett ögonblick som kändes obetydligt men som du vill bevara</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Något du är stolt över just nu</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">En påminnelse om vad som var viktigt idag</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content">Ett uppmuntrande ord till dig själv om tio år</span>
			</div>
		</div>
		<p>Dessa detaljer kan vävas in i din dagbokstext och gör den extra personlig och tidlös.</p>
	</section>

	<section>
		<h2>Välj rätt röst</h2>
		<p>Rösten du väljer påverkar stilen på din dagbokstext. Här är alla röster du kan välja mellan:</p>

		<div class="voice-grid">
			<div class="voice-card">
				<span class="voice-emoji"><EmojiLedger size={28} /></span>
				<h3>Klassisk</h3>
				<p>En rak, varm berättelse om din dag. Perfekt för alla tillfällen.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiOpenBook size={28} /></span>
				<h3>Berättelse</h3>
				<p>Din dag som en fängslande novell med dramaturgisk båge.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiFaceThinking size={28} /></span>
				<h3>Filosofisk</h3>
				<p>Djupa reflektioner om livets mening och vardagens under.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiStudioMicrophone size={28} /></span>
				<h3>Sportkommentator</h3>
				<p>OCH HAN GÖR DET! Spänning och energi i varje moment!</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiCatTabby size={28} /></span>
				<h3>Kattperspektiv</h3>
				<p>Din dag sedd genom kattens dömande och nyfikna ögon.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiFaceSmirking size={28} /></span>
				<h3>Sarkastisk</h3>
				<p>För dagar när du mest vill rulla med ögonen åt allt.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiCrown size={28} /></span>
				<h3>Drama Queen</h3>
				<p>ALLT är en KATASTROF eller en TRIUMF. Inga mellanting!</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiPoo size={28} /></span>
				<h3>Meme</h3>
				<p>no cap this is giving very much chronically online energy fr fr</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiFaceGrimacing size={28} /></span>
				<h3>Cringe</h3>
				<p>Alla pinsamma ögonblick förevigas för evigheten. Du bad om det.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiFlagUK size={28} /></span>
				<h3>Brittisk</h3>
				<p>Torr brittisk humor och understatement. Skrivs på engelska.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiVideoGameControl size={28} /></span>
				<h3>Quest Log</h3>
				<p>Din dag som ett äventyr med quests, XP och achievements.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiFaceYawning size={28} /></span>
				<h3>Uttråkad</h3>
				<p>En AI som verkligen inte bryr sig. Minimalt engagemang.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiEarth size={28} /></span>
				<h3>Naturdokumentär</h3>
				<p>David Attenborough observerar dig i din naturliga miljö.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiBrain size={28} /></span>
				<h3>Psykolog</h3>
				<p>Empatisk och validerande. Hjälper dig förstå dina känslor.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiRobot size={28} /></span>
				<h3>AI-Robot</h3>
				<p>SYSTEMLOGG: Mänsklig aktivitet dokumenterad. Analyserar...</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiTheaterMasks size={28} /></span>
				<h3>Shakespeare</h3>
				<p>Poetisk prosa från renässansen. Att vara eller icke vara.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiNewspaper size={28} /></span>
				<h3>Kvällstidning</h3>
				<p>CHOCK! SKANDAL! Din dag som sensationella rubriker!</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiClassicBuilding size={28} /></span>
				<h3>Formell</h3>
				<p>Byråkratisk precision. Undertecknad meddelar härmed...</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiMusicalNotes size={28} /></span>
				<h3>Trubadur</h3>
				<p>Din dag sjungen som en ballad. Med rim och melodi.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiFaceNerd size={28} /></span>
				<h3>Nörd</h3>
				<p>Fakta, statistik och djupdykningar i varje liten detalj.</p>
			</div>
			<div class="voice-card">
				<span class="voice-emoji"><EmojiGameDice size={28} /></span>
				<h3>Överraska mig!</h3>
				<p>Låt slumpen välja – du vet aldrig vilken röst du får!</p>
			</div>
		</div>

		<p>Experimentera! Samma dag kan bli helt olika beroende på vilken röst du väljer. Ibland är det roligt att testa flera röster på samma dag.</p>
	</section>

	<section>
		<h2>Spara din dagbokstext</h2>
		<p>När din text har genererats finns det flera sätt att spara och dela den. Välj det alternativ som passar dig bäst:</p>

		<div class="save-grid">
			<div class="save-card">
				<span class="save-emoji"><EmojiClipboard size={28} /></span>
				<div class="save-content">
					<h3>Kopiera text</h3>
					<p>Kopiera och klistra in var du vill.</p>
				</div>
			</div>
			<div class="save-card">
				<span class="save-emoji"><EmojiFramedPicture size={28} /></span>
				<div class="save-content">
					<h3>Spara som bild</h3>
					<p>Spara som en bild till ditt fotoalbum.</p>
				</div>
			</div>
			<div class="save-card">
				<span class="save-emoji"><EmojiPrinter size={28} /></span>
				<div class="save-content">
					<h3>Spara som PDF</h3>
					<p>Perfekt för utskrift och arkivering.</p>
				</div>
			</div>
			<div class="save-card">
				<span class="save-emoji"><EmojiEnvelopeArrow size={28} /></span>
				<div class="save-content">
					<h3>Skicka via e-post</h3>
					<p>Mejla texten till vem du vill.</p>
				</div>
			</div>
		</div>

		<p>Alla alternativ hittar du längst ner på sidan efter att din text har genererats. Du kan använda flera alternativ på samma text!</p>
	</section>

	<section>
		<h2>Vanliga frågor</h2>

		<h3>Behöver jag fylla i allt?</h3>
		<p>Nej! Fyll i det som känns relevant. Hade du ingen speciell mat? Skippa det. Vet du inte vad som spelades? Det går bra. AI:n arbetar med det du ger den.</p>

		<h3>Kan jag redigera texten efteråt?</h3>
		<p>Ja, du kan kopiera texten och redigera den hur du vill. Det är din dagbok!</p>

		<h3>Sparas min data?</h3>
		<p>Din profilinformation sparas lokalt på din enhet så du slipper fylla i den varje gång. Dagboksdata skickas till AI:n för att skapa texten, men sparas inte efteråt. Läs mer i vår <a href="/privacy">integritetspolicy</a>.</p>

		<h3>Varför blev texten konstig?</h3>
		<p>Ibland gör AI:n misstag eller tolkar saker annorlunda än du tänkte. Prova att ge mer kontext, formulera om, eller helt enkelt generera igen. Varje generering är unik!</p>

		<h3>Kan jag skriva på engelska?</h3>
		<p>Appen är designad för svenska, men du kan skriva dina svar på engelska om du vill. Texten kommer dock fortfarande genereras på svenska (förutom om du väljer "British" som röst).</p>
	</section>

	<section>
		<h2>Pro-tips</h2>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Skriv samma dag</strong> – Det är lättare att komma ihåg detaljer medan de är färska.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Inkludera "tidskapsel"-detaljer</strong> – Vad kostar en liter mjölk? Vilken låt är populär just nu? Dessa saker blir fascinerande att läsa om några år.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Blanda stort och smått</strong> – En stor nyhet och vad du åt till lunch. Både och gör dagen verklig.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Spara dina favoriter</strong> – Exportera texter du gillar extra mycket så du har dem kvar.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><EmojiDiamond size={12} /></span>
				<span class="list-content"><strong>Ha kul!</strong> – Det här är inte en läxa. Det finns inga fel svar.</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Behöver du mer hjälp?</h2>
		<p>Har du frågor eller förslag på hur vi kan göra guiden bättre? <a href="/contact">Hör av dig!</a></p>
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

	.subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 2.5rem;
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

	.custom-ol,
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
		color: var(--color-accent);
	}

	.number-icon {
		width: 16px;
		height: 21px;
		padding-top: 2px;
	}

	.bullet-icon {
		width: 16px;
		height: 21px;
		padding-top: 2px;
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

	.tip-box {
		background: var(--color-bg-elevated);
		padding: 1rem 1.25rem;
		border-radius: var(--radius-md);
		margin-bottom: 1rem;
	}

	.tip-box h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.tip-box p {
		margin-bottom: 0.25rem;
	}

	.tip-box p:last-child {
		margin-bottom: 0;
	}

	.example {
		font-weight: var(--weight-medium);
		font-size: var(--text-xs);
		padding: 0.125rem 0.375rem;
		border-radius: var(--radius-sm);
		margin-right: 0.25rem;
	}

	.example.bad {
		background-color: var(--color-danger-bg, rgba(239, 68, 68, 0.1));
		color: var(--color-danger, #ef4444);
	}

	.example.good {
		background-color: var(--color-success-bg, rgba(34, 197, 94, 0.1));
		color: var(--color-success, #22c55e);
	}

	.voice-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 0.75rem;
		margin: 1.25rem 0;
	}

	.voice-card {
		background: var(--color-bg-elevated);
		padding: 1rem;
		border-radius: var(--radius-md);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.voice-card .voice-emoji {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.25rem;
	}

	.voice-card h3 {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin: 0;
	}

	.voice-card p {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}

	.save-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin: 1.25rem 0;
	}

	.save-card {
		background: var(--color-bg-elevated);
		padding: 0.875rem 1rem;
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.save-card .save-emoji {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.save-card .save-content h3 {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin: 0 0 0.125rem 0;
	}

	.save-card .save-content p {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}
</style>

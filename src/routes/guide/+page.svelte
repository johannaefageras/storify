<script lang="ts">
	import { accentStore } from '$lib/stores/accent.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import { Number1, Number2, Number3, Number4, Number5, Number6, Number7 } from '$lib/assets/numbers';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import { voiceSamples } from '$lib/data/voiceSamples';
	import type { Snippet } from 'svelte';

	interface VoiceInfo {
		id: string;
		name: string;
		description: string;
		icon: Snippet;
	}

	const studentComponents = {
		pink: 'woman-student-pink',
		amber: 'woman-student-amber',
		blue: 'woman-student-blue',
		lime: 'woman-student-lime',
		red: 'woman-student-red'
	};

	const diamondComponents = {
		pink: 'diamond-pink',
		amber: 'diamond-amber',
		blue: 'diamond-blue',
		lime: 'diamond-lime',
		red: 'diamond-red'
	};

	let StudentIcon = $derived(studentComponents[accentStore.current]);
	let DiamondIcon = $derived(diamondComponents[accentStore.current]);

	let selectedVoice: VoiceInfo | null = $state(null);

	function openModal(voice: VoiceInfo) {
		selectedVoice = voice;
	}

	function closeModal() {
		selectedVoice = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && selectedVoice) {
			closeModal();
		}
	}

	function getRandomSamples(id: string, count: number = 3): string[] {
		const samples = voiceSamples[id] || [];
		const shuffled = [...samples].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, count);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<main class="legal-page">
	<div class="page-header">
		<Emoji name={StudentIcon} size={96} />
		<h1>Användarguide</h1>
	</div>
	<p class="subtitle">Så får du ut det bästa av My Storify</p>
	<p class="updated">Senast uppdaterad: 27 mars 2026</p>

	<section>
		<h2>Hur fungerar My Storify?</h2>
		<p>My Storify hjälper dig att skriva dagbok genom att omvandla dina svar på enkla frågor till en personlig dagbokstext. Du väljer en röst som passar ditt humör, och sedan skapar AI:n en text baserad på det du berättat.</p>
		<p>Tänk på det som att ha en personlig författare som lyssnar på din dag och sedan skriver ner den åt dig – men med din egen information och i den stil du väljer.</p>
		<p>Appen kan även hämta aktuellt väder och din plats automatiskt, så du slipper fylla i det manuellt – ett litet sätt att fånga stämningen i din dag.</p>
		<p>Vill du ibland dela mer än bara med dig själv? My Storify har också <strong>Gemenskapen</strong>, där du frivilligt kan publicera utvalda dagboksanteckningar och läsa sådant andra användare valt att dela.</p>
		<p>Du kan välja mellan fyra lägen:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Fullständig guide</strong> – En steg-för-steg-wizard med detaljerade frågor om din dag. Passar när du har lite tid och vill skapa en rik och detaljerad dagbokstext.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Snabbläge</strong> – En enkel sida där du fångar dagens känsla på under en minut. Perfekt för hektiska dagar när du ändå vill hålla dagboksvanan vid liv.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>AI-intervju</strong> – Chatta med en AI som ställer frågor om din dag. Känns som att prata med en nyfiken vän – och efteråt skapas din dagbokstext utifrån samtalet.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Skriv fritt</strong> – Skriv fritt i en textredigerare med AI-stöd som kan förfina och polera din text när du är klar.</span>
			</div>
		</div>
	</section>

	<section>
		<h2>Snabbläge</h2>
		<p>Snabbläget är det snabbaste sättet att skapa en dagbokstext. Allt sker på en enda sida – inga steg att klicka igenom. Du fyller i:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Dagsform</strong> – Hur var din dag på en skala från 1 till 10?</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Berätta om din dag</strong> – En kort fritext där du beskriver vad som hände.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Dagens segrar</strong> – Små och stora vinster under dagen.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Dagens färg</strong> – Om din dag var en färg, vilken skulle det vara?</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Röst</strong> – Välj en av 32 skrivstilar.</span>
			</div>
		</div>
		<p>Texten som genereras i snabbläget är kortare och mer koncentrerad – ungefär 100–150 ord – men fångar ändå kärnan i din dag. Tillägg som horoskop och historiska händelser är inte tillgängliga i snabbläget.</p>
		<p>Du hittar snabbläget via länken "Snabbläge" på startsidan, eller genom att gå direkt till <a href="/quick">/quick</a>.</p>
	</section>

	<section>
		<h2>Fullständig guide – steg för steg</h2>
		<p>Den fullständiga guiden tar dig igenom följande moment:</p>
		<div class="custom-ol">
			<div class="custom-li">
				<span class="list-icon number-icon"><Number1 size={14} /></span>
				<span class="list-content"><strong>Berätta vem du är</strong> – Fyll i din profil med namn, ålder, pronomen och lite om din livssituation. Detta hjälper AI:n att förstå vem du är och göra texten personlig. Om du har ett konto hanteras profilen på din profilsida istället.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Number2 size={14} /></span>
				<span class="list-content"><strong>Fånga dagens känsla</strong> – Välj emojis som representerar din dag, ange hur du sovit, din energinivå och ditt humör.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Number3 size={14} /></span>
				<span class="list-content"><strong>Beskriv vad du gjort</strong> – Platser du besökt, aktiviteter, personer du träffat, vinster och motgångar.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Number4 size={14} /></span>
				<span class="list-content"><strong>Lägg till detaljer</strong> – Reflektioner, mat och musik, och om dagen hade en färg – vilken skulle det vara?</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Number5 size={14} /></span>
				<span class="list-content"><strong>Skriv en tidskapsel</strong> – Spara ett minne du vill komma ihåg om tio år och skriv ett meddelande till ditt framtida jag.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Number6 size={14} /></span>
				<span class="list-content"><strong>Välj röst och tillägg</strong> – Välj vem som ska skriva din dagbok (32 unika röster!) och krydda med valfria tillägg som horoskop, historiska händelser eller en personlig hemläxa.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon number-icon"><Number7 size={14} /></span>
				<span class="list-content"><strong>Generera och spara</strong> – Granska en sammanfattning, tryck på knappen och låt magin hända! Spara sedan din text som bild, PDF, e-post, i ditt dagboksarkiv eller dela den till Gemenskapen.</span>
			</div>
		</div>
		<p>Inte alla steg är obligatoriska – fyll i det som känns relevant och hoppa över resten. AI:n arbetar med det du ger den.</p>
	</section>

	<section>
		<h2>Så pratar du med AI:n</h2>
		<p>Du behöver inte skriva perfekt eller formulera dig fint – AI:n är bra på att tolka även korta anteckningar. Men här är några tips för att få bättre resultat:</p>

		<div class="tip-box">
			<h3>Var specifik</h3>
			<p><span class="icon-badge bad"><Emoji name="minus" size={14} /></span> "Träffade en kompis"</p>
			<p><span class="icon-badge good"><Emoji name="plus" size={14} /></span> "Fika med Emma på Espresso House, pratade om hennes nya jobb"</p>
		</div>

		<div class="tip-box">
			<h3>Inkludera känslor</h3>
			<p><span class="icon-badge bad"><Emoji name="minus" size={14} /></span> "Jobbade"</p>
			<p><span class="icon-badge good"><Emoji name="plus" size={14} /></span> "Stressigt på jobbet, men kände mig stolt efter presentationen"</p>
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
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Berätta om något roligt som hände</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Ventilera frustration</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Spela in en tanke du vill komma ihåg</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Beskriva ett ögonblick som betydde något</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content">Skriva ner ett citat som någon sa</span>
			</div>
		</div>
		<p>Ju mer kontext du ger, desto bättre kan AI:n fånga din dag.</p>
	</section>

	<section>
		<h2>Välj rätt röst</h2>
		<p>Rösten du väljer påverkar stilen på din dagbokstext. Klicka på en röst för att läsa mer och se exempel:</p>

		<div class="voice-grid-compact">
			{#snippet ledgerIcon()}<Emoji name="ledger" size={20} />{/snippet}
			{#snippet openBookIcon()}<Emoji name="open-book" size={20} />{/snippet}
			{#snippet owlIcon()}<Emoji name="owl" size={20} />{/snippet}
			{#snippet microphoneIcon()}<Emoji name="microphone" size={20} />{/snippet}
			{#snippet catIcon()}<Emoji name="cat" size={20} />{/snippet}
			{#snippet unamusedIcon()}<Emoji name="face-unamused" size={20} />{/snippet}
			{#snippet crownIcon()}<Emoji name="crown" size={20} />{/snippet}
			{#snippet grimacingIcon()}<Emoji name="face-grimacing" size={20} />{/snippet}
			{#snippet flagUKIcon()}<Emoji name="flag-uk" size={20} />{/snippet}
			{#snippet videoGameIcon()}<Emoji name="video-game" size={20} />{/snippet}
			{#snippet yawningIcon()}<Emoji name="face-yawning" size={20} />{/snippet}
			{#snippet earthIcon()}<Emoji name="earth" size={20} />{/snippet}
			{#snippet brainIcon()}<Emoji name="brain" size={20} />{/snippet}
			{#snippet robotIcon()}<Emoji name="robot" size={20} />{/snippet}
			{#snippet theaterMasksIcon()}<Emoji name="theater-masks" size={20} />{/snippet}
			{#snippet newspaperIcon()}<Emoji name="newspaper" size={20} />{/snippet}
			{#snippet blackNibIcon()}<Emoji name="black-nib" size={20} />{/snippet}
			{#snippet nerdIcon()}<Emoji name="face-nerd" size={20} />{/snippet}
			{#snippet satelliteIcon()}<Emoji name="satellite" size={20} />{/snippet}
			{#snippet meditatingIcon()}<Emoji name="woman-meditating" size={20} />{/snippet}
			{#snippet explodingHeadIcon()}<Emoji name="face-exploding-head" size={20} />{/snippet}
			{#snippet upsideDownIcon()}<Emoji name="face-upside-down" size={20} />{/snippet}
			{#snippet archiveIcon()}<Emoji name="archive" size={20} />{/snippet}
			{#snippet tornadoIcon()}<Emoji name="tornado" size={20} />{/snippet}
			<button class="voice-chip" onclick={() => openModal({ id: 'classic', name: 'Dagboksskribenten', description: 'En rak, varm berättelse om din dag. Perfekt för alla tillfällen.', icon: ledgerIcon })}>
				<span class="voice-chip-emoji">{@render ledgerIcon()}</span>
				<span class="voice-chip-name">Dagboksskribenten</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'storytelling', name: 'Berättaren', description: 'Din dag som en fängslande novell med dramaturgisk båge.', icon: openBookIcon })}>
				<span class="voice-chip-emoji">{@render openBookIcon()}</span>
				<span class="voice-chip-name">Berättaren</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'philosophical', name: 'Filosofen', description: 'Djupa reflektioner om livets mening och vardagens under.', icon: owlIcon })}>
				<span class="voice-chip-emoji">{@render owlIcon()}</span>
				<span class="voice-chip-name">Filosofen</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'sportscaster', name: 'Sportkommentatorn', description: 'OCH HAN GÖR DET! Spänning och energi i varje moment!', icon: microphoneIcon })}>
				<span class="voice-chip-emoji">{@render microphoneIcon()}</span>
				<span class="voice-chip-name">Sportkommentatorn</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'cat-perspective', name: 'Katten', description: 'Din dag sedd genom kattens dömande och nyfikna ögon.', icon: catIcon })}>
				<span class="voice-chip-emoji">{@render catIcon()}</span>
				<span class="voice-chip-name">Katten</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'cynical', name: 'Cynikern', description: 'Skeptisk och lite uppgiven – men ärlig och underfundig.', icon: unamusedIcon })}>
				<span class="voice-chip-emoji">{@render unamusedIcon()}</span>
				<span class="voice-chip-name">Cynikern</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'drama-queen', name: 'Divan', description: 'ALLT är en KATASTROF eller en TRIUMF. Inga mellanting!', icon: crownIcon })}>
				<span class="voice-chip-emoji">{@render crownIcon()}</span>
				<span class="voice-chip-name">Divan</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'cringe', name: 'Tonåringen', description: 'Självmedveten, socialt överanalyserande och väldigt mycket "okej men alltså".', icon: grimacingIcon })}>
				<span class="voice-chip-emoji">{@render grimacingIcon()}</span>
				<span class="voice-chip-name">Tonåringen</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'british', name: 'Britten', description: 'Torr Britten-humor och understatement. Skrivs på engelska.', icon: flagUKIcon })}>
				<span class="voice-chip-emoji">{@render flagUKIcon()}</span>
				<span class="voice-chip-name">Britten</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'quest-log', name: 'Gamern', description: 'Din dag som ett äventyr med quests, XP och achievements.', icon: videoGameIcon })}>
				<span class="voice-chip-emoji">{@render videoGameIcon()}</span>
				<span class="voice-chip-name">Gamern</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'bored', name: 'Tråkmånsen', description: 'En AI som verkligen inte bryr sig. Minimalt engagemang.', icon: yawningIcon })}>
				<span class="voice-chip-emoji">{@render yawningIcon()}</span>
				<span class="voice-chip-name">Tråkmånsen</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'nature-documentary', name: 'Naturfilmaren', description: 'David Attenborough observerar dig i din naturliga miljö.', icon: earthIcon })}>
				<span class="voice-chip-emoji">{@render earthIcon()}</span>
				<span class="voice-chip-name">Naturfilmaren</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'therapist', name: 'Psykologen', description: 'Empatisk och validerande. Hjälper dig förstå dina känslor.', icon: brainIcon })}>
				<span class="voice-chip-emoji">{@render brainIcon()}</span>
				<span class="voice-chip-name">Psykologen</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'ai-robot', name: 'AI-Roboten', description: 'SYSTEMLOGG: Mänsklig aktivitet dokumenterad. Analyserar...', icon: robotIcon })}>
				<span class="voice-chip-emoji">{@render robotIcon()}</span>
				<span class="voice-chip-name">AI-Roboten</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'shakespeare', name: 'Shakespeare', description: 'Poetisk prosa från renässansen. Att vara eller icke vara.', icon: theaterMasksIcon })}>
				<span class="voice-chip-emoji">{@render theaterMasksIcon()}</span>
				<span class="voice-chip-name">Shakespeare</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'tabloid', name: 'Kvällstidningsreportern', description: 'CHOCK! SKANDAL! Din dag som sensationella rubriker!', icon: newspaperIcon })}>
				<span class="voice-chip-emoji">{@render newspaperIcon()}</span>
				<span class="voice-chip-name">Kvällstidningsreportern</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'formal', name: 'Akademikern', description: 'Din dag som empiri, analys och försiktiga slutsatser. Vidare forskning krävs.', icon: blackNibIcon })}>
				<span class="voice-chip-emoji">{@render blackNibIcon()}</span>
				<span class="voice-chip-name">Akademikern</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'nerd', name: 'Nörden', description: 'Fakta, statistik och djupdykningar i varje liten detalj.', icon: nerdIcon })}>
				<span class="voice-chip-emoji">{@render nerdIcon()}</span>
				<span class="voice-chip-name">Nörden</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'tinfoil-hat', name: 'Foliehatten', description: 'Allt hänger ihop. Dolda signaler och hemliga planer överallt.', icon: satelliteIcon })}>
				<span class="voice-chip-emoji">{@render satelliteIcon()}</span>
				<span class="voice-chip-name">Foliehatten</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'self-help', name: 'Livscoachen', description: 'Upplyftande råd, små övningar och pepp för din utveckling.', icon: meditatingIcon })}>
				<span class="voice-chip-emoji">{@render meditatingIcon()}</span>
				<span class="voice-chip-name">Livscoachen</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'overthinker', name: 'Grubblaren', description: 'Alla beslut analyseras in i minsta detalj. Om och om igen.', icon: explodingHeadIcon })}>
				<span class="voice-chip-emoji">{@render explodingHeadIcon()}</span>
				<span class="voice-chip-name">Grubblaren</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'passive-aggressive', name: 'Martyren', description: 'Självuppoffrande, sårad och tapper. Någon måste ju bära allt.', icon: upsideDownIcon })}>
				<span class="voice-chip-emoji">{@render upsideDownIcon()}</span>
				<span class="voice-chip-name">Martyren</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'bureaucratic', name: 'Handläggaren', description: 'Formulär, stämplar och paragrafer. Allt ska dokumenteras korrekt.', icon: archiveIcon })}>
				<span class="voice-chip-emoji">{@render archiveIcon()}</span>
				<span class="voice-chip-name">Handläggaren</span>
			</button>
			<button class="voice-chip" onclick={() => openModal({ id: 'chaotic', name: 'Multitaskaren', description: 'Allt händer på en gång och ingenting går som planerat. Kaoset regerar!', icon: tornadoIcon })}>
				<span class="voice-chip-emoji">{@render tornadoIcon()}</span>
				<span class="voice-chip-name">Multitaskaren</span>
			</button>
		</div>

		<p>Experimentera! Samma dag kan bli helt olika beroende på vilken röst du väljer. Kan du inte bestämma dig? Välj <strong>"Överraska mig!"</strong> i appen så får du en slumpmässig röst varje gång.</p>
	</section>

	<!-- Voice Modal -->
	{#if selectedVoice}
		<div class="modal-backdrop" onclick={closeModal} role="presentation">
			<div class="modal-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
				<button class="modal-close" onclick={closeModal} aria-label="Stäng">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
				<div class="modal-header">
					<span class="modal-emoji">{@render selectedVoice.icon()}</span>
					<h3 id="modal-title">{selectedVoice.name}</h3>
				</div>
				<p class="modal-description">{selectedVoice.description}</p>
				<div class="modal-samples">
					<h4>Exempel på rösten:</h4>
					{#each getRandomSamples(selectedVoice.id, 3) as sample}
						<p class="sample-text">"{sample}"</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<section>
		<h2>Krydda din dagbok med tillägg</h2>
		<p>I guiden kan du välja att lägga till extra avsnitt i din dagbokstext. Dessa skrivs i samma ton och stil som resten av texten:</p>

		<div class="addon-info-grid">
			<div class="addon-info-card">
				<span class="addon-info-emoji"><Emoji name="crystal-ball" size={28} /></span>
				<div class="addon-info-content">
					<h3>Horoskop</h3>
					<p>Ett personligt horoskop baserat på ditt stjärntecken och dagens händelser. Kräver att du angett födelsedag i din profil.</p>
				</div>
			</div>
			<div class="addon-info-card">
				<span class="addon-info-emoji"><Emoji name="mantelpiece-clock" size={28} /></span>
				<div class="addon-info-content">
					<h3>På denna dag</h3>
					<p>Intressanta historiska händelser som inträffat på samma datum. Ett kul sätt att sätta din dag i ett större perspektiv.</p>
				</div>
			</div>
			<div class="addon-info-card">
				<span class="addon-info-emoji"><Emoji name="light-bulb" size={28} /></span>
				<div class="addon-info-content">
					<h3>Hemläxa</h3>
					<p>En specifik reflektion eller utmaning baserad på just din dag. Kan vara handlingsinriktad eller eftertänksam – tonen styr.</p>
				</div>
			</div>
		</div>
	</section>

	<section>
		<h2>Redigera och spara din dagbokstext</h2>
		<p>När din text har genererats finns det flera sätt att redigera, spara och dela den:</p>

		<div class="save-grid">
			<div class="save-card">
				<span class="save-emoji"><Emoji name="pencil" size={28} /></span>
				<div class="save-content">
					<h3>Redigera inlägget</h3>
					<p>Justera texten innan du sparar.</p>
				</div>
			</div>
			<div class="save-card">
				<span class="save-emoji"><Emoji name="archive" size={28} /></span>
				<div class="save-content">
					<h3>Spara på webben</h3>
					<p>Spara i ditt personliga arkiv online.</p>
				</div>
			</div>
			<div class="save-card">
				<span class="save-emoji"><Emoji name="framed-picture" size={28} /></span>
				<div class="save-content">
					<h3>Spara som bild</h3>
					<p>Spara som en bild till ditt fotoalbum.</p>
				</div>
			</div>
			<div class="save-card">
				<span class="save-emoji"><Emoji name="printer" size={28} /></span>
				<div class="save-content">
					<h3>Spara som PDF</h3>
					<p>Perfekt för utskrift och arkivering.</p>
				</div>
			</div>
			<div class="save-card">
				<span class="save-emoji"><Emoji name="clipboard" size={28} /></span>
				<div class="save-content">
					<h3>Kopiera texten</h3>
					<p>Kopiera och klistra in var du vill.</p>
				</div>
			</div>
			<div class="save-card">
				<span class="save-emoji"><Emoji name="envelope-arrow" size={28} /></span>
				<div class="save-content">
					<h3>Skicka som e-post</h3>
					<p>Mejla dagboken till vem du vill.</p>
				</div>
			</div>
			<div class="save-card">
				<span class="save-emoji"><Emoji name="users-silhouette" size={28} /></span>
				<div class="save-content">
					<h3>Dela till Gemenskapen</h3>
					<p>Publicera texten frivilligt så att andra My Storify-användare kan läsa den.</p>
				</div>
			</div>
		</div>

		<p>Alla alternativ hittar du längst ner på sidan efter att din text har genererats eller öppnats i appen. Du kan använda flera alternativ på samma text!</p>
		<p>När du delar till Gemenskapen kan du ange ett visningsnamn eller lämna fältet tomt för att publicera anonymt. Delning är alltid valfri och påverkar inte dina privata dagboksinlägg.</p>
	</section>

	<section>
		<h2>Gemenskapen</h2>
		<p>Gemenskapen är My Storifys publika flöde för dagboksanteckningar som användare själva valt att dela. Där kan du upptäcka olika röster, läsa andras vardagsberättelser och få inspiration till hur samma slags dag kan låta i helt olika toner.</p>
		<p>Du kan dela direkt efter att du skapat en text i guiden, snabbläget, AI-intervjun eller Skriv fritt. Har du redan sparat en anteckning i ditt dagboksarkiv kan du också dela den därifrån senare.</p>
		<p>För att läsa delade inlägg går du till <a href="/community">Gemenskapen</a>. För att publicera väljer du knappen för delning när du är klar med din text.</p>
	</section>

	<section>
		<h2>Skapa konto och bygg ditt dagboksarkiv</h2>
		<p>My Storify kan användas helt anonymt – du behöver inget konto för att generera dagbokstexter. Men skapar du ett konto får du tillgång till extra funktioner:</p>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Dagboksarkiv:</strong> Spara genererade dagboksinlägg och bläddra igenom dem när du vill.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Profil i molnet:</strong> Din profil synkas och finns tillgänglig oavsett vilken enhet du använder.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Snabbare start:</strong> Inloggade användare hoppar direkt till dagboksfrågorna eftersom profilen redan är sparad.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Kalender och streak:</strong> Följ din skrivresa i en kalender med heatmap, se din nuvarande och längsta streak, och få statistik över hur ofta du skriver.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Ägarskap över delade inlägg:</strong> Om du delar till Gemenskapen som inloggad kopplas inlägget till ditt konto, vilket gör att du kan ta bort det senare.</span>
			</div>
		</div>
		<p>Du kan dela till Gemenskapen även utan konto, men då publiceras texten anonymt eller med det visningsnamn du anger och utan koppling till ett användarkonto.</p>
		<p>Du skapar ett konto via <a href="/register">registreringssidan</a> eller loggar in via <a href="/login">inloggningssidan</a>.</p>
	</section>

	<section>
		<h2>Vanliga frågor</h2>

		<h3>Behöver jag fylla i allt?</h3>
		<p>Nej! Fyll i det som känns relevant. Hade du ingen speciell mat? Skippa det. Vet du inte vad som spelades? Det går bra. AI:n arbetar med det du ger den.</p>

		<h3>Kan jag redigera texten efteråt?</h3>
		<p>Ja, du kan kopiera texten och redigera den hur du vill. Det är din dagbok!</p>

		<h3>Sparas min data?</h3>
		<p>Om du använder appen utan konto sparas din profil lokalt på din enhet och skickas bara till AI:n när du genererar en text. Om du har ett konto sparas din profil och dina journalinlägg i molnet (via Supabase) så att du kan komma åt dem från olika enheter. Läs mer i vår <a href="/privacy">integritetspolicy</a>.</p>

		<h3>Måste jag ha konto för att dela till Gemenskapen?</h3>
		<p>Nej. Du kan dela både som inloggad och anonym användare. Om du inte är inloggad kan du ändå ange ett visningsnamn, eller lämna det tomt för att publicera som "Anonym".</p>

		<h3>Blir allt jag skriver offentligt?</h3>
		<p>Nej. Dina dagboksanteckningar är privata som standard. En text blir bara publik om du aktivt väljer att dela den till Gemenskapen.</p>

		<h3>Varför blev texten konstig?</h3>
		<p>Ibland gör AI:n misstag eller tolkar saker annorlunda än du tänkte. Prova att ge mer kontext, formulera om, eller helt enkelt generera igen. Varje generering är unik!</p>

		<h3>Kan jag skriva på engelska?</h3>
		<p>Appen är designad för svenska, men du kan skriva dina svar på engelska om du vill. Texten kommer dock fortfarande genereras på svenska (förutom om du väljer "Britten" som röst – då skrivs allt på engelska).</p>
	</section>

	<section>
		<h2>Pro-tips</h2>
		<div class="custom-ul">
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Skriv samma dag</strong> – Det är lättare att komma ihåg detaljer medan de är färska.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Använd tidskapseln</strong> – Vad kostar en liter mjölk? Vilken låt är populär just nu? Dessa saker blir kul att läsa om några år.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Blanda stort och smått</strong> – Allt ifrån sensationella nyheter till vad du åt till frukost. Både och gör dagen verklig.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Prova olika röster</strong> – Samma dag kan bli rolig, poetisk eller dramatisk beroende på vilken röst du väljer.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Spara dina favoriter</strong> – Exportera texter du gillar extra mycket, eller skapa ett konto och bygg ett dagboksarkiv.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
				<span class="list-content"><strong>Dela selektivt</strong> – Gemenskapen blir roligast när du delar det som faktiskt känns kul, fint eller märkligt nog att bjuda på.</span>
			</div>
			<div class="custom-li">
				<span class="list-icon bullet-icon"><Emoji name={DiamondIcon} size={12} /></span>
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

	.subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: 0.25rem;
		text-align: center;
	}

	.updated {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin-bottom: 2.5rem;
		letter-spacing: var(--tracking-wide);
		text-align: center;
		opacity: 0.7;
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
		color: var(--color-accent);
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

	.icon-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		border-radius: var(--radius-sm);
		margin-right: 0.25rem;
		vertical-align: middle;
	}

	.icon-badge.bad {
		background-color: var(--color-danger-bg, rgba(239, 68, 68, 0.1));
	}

	.icon-badge.good {
		background-color: var(--color-success-bg, rgba(34, 197, 94, 0.1));
	}

	.voice-grid-compact {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 1.25rem 0;
	}

	.voice-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-bg-elevated);
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: var(--font-primary);
	}

	.voice-chip:hover {
		background: var(--color-bg-hover, rgba(255, 255, 255, 0.1));
		border-color: var(--color-border-subtle, rgba(255, 255, 255, 0.1));
	}

	.voice-chip:active {
		transform: scale(0.98);
	}

	.voice-chip-emoji {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.voice-chip-name {
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		color: var(--color-text);
		white-space: nowrap;
	}

	/* Modal styles */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 1000;
		animation: fadeIn 0.15s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-content {
		background: var(--color-bg);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		max-width: 400px;
		width: 100%;
		max-height: 80vh;
		overflow-y: auto;
		position: relative;
		animation: slideUp 0.2s ease;
		border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: color 0.15s ease, background 0.15s ease;
	}

	.modal-close:hover {
		color: var(--color-text);
		background: var(--color-bg-elevated);
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		padding-right: 2rem;
	}

	.modal-emoji {
		display: flex;
		align-items: center;
		justify-content: center;
		transform: scale(1.6);
		transform-origin: center;
	}

	.modal-header h3 {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin: 0;
	}

	.modal-description {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin-bottom: 1rem;
	}

	.modal-samples {
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		padding: 1rem;
	}

	.modal-samples h4 {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sample-text {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-style: italic;
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0 0 0.5rem 0;
		padding-left: 0.75rem;
		border-left: 2px solid var(--color-accent);
	}

	.sample-text:last-child {
		margin-bottom: 0;
	}

	.addon-info-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
		margin: 1.25rem 0;
	}

	.addon-info-card {
		background: var(--color-bg-elevated);
		padding: 0.875rem 1rem;
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.addon-info-card .addon-info-emoji {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.addon-info-card .addon-info-content h3 {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin: 0 0 0.125rem 0;
	}

	.addon-info-card .addon-info-content p {
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

	@media (max-width: 480px) {
		.legal-page {
			padding: 1.25rem;
			padding-top: calc(env(safe-area-inset-top, 0px) + 1.25rem);
			padding-bottom: 0;
		}

		.save-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { tones } from '$lib/data/tones';
	import { emojiLabelMap } from '$lib/data/emojis';
	import { jomojiSvgMap, jomojiNameMap } from '$lib/data/jomojis';
	import { uniqueSvgIds } from '$lib/utils/uniqueSvgIds';
	import { getMoodColorById } from '$lib/data/moodColors';
	import type { Component } from 'svelte';
	import { EmojiSparklesAlt, EmojiRoseLight, EmojiRoseDark, EmojiFramedPicture, EmojiPrinter, EmojiClipboard, EmojiArchive, EmojiEnvelopeIncoming, EmojiVideoGame, EmojiFaceGrimacing, EmojiCat, EmojiFaceYawning, EmojiFaceExplodingHead, EmojiFaceNerd, EmojiRobot, EmojiDetective, EmojiLedger, EmojiWomanMeditating, EmojiNewspaper, EmojiMusicalNotes, EmojiTheaterMasks, EmojiFlagUK, EmojiCrown, EmojiEarth, EmojiMicrophone, EmojiPoo, EmojiBrain, EmojiOpenBook, EmojiSatellite, EmojiDice, EmojiTornado, EmojiFaceUnamused, EmojiTopHat, EmojiHeartOnFire, EmojiFaceUpsideDown, EmojiOwl, EmojiCrystalBall, EmojiBooks, EmojiScroll, EmojiZodiacAries, EmojiZodiacTaurus, EmojiZodiacGemini, EmojiZodiacCancer, EmojiZodiacLeo, EmojiZodiacVirgo, EmojiZodiacLibra, EmojiZodiacScorpio, EmojiZodiacSagittarius, EmojiZodiacCapricorn, EmojiZodiacAquarius, EmojiZodiacPisces } from '$lib/components/emojis';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';
	import { getZodiacFromBirthday } from '$lib/utils/zodiac';
	import html2canvas from 'html2canvas';
	import { jsPDF } from 'jspdf';
	import { getApiUrl } from '$lib/config';
	import { goto } from '$app/navigation';
	import resultMessages from '$lib/data/resultMessages.json';
	import { getLoadingPhrases } from '$lib/data/loadingPhrases';
	// Generation state
	let isGenerating = $state(false);
	let generatedEntry = $state('');
	let error = $state('');
	// References for export
	let documentElement: HTMLDivElement = $state(null!);
	let pdfElement: HTMLDivElement = $state(null!);
	let isDownloading = $state(false);
	let isDownloadingPdf = $state(false);
	let isCopying = $state(false);
	let isSendingEmail = $state(false);
	let showEmailModal = $state(false);
	let emailAddress = $state('');
	let emailError = $state('');
	let emailSent = $state(false);

	// Random result message (selected once when entry is generated)
	let resultMessage = $state({ title: '', subtitle: '' });

	// Loading phrase cycling
	let loadingPhrase = $state('');
	let loadingPhraseVisible = $state(false);
	let phraseInterval: ReturnType<typeof setInterval> | null = null;

	function shuffled(arr: string[]): string[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	function startPhraseCycling(toneId: string) {
		let remaining = shuffled(getLoadingPhrases(toneId));

		// Show first phrase immediately
		loadingPhrase = remaining.pop()!;
		loadingPhraseVisible = true;

		phraseInterval = setInterval(() => {
			loadingPhraseVisible = false;

			setTimeout(() => {
				if (remaining.length === 0) {
					remaining = shuffled(getLoadingPhrases(toneId));
				}
				loadingPhrase = remaining.pop()!;
				loadingPhraseVisible = true;
			}, 300);
		}, 2200);
	}

	function stopPhraseCycling() {
		if (phraseInterval) {
			clearInterval(phraseInterval);
			phraseInterval = null;
		}
		loadingPhraseVisible = false;
	}

	// Track the actual tone used (important for "surprise" mode)
	let actualToneUsed = $state<string | null>(null);

	// DEV: Preview mode for styling without API calls
	const DEV_PREVIEW = false;
	const SAMPLE_ENTRY = `Kära dagbok,

Idag var en ganska lugn dag, faktiskt. Inget speciellt hände, men det var ändå en bra dag på något sätt.

På skolan fick vi veta att matteläraren var sjuk, så istället för lektion blev det film. Jag vet inte ens vad filmen handlade om egentligen – jag satt mest och tänkte på annat och pratade lite med Emma bredvid mig. Det kändes som en liten bonus mitt i veckan.

Det bästa var håltimmen. Jag och tjejerna satt i cafeterian och bara snackade. Inget viktigt, bara sådär. Ibland är det de stunderna som är bäst, när man inte måste göra något utan bara kan vara.

Hemma hos mamma ikväll blev det pasta till middag. Hon gör den där såsen som jag gillar, med vitlök och parmesan. Vi åt framför TV:n, jag och min syster, medan mamma satt i köket och läste något på sin telefon.

Nu är det kväll och jag är trött, men den goda sorten av trött. Imorgon är det torsdag, vilket betyder att det snart är fredag. Den tanken gör mig glad.

Vi ses imorgon, dagboken.`;

	const zodiacComponents: Record<string, Component> = {
		aries: EmojiZodiacAries,
		taurus: EmojiZodiacTaurus,
		gemini: EmojiZodiacGemini,
		cancer: EmojiZodiacCancer,
		leo: EmojiZodiacLeo,
		virgo: EmojiZodiacVirgo,
		libra: EmojiZodiacLibra,
		scorpio: EmojiZodiacScorpio,
		sagittarius: EmojiZodiacSagittarius,
		capricorn: EmojiZodiacCapricorn,
		aquarius: EmojiZodiacAquarius,
		pisces: EmojiZodiacPisces
	};

	const zodiacSign = $derived(getZodiacFromBirthday(wizardStore.data.profile.birthday));
	const hasAddons = $derived(wizardStore.data.includeHoroscope || wizardStore.data.includeOnThisDay || wizardStore.data.includeHomework);

	// Detect addon heading type for rendering with emoji icons
	type ParagraphType = 'horoscope-heading' | 'onthisday-heading' | 'homework-heading' | 'regular';

	function getParagraphType(text: string): ParagraphType {
		// Strip markdown formatting (**, *) from start/end before checking patterns
		const trimmed = text.trim().replace(/^\*+|\*+$/g, '');
		// Check for horoscope heading (Swedish or English)
		if (/^Horoskop för /i.test(trimmed) || /^Horoscope for /i.test(trimmed)) {
			return 'horoscope-heading';
		}
		// Check for "on this day" heading (Swedish or English)
		if (
			/^På denna dag(?:[\s.!:…—–-]*)$/i.test(trimmed) ||
			/^On this day(?:[\s.!:…—–-]*)$/i.test(trimmed)
		) {
			return 'onthisday-heading';
		}
		// Check for homework heading (Swedish or English)
		if (/^Hemläxa/i.test(trimmed) || /^Homework/i.test(trimmed)) {
			return 'homework-heading';
		}
		return 'regular';
	}

	function getZodiacComponent(): Component | undefined {
		if (!zodiacSign) return undefined;
		return zodiacComponents[zodiacSign.id];
	}

	const toneIconMap: Record<string, Component> = {
		'ai-robot': EmojiRobot,
		'bored': EmojiFaceYawning,
		'british': EmojiFlagUK,
		'bureaucratic': EmojiArchive,
		'cat-perspective': EmojiCat,
		'chaotic': EmojiTornado,
		'classic': EmojiLedger,
		'cringe': EmojiFaceGrimacing,
		'cynical': EmojiFaceUnamused,
		'detective': EmojiDetective,
		'drama-queen': EmojiCrown,
		'formal': EmojiTopHat,
		'melodramatic': EmojiHeartOnFire,
		'meme': EmojiPoo,
		'nature-documentary': EmojiEarth,
		'nerd': EmojiFaceNerd,
		'overthinker': EmojiFaceExplodingHead,
		'passive-aggressive': EmojiFaceUpsideDown,
		'philosophical': EmojiOwl,
		'quest-log': EmojiVideoGame,
		'self-help': EmojiWomanMeditating,
		'shakespeare': EmojiTheaterMasks,
		'sportscaster': EmojiMicrophone,
		'storytelling': EmojiOpenBook,
		'tabloid': EmojiNewspaper,
		'therapist': EmojiBrain,
		'tinfoil-hat': EmojiSatellite,
		'troubadour': EmojiMusicalNotes
	};

	function getEmojiSvg(emojiId: string): string | undefined {
		return jomojiSvgMap.get(emojiId);
	}

	function getToneIcon(toneId: string): Component | undefined {
		return toneIconMap[toneId];
	}

	const selectedTone = $derived(tones.find((t) => t.id === wizardStore.data.selectedTone));

	// Detect dark mode for footer icon
	let isDarkMode = $state(false);

	$effect(() => {
		if (typeof window !== 'undefined') {
			isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

			const observer = new MutationObserver(() => {
				isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
			});
			observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

			return () => observer.disconnect();
		}
	});

	function getMoodLabel(value: number): string {
		if (value <= 3) return 'Lågt';
		if (value <= 6) return 'Okej';
		return 'Bra';
	}

	type SummaryItem =
		| { type: 'text'; label: string; value: string }
		| { type: 'emojis'; label: string; emojiIds: string[] }
		| { type: 'energy'; label: string; sleep: number; energy: number; mood: number }
		| { type: 'list'; label: string; items: string[] }
		| { type: 'color'; label: string; colorId: string; colorName: string; cssVar: string };

	type RenderParagraph = { type: ParagraphType; text: string };

	function formatParagraph(text: string): string {
		return text
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/\n/g, '<br>');
	}

	function isSeparatorParagraph(text: string): boolean {
		return /^-{3,}$/.test(text.trim());
	}

	function stripSeparatorLines(entry: string): string {
		return entry
			.split('\n')
			.filter((line) => !isSeparatorParagraph(line))
			.join('\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim();
	}

	function getRenderParagraphs(entry: string): RenderParagraph[] {
		if (!entry) return [];
		const paragraphs = entry.split(/\n{2,}/);
		const result: RenderParagraph[] = [];

		for (const paragraph of paragraphs) {
			if (!paragraph.trim()) continue;
			if (isSeparatorParagraph(paragraph)) continue;

			const paragraphType = getParagraphType(paragraph);
			if (paragraphType === 'regular') {
				result.push({ type: 'regular', text: paragraph });
				continue;
			}

			const lines = paragraph
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line && !isSeparatorParagraph(line));
			if (lines.length === 0) continue;

			result.push({ type: paragraphType, text: lines[0] });

			if (lines.length > 1) {
				result.push({ type: 'regular', text: lines.slice(1).join('\n') });
			}
		}

		return result;
	}

	function getFilledData(): SummaryItem[] {
		const data = wizardStore.data;
		const sections: SummaryItem[] = [];

		sections.push({
			type: 'energy',
			label: 'Dagsform',
			sleep: data.sleepQuality,
			energy: data.energyLevel,
			mood: data.mood
		});

		const allLocations = [...data.locations, ...data.customLocations];
		if (allLocations.length > 0) {
			sections.push({ type: 'list', label: 'Platser', items: allLocations });
		}

		const allActivities = [...data.activities, ...data.customActivities];
		if (allActivities.length > 0) {
			sections.push({ type: 'list', label: 'Aktiviteter', items: allActivities });
		}

		if (data.people.length > 0) {
			sections.push({ type: 'list', label: 'Personer', items: data.people });
		}

		const filledWins = data.wins.filter((w) => w.trim());
		if (filledWins.length > 0) {
			sections.push({ type: 'list', label: 'Vinster', items: filledWins });
		}

		const filledFrustrations = data.frustrations.filter((f) => f.trim());
		if (filledFrustrations.length > 0) {
			sections.push({ type: 'list', label: 'Motgångar', items: filledFrustrations });
		}

		const allMeals = [...data.meals, ...data.customMeals];
		if (allMeals.length > 0) {
			sections.push({ type: 'list', label: 'Mat', items: allMeals });
		}

		const allSoundtracks = [...data.soundtracks, ...data.customSoundtracks];
		if (allSoundtracks.length > 0) {
			sections.push({ type: 'list', label: 'Soundtrack', items: allSoundtracks });
		}

		if (data.moodColor) {
			const moodColor = getMoodColorById(data.moodColor);
			if (moodColor) {
				sections.push({ type: 'color', label: 'Färg', colorId: moodColor.id, colorName: moodColor.name, cssVar: moodColor.cssVar });
			}
		}

		if (data.memoryFor10Years && data.memoryFor10Years.trim()) {
			sections.push({ type: 'text', label: 'Tidskapsel', value: data.memoryFor10Years });
		}

		return sections;
	}

	const summaryData = $derived(getFilledData());
	const renderParagraphs = $derived(getRenderParagraphs(generatedEntry));

	$effect(() => {
		wizardStore.setResultView(generatedEntry.trim().length > 0);
	});

	async function handleGenerate() {
		isGenerating = true;
		error = '';
		generatedEntry = '';

		// Determine the actual tone to use (random if "surprise" selected)
		let toneToUse = wizardStore.data.selectedTone;
		if (toneToUse === 'surprise') {
			const randomIndex = Math.floor(Math.random() * tones.length);
			toneToUse = tones[randomIndex].id;
		}
		actualToneUsed = toneToUse;
		startPhraseCycling(toneToUse);

		// DEV: Use sample content instead of API call
		if (DEV_PREVIEW) {
			await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate loading
			generatedEntry = stripSeparatorLines(SAMPLE_ENTRY);
			selectRandomMessage();
			stopPhraseCycling();
			isGenerating = false;
			return;
		}

		try {
			const emojiLabels = wizardStore.data.emojis.map(
				(emojiId) => emojiLabelMap.get(emojiId) ?? jomojiNameMap.get(emojiId) ?? emojiId
			);

			const response = await fetch(getApiUrl('/api/generate'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ ...wizardStore.data, emojis: emojiLabels, selectedTone: toneToUse })
			});

			const result = await response.json();

			if (result.success) {
				generatedEntry = stripSeparatorLines(result.entry);
				selectRandomMessage();
			} else {
				error = result.error || 'Något gick fel vid genereringen.';
			}
		} catch (err) {
			error = 'Kunde inte ansluta till servern. Försök igen.';
			console.error('Generation error:', err);
		} finally {
			stopPhraseCycling();
			isGenerating = false;
		}
	}

	function handleStartOver() {
		wizardStore.fullReset();
		generatedEntry = '';
		error = '';
		goto('/');
	}

	function selectRandomMessage() {
		const randomIndex = Math.floor(Math.random() * resultMessages.length);
		resultMessage = resultMessages[randomIndex];
	}

	async function downloadAsImage() {
		if (!documentElement || isDownloading) return;
		isDownloading = true;

		try {
			const canvas = await html2canvas(documentElement, {
				backgroundColor: isDarkMode ? '#1c1c1f' : '#ffffff',
				useCORS: true,
				logging: false
			} as Parameters<typeof html2canvas>[1] & { scale?: number });
			// Note: scale is set via window.devicePixelRatio or canvas is scaled manually if higher DPI needed

			const link = document.createElement('a');
			link.download = `dagbok-${wizardStore.data.date?.replace(/[\s,]+/g, '-').replace(/-+/g, '-') || 'entry'}.png`;
			link.href = canvas.toDataURL('image/png', 1.0);
			link.click();
		} catch (err) {
			console.error('Failed to download image:', err);
		} finally {
			isDownloading = false;
		}
	}

	async function downloadAsPdf() {
		if (!pdfElement || isDownloadingPdf) return;
		isDownloadingPdf = true;

		try {
			const a4Width = 210;
			const a4Height = 297;

			await document.fonts.ready;

			const canvas = await html2canvas(pdfElement, {
				backgroundColor: '#ffffff',
				useCORS: true,
				logging: false,
				width: 720
			} as Parameters<typeof html2canvas>[1] & { scale?: number });

			const margin = 15;
			const maxWidth = a4Width - margin * 2;
			const maxHeight = a4Height - margin * 2;

			const pxToMm = 25.4 / (96 * 3);
			const contentWidthMm = canvas.width * pxToMm;
			const contentHeightMm = canvas.height * pxToMm;

			const scale = Math.min(maxWidth / contentWidthMm, maxHeight / contentHeightMm, 1);
			const finalWidth = contentWidthMm * scale;
			const finalHeight = contentHeightMm * scale;

			const x = (a4Width - finalWidth) / 2;
			const y = margin;

			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4'
			});

			const imgData = canvas.toDataURL('image/png', 1.0);
			pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

			pdf.save(`dagbok-${wizardStore.data.date?.replace(/[\s,]+/g, '-').replace(/-+/g, '-') || 'entry'}.pdf`);
		} catch (err) {
			console.error('Failed to download PDF:', err);
		} finally {
			isDownloadingPdf = false;
		}
	}

	async function copyToClipboard() {
		if (isCopying) return;
		isCopying = true;

		try {
			await navigator.clipboard.writeText(generatedEntry);
		} catch (err) {
			console.error('Failed to copy to clipboard:', err);
		} finally {
			setTimeout(() => {
				isCopying = false;
			}, 1500);
		}
	}

	function openEmailModal() {
		emailAddress = '';
		emailError = '';
		emailSent = false;
		showEmailModal = true;
	}

	function closeEmailModal() {
		showEmailModal = false;
		emailAddress = '';
		emailError = '';
	}

	async function sendEmail() {
		if (isSendingEmail || !emailAddress.trim()) return;
		isSendingEmail = true;
		emailError = '';

		try {
			const response = await fetch(getApiUrl('/api/email'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: emailAddress.trim(),
					entry: generatedEntry,
					date: wizardStore.data.date,
					weekday: wizardStore.data.weekday
				})
			});

			const result = await response.json();

			if (result.success) {
				emailSent = true;
				setTimeout(() => {
					closeEmailModal();
				}, 1500);
			} else {
				emailError = result.error || 'Kunde inte skicka e-post.';
			}
		} catch (err) {
			emailError = 'Kunde inte ansluta till servern. Försök igen.';
			console.error('Email error:', err);
		} finally {
			isSendingEmail = false;
		}
	}
</script>

{#if generatedEntry}
	<div class="result-view">
		<div class="result-intro">
			<div class="result-icon">
				{#if isDarkMode}
					<EmojiRoseDark size={48} />
				{:else}
					<EmojiRoseLight size={48} />
				{/if}
			</div>
			<h1 class="result-title">{resultMessage.title}</h1>
			<p class="result-subtitle">{resultMessage.subtitle}</p>
		</div>

		<div class="document-wrapper">
			<div class="result-document" bind:this={documentElement}>
				<!-- Paper texture overlay -->
				<div class="paper-texture"></div>

				<div class="document-header">
					<div class="document-date">
						<span class="document-weekday">{wizardStore.data.weekday}</span>
						<span class="document-date-text">{wizardStore.data.date}</span>
					</div>
					<span class="document-emojis">
						{#each wizardStore.data.emojis as emojiId}
							{@const svg = getEmojiSvg(emojiId)}
							{#if svg}
								<span class="document-emoji">{@html uniqueSvgIds(svg)}</span>
							{/if}
						{/each}
					</span>
				</div>

				<div class="document-content">
					{#each renderParagraphs as paragraph}
						{#if paragraph.type === 'horoscope-heading'}
							{@const ZodiacIcon = getZodiacComponent()}
							<p class="addon-heading">
								{#if ZodiacIcon}
									<span class="addon-icon"><UniqueEmoji><ZodiacIcon size={24} /></UniqueEmoji></span>
								{:else}
									<span class="addon-icon"><UniqueEmoji><EmojiCrystalBall size={24} /></UniqueEmoji></span>
								{/if}
								<span>{@html formatParagraph(paragraph.text)}</span>
							</p>
						{:else if paragraph.type === 'onthisday-heading'}
							<p class="addon-heading">
								<span class="addon-icon"><UniqueEmoji><EmojiScroll size={24} /></UniqueEmoji></span>
								<span>{@html formatParagraph(paragraph.text)}</span>
							</p>
						{:else if paragraph.type === 'homework-heading'}
							<p class="addon-heading">
								<span class="addon-icon"><UniqueEmoji><EmojiBooks size={24} /></UniqueEmoji></span>
								<span>{@html formatParagraph(paragraph.text)}</span>
							</p>
						{:else}
							<p>
								{@html formatParagraph(paragraph.text)}
							</p>
						{/if}
					{/each}
				</div>

				<div class="document-footer">
					<div class="footer-line"></div>
					<div class="footer-content">
						{#if actualToneUsed || selectedTone}
							{@const actualTone = actualToneUsed ? tones.find((t) => t.id === actualToneUsed) : selectedTone}
							{#if actualTone}
								{@const ToneIcon = getToneIcon(actualTone.id)}
								<div class="document-tone">
									{#if ToneIcon}
										<span class="tone-icon"><UniqueEmoji><ToneIcon size={30} /></UniqueEmoji></span>
									{/if}
									<span class="tone-name">{actualTone.name}</span>
								</div>
							{/if}
						{/if}
						<span class="brand-text">Berättat av Storify</span>
					</div>
				</div>
			</div>
		</div>

		<div class="actions-container">
			<div class="result-actions">
				<button class="action-btn" onclick={downloadAsImage} disabled={isDownloading}>
					{#if isDownloading}
						<span class="spinner"></span>
						<span>Sparar...</span>
					{:else}
						<EmojiFramedPicture size={22} />
						<span>Spara bild</span>
					{/if}
				</button>
				<button class="action-btn" onclick={downloadAsPdf} disabled={isDownloadingPdf}>
					{#if isDownloadingPdf}
						<span class="spinner"></span>
						<span>Skapar...</span>
					{:else}
						<EmojiPrinter size={22} />
						<span>Spara PDF</span>
					{/if}
				</button>
				<button class="action-btn" onclick={copyToClipboard} disabled={isCopying}>
					{#if isCopying}
						<svg class="action-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<polyline points="20 6 9 17 4 12"/>
						</svg>
						<span>Kopierat!</span>
					{:else}
						<EmojiClipboard size={22} />
						<span>Kopiera</span>
					{/if}
				</button>
				<button class="action-btn" onclick={openEmailModal}>
					<EmojiEnvelopeIncoming size={22} />
					<span>Maila</span>
				</button>
			</div>
				<button class="action-btn restart-btn" onclick={handleStartOver}>
				Börja om från början...
			</button>
		</div>

		{#if showEmailModal}
			<div class="modal-overlay" onclick={closeEmailModal} role="button" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && closeEmailModal()}>
				<div class="modal-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && closeEmailModal()} role="dialog" aria-modal="true" aria-labelledby="email-modal-title" tabindex="-1">
					<h2 id="email-modal-title" class="modal-title">Skicka som e-post</h2>
					<p class="modal-description">Ange en e-postadress så skickar vi dagboksinlägget dit.</p>

					<input
						type="email"
						class="modal-input"
						placeholder="din@email.se"
						bind:value={emailAddress}
						onkeydown={(e) => e.key === 'Enter' && sendEmail()}
						disabled={isSendingEmail || emailSent}
					/>

					{#if emailError}
						<p class="modal-error">{emailError}</p>
					{/if}

					<div class="modal-actions">
						<button class="modal-btn modal-btn-cancel" onclick={closeEmailModal} disabled={isSendingEmail}>
							Avbryt
						</button>
						<button class="modal-btn modal-btn-send" onclick={sendEmail} disabled={isSendingEmail || emailSent || !emailAddress.trim()}>
							{#if emailSent}
								<svg class="action-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12"/>
								</svg>
								Skickat!
							{:else if isSendingEmail}
								<span class="spinner"></span>
								Skickar...
							{:else}
								Skicka
							{/if}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Hidden PDF-optimized layout -->
	<div class="pdf-document" bind:this={pdfElement}>
		<div class="pdf-header">
			<div class="pdf-emojis">
				{#each wizardStore.data.emojis as emojiId}
					{@const svg = getEmojiSvg(emojiId)}
					{#if svg}
						<span class="pdf-emoji">{@html uniqueSvgIds(svg)}</span>
					{/if}
				{/each}
			</div>
			<h1 class="pdf-title">{wizardStore.data.weekday}, {wizardStore.data.date}</h1>
		</div>

		<div class="pdf-content">
			{#each renderParagraphs as paragraph}
				{#if paragraph.type === 'horoscope-heading'}
					{@const ZodiacIcon = getZodiacComponent()}
					<p class="pdf-addon-heading">
						{#if ZodiacIcon}
							<span class="pdf-addon-icon"><UniqueEmoji><ZodiacIcon size={20} /></UniqueEmoji></span>
						{:else}
							<span class="pdf-addon-icon"><UniqueEmoji><EmojiCrystalBall size={20} /></UniqueEmoji></span>
						{/if}
						<span>{@html formatParagraph(paragraph.text)}</span>
					</p>
				{:else if paragraph.type === 'onthisday-heading'}
					<p class="pdf-addon-heading">
						<span class="pdf-addon-icon"><UniqueEmoji><EmojiScroll size={20} /></UniqueEmoji></span>
						<span>{@html formatParagraph(paragraph.text)}</span>
					</p>
				{:else if paragraph.type === 'homework-heading'}
					<p class="pdf-addon-heading">
						<span class="pdf-addon-icon"><UniqueEmoji><EmojiBooks size={20} /></UniqueEmoji></span>
						<span>{@html formatParagraph(paragraph.text)}</span>
					</p>
				{:else}
					<p>
						{@html formatParagraph(paragraph.text)}
					</p>
				{/if}
			{/each}
		</div>

		<div class="pdf-footer">
			{#if actualToneUsed || selectedTone}
				{@const pdfActualTone = actualToneUsed ? tones.find((t) => t.id === actualToneUsed) : selectedTone}
				{#if pdfActualTone}
					{@const ToneIcon = getToneIcon(pdfActualTone.id)}
					{#if ToneIcon}
						<span class="pdf-tone-icon"><UniqueEmoji><ToneIcon size={24} /></UniqueEmoji></span>
					{/if}
					<span class="pdf-tone-name">{pdfActualTone.name}</span>
				{/if}
			{/if}
			<span class="pdf-brand">
				<span class="pdf-brand-text">Berättat av Storify</span>
			</span>
		</div>
	</div>
{:else}
	<div class="step-content">
		<p class="step-intro">Kolla igenom dina val. Ser det bra ut? Då är det bara att trycka på knappen och låta dagboken ta form.</p>

		{#if wizardStore.data.selectedTone === 'surprise'}
			<span class="voice-indicator">
				<span class="voice-icon"><EmojiDice size={20} /></span>
				Överraskning
			</span>
		{:else if selectedTone}
			{@const ToneIcon = getToneIcon(selectedTone.id)}
			<span class="voice-indicator">
				{#if ToneIcon}
					<span class="voice-icon"><UniqueEmoji><ToneIcon size={20} /></UniqueEmoji></span>
				{/if}
				{selectedTone.name}
			</span>
		{/if}

		<div class="summary-header">
			<div class="summary-date">
				<span class="weekday">{wizardStore.data.weekday}</span>
				<span class="date">{wizardStore.data.date}</span>
				{#if hasAddons}
					<div class="summary-addons">
						{#if wizardStore.data.includeHoroscope}
							<span class="addon-badge" title="Horoskop">
								{#if zodiacSign}
									{@const ZodiacIcon = zodiacComponents[zodiacSign.id]}
									{#if ZodiacIcon}
										<UniqueEmoji><ZodiacIcon size={20} /></UniqueEmoji>
									{:else}
										<UniqueEmoji><EmojiCrystalBall size={20} /></UniqueEmoji>
									{/if}
								{:else}
									<UniqueEmoji><EmojiCrystalBall size={20} /></UniqueEmoji>
								{/if}
							</span>
						{/if}
						{#if wizardStore.data.includeOnThisDay}
							<span class="addon-badge" title="På denna dag...">
								<UniqueEmoji><EmojiScroll size={20} /></UniqueEmoji>
							</span>
						{/if}
						{#if wizardStore.data.includeHomework}
							<span class="addon-badge" title="Hemläxa">
								<UniqueEmoji><EmojiBooks size={20} /></UniqueEmoji>
							</span>
						{/if}
					</div>
				{/if}
			</div>
			<span class="summary-emojis">
				{#each wizardStore.data.emojis as emojiId}
					{@const svg = getEmojiSvg(emojiId)}
					{#if svg}
						<span class="summary-emoji">{@html uniqueSvgIds(svg)}</span>
					{/if}
				{/each}
			</span>
		</div>

		<div class="summary-grid">
			{#each summaryData as item}
				<div class="summary-item">
					<span class="summary-label">{item.label}</span>
					{#if item.type === 'text'}
						<span class="summary-value">{item.value}</span>
					{:else if item.type === 'energy'}
						<div class="energy-bars">
							<div class="energy-row">
								<span class="energy-label">Sömn</span>
								<div class="energy-bar-container">
									<div class="energy-bar" style="width: {item.sleep * 10}%"></div>
								</div>
								<span class="energy-value">{item.sleep}</span>
							</div>
							<div class="energy-row">
								<span class="energy-label">Energi</span>
								<div class="energy-bar-container">
									<div class="energy-bar" style="width: {item.energy * 10}%"></div>
								</div>
								<span class="energy-value">{item.energy}</span>
							</div>
							<div class="energy-row">
								<span class="energy-label">Humör</span>
								<div class="energy-bar-container">
									<div class="energy-bar" style="width: {item.mood * 10}%"></div>
								</div>
								<span class="energy-value">{item.mood}</span>
							</div>
						</div>
					{:else if item.type === 'list'}
						<div class="summary-tags">
							{#each item.items as tag}
								<span class="summary-tag">{tag}</span>
							{/each}
						</div>
					{:else if item.type === 'color'}
						<div class="summary-color">
							<span class="summary-color-swatch" style="--swatch-color: var({item.cssVar})"></span>
							<span class="summary-color-name">{item.colorName}</span>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="generate-section">
			{#if error}
				<div class="error-message">{error}</div>
			{/if}
			<button class="generate-btn" onclick={handleGenerate} disabled={isGenerating}>
				{#if isGenerating}
					<span class="spinner"></span>
					<span class="loading-phrase" class:visible={loadingPhraseVisible}>{loadingPhrase}</span>
				{:else}
					<span class="generate-icon"><EmojiSparklesAlt size={28} /></span>
					Generera dagboksinlägg
				{/if}
			</button>
		</div>
	</div>
{/if}

<style>
	/* ==========================================================================
	   Pre-generation: Step Content & Summary
	   ========================================================================== */

	.step-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.step-intro {
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		margin-top: 0;
	}

	.summary-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.summary-date {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.125rem;
	}

	.weekday {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-snug);
		color: var(--color-text);
	}

	.date {
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.summary-addons {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 0.375rem;
	}

	.addon-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.12rem;
		border-radius: var(--radius-xs);
	}

	.summary-emojis {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		flex-wrap: wrap;
	}

	.summary-emoji {
		display: flex;
		align-items: center;
		width: 36px;
		height: 36px;
	}

	.summary-emoji :global(svg) {
		width: 100%;
		height: 100%;
	}

	.summary-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}

	.summary-label {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.summary-value {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		font-stretch: 100%;
		letter-spacing: var(--tracking-normal);
		line-height: var(--leading-normal);
		color: var(--color-text);
	}

	.energy-bars {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.energy-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.energy-label {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		color: var(--color-text-muted);
		width: 3.5rem;
		flex-shrink: 0;
	}

	.energy-bar-container {
		flex: 1;
		height: 6px;
		background-color: var(--color-neutral);
		border-radius: 3px;
		overflow: hidden;
	}

	.energy-bar {
		height: 100%;
		background-color: var(--color-accent);
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.energy-value {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text);
		width: 1.5rem;
		text-align: right;
		flex-shrink: 0;
	}

	.summary-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.summary-tag {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		color: var(--color-text);
		background-color: var(--color-neutral);
		padding: 0.25rem 0.625rem;
		border-radius: var(--radius-sm);
	}

	.summary-color {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.summary-color-swatch {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 4px;
		background-color: var(--swatch-color);
		box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.9), 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.summary-color-name {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		color: var(--color-text);
	}

	.voice-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: -0.75rem;
		margin-bottom: -0.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.voice-icon {
		display: flex;
		align-items: center;
	}

	.generate-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.generate-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		width: 100%;
		padding: 1.25rem 2rem;
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		font-stretch: 108%;
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-snug);
		background-color: var(--color-accent);
		color: white;
		border-radius: var(--radius-md);
		transition:
			background-color 0.15s ease,
			transform 0.1s ease;
	}

	.generate-btn:hover {
		background-color: var(--color-accent-hover);
	}

	.generate-btn:active {
		transform: scale(0.98);
	}

	.generate-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.generate-icon {
		display: flex;
		align-items: center;
	}

	.loading-phrase {
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.loading-phrase.visible {
		opacity: 1;
	}

	.error-message {
		width: 100%;
		padding: 0.75rem 1rem;
		background-color: var(--color-error-bg);
		border: 1px solid var(--color-error-border);
		border-radius: var(--radius-sm);
		color: var(--color-error);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		text-align: center;
	}

	/* ==========================================================================
	   Post-generation: Result View
	   ========================================================================== */

	.result-view {
		display: flex;
		flex-direction: column;
	}

	.result-intro {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.result-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.5rem;
		opacity: 0.8;
	}

	.result-title {
		font-family: var(--font-primary);
		font-size: var(--text-xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		color: var(--color-text);
		margin: 0 0 0.375rem 0;
	}

	.result-subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}

	/* ==========================================================================
	   Document Wrapper
	   ========================================================================== */

	.document-wrapper {
		width: 100%;
		position: relative;
	}

	/* ==========================================================================
	   Result Document - The main diary card
	   ========================================================================== */

	.result-document {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem;
		font-family: var(--font-primary);
		background-color: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.04),
			0 4px 12px rgba(0, 0, 0, 0.03),
			0 8px 32px rgba(0, 0, 0, 0.02);
		overflow: hidden;
	}

	.paper-texture {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
		opacity: 0.02;
		pointer-events: none;
	}

	/* ==========================================================================
	   Document Header
	   ========================================================================== */

	.document-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.document-emojis {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.document-emoji {
		display: flex;
		align-items: center;
		width: 30px;
		height: 30px;
	}

	.document-emoji :global(svg) {
		width: 100%;
		height: 100%;
	}

	.document-date {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.125rem;
	}

	.document-weekday {
		font-size: var(--text-xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		color: var(--color-text);
	}

	.document-date-text {
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	/* ==========================================================================
	   Document Content
	   ========================================================================== */

	.document-content {
		font-size: var(--text-base);
		font-weight: var(--weight-book);
		line-height: var(--leading-loose);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.document-content p {
		margin: 0 0 1.125rem 0;
		text-indent: 0;
	}

	.document-content p:first-child {
		font-weight: var(--weight-medium);
	}

	.document-content p:last-child {
		margin-bottom: 0;
	}

	.document-content p.addon-heading {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-weight: var(--weight-medium);
		margin-top: 1.5rem;
	}

	.document-content p.addon-heading:first-child {
		margin-top: 0;
		padding-top: 0;
		border-top: none;
	}

	.addon-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	/* ==========================================================================
	   Document Footer
	   ========================================================================== */

	.document-footer {
		display: flex;
		flex-direction: column;
	}

	.footer-line {
		height: 1px;
		background: var(--color-border);
		margin-bottom: 1.25rem;
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.document-tone {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.tone-icon {
		display: flex;
		align-items: center;
	}

	.tone-name {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.brand-text {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-accent-hover);
		transition: color 0.2s ease, opacity 0.2s ease;
		cursor: default;
	}

	.brand-text:hover {
		color: var(--color-accent);
		opacity: 1;
	}

	/* ==========================================================================
	   Action Buttons
	   ========================================================================== */

	.actions-container {
		width: 100%;
		margin-top: 1.5rem;
	}

	.result-actions {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		background: var(--color-accent);
		color: white;
		border: none;
	}

	.action-btn:hover:not(:disabled) {
		background: var(--color-accent-hover);
		box-shadow: 0 4px 12px rgba(244, 63, 122, 0.25);
	}

	.action-btn:active:not(:disabled) {
		transform: scale(0.97);
	}

	.action-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.action-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	.action-icon.check {
		color: #22c55e;
	}

	.restart-btn {
		width: 100%;
		margin-top: 0.75rem;
		background: transparent;
		color: var(--color-accent);
		border: 2px solid var(--color-accent);
	}

	.restart-btn:hover {
		background: var(--color-accent);
		color: white;
	}

	/* ==========================================================================
	   Spinner
	   ========================================================================== */

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		opacity: 0.8;
	}

	.generate-btn .spinner {
		width: 18px;
		height: 18px;
		border-color: rgba(255, 255, 255, 0.3);
		border-top-color: white;
		opacity: 1;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ==========================================================================
	   PDF Document (Hidden)
	   ========================================================================== */

	.pdf-document {
		position: absolute;
		left: -9999px;
		top: 0;
		width: 720px;
		padding: 2.5rem 3rem;
		background: #ffffff;
		font-family: var(--font-primary);
	}

	.pdf-header {
		margin-bottom: 2rem;
	}

	.pdf-emojis {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.pdf-emoji {
		display: flex;
		align-items: center;
		width: 44px;
		height: 44px;
	}

	.pdf-emoji :global(svg) {
		width: 100%;
		height: 100%;
	}

	.pdf-title {
		font-family: var(--font-primary);
		font-size: 32px;
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: #1a1a1a;
		margin: 0;
		line-height: 1.2;
	}

	.pdf-content {
		font-family: var(--font-primary);
		font-size: 19px;
		font-weight: var(--weight-book);
		line-height: 1.75;
		letter-spacing: var(--tracking-wide);
		color: #1a1a1a;
	}

	.pdf-content p {
		margin: 0 0 1.25rem 0;
		text-align: left;
	}

	.pdf-content p:last-child {
		margin-bottom: 0;
	}

	.pdf-content p:first-child {
		font-weight: var(--weight-medium);
		font-size: 21px;
	}

	.pdf-content p.pdf-addon-heading {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-weight: var(--weight-medium);
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
	}

	.pdf-addon-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.pdf-footer {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 2.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
	}

	.pdf-tone-icon {
		display: flex;
		align-items: center;
		opacity: 0.6;
	}

	.pdf-tone-name {
		font-family: var(--font-primary);
		font-size: 14px;
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: #666;
	}

	.pdf-brand {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-left: auto;
	}

	.pdf-brand-text {
		font-family: var(--font-primary);
		font-size: 14px;
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: #888;
	}

	/* ==========================================================================
	   Responsive Adjustments
	   ========================================================================== */

	@media (max-width: 640px) {
		.result-document {
			padding: 1.5rem;
			gap: 1rem;
		}

		.document-header {
			padding-bottom: 1rem;
		}

		.document-weekday {
			font-size: var(--text-lg);
		}

		.document-emojis {
			gap: 0.5rem;
		}

		.document-emoji :global(svg) {
			width: 24px;
			height: 24px;
		}

		.result-actions {
			grid-template-columns: 1fr;
		}

		.action-btn {
			padding: 1rem;
		}

		.footer-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}
	}

	@media (min-width: 641px) and (max-width: 900px) {
		.result-actions {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 480px) {
		.summary-header {
			padding: 1rem;
		}

		.summary-emojis {
			gap: 0.5rem;
		}

		.energy-row {
			flex-wrap: wrap;
		}

		.energy-label,
		.energy-value {
			width: auto;
		}
	}

	/* ==========================================================================
	   Email Modal
	   ========================================================================== */

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
		animation: fadeIn 0.15s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		padding: 1.5rem;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		animation: slideUp 0.2s ease;
	}

	@keyframes slideUp {
		from {
			transform: translateY(10px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.modal-title {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.modal-description {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin: 0 0 1rem 0;
		line-height: var(--leading-relaxed);
	}

	.modal-input {
		width: 100%;
		padding: 0.875rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		color: var(--color-text);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.modal-input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px rgba(244, 63, 122, 0.1);
	}

	.modal-input::placeholder {
		color: var(--color-text-muted);
	}

	.modal-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.modal-error {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-error);
		margin: 0.75rem 0 0 0;
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	.modal-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.modal-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.modal-btn-cancel {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.modal-btn-cancel:hover:not(:disabled) {
		background: var(--color-neutral);
		color: var(--color-text);
	}

	.modal-btn-send {
		background: var(--color-accent);
		color: white;
		border: none;
	}

	.modal-btn-send:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}
</style>

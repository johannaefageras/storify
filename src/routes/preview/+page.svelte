<script lang="ts">
	import { tones } from '$lib/data/tones';
	import { emojiMap } from '$lib/data/emojis';
	import type { Component } from 'svelte';
	import html2canvas from 'html2canvas';
	import { jsPDF } from 'jspdf';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';

	// Sample data for preview
	const SAMPLE_DATA = {
		date: '24 januari 2025',
		weekday: 'Fredag',
		emojis: ['face-beaming-smiling-eyes', 'glowing-star', 'hot-beverage', 'face-smiling-hearts'],
		selectedTone: 'storytelling'
	};

	const SAMPLE_ENTRY = `Hon vaknade till ljudet av regn mot fönstret, det mjuka trummandet som bara januariregn kan åstadkomma. Klockan visade halv åtta, men morgonljuset kämpade sig knappt igenom de grå molnen.

Det var en av de där fredagarna som lovar mer än de håller – eller kanske tvärtom. Hon visste inte ännu att denna dag skulle innehålla små ögonblick värda att minnas.

Frukosten blev enkel: fil med müsli och en kopp kaffe som hon drack stående vid köksfönstret. Utanför gick människor förbi med uppfällda paraplyer, alla på väg någonstans. Hon undrade ibland vart alla var på väg så tidigt.

På jobbet väntade ett möte som hon hade gruvat sig för i veckor. Men när det väl var dags visade det sig vara enklare än förväntat. Kollegorna nickade instämmande till hennes förslag, och efteråt kom chefen fram och sa något uppmuntrande. Sådana stunder, tänkte hon, de små bekräftelserna som man inte visste att man behövde.

Lunchen blev på det lilla stället runt hörnet, det med de slitna trästolarna och den alltid lite för starka kaffedoften. Hon beställde sin vanliga – toast med avokado – och satt en stund och bara tittade ut genom fönstret. Regnet hade upphört och en blek sol letade sig fram mellan molnen.

Kvällen tillbringade hon hemma, inlindad i en filt i soffan. Det blev en film hon sett förut, en av de där man kan titta på utan att egentligen behöva följa med. Ibland är det precis vad man behöver.

Nu, när klockan närmar sig midnatt, sitter hon med en kopp te och skriver dessa rader. Imorgon är det lördag, och hon har inga planer alls. Den tanken fyller henne med en stilla glädje.`;

	// Voice icons for display
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

	import EmojiRoseLight from '$lib/components/emojis/assorted/EmojiRoseLight.svelte';
	import EmojiRoseDark from '$lib/components/emojis/assorted/EmojiRoseDark.svelte';
	import EmojiFramedPicture from '$lib/components/emojis/assorted/EmojiFramedPicture.svelte';
	import EmojiPrinter from '$lib/components/emojis/assorted/EmojiPrinter.svelte';
	import EmojiClipboard from '$lib/components/emojis/assorted/EmojiClipboard.svelte';

	const toneIconMap: Record<string, Component> = {
		classic: EmojiLedger,
		sportscaster: EmojiStudioMicrophone,
		'cat-perspective': EmojiCatTabby,
		philosophical: EmojiFaceThinking,
		'nature-documentary': EmojiEarth,
		sarcastic: EmojiFaceGrimacing,
		nerd: EmojiFaceNerd,
		storytelling: EmojiOpenBook,
		cringe: EmojiFaceSmirking,
		formal: EmojiClassicBuilding,
		'quest-log': EmojiVideoGameControl,
		shakespeare: EmojiTheaterMasks,
		therapist: EmojiBrain,
		meme: EmojiPoo,
		bored: EmojiFaceYawning,
		british: EmojiFlagUK,
		'drama-queen': EmojiCrown,
		'ai-robot': EmojiRobot,
		troubadour: EmojiMusicalNotes,
		tabloid: EmojiNewspaper
	};

	function getEmojiComponent(emojiId: string): Component | undefined {
		return emojiMap.get(emojiId);
	}

	function getToneIcon(toneId: string): Component | undefined {
		return toneIconMap[toneId];
	}

	const selectedTone = $derived(tones.find((t) => t.id === SAMPLE_DATA.selectedTone));

	// Detect dark mode
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

	// References for export
	let documentElement: HTMLDivElement = $state(null!);
	let pdfElement: HTMLDivElement = $state(null!);
	let isDownloading = $state(false);
	let isDownloadingPdf = $state(false);
	let isCopying = $state(false);

	async function downloadAsImage() {
		if (!documentElement || isDownloading) return;
		isDownloading = true;

		try {
			const canvas = await html2canvas(documentElement, {
				backgroundColor: isDarkMode ? '#1c1c1f' : '#ffffff',
				scale: 3,
				useCORS: true,
				logging: false
			});

			const link = document.createElement('a');
			link.download = `dagbok-${SAMPLE_DATA.date.replace(/\s/g, '-')}.png`;
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
				scale: 3,
				useCORS: true,
				logging: false,
				width: 720
			});

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

			pdf.save(`dagbok-${SAMPLE_DATA.date.replace(/\s/g, '-')}.pdf`);
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
			await navigator.clipboard.writeText(SAMPLE_ENTRY);
		} catch (err) {
			console.error('Failed to copy to clipboard:', err);
		} finally {
			setTimeout(() => {
				isCopying = false;
			}, 1500);
		}
	}
</script>

<svelte:head>
	<title>Preview – Storify</title>
</svelte:head>

<main class="preview-page">
	<header class="preview-header">
		<a href="/" class="logo-link">
			<span class="logo-icon">
				{#if isDarkMode}
					<EmojiRoseDark size={32} />
				{:else}
					<EmojiRoseLight size={32} />
				{/if}
			</span>
			<span class="logo-text">Storify</span>
		</a>
		<ThemeToggle variant="inline" />
	</header>

	<div class="preview-content">
		<div class="preview-intro">
			<span class="preview-badge">Förhandsgranskning</span>
			<h1 class="preview-title">Din dagbok tar form</h1>
			<p class="preview-subtitle">Så här kan ett genererat inlägg se ut – redo att sparas och delas.</p>
		</div>

		<div class="document-wrapper">
			<div class="result-document" bind:this={documentElement}>
				<!-- Paper texture overlay -->
				<div class="paper-texture"></div>

				<div class="document-header">
					<div class="document-date">
						<span class="document-weekday">{SAMPLE_DATA.weekday}</span>
						<span class="document-date-text">{SAMPLE_DATA.date}</span>
					</div>
					<span class="document-emojis">
						{#each SAMPLE_DATA.emojis as emojiId}
							{@const EmojiComponent = getEmojiComponent(emojiId)}
							{#if EmojiComponent}
								<span class="document-emoji"><EmojiComponent size={30} /></span>
							{/if}
						{/each}
					</span>
				</div>

				<div class="document-content">
					{#each SAMPLE_ENTRY.split('\n\n') as paragraph, i}
						{#if paragraph.trim()}
							<p>
								{@html paragraph
									.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
									.replace(/\*(.*?)\*/g, '<em>$1</em>')
									.replace(/\n/g, '<br>')}
							</p>
						{/if}
					{/each}
				</div>

				<div class="document-footer">
					<div class="footer-line"></div>
					<div class="footer-content">
						{#if selectedTone}
							{@const ToneIcon = getToneIcon(selectedTone.id)}
							<div class="document-tone">
								{#if ToneIcon}
									<span class="tone-icon"><ToneIcon size={30} /></span>
								{/if}
								<span class="tone-name">{selectedTone.name}</span>
							</div>
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
			</div>
			<a href="/wizard" class="action-btn restart-btn">Börja om från början</a>
		</div>
	</div>

	<footer class="preview-footer">
		<p>Detta är en förhandsvisning av designen. I den riktiga appen genereras texten baserat på dina dagliga upplevelser.</p>
	</footer>
</main>

<!-- Hidden PDF-optimized layout -->
<div class="pdf-document" bind:this={pdfElement}>
	<div class="pdf-header">
		<div class="pdf-emojis">
			{#each SAMPLE_DATA.emojis as emojiId}
				{@const EmojiComponent = getEmojiComponent(emojiId)}
				{#if EmojiComponent}
					<span class="pdf-emoji"><EmojiComponent size={44} /></span>
				{/if}
			{/each}
		</div>
		<h1 class="pdf-title">{SAMPLE_DATA.weekday}, {SAMPLE_DATA.date}</h1>
	</div>

	<div class="pdf-content">
		{#each SAMPLE_ENTRY.split('\n\n') as paragraph}
			{#if paragraph.trim()}
				<p>
					{@html paragraph
						.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
						.replace(/\*(.*?)\*/g, '<em>$1</em>')
						.replace(/\n/g, '<br>')}
				</p>
			{/if}
		{/each}
	</div>

	<div class="pdf-footer">
		{#if selectedTone}
			{@const ToneIcon = getToneIcon(selectedTone.id)}
			{#if ToneIcon}
				<span class="pdf-tone-icon"><ToneIcon size={24} /></span>
			{/if}
			<span class="pdf-tone-name">{selectedTone.name}</span>
		{/if}
		<span class="pdf-brand">
			<span class="pdf-brand-text">Berättat av Storify</span>
		</span>
	</div>
</div>

<style>
	/* ==========================================================================
	   Page Layout
	   ========================================================================== */

	.preview-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
		position: relative;
		overflow-x: hidden;
	}

	/* ==========================================================================
	   Header
	   ========================================================================== */

	.preview-header {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background: color-mix(in srgb, var(--color-bg) 85%, transparent);
		border-bottom: 1px solid var(--color-border);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	.logo-link {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.logo-link:hover {
		opacity: 0.8;
		text-decoration: none;
	}

	.logo-icon {
		display: flex;
		align-items: center;
	}

	.logo-text {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		font-weight: var(--weight-medium);
		font-stretch: 110%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
	}

	/* ==========================================================================
	   Content Area
	   ========================================================================== */

	.preview-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 3rem 2rem;
		max-width: 800px;
		margin: 0 auto;
		width: 100%;
		position: relative;
		z-index: 1;
	}

	/* ==========================================================================
	   Intro Section
	   ========================================================================== */

	.preview-intro {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.preview-badge {
		display: inline-block;
		padding: 0.375rem 0.875rem;
		background: var(--color-accent);
		color: white;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		border-radius: 100px;
		margin-bottom: 1.25rem;
	}

	.preview-title {
		font-family: var(--font-primary);
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		color: var(--color-text);
		margin-bottom: 0.75rem;
	}

	.preview-subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		max-width: 400px;
		margin: 0 auto;
	}

	/* ==========================================================================
	   Document Wrapper & Shadow
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
		padding: 2.5rem;
		font-family: var(--font-primary);
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
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
		gap: 0.75rem;
	}

	.document-emoji {
		display: flex;
		align-items: center;
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

	/* ==========================================================================
	   Document Footer
	   ========================================================================== */

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
		grid-template-columns: repeat(3, 1fr);
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
		text-decoration: none;
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

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		opacity: 0.8;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ==========================================================================
	   Footer
	   ========================================================================== */

	.preview-footer {
		text-align: center;
		padding: 2rem 1.5rem;
		border-top: 1px solid var(--color-border);
		background: var(--color-bg);
	}

	.preview-footer p {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		max-width: 500px;
		margin: 0 auto;
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
		.preview-header {
			padding: calc(env(safe-area-inset-top, 0px) + 0.75rem) 1rem;
		}

		.preview-content {
			padding: 1.5rem 1rem 2rem;
		}

		.preview-title {
			font-size: var(--text-xl);
		}

		.preview-subtitle {
			font-size: var(--text-sm);
		}

		.result-document {
			padding: 1.5rem;
			gap: 1rem;
		}

		.document-weekday {
			font-size: var(--text-lg);
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

	@media (min-width: 641px) and (max-width: 800px) {
		.result-actions {
			grid-template-columns: repeat(2, 1fr);
		}

		.action-btn:last-child {
			grid-column: 1 / -1;
		}
	}
</style>

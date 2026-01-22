<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { tones } from '$lib/data/tones';
	import { emojiLabelMap, emojiMap } from '$lib/data/emojis';
	import type { Component } from 'svelte';
	import EmojiSparkles from '$lib/components/emojis/EmojiAppSparkles.svelte';
	import html2canvas from 'html2canvas';

	// Generation state
	let isGenerating = $state(false);
	let generatedEntry = $state('');
	let error = $state('');

	// Reference to the document element for image export
	let documentElement: HTMLDivElement = $state(null!);

	// DEV: Preview mode for styling without API calls
	const DEV_PREVIEW = false;
	const SAMPLE_ENTRY = `Kära dagbok,

Idag var en ganska lugn dag, faktiskt. Inget speciellt hände, men det var ändå en bra dag på något sätt.

På skolan fick vi veta att matteläraren var sjuk, så istället för lektion blev det film. Jag vet inte ens vad filmen handlade om egentligen – jag satt mest och tänkte på annat och pratade lite med Emma bredvid mig. Det kändes som en liten bonus mitt i veckan.

Det bästa var håltimmen. Jag och tjejerna satt i cafeterian och bara snackade. Inget viktigt, bara sådär. Ibland är det de stunderna som är bäst, när man inte måste göra något utan bara kan vara.

Hemma hos mamma ikväll blev det pasta till middag. Hon gör den där såsen som jag gillar, med vitlök och parmesan. Vi åt framför TV:n, jag och min syster, medan mamma satt i köket och läste något på sin telefon.

Nu är det kväll och jag är trött, men den goda sorten av trött. Imorgon är det torsdag, vilket betyder att det snart är fredag. Den tanken gör mig glad.

Vi ses imorgon, dagboken.`;

	// Voice icons for display
	import EmojiVoiceBored from '$lib/components/emojis/EmojiVoiceBored.svelte';
	import EmojiVoiceBrittish from '$lib/components/emojis/EmojiVoiceBrittish.svelte';
	import EmojiVoiceCatPerspective from '$lib/components/emojis/EmojiVoiceCatPerspective.svelte';
	import EmojiVoiceClassic from '$lib/components/emojis/EmojiVoiceClassic.svelte';
	import EmojiVoiceCringe from '$lib/components/emojis/EmojiVoiceCringe.svelte';
	import EmojiVoiceDramaQueen from '$lib/components/emojis/EmojiVoiceDramaQueen.svelte';
	import EmojiVoiceMeme from '$lib/components/emojis/EmojiVoiceMeme.svelte';
	import EmojiVoicePhilosophical from '$lib/components/emojis/EmojiVoicePhilosophical.svelte';
	import EmojiVoiceQuestLog from '$lib/components/emojis/EmojiVoiceQuestLog.svelte';
	import EmojiVoiceSarcastic from '$lib/components/emojis/EmojiVoiceSarcastic.svelte';
	import EmojiVoiceSportscaster from '$lib/components/emojis/EmojiVoiceSportscaster.svelte';
	import EmojiVoiceStorytelling from '$lib/components/emojis/EmojiVoiceStorytelling.svelte';

	const toneIconMap: Record<string, Component> = {
		classic: EmojiVoiceClassic,
		storytelling: EmojiVoiceStorytelling,
		philosophical: EmojiVoicePhilosophical,
		sportscaster: EmojiVoiceSportscaster,
		'cat-perspective': EmojiVoiceCatPerspective,
		sarcastic: EmojiVoiceSarcastic,
		'drama-queen': EmojiVoiceDramaQueen,
		meme: EmojiVoiceMeme,
		cringe: EmojiVoiceCringe,
		brittish: EmojiVoiceBrittish,
		'quest-log': EmojiVoiceQuestLog,
		bored: EmojiVoiceBored
	};

	function getEmojiComponent(emojiId: string): Component | undefined {
		return emojiMap.get(emojiId);
	}

	function getToneIcon(toneId: string): Component | undefined {
		return toneIconMap[toneId];
	}

	const selectedTone = $derived(tones.find((t) => t.id === wizardStore.data.selectedTone));

	function getMoodLabel(value: number): string {
		if (value <= 3) return 'Lågt';
		if (value <= 6) return 'Okej';
		return 'Bra';
	}

	type SummaryItem =
		| { type: 'text'; label: string; value: string }
		| { type: 'emojis'; label: string; emojiIds: string[] }
		| { type: 'energy'; label: string; sleep: number; energy: number; mood: number }
		| { type: 'list'; label: string; items: string[] };

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

		if (data.memoryFor10Years && data.memoryFor10Years.trim()) {
			sections.push({ type: 'text', label: 'Tidskapsel', value: data.memoryFor10Years });
		}

		return sections;
	}

	const summaryData = $derived(getFilledData());

	$effect(() => {
		wizardStore.setResultView(generatedEntry.trim().length > 0);
	});

	async function handleGenerate() {
		isGenerating = true;
		error = '';
		generatedEntry = '';

		// DEV: Use sample content instead of API call
		if (DEV_PREVIEW) {
			await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate loading
			generatedEntry = SAMPLE_ENTRY;
			isGenerating = false;
			return;
		}

		try {
			const emojiLabels = wizardStore.data.emojis.map(
				(emojiId) => emojiLabelMap.get(emojiId) ?? emojiId
			);
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ ...wizardStore.data, emojis: emojiLabels })
			});

			const result = await response.json();

			if (result.success) {
				generatedEntry = result.entry;
			} else {
				error = result.error || 'Något gick fel vid genereringen.';
			}
		} catch (err) {
			error = 'Kunde inte ansluta till servern. Försök igen.';
			console.error('Generation error:', err);
		} finally {
			isGenerating = false;
		}
	}

	function handleStartOver() {
		wizardStore.reset();
		generatedEntry = '';
		error = '';
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(generatedEntry);
	}

	async function saveAsImage() {
		if (!documentElement) return;

		try {
			const canvas = await html2canvas(documentElement, {
				backgroundColor: null,
				scale: 2, // Higher resolution
				useCORS: true,
				logging: false
			});

			// Convert to blob and download
			canvas.toBlob((blob) => {
				if (!blob) return;
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `dagbok-${wizardStore.data.date || 'entry'}.png`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			}, 'image/png');
		} catch (err) {
			console.error('Failed to save as image:', err);
		}
	}
</script>

{#if generatedEntry}
	<div class="result-view">
		<div class="result-document" bind:this={documentElement}>
			<div class="document-header">
				<span class="document-emojis">
					{#each wizardStore.data.emojis as emojiId}
						{@const EmojiComponent = getEmojiComponent(emojiId)}
						{#if EmojiComponent}
							<span class="document-emoji"><EmojiComponent size={28} /></span>
						{/if}
					{/each}
				</span>
				<div class="document-date">
					<span class="document-weekday">{wizardStore.data.weekday}</span>
					<span class="document-date-text">{wizardStore.data.date}</span>
				</div>
			</div>
			<div class="document-divider"></div>
			<div class="document-content">
				{#each generatedEntry.split('\n\n') as paragraph}
					{#if paragraph.trim()}
						<p>{@html paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>')}</p>
					{/if}
				{/each}
			</div>
		</div>
		<div class="result-actions">
			<button class="secondary-btn" onclick={handleStartOver}>
				Börja om
			</button>
			<button class="copy-btn-large" onclick={copyToClipboard} title="Kopiera till urklipp">
				Kopiera text
			</button>
			<button class="save-image-btn" onclick={saveAsImage} title="Spara som bild">
				Spara bild
			</button>
			<button class="generate-btn small" onclick={handleGenerate} disabled={isGenerating}>
				{#if isGenerating}
					Skriver...
				{:else}
					<span class="generate-icon"><EmojiSparkles size={16} /></span>
					Skriv om
				{/if}
			</button>
		</div>
	</div>
{:else}
	<div class="step-content">
		<p class="step-intro">Kolla igenom dina val. Ser det bra ut? Då är det bara att trycka på knappen och låta dagboken ta form.</p>

		<div class="summary-header">
			<span class="summary-emojis">
				{#each wizardStore.data.emojis as emojiId}
					{@const EmojiComponent = getEmojiComponent(emojiId)}
					{#if EmojiComponent}
						<span class="summary-emoji"><EmojiComponent size={40} /></span>
					{/if}
				{/each}
			</span>
			<div class="summary-date">
				<span class="weekday">{wizardStore.data.weekday}</span>
				<span class="date">{wizardStore.data.date}</span>
			</div>
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
					Genererar...
				{:else}
					<span class="generate-icon"><EmojiSparkles size={20} /></span>
					Generera dagboksinlägg
				{/if}
			</button>
			{#if selectedTone}
				{@const ToneIcon = getToneIcon(selectedTone.id)}
				<span class="voice-indicator">
					{#if ToneIcon}
						<span class="voice-icon"><ToneIcon size={16} /></span>
					{/if}
					{selectedTone.name}
				</span>
			{/if}
		</div>
	</div>
{/if}

<style>
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
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.summary-emojis {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.summary-emoji {
		display: flex;
		align-items: center;
	}

	.summary-date {
		text-align: center;
	}

	.weekday {
		display: block;
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-snug);
		color: var(--color-text);
	}

	.date {
		display: block;
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
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

	.generate-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.5rem;
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

	.generate-icon {
		display: flex;
		align-items: center;
	}

	.voice-indicator {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		color: var(--color-text-muted);
	}

	.voice-icon {
		display: flex;
		align-items: center;
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

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.generate-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.result-view {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.result-document {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.document-header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.document-emojis {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.document-emoji {
		display: flex;
		align-items: center;
	}

	.document-date {
		text-align: left;
	}

	.document-weekday {
		display: block;
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-snug);
		color: var(--color-text);
	}

	.document-date-text {
		display: block;
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.document-divider {
		height: 1px;
		background-color: var(--color-border);
	}

	.document-content {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		line-height: var(--leading-relaxed);
		color: var(--color-text);
	}

	.document-content p {
		margin: 0 0 0.75rem 0;
	}

	.document-content p:last-child {
		margin-bottom: 0;
	}

	.result-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.5rem;
	}

	.secondary-btn {
		flex: 1;
		padding: 0.875rem 1.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text);
		background-color: var(--color-neutral);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.secondary-btn:hover {
		background-color: var(--color-border);
	}

	.generate-btn.small {
		flex: 1;
		padding: 0.875rem 1.5rem;
		font-size: var(--text-sm);
	}

	.copy-btn-large {
		flex: 1;
		padding: 0.875rem 1.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-accent);
		background-color: transparent;
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background-color 0.15s ease;
	}

	.copy-btn-large:hover {
		background-color: var(--color-neutral);
	}

	.save-image-btn {
		flex: 1;
		padding: 0.875rem 1.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-accent);
		background-color: transparent;
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background-color 0.15s ease;
	}

	.save-image-btn:hover {
		background-color: var(--color-neutral);
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

		.result-actions > * {
			flex: 1 1 100%;
		}
	}
</style>

<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { supabase } from '$lib/supabase/client';
	import { tones } from '$lib/data/tones';
	import { jomojiSvgMap } from '$lib/data/jomojis';
	import { uniqueSvgIds } from '$lib/utils/uniqueSvgIds';
	import { getMoodColorById } from '$lib/data/moodColors';
	import { Emoji } from '$lib/assets/emojis';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';
	import DiaryCard from '$lib/components/DiaryCard.svelte';
	import ShareToCommunity from '$lib/components/ShareToCommunity.svelte';
	import { getZodiacFromBirthday } from '$lib/utils/zodiac';
	import { isSeparatorParagraph } from '$lib/utils/paragraphs';
	import TonePickerDropdown from '$lib/components/TonePickerDropdown.svelte';
	import { streamEntry } from '$lib/utils/streamEntry';
	import { goto } from '$app/navigation';
	import resultMessages from '$lib/data/resultMessages.json';
	import { getLoadingPhrases } from '$lib/data/loadingPhrases';
	// Generation state
	let isGenerating = $state(false);
	let generatedEntry = $state('');
	let error = $state('');
	let showShareModal = $state(false);
	let showDiscardConfirm = $state(false);

	// Journal save state
	let isSavingEntry = $state(false);
	let entrySaved = $state(false);
	let entrySaveError = $state('');

	// Regenerate state
	let isRegenerating = $state(false);
	let regenerateError = $state('');

	// Edit state
	let isEditing = $state(false);
	let editText = $state('');

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

	const zodiacComponents: Record<string, string> = {
		aries: 'zodiac-aries',
		taurus: 'zodiac-taurus',
		gemini: 'zodiac-gemini',
		cancer: 'zodiac-cancer',
		leo: 'zodiac-leo',
		virgo: 'zodiac-virgo',
		libra: 'zodiac-libra',
		scorpio: 'zodiac-scorpio',
		sagittarius: 'zodiac-sagittarius',
		capricorn: 'zodiac-capricorn',
		aquarius: 'zodiac-aquarius',
		pisces: 'zodiac-pisces'
	};

	const zodiacSign = $derived(getZodiacFromBirthday(wizardStore.data.profile.birthday));
	const hasAddons = $derived(wizardStore.data.includeHoroscope || wizardStore.data.includeOnThisDay || wizardStore.data.includeHomework);

	function getZodiacComponent(): string | undefined {
		if (!zodiacSign) return undefined;
		return zodiacComponents[zodiacSign.id];
	}

	const toneIconMap: Record<string, string> = {
		'ai-robot': 'robot',
		'bored': 'face-yawning',
		'british': 'flag-uk',
		'bureaucratic': 'archive',
		'cat-perspective': 'cat',
		'chaotic': 'tornado',
		'classic': 'ledger',
		'cringe': 'face-grimacing',
		'cynical': 'face-unamused',
		'drama-queen': 'crown',
		'formal': 'top-hat',
		'nature-documentary': 'earth',
		'nerd': 'face-nerd',
		'overthinker': 'face-exploding-head',
		'passive-aggressive': 'face-upside-down',
		'philosophical': 'owl',
		'quest-log': 'video-game',
		'self-help': 'woman-meditating',
		'shakespeare': 'theater-masks',
		'sportscaster': 'microphone',
		'storytelling': 'open-book',
		'tabloid': 'newspaper',
		'therapist': 'brain',
		'tinfoil-hat': 'satellite',
		'action-hero': 'collision',
		'influencer': 'loudspeaker',
		'six-year-old': 'teddy-bear'
	};

	function getEmojiSvg(emojiId: string): string | undefined {
		return jomojiSvgMap.get(emojiId);
	}

	function getToneIcon(toneId: string): string | undefined {
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
		| { type: 'list'; label: string; items: string[] }
		| { type: 'color'; label: string; colorId: string; colorName: string; cssVar: string };

	function stripSeparatorLines(entry: string): string {
		return entry
			.split('\n')
			.filter((line) => !isSeparatorParagraph(line))
			.join('\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim();
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
			void wizardStore.clearDraft('wizard');
			stopPhraseCycling();
			isGenerating = false;
			return;
		}

		try {
			let firstChunkSeen = false;
			const { entry } = await streamEntry(
				{ ...wizardStore.data, selectedTone: toneToUse },
				{
					onChunk: (_chunk, accumulated) => {
						if (!firstChunkSeen) {
							firstChunkSeen = true;
							selectRandomMessage();
							stopPhraseCycling();
						}
						generatedEntry = accumulated;
					}
				}
			);

			generatedEntry = stripSeparatorLines(entry);
			if (!firstChunkSeen) selectRandomMessage();
			void wizardStore.clearDraft('wizard');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Kunde inte ansluta till servern. Försök igen.';
			generatedEntry = '';
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

	let editTextareaEl: HTMLTextAreaElement = $state(null!);

	function autoResizeTextarea() {
		if (!editTextareaEl) return;
		editTextareaEl.style.height = 'auto';
		editTextareaEl.style.height = editTextareaEl.scrollHeight + 'px';
	}

	async function regenerateWithTone(newToneId: string) {
		if (!generatedEntry || isRegenerating) return;
		isRegenerating = true;
		regenerateError = '';

		try {
			generatedEntry = '';
			const { entry } = await streamEntry(
				{ ...wizardStore.data, selectedTone: newToneId },
				{
					onChunk: (_chunk, accumulated) => {
						generatedEntry = accumulated;
					}
				}
			);

			generatedEntry = stripSeparatorLines(entry);
			actualToneUsed = newToneId;
			entrySaved = false;
		} catch (err) {
			regenerateError = err instanceof Error ? err.message : 'Kunde inte ansluta till servern. Försök igen.';
			console.error('Regenerate error:', err);
		} finally {
			isRegenerating = false;
		}
	}

	function startEditing() {
		editText = generatedEntry;
		isEditing = true;
	}

	$effect(() => {
		if (isEditing && editTextareaEl) {
			autoResizeTextarea();
		}
	});

	function cancelEditing() {
		isEditing = false;
		editText = '';
	}

	function saveEdit() {
		generatedEntry = editText;
		isEditing = false;
		editText = '';
	}

	async function saveEntryToJournal() {
		if (!authStore.user || !generatedEntry.trim() || isSavingEntry) return;

		isSavingEntry = true;
		entrySaveError = '';

		try {
			// Ensure session is fresh (triggers token refresh if expired)
			const { data: { session } } = await supabase.auth.getSession();
			if (!session) {
				entrySaveError = 'Din session har gått ut. Logga in igen.';
				return;
			}

			const payload = {
				user_id: authStore.user.id,
				generated_text: generatedEntry,
				tone_id: actualToneUsed || wizardStore.data.selectedTone,
				entry_date: wizardStore.data.dateISO,
				weekday: wizardStore.data.weekday,
				emojis: wizardStore.data.emojis,
				mood_color: wizardStore.data.moodColor || null,
				energy_level: Math.round(wizardStore.data.energyLevel),
				sleep_quality: Math.round(wizardStore.data.sleepQuality),
				mood_level: Math.round(wizardStore.data.mood)
			};
			console.log('Insert payload:', JSON.stringify(payload, null, 2));

			const { error: insertError } = await supabase.from('entries').insert(payload);

			if (insertError) {
				entrySaveError = 'Kunde inte spara inlägget. Försök igen.';
				console.error('Save entry error:', JSON.stringify(insertError, null, 2));
			} else {
				entrySaved = true;
			}
		} catch (err) {
			entrySaveError = 'Kunde inte ansluta till servern. Försök igen.';
			console.error('Save entry error:', err);
		} finally {
			isSavingEntry = false;
		}
	}
</script>

{#if generatedEntry}
	<div class="result-view">
		<div class="result-intro">
			<div class="result-icon">
					<Emoji name="rose-pink" size={48} />
			</div>
			<h1 class="result-title">{resultMessage.title}</h1>
			<p class="result-subtitle">{resultMessage.subtitle}</p>
		</div>

		<div class="document-wrapper">
			{#if regenerateError}
				<p class="regenerate-error">{regenerateError}</p>
			{/if}
			{#if isEditing}
				<textarea class="edit-textarea" bind:value={editText} bind:this={editTextareaEl} oninput={autoResizeTextarea}></textarea>
			{:else}
				<DiaryCard
					weekday={wizardStore.data.weekday}
					date={wizardStore.data.date}
					emojis={wizardStore.data.emojis}
					toneId={actualToneUsed || wizardStore.data.selectedTone}
					generatedText={generatedEntry}
					birthday={wizardStore.data.profile.birthday ?? undefined}
				/>
			{/if}
		</div>

		{#if isEditing}
			<div class="edit-actions">
				<button class="edit-btn edit-btn-cancel" onclick={cancelEditing}>
					<Emoji name="cross-mark" size={18} />
					<span>Avbryt</span>
				</button>
				<button class="edit-btn edit-btn-save" onclick={saveEdit}>
					<Emoji name="floppy-disk" size={18} />
					<span>Spara</span>
				</button>
			</div>
		{:else if showDiscardConfirm}
			<div class="delete-confirm">
				<span class="delete-confirm-text">Ta bort anteckningen?</span>
				<button class="delete-confirm-btn delete-yes" onclick={handleStartOver}>
					Ja, ta bort
				</button>
				<button class="delete-confirm-btn delete-no" onclick={() => showDiscardConfirm = false}>
					Avbryt
				</button>
			</div>
		{:else}
			{#if authStore.isLoggedIn}
				<div class="journal-save-container">
					<button class="action-btn journal-save-btn" onclick={saveEntryToJournal} disabled={isSavingEntry || entrySaved}>
						{#if isSavingEntry}
							<span class="spinner"></span>
							<span>Sparar...</span>
						{:else if entrySaved}
							<svg class="action-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="20 6 9 17 4 12"/>
							</svg>
							<span>Sparat dagbok!</span>
						{:else}
							<Emoji name="floppy-disk" size={22} />
							<span>Spara dagbok</span>
						{/if}
					</button>
					{#if entrySaveError}
						<p class="journal-save-error">{entrySaveError}</p>
					{/if}
				</div>
			{/if}

			<div class="actions-container">
				<div class="result-actions">
					<button class="action-btn" onclick={startEditing}>
						<Emoji name="pencil" size={22} />
						<span>Redigera</span>
					</button>
					<TonePickerDropdown
						currentToneId={actualToneUsed || wizardStore.data.selectedTone}
						{isRegenerating}
						onSelectTone={regenerateWithTone}
					>
						{#snippet trigger({ toggle, isRegenerating: busy, icon })}
							<button class="action-btn" onclick={toggle} disabled={busy}>
								{#if busy}
									<span class="spinner"></span>
									<span>Regenererar...</span>
								{:else}
									<Emoji name={icon} size={22} />
									<span>Regenerera</span>
								{/if}
							</button>
						{/snippet}
					</TonePickerDropdown>
					<button class="action-btn" onclick={() => showShareModal = true}>
						<Emoji name="users-silhouette" size={22} />
						<span>Publicera</span>
					</button>
					<button class="action-btn action-btn-delete" onclick={() => showDiscardConfirm = true}>
						<Emoji name="trash" size={22} />
						<span>Ta bort</span>
					</button>
				</div>
			</div>
		{/if}

		{#if showShareModal && generatedEntry}
			<ShareToCommunity
				generatedText={generatedEntry}
				toneId={actualToneUsed || wizardStore.data.selectedTone}
				entryDate={wizardStore.data.dateISO}
				emojis={wizardStore.data.emojis}
				weekday={wizardStore.data.weekday}
				onClose={() => showShareModal = false}
			/>
		{/if}
	</div>
{:else}
	<div class="step-content">
		<p class="step-intro">Kolla igenom dina val. Ser det bra ut? Då är det bara att trycka på knappen och låta dagboken ta form.</p>

		{#if wizardStore.data.selectedTone === 'surprise'}
			<span class="voice-indicator">
				<span class="voice-icon"><Emoji name="dice" size={20} /></span>
				Överraskning
			</span>
		{:else if selectedTone}
			{@const ToneIcon = getToneIcon(selectedTone.id)}
			<span class="voice-indicator">
				{#if ToneIcon}
					<span class="voice-icon"><UniqueEmoji><Emoji name={ToneIcon} size={20} /></UniqueEmoji></span>
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
										<UniqueEmoji><Emoji name={ZodiacIcon} size={20} /></UniqueEmoji>
									{:else}
										<UniqueEmoji><Emoji name="crystal-ball" size={20} /></UniqueEmoji>
									{/if}
								{:else}
									<UniqueEmoji><Emoji name="crystal-ball" size={20} /></UniqueEmoji>
								{/if}
							</span>
						{/if}
						{#if wizardStore.data.includeOnThisDay}
							<span class="addon-badge" title="På denna dag...">
								<UniqueEmoji><Emoji name="mantelpiece-clock" size={20} /></UniqueEmoji>
							</span>
						{/if}
						{#if wizardStore.data.includeHomework}
							<span class="addon-badge" title="Hemläxa">
								<UniqueEmoji><Emoji name="light-bulb" size={20} /></UniqueEmoji>
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
					<span class="generate-icon"><Emoji name="sparkles" size={28} /></span>
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


	.regenerate-error {
		margin: 0 0 0.75rem 0;
		padding: 0.5rem 0.75rem;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
		border-radius: var(--radius-sm);
	}

	/* ==========================================================================
	   Journal Save Button
	   ========================================================================== */

	.journal-save-container {
		width: 100%;
		margin-top: 1.5rem;
	}

	.journal-save-btn {
		width: 100%;
		padding: 1rem 1.25rem;
	}

	.journal-save-error {
		margin: 0.5rem 0 0 0;
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
	   Action Buttons
	   ========================================================================== */

	.actions-container {
		width: 100%;
		margin-top: 0.75rem;
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

	.action-btn-delete {
		background: transparent;
		color: var(--color-accent);
		border: 2px solid var(--color-accent);
	}

	.action-btn-delete:hover:not(:disabled) {
		background: var(--color-accent);
		color: white;
		box-shadow: none;
	}

	/* ==========================================================================
	   Delete Confirmation
	   ========================================================================== */

	.delete-confirm {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 1.5rem;
	}

	.delete-confirm-text {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-accent);
		white-space: nowrap;
	}

	.delete-confirm-btn {
		padding: 0.5rem 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
		border: none;
	}

	.delete-yes {
		background: var(--color-accent);
		color: white;
	}

	.delete-yes:hover {
		background: var(--color-accent-hover);
	}

	.delete-no {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.delete-no:hover {
		background: var(--color-neutral);
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
	   Responsive Adjustments
	   ========================================================================== */

	@media (max-width: 480px) {
		.result-actions {
			grid-template-columns: 1fr;
		}

		.action-btn {
			padding: 1rem;
		}

		.summary-emoji {
			width: 28px;
			height: 28px;
		}
	}

	@media (min-width: 481px) and (max-width: 640px) {
		.result-actions {
			grid-template-columns: repeat(2, 1fr);
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
	   Edit Mode
	   ========================================================================== */

	.edit-textarea {
		box-sizing: border-box;
		width: 100%;
		padding: 2rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-book);
		line-height: var(--leading-loose);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		background-color: var(--color-bg-elevated);
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-md);
		resize: none;
		outline: none;
		overflow: hidden;
		box-shadow: 0 0 0 3px rgba(244, 63, 122, 0.1);
	}

	.edit-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.edit-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.15s ease;
		border: none;
	}

	.edit-btn-cancel {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.edit-btn-cancel:hover {
		background: var(--color-neutral);
		color: var(--color-text);
	}

	.edit-btn-save {
		background: var(--color-accent);
		color: white;
	}

	.edit-btn-save:hover {
		background: var(--color-accent-hover);
	}

	@media (max-width: 480px) {
		.edit-textarea {
			padding: 1.25rem;
		}

		.edit-actions {
			margin-top: 1rem;
		}

		.edit-btn {
			padding: 0.875rem 1rem;
		}
	}

</style>

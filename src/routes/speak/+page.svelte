<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { supabase } from '$lib/supabase/client';
	import { activeTones as tones } from '$lib/data/tones';
	import { streamEntry } from '$lib/utils/streamEntry';
	import { generateTitle } from '$lib/utils/generateTitle';
	import { fireBadgeEvent } from '$lib/gamification/client';
	import { isSeparatorParagraph } from '$lib/utils/paragraphs';
	import { getSwedishDiaryDate } from '$lib/utils/localDate';
	import { getLoadingPhrases } from '$lib/data/loadingPhrases';
	import DiaryCard from '$lib/components/DiaryCard.svelte';
	import ShareToCommunity from '$lib/components/ShareToCommunity.svelte';
	import TonePickerDropdown from '$lib/components/TonePickerDropdown.svelte';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import RequiredIndicator from '$lib/components/RequiredIndicator.svelte';
	import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';
	import arrowLeftSvg from '$lib/assets/icons/arrow-left.svg?raw';
	import { Emoji } from '$lib/assets/emojis';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';

	const toneEmojiMap: Record<string, string> = {
		'dagboksskribenten': 'ledger',
		'berattaren': 'open-book',
		'filosofen': 'owl',
		'sportkommentatorn': 'soccer-ball',
		'katten': 'cat-face',
		'cynikern': 'face-unamused',
		'divan': 'crown',
		'tonaringen': 'face-rolling-eyes',
		'britten': 'flag-uk',
		'gamern': 'video-game',
		'naturfilmaren': 'earth',
		'psykologen': 'brain',
		'roboten': 'robot',
		'shakespeare': 'theater-masks',
		'reportern': 'newspaper',
		'akademikern': 'black-nib',
		'norden': 'face-nerd',
		'foliehatten': 'satellite',
		'livscoachen': 'woman-meditating',
		'grubblaren': 'face-exploding-head',
		'martyren': 'headstone',
		'handlaggaren': 'archive',
		'multitaskaren': 'tornado',
		'killenheladagen': 'shorts',
		'actionhjalten': 'collision',
		'influencern': 'loudspeaker',
		'sexaringen': 'teddy-bear',
		'poeten': 'feather',
		'kulturtanten': 'wine',
		'piraten': 'skull-crossbones'
	};

	// Pure-UX checklist: reminders the user can tick off while speaking. Nothing
	// here is sent to the AI — the transcript is the only content source.
	const prompts = [
		{ id: 'where', label: 'Var du har varit...' },
		{ id: 'who', label: 'Vem du har varit med...' },
		{ id: 'what', label: 'Vad du har gjort...' },
		{ id: 'feeling', label: 'Hur du har känt dig...' },
		{ id: 'highlight', label: 'Dagens höjdpunkter...' },
		{ id: 'surprise', label: 'Något oväntat som hände...' },
		{ id: 'gratitude', label: 'Något du är tacksam för...' },
		{ id: 'tomorrow', label: 'Vad du ser fram emot...' }
	];
	let checkedPrompts = $state<Set<string>>(new Set());

	function togglePrompt(id: string) {
		const next = new Set(checkedPrompts);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		checkedPrompts = next;
	}

	onMount(async () => {
		await wizardStore.initProfile();

		// Voice mode reuses the quick payload shape on the server.
		wizardStore.updateData('quickMode', false);
		wizardStore.updateData('speakMode', true);
		wizardStore.updateData('chatMode', false);
		wizardStore.updateData('editorMode', false);
		wizardStore.updateData('quickText', '');

		// /speak only collects a transcript + tone — clear any leftover state from
		// other modes so it doesn't bleed into the prompt.
		wizardStore.updateData('wins', []);
		wizardStore.updateData('frustrations', []);
		wizardStore.updateData('moodColor', '');
		wizardStore.updateData('emojis', []);
		wizardStore.updateData('locations', []);
		wizardStore.updateData('customLocations', []);
		wizardStore.updateData('activities', []);
		wizardStore.updateData('customActivities', []);
		wizardStore.updateData('people', []);

		const today = getSwedishDiaryDate();
		wizardStore.updateData('weekday', today.weekday);
		wizardStore.updateData('date', today.date);
		wizardStore.updateData('dateISO', today.dateISO);

		if (!wizardStore.data.selectedTone) {
			wizardStore.updateData('selectedTone', 'dagboksskribenten');
		}

		wizardStore.updateData('includeHomework', false);
		wizardStore.updateData('includeHoroscope', false);
		wizardStore.updateData('includeOnThisDay', false);
	});

	function updateQuickText(value: string) {
		wizardStore.updateData('quickText', value);
	}

	let isFormValid = $derived(
		wizardStore.data.selectedTone.trim() !== '' &&
		wizardStore.data.quickText.trim() !== ''
	);

	let isGenerating = $state(false);
	let generatedEntry = $state('');
	let error = $state('');
	let actualToneUsed = $state<string | null>(null);

	let showShareModal = $state(false);
	let showDiscardConfirm = $state(false);
	let isSavingEntry = $state(false);
	let entrySaved = $state(false);
	let entrySaveError = $state('');

	let isRegenerating = $state(false);
	let regenerateError = $state('');

	let isEditing = $state(false);
	let editText = $state('');
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
		loadingPhrase = remaining.pop()!;
		loadingPhraseVisible = true;
		phraseInterval = setInterval(() => {
			loadingPhraseVisible = false;
			setTimeout(() => {
				if (remaining.length === 0) remaining = shuffled(getLoadingPhrases(toneId));
				loadingPhrase = remaining.pop()!;
				loadingPhraseVisible = true;
			}, 300);
		}, 2200);
	}

	function stopPhraseCycling() {
		if (phraseInterval) { clearInterval(phraseInterval); phraseInterval = null; }
		loadingPhraseVisible = false;
	}

	function stripSeparatorLines(entry: string): string {
		return entry.split('\n').filter((line) => !isSeparatorParagraph(line)).join('\n').replace(/\n{3,}/g, '\n\n').trim();
	}

	async function handleGenerate() {
		isGenerating = true;
		error = '';
		generatedEntry = '';

		let toneToUse = wizardStore.data.selectedTone;
		if (toneToUse === 'surprise') {
			const randomIndex = Math.floor(Math.random() * tones.length);
			toneToUse = tones[randomIndex].id;
		}
		actualToneUsed = toneToUse;
		startPhraseCycling(toneToUse);

		try {
			let firstChunkSeen = false;
			const { entry } = await streamEntry(
				{ ...wizardStore.data, selectedTone: toneToUse },
				{
					onChunk: (_chunk, accumulated) => {
						if (!firstChunkSeen) {
							firstChunkSeen = true;
							stopPhraseCycling();
						}
						generatedEntry = accumulated;
					}
				}
			);

			generatedEntry = stripSeparatorLines(entry);
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

	async function saveEntryToJournal() {
		if (!authStore.user || !generatedEntry.trim() || isSavingEntry) return;
		isSavingEntry = true;
		entrySaveError = '';
		try {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session) { entrySaveError = 'Din session har gått ut. Logga in igen.'; return; }
			const toneIdForSave = actualToneUsed || wizardStore.data.selectedTone;
			const title = await generateTitle(generatedEntry, toneIdForSave);
			const payload = {
				user_id: authStore.user.id,
				generated_text: generatedEntry,
				title,
				tone_id: toneIdForSave,
				entry_date: wizardStore.data.dateISO,
				weekday: wizardStore.data.weekday,
				emojis: [],
				mood_color: null,
				energy_level: null,
				sleep_quality: null,
				mood_level: null,
				writing_mode: 'speak'
			};
			const { error: insertError } = await supabase.from('entries').insert(payload);
			if (insertError) {
				entrySaveError = 'Kunde inte spara inlägget. Försök igen.';
				console.error('Save entry error:', JSON.stringify(insertError, null, 2));
			} else {
				entrySaved = true;
				void fireBadgeEvent('entry-created', {
					createdAt: new Date(),
					entryDate: payload.entry_date,
					toneId: payload.tone_id,
					mode: 'speak',
					wordCount: generatedEntry.trim().split(/\s+/).filter(Boolean).length
				});
			}
		} catch (err) {
			entrySaveError = 'Kunde inte ansluta till servern. Försök igen.';
			console.error('Save entry error:', err);
		} finally {
			isSavingEntry = false;
		}
	}
</script>

<main class="speak" class:result-view={!!generatedEntry}>
	{#if generatedEntry}
		<div class="result-view-content">
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
						emojis={[]}
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
					emojis={[]}
					weekday={wizardStore.data.weekday}
					onClose={() => showShareModal = false}
				/>
			{/if}
		</div>
	{:else}
		<header class="speak-header">
			<div class="step-indicator">
				<div class="step-icon"><UniqueEmoji><Emoji name="studio-microphone" size={72} /></UniqueEmoji></div>
				<h1 class="step-title">Tala in din dag</h1>
			</div>
		</header>

		<div class="speak-form">
			<p class="step-intro">Tryck på mikrofonen och berätta hur din dag har varit.</p>

			<section class="form-section">
				<VoiceRecorder
					text={wizardStore.data.quickText}
					onTextChange={updateQuickText}
					disabled={isGenerating}
				/>
			</section>

			<section class="form-section">
				<span class="section-label">Behöver du inspiration?</span>
				<p class="section-description">Bocka av medan du pratar – eller strunta i listan helt.</p>
				<ul class="prompt-list">
					{#each prompts as prompt}
						<li>
							<label class="prompt-item" class:checked={checkedPrompts.has(prompt.id)}>
								<input
									type="checkbox"
									checked={checkedPrompts.has(prompt.id)}
									onchange={() => togglePrompt(prompt.id)}
								/>
								<span class="prompt-check" aria-hidden="true">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								</span>
								<span class="prompt-label">{prompt.label}</span>
							</label>
						</li>
					{/each}
				</ul>
			</section>

			<section class="form-section">
				<span class="section-label">Välj en röst<RequiredIndicator /></span>
				<div class="voice-grid-compact">
					{#each tones as tone}
						{@const ToneEmoji = toneEmojiMap[tone.id]}
						<button
							class="voice-chip"
							class:selected={wizardStore.data.selectedTone === tone.id}
							onclick={() => wizardStore.updateData('selectedTone', tone.id)}
						>
							<span class="voice-chip-emoji">
								{#if ToneEmoji}
									<Emoji name={ToneEmoji} size={20} />
								{:else}
									{tone.emoji}
								{/if}
							</span>
							<span class="voice-chip-name">{tone.name}</span>
						</button>
					{/each}
				</div>
			</section>

			<section class="form-section">
				{#if error}
					<div class="error-message">{error}</div>
				{/if}
				<button class="generate-btn" onclick={handleGenerate} disabled={isGenerating || !isFormValid}>
					{#if isGenerating}
						<span class="spinner"></span>
						<span class="loading-phrase" class:visible={loadingPhraseVisible}>{loadingPhrase}</span>
					{:else}
						<span class="generate-icon"><Emoji name="sparkles" size={28} /></span>
						Generera dagboksinlägg
					{/if}
				</button>
			</section>
		</div>

		<footer class="speak-footer">
			<a href="/" class="btn btn-secondary"><span style="display:inline-flex;width:16px;height:16px;flex-shrink:0;">{@html arrowLeftSvg}</span> Tillbaka</a>
		</footer>
		<LegalFooter />
	{/if}
</main>

<style>
	.speak {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		max-width: var(--content-width);
		margin: 0 auto;
		padding: 1.75rem 1.25rem 0;
	}

	.speak.result-view {
		padding: 1.25rem 1.25rem 0;
	}

	.speak-header {
		margin-bottom: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.step-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		text-align: center;
	}

	.step-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.8;
	}

	.step-title {
		font-family: var(--font-primary);
		font-size: var(--text-3xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-snug);
		margin-top: 0;
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

	.speak-form {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.section-label:has(+ .section-description) {
		margin-bottom: 0;
	}

	.section-label {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		margin-bottom: 0.375rem;
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.section-description {
		margin: 0 0 0.625rem 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-weight: var(--weight-light);
		letter-spacing: var(--tracking-wide);
		text-align: center;
	}

	.prompt-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	.prompt-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 0.875rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		cursor: pointer;
		transition: border-color 0.15s ease, background-color 0.15s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.prompt-item:hover {
		border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
	}

	.prompt-item input[type='checkbox'] {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.prompt-check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		flex-shrink: 0;
		background: var(--color-bg);
		border: 1.5px solid var(--color-border);
		border-radius: 4px;
		color: white;
		transition: background-color 0.15s ease, border-color 0.15s ease;
	}

	.prompt-check svg {
		width: 0.75rem;
		height: 0.75rem;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.prompt-item.checked {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-elevated));
	}

	.prompt-item.checked .prompt-check {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.prompt-item.checked .prompt-check svg {
		opacity: 1;
	}

	.prompt-item.checked .prompt-label {
		color: var(--color-text-muted);
		text-decoration: line-through;
		text-decoration-color: color-mix(in srgb, var(--color-text-muted) 60%, transparent);
	}

	.prompt-label {
		flex: 1;
	}

	.voice-grid-compact {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}

	.voice-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.325rem 0.575rem;
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

	.voice-chip.selected {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 12%, var(--color-bg-elevated));
		box-shadow: 0 0 0 1px var(--color-accent);
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
		transition: background-color 0.15s ease, transform 0.1s ease;
	}

	.generate-btn:hover:not(:disabled) {
		background-color: var(--color-accent-hover);
	}

	.generate-btn:active:not(:disabled) {
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

	.speak-footer {
		display: flex;
		justify-content: flex-start;
		padding-top: 2.25rem;
		margin-top: auto;
	}

	.result-view-content {
		display: flex;
		flex-direction: column;
	}

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
		background: transparent;
		color: var(--color-accent);
		border: 2px solid var(--color-accent);
	}

	.action-btn:hover:not(:disabled) {
		background: var(--color-accent);
		color: white;
		box-shadow: none;
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
		to { transform: rotate(360deg); }
	}

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

	@media (max-width: 600px) {
		.speak {
			padding: calc(env(safe-area-inset-top, 0px) + 1.25rem) 1rem 0;
		}

		.speak.result-view {
			padding: calc(env(safe-area-inset-top, 0px) + 1rem) 1rem 0;
		}

		.step-title {
			font-size: var(--text-xl);
		}

		.prompt-list {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.result-actions {
			grid-template-columns: 1fr;
		}

		.action-btn {
			padding: 1rem;
		}

		.speak-footer {
			flex-direction: column;
			gap: 0.75rem;
		}

		.speak-footer > a.btn {
			width: 100%;
			align-self: stretch;
		}

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
</style>

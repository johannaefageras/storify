<script lang="ts">
	import InterviewEmptyState from '$lib/components/interview/InterviewEmptyState.svelte';
	import InterviewerSelection from '$lib/components/interview/InterviewerSelection.svelte';
	import MessageList from '$lib/components/interview/MessageList.svelte';
	import ChatInput from '$lib/components/interview/ChatInput.svelte';
	import ToneSelection from '$lib/components/interview/ToneSelection.svelte';
	import DiaryCard from '$lib/components/DiaryCard.svelte';
	import ShareToCommunity from '$lib/components/ShareToCommunity.svelte';
	import { chatStore } from '$lib/stores/chat.svelte';
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { supabase } from '$lib/supabase/client';
	import { getApiUrl } from '$lib/config';
	import { streamEntry } from '$lib/utils/streamEntry';
	import { goto } from '$app/navigation';
	import { tones } from '$lib/data/tones';
	import { pickOpener, type StarterId } from '$lib/data/interviewOpeners';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import { isSeparatorParagraph } from '$lib/utils/paragraphs';
	import { getSwedishDiaryDate } from '$lib/utils/localDate';
	import { getLoadingPhrases } from '$lib/data/loadingPhrases';
	import resultMessages from '$lib/data/resultMessages.json';
	import { Emoji } from '$lib/assets/emojis';
	import TonePickerDropdown from '$lib/components/TonePickerDropdown.svelte';

	// Generation state
	let generatedEntry = $state('');
	let error = $state('');
	let actualToneUsed = $state<string | null>(null);
	let interviewDate = $state('');
	let interviewDateISO = $state('');
	let interviewWeekday = $state('');

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
	let editTextareaEl: HTMLTextAreaElement = $state(null!);

	// Result message (random congrats)
	let resultMessage = $state({ title: '', subtitle: '' });

	// Loading phrase cycling
	let loadingPhrase = $state('');
	let loadingPhraseVisible = $state(false);
	let phraseInterval: ReturnType<typeof setInterval> | null = null;

	// Restore draft on page load
	$effect(() => {
		chatStore.loadDraft();
	});

	$effect(() => {
		if (isEditing && editTextareaEl) {
			autoResizeTextarea();
		}
	});

	// --- Helpers ---

	function computeTodayDate(): { weekday: string; date: string; dateISO: string } {
		return getSwedishDiaryDate();
	}

	function formatChatTranscript(): string {
		return chatStore.messages
			.filter((m) => m.content.trim().length > 0)
			.map((m) => {
				const prefix = m.role === 'user' ? 'Användaren' : 'Intervjuaren';
				return `${prefix}: ${m.content}`;
			})
			.join('\n\n');
	}

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

	function stripSeparatorLines(entry: string): string {
		return entry
			.split('\n')
			.filter((line) => !isSeparatorParagraph(line))
			.join('\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim();
	}

	function selectRandomMessage() {
		const randomIndex = Math.floor(Math.random() * resultMessages.length);
		resultMessage = resultMessages[randomIndex];
	}

	function autoResizeTextarea() {
		if (!editTextareaEl) return;
		editTextareaEl.style.height = 'auto';
		editTextareaEl.style.height = editTextareaEl.scrollHeight + 'px';
	}

	// --- Streaming (existing) ---

	async function streamResponse() {
		chatStore.setStreaming(true);
		chatStore.setError('');
		chatStore.addAssistantMessage('');

		try {
			const payload = {
				messages: chatStore.messages
					.filter((m) => m.content.length > 0)
					.map((m) => ({ role: m.role, content: m.content })),
				profile: wizardStore.data.profile,
				interviewer: chatStore.selectedInterviewer
			};

			const response = await fetch(getApiUrl('/api/chat'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(
					errorData?.error || `Något gick fel (${response.status}). Försök igen.`
				);
			}

			const reader = response.body?.getReader();
			if (!reader) throw new Error('Ingen ström tillgänglig.');

			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';

				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed || !trimmed.startsWith('data: ')) continue;

					const data = trimmed.slice(6);
					if (data === '[DONE]') break;

					try {
						const parsed = JSON.parse(data);
						if (parsed.error) throw new Error(parsed.error);
						if (parsed.text) {
							chatStore.appendToLastAssistantMessage(parsed.text);
						}
					} catch (e) {
						if (e instanceof SyntaxError) continue;
						throw e;
					}
				}
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Ett oväntat fel uppstod.';
			chatStore.setError(message);
			chatStore.removeLastAssistantMessage();
		} finally {
			chatStore.setStreaming(false);
		}
	}

	function handleSend(message: string) {
		chatStore.addUserMessage(message);
		if (chatStore.phase === 'empty') {
			chatStore.startChatting();
		}
		streamResponse();
	}

	function handleStarter(starter: StarterId) {
		chatStore.startChatting();
		chatStore.addAssistantMessage(pickOpener(chatStore.selectedInterviewer, starter));
	}

	// --- Generation ---

	async function handleGenerate() {
		error = '';
		generatedEntry = '';

		const today = computeTodayDate();
		interviewDate = today.date;
		interviewDateISO = today.dateISO;
		interviewWeekday = today.weekday;

		let toneToUse = chatStore.selectedTone;
		if (toneToUse === 'surprise') {
			const randomIndex = Math.floor(Math.random() * tones.length);
			toneToUse = tones[randomIndex].id;
		}
		actualToneUsed = toneToUse;

		chatStore.startGenerating();
		startPhraseCycling(toneToUse);

		try {
			const chatTranscript = formatChatTranscript();
			const payload = {
				...wizardStore.data,
				chatMode: true,
				chatTranscript,
				selectedTone: toneToUse,
				date: interviewDate,
				weekday: interviewWeekday,
				includeHoroscope: chatStore.includeHoroscope,
				includeOnThisDay: chatStore.includeOnThisDay,
				includeHomework: chatStore.includeHomework,
				quickMode: false,
				quickText: ''
			};

			let switchedToResult = false;
			const { entry } = await streamEntry(payload, {
				onChunk: (_chunk, accumulated) => {
					if (!switchedToResult) {
						switchedToResult = true;
						selectRandomMessage();
						stopPhraseCycling();
						chatStore.showResult('');
					}
					generatedEntry = accumulated;
				}
			});

			generatedEntry = stripSeparatorLines(entry);
			chatStore.showResult(generatedEntry);
			chatStore.clearDraft();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Kunde inte ansluta till servern. Försök igen.';
			console.error('Generation error:', err);
		} finally {
			stopPhraseCycling();
		}
	}

	// --- Edit mode ---

	async function regenerateWithTone(newToneId: string) {
		if (!generatedEntry || isRegenerating) return;
		isRegenerating = true;
		regenerateError = '';

		try {
			const chatTranscript = formatChatTranscript();
			const payload = {
				...wizardStore.data,
				chatMode: true,
				chatTranscript,
				selectedTone: newToneId,
				date: interviewDate,
				weekday: interviewWeekday,
				includeHoroscope: chatStore.includeHoroscope,
				includeOnThisDay: chatStore.includeOnThisDay,
				includeHomework: chatStore.includeHomework,
				quickMode: false,
				quickText: ''
			};

			generatedEntry = '';
			const { entry } = await streamEntry(payload, {
				onChunk: (_chunk, accumulated) => {
					generatedEntry = accumulated;
				}
			});

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

	function cancelEditing() {
		isEditing = false;
		editText = '';
	}

	function saveEdit() {
		generatedEntry = editText;
		isEditing = false;
		editText = '';
	}

	// --- Journal save ---

	async function saveEntryToJournal() {
		if (!authStore.user || !generatedEntry.trim() || isSavingEntry) return;
		isSavingEntry = true;
		entrySaveError = '';

		try {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session) {
				entrySaveError = 'Din session har gått ut. Logga in igen.';
				return;
			}

			const payload = {
				user_id: authStore.user.id,
				generated_text: generatedEntry,
				tone_id: actualToneUsed || chatStore.selectedTone,
				entry_date: interviewDateISO,
				weekday: interviewWeekday,
				emojis: [],
				mood_color: null,
				energy_level: 5,
				sleep_quality: 5,
				mood_level: 5
			};

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

	// --- Start over ---

	function handleStartOver() {
		chatStore.clearDraft();
		chatStore.reset();
		generatedEntry = '';
		error = '';
		entrySaved = false;
		entrySaveError = '';
		goto('/');
	}

	async function handleExitChat() {
		stopPhraseCycling();
		await chatStore.clearDraft();
		chatStore.reset();

		generatedEntry = '';
		error = '';
		actualToneUsed = null;
		interviewDate = '';
		interviewWeekday = '';
		loadingPhrase = '';
		loadingPhraseVisible = false;

		isEditing = false;
		editText = '';

		entrySaved = false;
		entrySaveError = '';

		showDiscardConfirm = false;
	}
</script>

<main class="interview-page">
	<div class="interview-body">
		{#if chatStore.phase === 'interviewer-selection'}
			<div class="interview-select">
				<InterviewerSelection
					onSelect={(id) => chatStore.chooseInterviewerAndContinue(id)}
				/>
			</div>
		{:else if chatStore.phase === 'empty'}
			<div class="interview-back-bar">
				<button
					type="button"
					class="back-btn"
					onclick={() => chatStore.backToInterviewerSelection()}
					aria-label="Tillbaka till val av intervjuare"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
					<span>Välj en annan intervjuare</span>
				</button>
			</div>
			<div class="interview-empty">
				<InterviewEmptyState onStarter={handleStarter} />
			</div>
		{:else if chatStore.phase === 'chatting'}
			<div class="interview-chat">
				<MessageList messages={chatStore.messages} />
			</div>
		{:else if chatStore.phase === 'tone-selection'}
			<div class="interview-tones">
				<ToneSelection onGenerate={handleGenerate} />
			</div>
		{:else if chatStore.phase === 'generating'}
			<div class="interview-loading">
				{#if error}
					<div class="error-message">{error}</div>
					<button class="generate-btn" onclick={handleGenerate}>
						<span class="generate-icon"><Emoji name="sparkles" size={28} /></span>
						Försök igen
					</button>
				{:else}
					<button class="generate-btn" disabled>
						<span class="spinner"></span>
						<span class="loading-phrase" class:visible={loadingPhraseVisible}>{loadingPhrase}</span>
					</button>
				{/if}
			</div>
		{:else if chatStore.phase === 'result'}
			<div class="interview-result">
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
							weekday={interviewWeekday}
							date={interviewDate}
							emojis={[]}
							toneId={actualToneUsed || chatStore.selectedTone}
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
								currentToneId={actualToneUsed || chatStore.selectedTone}
								{isRegenerating}
								onSelectTone={regenerateWithTone}
							>
								{#snippet trigger({ toggle, isRegenerating: busy, icon })}
									<button class="action-btn" onclick={toggle} disabled={busy}>
										{#if busy}
											<span class="spinner"></span>
											<span>Skapar...</span>
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

					{#if showDiscardConfirm}
						<div class="delete-confirm">
							<p class="delete-confirm-text">Säker på att du vill ta bort detta inlägg?</p>
							<div class="delete-confirm-actions">
								<button class="action-btn delete-no" onclick={() => showDiscardConfirm = false}>
									<Emoji name="cross-mark" size={18} />
									<span>Avbryt</span>
								</button>
								<button class="action-btn delete-yes" onclick={handleStartOver}>
									<Emoji name="trash" size={18} />
									<span>Ja, ta bort</span>
								</button>
							</div>
						</div>
					{/if}
				{/if}

				{#if showShareModal && generatedEntry}
					<ShareToCommunity
						generatedText={generatedEntry}
						toneId={actualToneUsed || chatStore.selectedTone}
						entryDate={interviewDateISO}
						emojis={[]}
						weekday={interviewWeekday}
						onClose={() => showShareModal = false}
					/>
				{/if}

			</div>
		{/if}

	</div>

	{#if chatStore.phase === 'empty' || chatStore.phase === 'chatting'}
		<div class="interview-footer">
			{#if chatStore.error}
				<div class="error-bar" role="alert">
					<span class="error-text">{chatStore.error}</span>
					<button class="error-retry" onclick={() => streamResponse()}>Försök igen</button>
				</div>
			{/if}
			<ChatInput onSend={handleSend} onExitChat={handleExitChat} />
		</div>
	{/if}

	<LegalFooter />
</main>

<style>
	.interview-page {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
		max-width: var(--content-width);
		margin: 0 auto;
		width: 100%;
		overflow: hidden;
	}

	.interview-body {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.interview-back-bar {
		width: 100%;
		padding: 0 0.75rem;
		margin-bottom: 0.5rem;
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
	}

	.back-btn:hover {
		background: var(--color-neutral);
		color: var(--color-text);
		border-color: var(--color-text-muted);
	}

	.interview-empty,
	.interview-select {
		display: flex;
		flex: 1 1 auto;
		min-height: 0;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 0.25rem 0;
	}

	.interview-chat {
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}

	.interview-tones,
	.interview-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem 0;
		width: 100%;
	}

	.interview-result {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0;
		padding-bottom: 0.25rem;
		width: 100%;
	}

	.interview-page > :global(.legal-footer) {
		flex-shrink: 0;
		margin-top: 0.5rem;
		padding-top: 0.5rem;
	}

	.interview-footer {
		flex-shrink: 0;
		padding: 0.5rem;
		padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0px));
		background: var(--color-bg);
	}

	.error-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.375rem 0.625rem;
		margin-bottom: 0.375rem;
		background: var(--color-error-bg);
		border: 1px solid var(--color-error-border);
		border-radius: var(--radius-sm);
	}

	.error-text {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		color: var(--color-error);
		line-height: var(--leading-relaxed);
	}

	.error-retry {
		flex-shrink: 0;
		background: none;
		border: none;
		padding: 0;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--color-error);
		cursor: pointer;
		text-decoration: underline;
	}

	/* ==========================================================================
	   Loading Phase
	   ========================================================================== */

	.generate-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.875rem 1.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		font-stretch: 108%;
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-snug);
		background-color: var(--color-accent);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			transform 0.1s ease;
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
		padding: 0.625rem 0.875rem;
		background-color: var(--color-error-bg);
		border: 1px solid var(--color-error-border);
		border-radius: var(--radius-sm);
		color: var(--color-error);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		text-align: center;
		margin-bottom: 0.75rem;
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
	   Result View
	   ========================================================================== */

	.result-intro {
		text-align: center;
		margin: 0.25rem 0 0.5rem 0;
	}

	.result-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.25rem;
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
		margin: 0 0 0.25rem 0;
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
		margin: 0;
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
	   Journal Save
	   ========================================================================== */

	.journal-save-container {
		width: 100%;
		margin-top: 0.5rem;
	}

	.journal-save-btn {
		width: 100%;
		padding: 0.75rem 1rem;
	}

	.journal-save-error {
		margin: 0.375rem 0 0 0;
		padding: 0.625rem 0.875rem;
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
		margin: 0.25rem 0 0.25rem 0;
	}

	.result-actions {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 0.875rem;
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
		color: var(--color-error);
	}

	.action-btn-delete:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
		border-color: var(--color-error);
	}

	.delete-confirm {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		margin-top: 0.75rem;
		padding: 0.875rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		width: 100%;
	}

	.delete-confirm-text {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text);
		margin: 0;
		text-align: center;
	}

	.delete-confirm-actions {
		display: flex;
		gap: 0.5rem;
	}

	.delete-no,
	.delete-yes {
		flex: 1;
	}

	.delete-yes {
		color: var(--color-error);
	}

	/* ==========================================================================
	   Edit Mode
	   ========================================================================== */

	.edit-textarea {
		box-sizing: border-box;
		width: 100%;
		padding: 1.5rem;
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
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.edit-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
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

	/* ==========================================================================
	   Responsive
	   ========================================================================== */

	@media (max-width: 480px) {
		.result-actions {
			grid-template-columns: 1fr;
		}

		.action-btn {
			padding: 0.625rem 0.75rem;
		}

		.edit-textarea {
			padding: 1rem;
		}

		.edit-actions {
			margin-top: 0.625rem;
		}

		.edit-btn {
			padding: 0.625rem 0.875rem;
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

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { supabase } from '$lib/supabase/client';
	import { streamEntry } from '$lib/utils/streamEntry';
	import { generateTitle } from '$lib/utils/generateTitle';
	import { fireBadgeEvent } from '$lib/gamification/client';
	import { isSeparatorParagraph } from '$lib/utils/paragraphs';
	import { getSwedishDiaryDate } from '$lib/utils/localDate';
	import resultMessages from '$lib/data/resultMessages.json';
	import DiaryCard from '$lib/components/DiaryCard.svelte';
	import ShareToCommunity from '$lib/components/ShareToCommunity.svelte';
	import TonePickerDropdown from '$lib/components/TonePickerDropdown.svelte';
	import LegalFooter from '$lib/components/LegalFooter.svelte';

	import { Emoji } from '$lib/assets/emojis';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import TextAlign from '@tiptap/extension-text-align';
	import Underline from '@tiptap/extension-underline';
	import Link from '@tiptap/extension-link';
	import undoSvg from '$lib/assets/icons/undo.svg?raw';
	import redoSvg from '$lib/assets/icons/redo.svg?raw';
	import boldSvg from '$lib/assets/icons/bold.svg?raw';
	import italicSvg from '$lib/assets/icons/italic.svg?raw';
	import underlineSvg from '$lib/assets/icons/underline.svg?raw';
	import h1Svg from '$lib/assets/icons/h1.svg?raw';
	import h2Svg from '$lib/assets/icons/h2.svg?raw';
	import h3Svg from '$lib/assets/icons/h3.svg?raw';
	import listUnorderedSvg from '$lib/assets/icons/list-unordered.svg?raw';
	import listOrderedSvg from '$lib/assets/icons/list-ordered.svg?raw';
	import alignLeftSvg from '$lib/assets/icons/align-left.svg?raw';
	import alignCenterSvg from '$lib/assets/icons/align-center.svg?raw';
	import alignRightSvg from '$lib/assets/icons/align-right.svg?raw';
	import alignJustifySvg from '$lib/assets/icons/align-justify.svg?raw';
	import linkSvg from '$lib/assets/icons/link.svg?raw';
	import horizontalRuleSvg from '$lib/assets/icons/horizontal-rule.svg?raw';
	import aiSparklesSvg from '$lib/assets/icons/sparkles.svg?raw';

	// Tiptap editor
	let editor: Editor | null = $state(null);
	let editorElement: HTMLDivElement = $state(null!);

	// Track editor content for form validity
	let hasEditorContent = $state(false);

	// Toolbar reactive state (Svelte 5 doesn't detect changes on same object reference)
	let canUndo = $state(false);
	let canRedo = $state(false);
	let isBold = $state(false);
	let isItalic = $state(false);
	let isUnderline = $state(false);
	let isH1 = $state(false);
	let isH2 = $state(false);
	let isH3 = $state(false);
	let isBulletList = $state(false);
	let isOrderedList = $state(false);
	let alignLeft = $state(true);
	let alignCenter = $state(false);
	let alignRight = $state(false);
	let alignJustify = $state(false);
	let isLink = $state(false);

	// Link input popover state
	let showLinkInput = $state(false);
	let linkUrlInput = $state('');
	let linkInputEl: HTMLInputElement | null = $state(null);

	onMount(async () => {
		await wizardStore.initProfile();

		// Mark as editor mode
		wizardStore.updateData('editorMode', true);
		wizardStore.updateData('quickMode', false);
		wizardStore.updateData('chatMode', false);

		// Try to restore a saved draft
		await wizardStore.restoreDraft('editor');

		const today = getSwedishDiaryDate();
		wizardStore.updateData('weekday', today.weekday);
		wizardStore.updateData('date', today.date);
		wizardStore.updateData('dateISO', today.dateISO);

		// Disable addons
		wizardStore.updateData('includeHomework', false);
		wizardStore.updateData('includeHoroscope', false);
		wizardStore.updateData('includeOnThisDay', false);

		// Initialize Tiptap
		editor = new Editor({
			element: editorElement,
			autofocus: 'start',
			extensions: [
				StarterKit,
				Underline,
				Placeholder.configure({
					placeholder: 'Skriv fritt om din dag — tankar, händelser, känslor. AI:n förfinar det du skriver till ett dagboksinlägg.'
				}),
				TextAlign.configure({
					types: ['heading', 'paragraph'],
					defaultAlignment: 'left'
				}),
				Link.configure({
					openOnClick: false,
					autolink: true,
					linkOnPaste: true,
					protocols: ['http', 'https', 'mailto'],
					defaultProtocol: 'https',
					HTMLAttributes: {
						target: '_blank',
						rel: 'noopener noreferrer nofollow'
					}
				})
			],
			content: getInitialEditorContent(wizardStore.data.freeText || ''),
			onUpdate: ({ editor: e }) => {
				const html = e.getHTML();
				wizardStore.updateData('freeText', html);
				hasEditorContent = !e.isEmpty;
			},
			onTransaction: ({ editor: e }) => {
				// Update all toolbar reactive state
				canUndo = e.can().chain().focus().undo().run();
				canRedo = e.can().chain().focus().redo().run();
				isBold = e.isActive('bold');
				isItalic = e.isActive('italic');
				isUnderline = e.isActive('underline');
				isH1 = e.isActive('heading', { level: 1 });
				isH2 = e.isActive('heading', { level: 2 });
				isH3 = e.isActive('heading', { level: 3 });
				isBulletList = e.isActive('bulletList');
				isOrderedList = e.isActive('orderedList');
				alignLeft = e.isActive({ textAlign: 'left' });
				alignCenter = e.isActive({ textAlign: 'center' });
				alignRight = e.isActive({ textAlign: 'right' });
				alignJustify = e.isActive({ textAlign: 'justify' });
				if (!alignLeft && !alignCenter && !alignRight && !alignJustify) {
					alignLeft = true;
				}
				isLink = e.isActive('link');
			}
		});

		const initialHtml = editor.getHTML();
		wizardStore.updateData('freeText', initialHtml);
		hasEditorContent = !editor.isEmpty;
	});

	onDestroy(() => {
		editor?.destroy();
	});

	function normalizeUrl(url: string): string {
		const trimmed = url.trim();
		if (!trimmed) return '';
		if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
		if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return `mailto:${trimmed}`;
		return `https://${trimmed}`;
	}

	function openLinkInput() {
		if (!editor) return;
		const existing = editor.getAttributes('link').href as string | undefined;
		linkUrlInput = existing ?? '';
		showLinkInput = true;
		queueMicrotask(() => linkInputEl?.focus());
	}

	function applyLink() {
		if (!editor) return;
		const url = normalizeUrl(linkUrlInput);
		if (!url) {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
		} else {
			const { from, to, empty } = editor.state.selection;
			if (empty && !editor.isActive('link')) {
				editor
					.chain()
					.focus()
					.insertContent({
						type: 'text',
						text: url,
						marks: [{ type: 'link', attrs: { href: url } }]
					})
					.run();
			} else {
				editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
				editor.commands.setTextSelection({ from, to });
			}
		}
		closeLinkInput();
	}

	function removeLink() {
		editor?.chain().focus().extendMarkRange('link').unsetLink().run();
		closeLinkInput();
	}

	function closeLinkInput() {
		showLinkInput = false;
		linkUrlInput = '';
	}

	function handleLinkInputKey(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			applyLink();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			closeLinkInput();
		}
	}

	function getInitialEditorContent(html: string): string {
		const trimmed = html.trim();
		if (!trimmed) return '<p style="text-align: left;"></p>';

		const doc = new DOMParser().parseFromString(trimmed, 'text/html');
		doc.body.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
			const style = el.getAttribute('style');
			if (!style) return;

			const keptRules = style
				.split(';')
				.map((rule) => rule.trim())
				.filter(Boolean)
				.filter((rule) => !/^text-align\s*:/i.test(rule));

			if (keptRules.length > 0) {
				el.setAttribute('style', keptRules.join('; '));
			} else {
				el.removeAttribute('style');
			}
		});

		return doc.body.innerHTML;
	}

	function htmlToMarkdownText(html: string): string {
		const doc = new DOMParser().parseFromString(html, 'text/html');
		doc.body.querySelectorAll('a[href]').forEach((a) => {
			const href = a.getAttribute('href') ?? '';
			const text = a.textContent ?? '';
			a.replaceWith(text ? `[${text}](${href})` : href);
		});
		doc.body.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
		doc.body.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, hr').forEach((el) => {
			el.append('\n\n');
		});
		return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
	}

	// Refine state
	let isRefining = $state(false);

	// Entry state
	let generatedEntry = $state('');
	let error = $state('');

	// Result view state
	let showShareModal = $state(false);
	let isSavingEntry = $state(false);
	let entrySaved = $state(false);
	let entrySaveError = $state('');
	let resultMessage = $state({ title: '', subtitle: '' });

	// Confirm discard state
	let showDiscardConfirm = $state(false);

	// Regenerate state
	let isRegenerating = $state(false);
	let regenerateError = $state('');
	let currentToneId = $state('classic');

	// Edit state
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
			const existingText = generatedEntry;
			generatedEntry = '';
			const { entry } = await streamEntry(
				{ retoneMode: true, existingText, newToneId },
				{
					onChunk: (_chunk, accumulated) => {
						generatedEntry = accumulated;
					}
				}
			);

			generatedEntry = stripSeparatorLines(entry);
			currentToneId = newToneId;
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

	function stripSeparatorLines(entry: string): string {
		return entry.split('\n').filter((line) => !isSeparatorParagraph(line)).join('\n').replace(/\n{3,}/g, '\n\n').trim();
	}

	function selectRandomMessage() {
		const randomIndex = Math.floor(Math.random() * resultMessages.length);
		resultMessage = resultMessages[randomIndex];
	}

	async function handleRefine() {
		if (!editor || isRefining) return;
		isRefining = true;
		error = '';

		try {
			const { entry } = await streamEntry(wizardStore.data);
			const refined = stripSeparatorLines(entry);
			editor.commands.setContent(refined);
			wizardStore.updateData('freeText', editor.getHTML());
			hasEditorContent = !editor.isEmpty;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Kunde inte ansluta till servern. Försök igen.';
			console.error('Refine error:', err);
		} finally {
			isRefining = false;
		}
	}

	function handleCreateEntry() {
		if (!editor) return;
		const text = htmlToMarkdownText(editor.getHTML());
		if (!text.trim()) return;
		generatedEntry = text;
		selectRandomMessage();
		void wizardStore.clearDraft('editor');
	}

	function handleStartOver() {
		showDiscardConfirm = false;
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
			const title = await generateTitle(generatedEntry, 'editor');
			const payload = {
				user_id: authStore.user.id,
				generated_text: generatedEntry,
				title,
				tone_id: 'editor',
				entry_date: wizardStore.data.dateISO,
				weekday: wizardStore.data.weekday,
				emojis: [],
				mood_color: null,
				energy_level: null,
				sleep_quality: null,
				mood_level: null,
				writing_mode: 'manual'
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
					mode: 'manual',
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

<main class="editor-page" class:result-view={!!generatedEntry}>
	{#if generatedEntry}
		<!-- Result view -->
		<div class="result-view-content">
			<div class="result-intro">
				<div class="result-icon">
					<Emoji name="rose" size={48} />
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
						emojis={[]}
						toneId={currentToneId}
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
			{/if}

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
						{currentToneId}
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
			</div>

			{#if showShareModal && generatedEntry}
				<ShareToCommunity
					generatedText={generatedEntry}
					toneId={currentToneId}
					entryDate={wizardStore.data.dateISO}
					emojis={[]}
					weekday={wizardStore.data.weekday}
					onClose={() => showShareModal = false}
				/>
			{/if}
		</div>
	{:else}
		<!-- Editor form -->
		<header class="editor-header">
			<div class="step-indicator">
				<div class="step-icon"><UniqueEmoji><Emoji name="pencil" size={72} /></UniqueEmoji></div>
				<h1 class="step-title">Skriv fritt</h1>
			</div>
		</header>

		<div class="editor-form">
			<p class="step-intro">Skriv fritt och låt AI förfina din text.</p>

			<!-- Date display -->
			<p class="date-display">{wizardStore.data.weekday} {wizardStore.data.date}</p>

			<!-- Toolbar -->
			{#if editor}
				<div class="editor-toolbar">
					<button
						class="toolbar-btn"
						onclick={() => editor?.chain().focus().undo().run()}
						disabled={!canUndo}
						title="Ångra"
					>
						<span class="toolbar-icon">{@html undoSvg}</span>
					</button>
					<button
						class="toolbar-btn"
						onclick={() => editor?.chain().focus().redo().run()}
						disabled={!canRedo}
						title="Gör om"
					>
						<span class="toolbar-icon">{@html redoSvg}</span>
					</button>
					<span class="toolbar-separator"></span>
					<button
						class="toolbar-btn"
						class:active={isBold}
						onclick={() => editor?.chain().focus().toggleBold().run()}
						title="Fetstil"
					>
						<span class="toolbar-icon">{@html boldSvg}</span>
					</button>
					<button
						class="toolbar-btn"
						class:active={isItalic}
						onclick={() => editor?.chain().focus().toggleItalic().run()}
						title="Kursiv"
					>
						<span class="toolbar-icon">{@html italicSvg}</span>
					</button>
					<button
						class="toolbar-btn"
						class:active={isUnderline}
						onclick={() => editor?.chain().focus().toggleUnderline().run()}
						title="Understrykning"
					>
						<span class="toolbar-icon">{@html underlineSvg}</span>
					</button>
					<span class="toolbar-separator"></span>
					<button
						class="toolbar-btn"
						class:active={isH1}
						onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
						title="Huvudrubrik"
					>
						<span class="toolbar-icon">{@html h1Svg}</span>
					</button>
					<button
						class="toolbar-btn"
						class:active={isH2}
						onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
						title="Rubrik"
					>
						<span class="toolbar-icon">{@html h2Svg}</span>
					</button>
					<button
						class="toolbar-btn"
						class:active={isH3}
						onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
						title="Underrubrik"
					>
						<span class="toolbar-icon">{@html h3Svg}</span>
					</button>
					<span class="toolbar-separator"></span>
					<button
						class="toolbar-btn"
						class:active={isBulletList}
						onclick={() => editor?.chain().focus().toggleBulletList().run()}
						title="Punktlista"
					>
						<span class="toolbar-icon">{@html listUnorderedSvg}</span>
					</button>
					<button
						class="toolbar-btn"
						class:active={isOrderedList}
						onclick={() => editor?.chain().focus().toggleOrderedList().run()}
						title="Numrerad lista"
					>
						<span class="toolbar-icon">{@html listOrderedSvg}</span>
					</button>
					<span class="toolbar-separator"></span>
					<button
						class="toolbar-btn align-left-toolbar-button"
						class:active={alignLeft}
						onclick={() => editor?.chain().focus().setTextAlign('left').run()}
						title="Vänsterjustera"
					>
						<span class="toolbar-icon">{@html alignLeftSvg}</span>
					</button>
					<button
						class="toolbar-btn"
						class:active={alignCenter}
						onclick={() => editor?.chain().focus().setTextAlign('center').run()}
						title="Centrera"
					>
						<span class="toolbar-icon">{@html alignCenterSvg}</span>
					</button>
					<button
						class="toolbar-btn align-right-toolbar-button"
						class:active={alignRight}
						onclick={() => editor?.chain().focus().setTextAlign('right').run()}
						title="Högerjustera"
					>
						<span class="toolbar-icon">{@html alignRightSvg}</span>
					</button>
					<button
						class="toolbar-btn"
						class:active={alignJustify}
						onclick={() => editor?.chain().focus().setTextAlign('justify').run()}
						title="Marginaljustera"
					>
						<span class="toolbar-icon">{@html alignJustifySvg}</span>
					</button>
					<span class="toolbar-separator"></span>
					<button
						class="toolbar-btn link-toolbar-button"
						class:active={isLink || showLinkInput}
						onclick={openLinkInput}
						title="Infoga länk"
					>
						<span class="toolbar-icon">{@html linkSvg}</span>
					</button>
					<button
						class="toolbar-btn"
						onclick={() => editor?.chain().focus().setHorizontalRule().run()}
						title="Horisontell linje"
					>
						<span class="toolbar-icon">{@html horizontalRuleSvg}</span>
					</button>
					<span class="toolbar-separator"></span>
					<button
						class="toolbar-btn toolbar-btn-ai"
						onclick={handleRefine}
						disabled={isRefining || !hasEditorContent}
						title="Förfina med AI"
					>
						{#if isRefining}
							<span class="toolbar-spinner"></span>
						{:else}
							<span class="toolbar-icon">{@html aiSparklesSvg}</span>
						{/if}
					</button>
				</div>
				{#if showLinkInput}
					<div class="link-input-row">
						<input
							bind:this={linkInputEl}
							bind:value={linkUrlInput}
							type="url"
							class="link-input"
							placeholder="https://exempel.se eller mailadress"
							onkeydown={handleLinkInputKey}
						/>
						<button class="link-input-btn link-input-apply" onclick={applyLink} type="button">
							Lägg till
						</button>
						{#if isLink}
							<button class="link-input-btn link-input-remove" onclick={removeLink} type="button">
								Ta bort
							</button>
						{/if}
						<button class="link-input-btn link-input-cancel" onclick={closeLinkInput} type="button">
							Avbryt
						</button>
					</div>
				{/if}
			{/if}

			<!-- Tiptap editor -->
			<div class="tiptap-wrapper" bind:this={editorElement}></div>

			<!-- Create entry -->
			<section class="form-section">
				{#if error}
					<div class="error-message">{error}</div>
				{/if}
				<button class="generate-btn" onclick={handleCreateEntry} disabled={!hasEditorContent}>
					<span class="generate-icon"><Emoji name="pencil" size={28} /></span>
					Skriv anteckning
				</button>
			</section>
		</div>

		<LegalFooter />
	{/if}
</main>

<style>
	/* ==========================================================================
	   Layout
	   ========================================================================== */

	.editor-page {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: var(--content-width);
		margin: 0 auto;
		padding: 1.75rem 1.25rem 0;
	}

	.editor-page.result-view {
		padding: 1.25rem 1.25rem 0;
	}

	/* ==========================================================================
	   Header
	   ========================================================================== */

	.editor-header {
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

	.date-display {
		text-align: center;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin: 0;
	}

	/* ==========================================================================
	   Form
	   ========================================================================== */

	.editor-form {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	/* ==========================================================================
	   Toolbar
	   ========================================================================== */

	.editor-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
		padding: 0.375rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-bottom: none;
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: var(--color-text-muted);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		cursor: pointer;
		transition: all 0.1s ease;
	}

	.toolbar-btn:hover {
		background: var(--color-neutral);
		color: var(--color-text);
	}

	.toolbar-btn.active {
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent);
	}

	.toolbar-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.toolbar-btn:disabled:hover {
		background: transparent;
		color: var(--color-text-muted);
	}

	.toolbar-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
	}

	.toolbar-icon :global(svg) {
		width: 16px;
		height: 16px;
	}

	.toolbar-separator {
		width: 1px;
		height: 1.25rem;
		background: var(--color-border);
		margin: 0 0.125rem;
	}

	.toolbar-btn-ai {
		color: var(--color-accent);
	}

	.toolbar-btn-ai:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		color: var(--color-accent);
	}

	.toolbar-spinner {
		width: 14px;
		height: 14px;
		border: 2px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	.link-input-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-top: none;
	}

	.link-input {
		flex: 1;
		min-width: 12rem;
		padding: 0.5rem 0.625rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.link-input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
	}

	.link-input-btn {
		padding: 0.5rem 0.75rem;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.link-input-btn:hover {
		background: var(--color-neutral);
		color: var(--color-text);
	}

	.link-input-apply {
		background: var(--color-accent);
		color: white;
		border-color: var(--color-accent);
	}

	.link-input-apply:hover {
		background: var(--color-accent-hover);
		color: white;
	}

	.link-input-remove {
		color: var(--color-error);
	}

	/* ==========================================================================
	   Tiptap Editor
	   ========================================================================== */

	.tiptap-wrapper {
		min-height: 300px;
	}

	.tiptap-wrapper :global(.tiptap) {
		min-height: 300px;
		padding: 0.875rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		color: var(--color-text);
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: 0 0 var(--radius-sm) var(--radius-sm);
		outline: none;
		text-align: left;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.tiptap-wrapper :global(.tiptap:focus) {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
	}

	.tiptap-wrapper :global(.tiptap p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		color: var(--color-text-muted);
		font-weight: var(--weight-light);
		letter-spacing: var(--tracking-wider);
		float: left;
		height: 0;
		pointer-events: none;
	}

	.tiptap-wrapper :global(.tiptap em),
	.tiptap-wrapper :global(.tiptap i) {
		font-style: italic;
		font-weight: inherit;
		letter-spacing: inherit;
	}

	.tiptap-wrapper :global(.tiptap p) {
		margin: 0 0 0.5rem 0;
	}

	.tiptap-wrapper :global(.tiptap h1) {
		font-size: var(--text-xl);
		font-weight: var(--weight-semibold);
		margin: 1.25rem 0 0.5rem 0;
	}

	.tiptap-wrapper :global(.tiptap h2) {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		margin: 1rem 0 0.5rem 0;
	}

	.tiptap-wrapper :global(.tiptap h3) {
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		margin: 0.75rem 0 0.375rem 0;
	}

	.tiptap-wrapper :global(.tiptap > :first-child) {
		margin-top: 0;
	}

	.tiptap-wrapper :global(.tiptap ul),
	.tiptap-wrapper :global(.tiptap ol) {
		padding-left: 1.25rem;
		margin: 0.25rem 0 0.5rem 0;
	}

	.tiptap-wrapper :global(.tiptap li) {
		margin: 0.125rem 0;
	}

	.tiptap-wrapper :global(.tiptap a) {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 2px;
		cursor: pointer;
	}

	.tiptap-wrapper :global(.tiptap hr) {
		border: none;
		border-top: 1px solid var(--color-border);
		margin: 1rem 0;
	}

	/* ==========================================================================
	   Generate Button
	   ========================================================================== */

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
	   Result View
	   ========================================================================== */

	.result-view-content {
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

	@keyframes spin {
		to { transform: rotate(360deg); }
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

	/* ==========================================================================
	   Responsive
	   ========================================================================== */

	@media (max-width: 600px) {
		.editor-page {
			padding: calc(env(safe-area-inset-top, 0px) + 1.25rem) 1rem 0;
		}

		.editor-page.result-view {
			padding: calc(env(safe-area-inset-top, 0px) + 1rem) 1rem 0;
		}

		.step-title {
			font-size: var(--text-xl);
		}
	}

	@media (max-width: 480px) {
		.toolbar-separator {
			display: none;
		}

		.result-actions {
			grid-template-columns: 1fr;
		}

		.action-btn {
			padding: 1rem;
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

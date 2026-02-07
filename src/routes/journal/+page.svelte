<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { supabase } from '$lib/supabase/client';
	import { tones } from '$lib/data/tones';
	import { jomojiSvgMap } from '$lib/data/jomojis';
	import { uniqueSvgIds } from '$lib/utils/uniqueSvgIds';
	import DiaryCard from '$lib/components/DiaryCard.svelte';
	import type { Component } from 'svelte';
	import { EmojiRobot, EmojiFaceYawning, EmojiFlagUk, EmojiArchive, EmojiCat, EmojiTornado, EmojiLedger, EmojiFaceGrimacing, EmojiFaceUnamused, EmojiTopHat, EmojiHeartOnFire, EmojiFaceUpsideDown, EmojiOwl, EmojiVideoGame, EmojiWomanDetective, EmojiCrown, EmojiEarth, EmojiMicrophone, EmojiPoo, EmojiBrain, EmojiOpenBook, EmojiSatellite, EmojiWomanMeditating, EmojiNewspaper, EmojiMusicalNotes, EmojiTheaterMasks, EmojiFaceNerd, EmojiFaceExplodingHead, EmojiClipboard } from '$lib/assets/emojis';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';

	interface Entry {
		id: string;
		user_id: string;
		created_at: string;
		generated_text: string;
		tone_id: string;
		entry_date: string;
		weekday: string | null;
		emojis: string[];
		mood_color: string | null;
		energy_level: number | null;
		sleep_quality: number | null;
		mood_level: number | null;
	}

	let isLoading = $state(true);
	let entries = $state<Entry[]>([]);
	let error = $state('');

	// Modal state
	let selectedEntry = $state<Entry | null>(null);
	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);
	let isCopying = $state(false);

	const toneIconMap: Record<string, Component> = {
		'ai-robot': EmojiRobot,
		'bored': EmojiFaceYawning,
		'british': EmojiFlagUk,
		'bureaucratic': EmojiArchive,
		'cat-perspective': EmojiCat,
		'chaotic': EmojiTornado,
		'classic': EmojiLedger,
		'cringe': EmojiFaceGrimacing,
		'cynical': EmojiFaceUnamused,
		'detective': EmojiWomanDetective,
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

	const swedishMonths: Record<string, string> = {
		'01': 'Januari', '02': 'Februari', '03': 'Mars', '04': 'April',
		'05': 'Maj', '06': 'Juni', '07': 'Juli', '08': 'Augusti',
		'09': 'September', '10': 'Oktober', '11': 'November', '12': 'December'
	};

	const swedishWeekdays: Record<string, string> = {
		'0': 'Söndag', '1': 'Måndag', '2': 'Tisdag', '3': 'Onsdag',
		'4': 'Torsdag', '5': 'Fredag', '6': 'Lördag'
	};

	function formatEntryDate(dateStr: string): { weekday: string; date: string } {
		const d = new Date(dateStr + 'T00:00:00');
		const weekday = swedishWeekdays[String(d.getDay())] || '';
		const day = d.getDate();
		const month = swedishMonths[String(d.getMonth() + 1).padStart(2, '0')]?.toLowerCase() || '';
		const year = d.getFullYear();
		return { weekday, date: `${day} ${month} ${year}` };
	}

	function getMonthKey(dateStr: string): string {
		const [year, month] = dateStr.split('-');
		return `${swedishMonths[month]} ${year}`;
	}

	function truncateText(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
	}

	function getEmojiSvg(emojiId: string): string | undefined {
		return jomojiSvgMap.get(emojiId);
	}

	function getToneIcon(id: string): Component | undefined {
		return toneIconMap[id];
	}

	function getToneName(id: string): string {
		return tones.find((t) => t.id === id)?.name || id;
	}

	const groupedEntries = $derived.by(() => {
		const groups: { month: string; entries: Entry[] }[] = [];
		let currentMonth = '';

		for (const entry of entries) {
			const month = getMonthKey(entry.entry_date);
			if (month !== currentMonth) {
				currentMonth = month;
				groups.push({ month, entries: [entry] });
			} else {
				groups[groups.length - 1].entries.push(entry);
			}
		}

		return groups;
	});

	function openEntry(entry: Entry) {
		selectedEntry = entry;
		showDeleteConfirm = false;
	}

	function closeModal() {
		selectedEntry = null;
		showDeleteConfirm = false;
	}

	async function copyToClipboard() {
		if (!selectedEntry || isCopying) return;
		isCopying = true;
		try {
			await navigator.clipboard.writeText(selectedEntry.generated_text);
		} catch (err) {
			console.error('Failed to copy:', err);
		} finally {
			setTimeout(() => { isCopying = false; }, 1500);
		}
	}

	async function deleteEntry() {
		if (!selectedEntry || isDeleting) return;
		isDeleting = true;

		try {
			const { error: deleteError } = await supabase
				.from('entries')
				.delete()
				.eq('id', selectedEntry.id);

			if (deleteError) {
				console.error('Delete error:', deleteError);
				return;
			}

			entries = entries.filter((e) => e.id !== selectedEntry!.id);
			closeModal();
		} catch (err) {
			console.error('Delete error:', err);
		} finally {
			isDeleting = false;
		}
	}

	async function loadEntries() {
		const { data, error: fetchError } = await supabase
			.from('entries')
			.select('*')
			.order('entry_date', { ascending: false });

		if (fetchError) {
			error = 'Kunde inte ladda dagboksarkivet.';
			console.error('Fetch entries error:', fetchError);
		} else {
			entries = data || [];
		}
		isLoading = false;
	}

	onMount(() => {
		const checkAuth = () => {
			if (authStore.isLoading) {
				setTimeout(checkAuth, 50);
				return;
			}
			if (!authStore.isLoggedIn) {
				goto('/login');
				return;
			}
			loadEntries();
		};
		checkAuth();
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && selectedEntry && closeModal()} />

<div class="journal-page">
	<div class="journal-container">
		<div class="journal-header">
			<h1 class="journal-title">Dagboksarkiv</h1>
			<p class="journal-subtitle">Dina sparade dagboksanteckningar</p>
		</div>

		{#if isLoading}
			<div class="journal-loading">
				<span class="spinner"></span>
				<p>Laddar dagboksarkivet...</p>
			</div>
		{:else if error}
			<div class="journal-error">{error}</div>
		{:else if entries.length === 0}
			<div class="journal-empty">
				<p class="empty-text">Du har inga sparade dagboksanteckningar ännu.</p>
				<a href="/wizard" class="empty-link">Skapa din första dagboksanteckning</a>
			</div>
		{:else}
			{#each groupedEntries as group}
				<div class="month-group">
					<h2 class="month-label">{group.month}</h2>
					<div class="entries-grid">
						{#each group.entries as entry}
							{@const { weekday, date } = formatEntryDate(entry.entry_date)}
							{@const ToneIcon = getToneIcon(entry.tone_id)}
							<button class="entry-card" onclick={() => openEntry(entry)}>
								<div class="card-header">
									<div class="card-date">
										<span class="card-weekday">{weekday || entry.weekday || ''}</span>
										<span class="card-date-text">{date}</span>
									</div>
									{#if entry.emojis && entry.emojis.length > 0}
										<span class="card-emojis">
											{#each entry.emojis.slice(0, 3) as emojiId}
												{@const svg = getEmojiSvg(emojiId)}
												{#if svg}
													<span class="card-emoji">{@html uniqueSvgIds(svg)}</span>
												{/if}
											{/each}
										</span>
									{/if}
								</div>
								<p class="card-preview">{truncateText(entry.generated_text, 120)}</p>
								<div class="card-footer">
									{#if ToneIcon}
										<span class="card-tone-icon"><UniqueEmoji><ToneIcon size={16} /></UniqueEmoji></span>
									{/if}
									<span class="card-tone-name">{getToneName(entry.tone_id)}</span>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

{#if selectedEntry}
	{@const { weekday, date } = formatEntryDate(selectedEntry.entry_date)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="modal-overlay" onclick={closeModal} role="button" tabindex="-1">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Dagboksinlägg" tabindex="-1">
			<button class="modal-close" onclick={closeModal} aria-label="Stäng">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>

			<div class="modal-diary-card">
				<DiaryCard
					weekday={weekday || selectedEntry.weekday || ''}
					date={date}
					emojis={selectedEntry.emojis || []}
					toneId={selectedEntry.tone_id}
					generatedText={selectedEntry.generated_text}
				/>
			</div>

			<div class="modal-actions">
				<button class="modal-action-btn" onclick={copyToClipboard} disabled={isCopying}>
					{#if isCopying}
						<svg class="action-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<polyline points="20 6 9 17 4 12"/>
						</svg>
						<span>Kopierat!</span>
					{:else}
						<EmojiClipboard size={18} />
						<span>Kopiera</span>
					{/if}
				</button>

				{#if showDeleteConfirm}
					<div class="delete-confirm">
						<span class="delete-confirm-text">Ta bort anteckningen?</span>
						<button class="delete-confirm-btn delete-yes" onclick={deleteEntry} disabled={isDeleting}>
							{#if isDeleting}
								<span class="spinner"></span>
							{:else}
								Ja, ta bort
							{/if}
						</button>
						<button class="delete-confirm-btn delete-no" onclick={() => showDeleteConfirm = false}>
							Avbryt
						</button>
					</div>
				{:else}
					<button class="modal-action-btn modal-delete-btn" onclick={() => showDeleteConfirm = true}>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
						</svg>
						<span>Ta bort</span>
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.journal-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		padding-top: 1rem;
	}

	.journal-container {
		width: 100%;
		max-width: 700px;
	}

	.journal-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.journal-title {
		font-family: var(--font-primary);
		font-size: var(--text-3xl);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.journal-subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		margin: 0;
	}

	/* Loading & Empty States */

	.journal-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 3rem 0;
		color: var(--color-text-muted);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		letter-spacing: var(--tracking-wide);
	}

	.journal-loading p {
		margin: 0;
	}

	.journal-error {
		padding: 0.75rem 1rem;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		color: var(--color-accent);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		text-align: center;
	}

	.journal-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 3rem 0;
		text-align: center;
	}

	.empty-text {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		margin: 0;
	}

	.empty-link {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--color-accent);
		text-decoration: none;
		letter-spacing: var(--tracking-wide);
	}

	.empty-link:hover {
		text-decoration: underline;
	}

	/* Month Groups */

	.month-group {
		margin-bottom: 2rem;
	}

	.month-label {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0 0 0.75rem 0;
	}

	/* Entry Cards Grid */

	.entries-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.entry-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		text-align: left;
		font-family: var(--font-primary);
		color: var(--color-text);
	}

	.entry-card:hover {
		border-color: var(--color-accent);
		box-shadow: 0 2px 8px rgba(244, 63, 122, 0.08);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.card-date {
		display: flex;
		flex-direction: column;
		gap: 0.0625rem;
	}

	.card-weekday {
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-snug);
		color: var(--color-text);
	}

	.card-date-text {
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.card-emojis {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.card-emoji {
		display: flex;
		align-items: center;
		width: 20px;
		height: 20px;
	}

	.card-emoji :global(svg) {
		width: 100%;
		height: 100%;
	}

	.card-preview {
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		line-height: var(--leading-relaxed);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-footer {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.card-tone-icon {
		display: flex;
		align-items: center;
	}

	.card-tone-name {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	/* Modal */

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		z-index: 1000;
		padding: 2rem 1rem;
		overflow-y: auto;
		animation: fadeIn 0.15s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-content {
		position: relative;
		width: 100%;
		max-width: 600px;
		animation: slideUp 0.2s ease;
	}

	@keyframes slideUp {
		from { transform: translateY(10px); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}

	.modal-close {
		position: absolute;
		top: -2.5rem;
		right: 0;
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.15s ease;
		z-index: 1;
	}

	.modal-close:hover {
		color: white;
	}

	.modal-diary-card {
		margin-bottom: 1rem;
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.modal-action-btn {
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
		white-space: nowrap;
		background: var(--color-bg-elevated);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.modal-action-btn:hover:not(:disabled) {
		border-color: var(--color-accent);
	}

	.modal-action-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.modal-delete-btn {
		margin-left: auto;
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.modal-delete-btn:hover:not(:disabled) {
		background: var(--color-accent);
		color: white;
	}

	.action-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	.action-icon.check {
		color: #22c55e;
	}

	/* Delete Confirmation */

	.delete-confirm {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-left: auto;
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

	.delete-yes:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}

	.delete-yes:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.delete-no {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.delete-no:hover {
		background: var(--color-neutral);
	}

	/* Spinner */

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

	/* Responsive */

	@media (max-width: 600px) {
		.journal-page {
			padding: 1rem;
			padding-top: 0.5rem;
		}

		.entries-grid {
			grid-template-columns: 1fr;
		}

		.modal-overlay {
			padding: 1rem 0.75rem;
		}

		.modal-actions {
			flex-wrap: wrap;
		}

		.delete-confirm {
			margin-left: 0;
			width: 100%;
		}
	}
</style>

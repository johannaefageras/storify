<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { tones } from '$lib/data/tones';
	import { getApiUrl } from '$lib/config';
	import { getRenderParagraphs, formatParagraph } from '$lib/utils/paragraphs';

	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';
	import type { Component } from 'svelte';
	import {
		EmojiEarth,
		EmojiRobot,
		EmojiFaceYawning,
		EmojiFlagUk,
		EmojiArchive,
		EmojiCat,
		EmojiTornado,
		EmojiLedger,
		EmojiFaceGrimacing,
		EmojiFaceUnamused,
		EmojiTopHat,
		EmojiHeartOnFire,
		EmojiFaceUpsideDown,
		EmojiOwl,
		EmojiVideoGame,
		EmojiWomanDetective,
		EmojiCrown,
		EmojiMicrophone,
		EmojiPoo,
		EmojiBrain,
		EmojiOpenBook,
		EmojiSatellite,
		EmojiWomanMeditating,
		EmojiNewspaper,
		EmojiHotBeverage,
		EmojiTheaterMasks,
		EmojiFaceNerd,
		EmojiFaceExplodingHead,
		EmojiCastle,
		EmojiOldWoman,
		EmojiMemo,
		EmojiTools,
		EmojiCrossMark,
		EmojiUsersSilhouette,
		EmojiCrystalBall,
		EmojiMantelpieceClock,
		EmojiLightBulb
	} from '$lib/assets/emojis';

	interface CommunityEntry {
		id: string;
		user_id: string | null;
		created_at: string;
		display_name: string;
		entry_date: string;
		tone_id: string;
		generated_text: string;
		excerpt: string;
		emojis: string[];
		weekday: string | null;
	}

	let isLoading = $state(true);
	let entries = $state<CommunityEntry[]>([]);
	let error = $state('');
	let currentPage = $state(1);
	let totalEntries = $state(0);
	let isLoadingMore = $state(false);
	const LIMIT = 20;

	// Modal state
	let selectedEntry = $state<CommunityEntry | null>(null);
	let isDeleting = $state(false);

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
		'cozy': EmojiHotBeverage,
		'fairy-tale': EmojiCastle,
		'grandma': EmojiOldWoman,
		'hr-review': EmojiMemo,
		'ikea': EmojiTools
	};

	const swedishMonths: Record<string, string> = {
		'01': 'jan', '02': 'feb', '03': 'mar', '04': 'apr',
		'05': 'maj', '06': 'jun', '07': 'jul', '08': 'aug',
		'09': 'sep', '10': 'okt', '11': 'nov', '12': 'dec'
	};

	function formatDate(dateStr: string): string {
		const parts = dateStr.split('-');
		if (parts.length !== 3) return dateStr;
		const day = parseInt(parts[2], 10);
		const month = swedishMonths[parts[1]] || parts[1];
		const year = parts[0];
		return `${day} ${month} ${year}`;
	}

	function formatTimeAgo(isoStr: string): string {
		const now = Date.now();
		const then = new Date(isoStr).getTime();
		const diffMs = now - then;
		const diffMin = Math.floor(diffMs / 60000);
		if (diffMin < 1) return 'Just nu';
		if (diffMin < 60) return `${diffMin} min sedan`;
		const diffH = Math.floor(diffMin / 60);
		if (diffH < 24) return `${diffH}h sedan`;
		const diffD = Math.floor(diffH / 24);
		if (diffD < 7) return `${diffD}d sedan`;
		return formatDate(isoStr.slice(0, 10));
	}

	function getToneIcon(id: string): Component | undefined {
		return toneIconMap[id];
	}

	function getToneName(id: string): string {
		return tones.find((t) => t.id === id)?.name || id;
	}

	const hasMore = $derived(entries.length < totalEntries);

	async function loadEntries(page: number) {
		try {
			const res = await fetch(getApiUrl(`/api/community?page=${page}&limit=${LIMIT}`));
			const data = await res.json();

			if (!data.success) {
				error = data.error || 'Kunde inte ladda inlägg.';
				return;
			}

			if (page === 1) {
				entries = data.entries;
			} else {
				entries = [...entries, ...data.entries];
			}
			totalEntries = data.total;
		} catch {
			error = 'Kunde inte ansluta till servern.';
		}
	}

	async function loadMore() {
		if (isLoadingMore || !hasMore) return;
		isLoadingMore = true;
		currentPage++;
		await loadEntries(currentPage);
		isLoadingMore = false;
	}

	function openEntry(entry: CommunityEntry) {
		selectedEntry = entry;
	}

	function closeModal() {
		selectedEntry = null;
	}

	async function deleteOwnEntry() {
		if (!selectedEntry || isDeleting) return;
		isDeleting = true;

		try {
			// Import supabase dynamically to avoid it being required for anonymous visitors
			const { supabase } = await import('$lib/supabase/client');
			const { error: deleteError } = await supabase
				.from('community_entries')
				.delete()
				.eq('id', selectedEntry.id);

			if (deleteError) {
				console.error('Delete error:', deleteError);
			} else {
				entries = entries.filter((e) => e.id !== selectedEntry!.id);
				totalEntries--;
				closeModal();
			}
		} catch (err) {
			console.error('Delete error:', err);
		} finally {
			isDeleting = false;
		}
	}

	const canDelete = $derived(
		selectedEntry &&
			authStore.isLoggedIn &&
			authStore.user?.id === selectedEntry.user_id
	);

	onMount(async () => {
		await loadEntries(1);
		isLoading = false;
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && selectedEntry && closeModal()} />

<div class="community-page">
	<div class="community-container">
		<div class="community-header">
			<div class="header-icon"><UniqueEmoji><EmojiUsersSilhouette size={72} /></UniqueEmoji></div>
			<h1 class="community-title">Gemenskapen</h1>
			<p class="community-subtitle">Dagboksanteckningar delade av Storify-användare</p>
		</div>

		{#if isLoading}
			<div class="community-loading">
				<span class="spinner"></span>
				<p>Laddar inlägg...</p>
			</div>
		{:else if error}
			<div class="community-error">{error}</div>
		{:else if entries.length === 0}
			<div class="community-empty">
				<p class="empty-text">Inga delade dagboksanteckningar ännu.</p>
				<p class="empty-hint">Bli först! Skapa en dagbok och dela den med communityn.</p>
			</div>
		{:else}
			<div class="entries-grid">
				{#each entries as entry (entry.id)}
					{@const ToneIcon = getToneIcon(entry.tone_id)}
					<button class="community-card" onclick={() => openEntry(entry)}>
						<div class="card-top">
							<div class="card-tone-badge">
								{#if ToneIcon}
									<span class="card-tone-icon"><UniqueEmoji><ToneIcon size={16} /></UniqueEmoji></span>
								{/if}
								<span class="card-tone-name">{getToneName(entry.tone_id)}</span>
							</div>
							<span class="card-time">{formatTimeAgo(entry.created_at)}</span>
						</div>

						<p class="card-excerpt">{entry.excerpt}</p>

						<div class="card-bottom">
							<span class="card-author">{entry.display_name}</span>
							<span class="card-date">{formatDate(entry.entry_date)}</span>
						</div>
					</button>
				{/each}
			</div>

			{#if hasMore}
				<div class="load-more-row">
					<button class="load-more-btn" onclick={loadMore} disabled={isLoadingMore}>
						{#if isLoadingMore}
							<span class="spinner"></span>
							Laddar...
						{:else}
							Visa fler
						{/if}
					</button>
				</div>
			{/if}
		{/if}
	</div>
	<LegalFooter />
</div>

<!-- Detail Modal -->
{#if selectedEntry}
	{@const ToneIcon = getToneIcon(selectedEntry.tone_id)}
	{@const renderParagraphs = getRenderParagraphs(selectedEntry.generated_text)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="modal-overlay" onclick={closeModal} role="button" tabindex="-1">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Dagboksinlägg" tabindex="-1">
			<div class="modal-header">
				<div class="modal-meta">
					<div class="modal-tone">
						{#if ToneIcon}
							<span class="modal-tone-icon"><UniqueEmoji><ToneIcon size={20} /></UniqueEmoji></span>
						{/if}
						<span class="modal-tone-name">{getToneName(selectedEntry.tone_id)}</span>
					</div>
					<span class="modal-date">{formatDate(selectedEntry.entry_date)}</span>
				</div>
				<div class="modal-author-row">
					<span class="modal-author">av {selectedEntry.display_name}</span>
					<span class="modal-time">{formatTimeAgo(selectedEntry.created_at)}</span>
				</div>
			</div>

			<div class="modal-body">
				{#each renderParagraphs as paragraph}
					{#if paragraph.type === 'horoscope-heading'}
						<p class="addon-heading">
							<span class="addon-icon"><UniqueEmoji><EmojiCrystalBall size={24} /></UniqueEmoji></span>
							<span>{@html formatParagraph(paragraph.text)}</span>
						</p>
					{:else if paragraph.type === 'onthisday-heading'}
						<p class="addon-heading">
							<span class="addon-icon"><UniqueEmoji><EmojiMantelpieceClock size={24} /></UniqueEmoji></span>
							<span>{@html formatParagraph(paragraph.text)}</span>
						</p>
					{:else if paragraph.type === 'homework-heading'}
						<p class="addon-heading">
							<span class="addon-icon"><UniqueEmoji><EmojiLightBulb size={24} /></UniqueEmoji></span>
							<span>{@html formatParagraph(paragraph.text)}</span>
						</p>
					{:else}
						<p>{@html formatParagraph(paragraph.text)}</p>
					{/if}
				{/each}
			</div>

			<div class="modal-footer">
				<button class="modal-close-btn" onclick={closeModal}>
					<EmojiCrossMark size={18} />
					<span>Stäng</span>
				</button>
				{#if canDelete}
					<button class="modal-delete-btn" onclick={deleteOwnEntry} disabled={isDeleting}>
						{#if isDeleting}
							<span class="spinner"></span>
							<span>Tar bort...</span>
						{:else}
							<span>Ta bort mitt inlägg</span>
						{/if}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* ===== Page Layout ===== */

	.community-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		padding-top: 1rem;
		padding-bottom: 0;
	}

	.community-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: var(--content-width);
	}

	/* ===== Header ===== */

	.community-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.8;
		margin-bottom: 0.75rem;
	}

	.community-title {
		font-family: var(--font-primary);
		font-size: var(--text-3xl);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.community-subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		margin: 0;
	}

	/* ===== States ===== */

	.community-loading {
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

	.community-loading p {
		margin: 0;
	}

	.community-error {
		padding: 0.75rem 1rem;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		color: var(--color-accent);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		text-align: center;
	}

	.community-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
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

	.empty-hint {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		margin: 0;
		opacity: 0.7;
	}

	/* ===== Card Grid ===== */

	.entries-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.875rem;
	}

	.community-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem 1.125rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		font-family: var(--font-primary);
		color: var(--color-text);
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease,
			transform 0.15s ease;
	}

	.community-card:hover {
		border-color: var(--color-accent);
		box-shadow: 0 4px 16px rgba(244, 63, 122, 0.06);
		transform: translateY(-1px);
	}

	.card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.card-tone-badge {
		display: flex;
		align-items: center;
		gap: 0.3rem;
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

	.card-time {
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		opacity: 0.7;
		white-space: nowrap;
	}

	.card-excerpt {
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		line-height: var(--leading-relaxed);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
	}

	.card-author {
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-accent);
	}

	.card-date {
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	/* ===== Load More ===== */

	.load-more-row {
		display: flex;
		justify-content: center;
		padding-top: 1.5rem;
	}

	.load-more-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: border-color 0.15s ease;
	}

	.load-more-btn:hover:not(:disabled) {
		border-color: var(--color-accent);
	}

	.load-more-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* ===== Detail Modal ===== */

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		z-index: 1000;
		padding: 2rem 1rem;
		overflow-y: auto;
		animation: fadeIn 0.15s ease;
	}

	.modal-content {
		width: 100%;
		max-width: var(--content-width);
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		padding: 2rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		animation: slideUp 0.2s ease;
	}

	.modal-header {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1.5rem;
	}

	.modal-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.modal-tone {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.modal-tone-icon {
		display: flex;
		align-items: center;
	}

	.modal-tone-name {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.modal-date {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.modal-author-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.modal-author {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-accent);
	}

	.modal-time {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.modal-body {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-book);
		line-height: var(--leading-loose);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.modal-body p {
		margin: 0 0 1.125rem 0;
	}

	.modal-body p:first-child {
		font-weight: var(--weight-medium);
	}

	.modal-body p:last-child {
		margin-bottom: 0;
	}

	.modal-body p.addon-heading {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-weight: var(--weight-medium);
		margin-top: 1.5rem;
	}

	.modal-body p.addon-heading:first-child {
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

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--color-border);
	}

	.modal-close-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		background: none;
		border: none;
		cursor: pointer;
		transition: color 0.15s ease;
	}

	.modal-close-btn:hover {
		color: var(--color-accent);
	}

	.modal-delete-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		color: var(--color-accent);
		background: none;
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.modal-delete-btn:hover:not(:disabled) {
		background: var(--color-accent);
		color: white;
	}

	.modal-delete-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* ===== Spinner ===== */

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

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
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

	/* ===== Responsive ===== */

	@media (max-width: 600px) {
		.community-page {
			padding: 1rem;
			padding-top: 0.5rem;
			padding-bottom: 0;
		}

		.entries-grid {
			grid-template-columns: 1fr;
		}

		.modal-overlay {
			padding: 1rem 0.75rem;
		}

		.modal-content {
			padding: 1.5rem;
		}
	}
</style>

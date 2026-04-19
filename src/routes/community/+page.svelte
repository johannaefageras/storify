<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { tones } from '$lib/data/tones';
	import { getApiUrl } from '$lib/config';
	import { getRenderParagraphs, formatParagraph } from '$lib/utils/paragraphs';

	import chevronLeftSvg from '$lib/assets/svg/chevronLeft.svg?raw';
	import chevronRightSvg from '$lib/assets/svg/chevronRight.svg?raw';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';
	import { Emoji } from '$lib/assets/emojis';

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
	const LIMIT = 9;

	// Filter state
	let searchQuery = $state('');
	let selectedTone = $state('');
	let dateFrom = $state('');
	let dateTo = $state('');
	let searchTimeout: ReturnType<typeof setTimeout> | undefined;
	let isToneDropdownOpen = $state(false);

	const hasActiveFilters = $derived(
		searchQuery !== '' || selectedTone !== '' || dateFrom !== '' || dateTo !== ''
	);

	// Modal state
	let selectedEntry = $state<CommunityEntry | null>(null);
	let isDeleting = $state(false);

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
		'bro': 'shorts',
		'action-hero': 'collision',
		'influencer': 'loudspeaker',
		'six-year-old': 'teddy-bear'
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

	function getToneIcon(id: string): string | undefined {
		return toneIconMap[id];
	}

	function getToneName(id: string): string {
		return tones.find((t) => t.id === id)?.name || id;
	}

	const totalPages = $derived(Math.max(1, Math.ceil(totalEntries / LIMIT)));
	const hasPrev = $derived(currentPage > 1);
	const hasNext = $derived(currentPage < totalPages);

	async function loadEntries(page: number) {
		isLoading = true;
		error = '';
		try {
			const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
			if (searchQuery) params.set('search', searchQuery);
			if (selectedTone) params.set('tone', selectedTone);
			if (dateFrom) params.set('from', dateFrom);
			if (dateTo) params.set('to', dateTo);

			const res = await fetch(getApiUrl(`/api/community?${params}`));
			const data = await res.json();

			if (!data.success) {
				error = data.error || 'Kunde inte ladda inlägg.';
				return;
			}

			entries = data.entries;
			totalEntries = data.total;
		} catch {
			error = 'Kunde inte ansluta till servern.';
		} finally {
			isLoading = false;
		}
	}

	function applyFilters() {
		currentPage = 1;
		loadEntries(1);
	}

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(applyFilters, 400);
	}

	function clearFilters() {
		searchQuery = '';
		selectedTone = '';
		dateFrom = '';
		dateTo = '';
		applyFilters();
	}

	function selectToneFilter(toneId: string) {
		selectedTone = toneId;
		isToneDropdownOpen = false;
		applyFilters();
	}

	function handleToneDropdownClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.tone-filter-wrapper')) {
			isToneDropdownOpen = false;
		}
	}

	function handleToneDropdownKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isToneDropdownOpen = false;
		}
	}

	async function goToPage(page: number) {
		if (page < 1 || page > totalPages || page === currentPage) return;
		currentPage = page;
		await loadEntries(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
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

	onMount(() => {
		loadEntries(1);
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && selectedEntry) closeModal();
		handleToneDropdownKeydown(e);
	}}
	onclick={handleToneDropdownClickOutside}
/>

<div class="community-page">
	<div class="community-container">
		<div class="community-header">
			<div class="header-icon"><UniqueEmoji><Emoji name="users-silhouette" size={72} /></UniqueEmoji></div>
			<h1 class="community-title">Gemenskapen</h1>
			<p class="community-subtitle">Dagboksanteckningar delade av My Storify-användare</p>
		</div>

		<div class="filters-bar">
			<input
				type="search"
				class="filter-search"
				placeholder="Sök i gemenskapen..."
				bind:value={searchQuery}
				oninput={handleSearchInput}
			/>
			<div class="tone-filter-wrapper">
				<button
					type="button"
					class="filter-select tone-filter-trigger"
					onclick={(e) => { e.stopPropagation(); isToneDropdownOpen = !isToneDropdownOpen; }}
					aria-haspopup="listbox"
					aria-expanded={isToneDropdownOpen}
				>
					{#if selectedTone}
						{@const SelectedIcon = getToneIcon(selectedTone)}
						{#if SelectedIcon}
							<span class="tone-filter-trigger-icon"><UniqueEmoji><Emoji name={SelectedIcon} size={16} /></UniqueEmoji></span>
						{/if}
						<span class="tone-filter-trigger-label">{getToneName(selectedTone)}</span>
					{:else}
						<span class="tone-filter-trigger-label">Alla röster</span>
					{/if}
				</button>

				{#if isToneDropdownOpen}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div class="tone-dropdown" role="listbox" tabindex="-1" aria-label="Välj röst" onclick={(e) => e.stopPropagation()}>
						<div class="dropdown-header">
							<span class="dropdown-title">Välj röst</span>
						</div>
						<div class="tone-grid">
							<button
								type="button"
								class="tone-option"
								class:tone-option--current={selectedTone === ''}
								onclick={() => selectToneFilter('')}
								disabled={selectedTone === ''}
								role="option"
								aria-selected={selectedTone === ''}
							>
								<span class="tone-option-name">Alla röster</span>
							</button>
							{#each tones as tone (tone.id)}
								{@const ToneIcon = getToneIcon(tone.id)}
								<button
									type="button"
									class="tone-option"
									class:tone-option--current={tone.id === selectedTone}
									onclick={() => selectToneFilter(tone.id)}
									disabled={tone.id === selectedTone}
									role="option"
									aria-selected={tone.id === selectedTone}
									title={tone.name}
								>
									{#if ToneIcon}
										<span class="tone-option-icon"><UniqueEmoji><Emoji name={ToneIcon} size={22} /></UniqueEmoji></span>
									{/if}
									<span class="tone-option-name">{tone.name}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<div class="date-range">
				<input type="date" class="filter-date" bind:value={dateFrom} onchange={applyFilters} aria-label="Från datum" />
				<span class="date-separator">–</span>
				<input type="date" class="filter-date" bind:value={dateTo} onchange={applyFilters} aria-label="Till datum" />
			</div>
			{#if hasActiveFilters}
				<button class="clear-filters-btn" onclick={clearFilters}>Rensa</button>
			{/if}
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
				{#if hasActiveFilters}
					<p class="empty-text">Inga inlägg matchade din sökning.</p>
					<p class="empty-hint"><button class="clear-link" onclick={clearFilters}>Rensa filter</button> och försök igen.</p>
				{:else}
					<p class="empty-text">Inga delade dagboksanteckningar ännu.</p>
					<p class="empty-hint">Bli först! Skapa en dagbok och dela den med communityn.</p>
				{/if}
			</div>
		{:else}
			<div class="entries-grid">
				{#each entries as entry (entry.id)}
					{@const ToneIcon = getToneIcon(entry.tone_id)}
					<button class="community-card" onclick={() => openEntry(entry)}>
						<div class="card-top">
							<div class="card-tone-badge">
								{#if ToneIcon}
									<span class="card-tone-icon"><UniqueEmoji><Emoji name={ToneIcon} size={16} /></UniqueEmoji></span>
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

			{#if totalPages > 1}
				<div class="pagination">
					<button class="pagination-btn" onclick={() => goToPage(currentPage - 1)} disabled={!hasPrev} aria-label="Föregående sida">
						<span class="pagination-icon">{@html chevronLeftSvg}</span>
					</button>
					<span class="pagination-info">Sida {currentPage} av {totalPages}</span>
					<button class="pagination-btn" onclick={() => goToPage(currentPage + 1)} disabled={!hasNext} aria-label="Nästa sida">
						<span class="pagination-icon">{@html chevronRightSvg}</span>
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
							<span class="modal-tone-icon"><UniqueEmoji><Emoji name={ToneIcon} size={20} /></UniqueEmoji></span>
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
							<span class="addon-icon"><UniqueEmoji><Emoji name="crystal-ball" size={24} /></UniqueEmoji></span>
							<span>{@html formatParagraph(paragraph.text)}</span>
						</p>
					{:else if paragraph.type === 'onthisday-heading'}
						<p class="addon-heading">
							<span class="addon-icon"><UniqueEmoji><Emoji name="mantelpiece-clock" size={24} /></UniqueEmoji></span>
							<span>{@html formatParagraph(paragraph.text)}</span>
						</p>
					{:else if paragraph.type === 'homework-heading'}
						<p class="addon-heading">
							<span class="addon-icon"><UniqueEmoji><Emoji name="light-bulb" size={24} /></UniqueEmoji></span>
							<span>{@html formatParagraph(paragraph.text)}</span>
						</p>
					{:else}
						<p>{@html formatParagraph(paragraph.text)}</p>
					{/if}
				{/each}
			</div>

			<div class="modal-footer">
				<button class="modal-close-btn" onclick={closeModal}>
					<Emoji name="cross-mark" size={18} />
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
		max-width: 1100px;
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

	/* ===== Filters ===== */

	.filters-bar {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		margin-bottom: 1.5rem;
	}

	.filter-search,
	.filter-select,
	.filter-date {
		height: 2.75rem;
		padding: 0 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-normal);
		color: var(--color-text);
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		outline: none;
		box-sizing: border-box;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	:global([data-theme='dark']) .filter-date::-webkit-calendar-picker-indicator {
		filter: invert(1);
	}

	.filter-search:focus,
	.filter-select:focus,
	.filter-date:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
	}

	.filter-search {
		flex: 1;
		min-width: 0;
	}

	.filter-search::placeholder {
		color: var(--color-text-muted);
		font-weight: var(--weight-light);
		letter-spacing: var(--tracking-wider);
		opacity: 0.7;
	}

	.filter-select {
		min-width: 11rem;
		padding-right: 2rem;
		appearance: none;
		-webkit-appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.75rem center;
		cursor: pointer;
	}

	/* ===== Tone filter dropdown (matches TonePickerDropdown) ===== */

	.tone-filter-wrapper {
		position: relative;
		display: flex;
	}

	.tone-filter-trigger {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		text-align: left;
	}

	.tone-filter-trigger-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.tone-filter-trigger-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tone-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		width: 280px;
		max-height: 360px;
		overflow-y: auto;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
		z-index: 10;
		animation: dropdownIn 0.15s ease;
	}

	@keyframes dropdownIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.dropdown-header {
		padding: 0.75rem 0.875rem 0.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.dropdown-title {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.tone-grid {
		display: flex;
		flex-direction: column;
		padding: 0.375rem;
	}

	.tone-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.625rem;
		background: none;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		text-align: left;
		transition: background-color 0.1s ease;
		width: 100%;
	}

	.tone-option:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
	}

	.tone-option--current {
		opacity: 0.4;
		cursor: default;
	}

	.tone-option-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.tone-option-name {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.date-range {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.date-separator {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		opacity: 0.5;
		user-select: none;
	}

	.clear-filters-btn {
		height: 2.75rem;
		padding: 0 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text-muted);
		background: none;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		white-space: nowrap;
		box-sizing: border-box;
		transition:
			border-color 0.15s ease,
			color 0.15s ease;
	}

	.clear-filters-btn:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.clear-link {
		padding: 0;
		font-family: var(--font-primary);
		font-size: inherit;
		font-weight: var(--weight-medium);
		color: var(--color-accent);
		background: none;
		border: none;
		cursor: pointer;
		text-decoration: underline;
	}

	.clear-link:hover {
		opacity: 0.8;
	}

	/* ===== Card Grid ===== */

	.entries-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.875rem;
	}

	@media (max-width: 750px) {
		.entries-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.community-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 0;
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
			background-color 0.15s ease,
			box-shadow 0.15s ease,
			transform 0.15s ease;
	}

	.community-card:hover {
		border-color: var(--color-accent);
		background-color: color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-elevated));
		box-shadow: 0 4px 16px rgba(244, 63, 122, 0.08);
		transform: translateY(-2px);
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
		flex: 1;
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
		overflow-wrap: break-word;
		word-break: break-word;
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

	/* ===== Pagination ===== */

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding-top: 1.5rem;
	}

	.pagination-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		color: var(--color-text);
		transition: border-color 0.15s ease, color 0.15s ease;
	}

	.pagination-btn:hover:not(:disabled) {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.pagination-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.pagination-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
	}

	.pagination-icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.pagination-info {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
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

		.filters-bar {
			flex-wrap: wrap;
		}

		.filter-search {
			flex-basis: 100%;
		}

		.filter-select {
			min-width: 0;
			flex: 1;
		}

		.tone-filter-wrapper {
			flex: 1;
			min-width: 0;
		}

		.tone-filter-trigger {
			width: 100%;
		}

		.tone-dropdown {
			width: 100%;
			min-width: 240px;
			max-height: 300px;
		}

		.date-range {
			flex-basis: 100%;
			order: 3;
		}

		.filter-date {
			flex: 1;
			min-width: 0;
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

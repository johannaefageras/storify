<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { supabase } from '$lib/supabase/client';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import refreshSvg from '$lib/assets/icons/refresh.svg?raw';
	import {
		BADGES,
		BADGES_BY_ID,
		type BadgeCategory,
		type BadgeTier
	} from '$lib/data/badges';

	const svgModules = import.meta.glob('$lib/assets/emojis/*.svg', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>;

	const svgMap: Map<string, string> = (() => {
		const map = new Map<string, string>();
		for (const [path, raw] of Object.entries(svgModules)) {
			const slug = path.split('/').pop()?.replace(/\.svg$/, '');
			if (!slug) continue;
			map.set(
				slug,
				raw.replace(/<svg\b([^>]*)>/, (_m, attrs: string) => {
					const stripped = attrs.replace(/\s(width|height|class)="[^"]*"/g, '');
					return `<svg${stripped} width="64" height="64" aria-hidden="true">`;
				})
			);
		}
		return map;
	})();

	const CATEGORY_LABEL: Record<BadgeCategory, string> = {
		onboarding: 'Onboarding',
		milestones: 'Milstolpar',
		streaks: 'Sviter',
		timing: 'Timing',
		'writing-mode': 'Skrivsätt',
		community: 'Gemenskap',
		occasions: 'Tillfällen',
		mood: 'Humör',
		voice: 'Röst',
		engagement: 'Engagemang',
		editing: 'Redigering',
		exploration: 'Utforskning',
		features: 'Funktioner',
		craft: 'Hantverk'
	};

	const TIER_LABEL: Record<BadgeTier, string> = {
		bronze: 'Brons',
		silver: 'Silver',
		gold: 'Guld',
		platinum: 'Platina'
	};

	const CATEGORY_OPTIONS: BadgeCategory[] = Array.from(
		new Set(BADGES.map((b) => b.category))
	).sort((a, b) => CATEGORY_LABEL[a].localeCompare(CATEGORY_LABEL[b], 'sv'));

	const TIER_OPTIONS: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum'];

	const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});

	let isLoading = $state(true);
	let earnedMap = $state<Map<string, string>>(new Map());
	let categoryFilter = $state<BadgeCategory | 'all'>('all');
	let tierFilter = $state<BadgeTier | 'all'>('all');
	let showOnlyEarned = $state(false);
	let isRescanning = $state(false);
	let rescanMessage = $state<string>('');

	async function getAuthHeaders(): Promise<Record<string, string> | undefined> {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		return session?.access_token
			? { Authorization: `Bearer ${session.access_token}` }
			: undefined;
	}

	async function loadBadges() {
		if (!authStore.user) return;
		try {
			const res = await fetch('/api/badges/list', {
				headers: (await getAuthHeaders()) ?? {}
			});
			if (!res.ok) throw new Error(`Failed to load badges (${res.status})`);
			const payload = (await res.json()) as {
				rows?: { badge_id: string; earned_at: string }[];
			};
			const next = new Map<string, string>();
			for (const row of payload.rows ?? []) {
				next.set(row.badge_id, row.earned_at);
			}
			earnedMap = next;
		} catch (err) {
			console.error('[badges page] load failed:', err);
		}
		isLoading = false;
	}

	const visibleBadges = $derived(
		BADGES.filter((b) => {
			const isEarned = earnedMap.has(b.id);
			if (b.hidden && !isEarned) return false;
			if (showOnlyEarned && !isEarned) return false;
			if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
			if (tierFilter !== 'all' && b.tier !== tierFilter) return false;
			return true;
		})
	);

	const sortedBadges = $derived(
		[...visibleBadges].sort((a, b) => {
			const aAt = earnedMap.get(a.id);
			const bAt = earnedMap.get(b.id);
			if (aAt && !bAt) return -1;
			if (!aAt && bAt) return 1;
			if (aAt && bAt) return bAt.localeCompare(aAt);
			return BADGES.indexOf(a) - BADGES.indexOf(b);
		})
	);

	const totalUnlockableCount = $derived(
		BADGES.filter((b) => !b.hidden || earnedMap.has(b.id)).length
	);

	const earnedCount = $derived(
		Array.from(earnedMap.keys()).filter((id) => BADGES_BY_ID[id]).length
	);

	function formatDate(iso: string): string {
		return dateFormatter.format(new Date(iso));
	}

	async function forceRescan() {
		if (isRescanning) return;
		isRescanning = true;
		rescanMessage = '';
		try {
			const {
				data: { session }
			} = await supabase.auth.getSession();
			const res = await fetch('/api/badges/backfill?force=1', {
				method: 'POST',
				headers: session?.access_token
					? { Authorization: `Bearer ${session.access_token}` }
					: undefined
			});
			const data = (await res.json().catch(() => ({}))) as {
				newlyEarned?: { id: string }[];
				skipped?: boolean;
				error?: string;
			};
			if (!res.ok) {
				rescanMessage = data.error ?? `Fel (${res.status}).`;
			} else {
				const added = data.newlyEarned?.length ?? 0;
				rescanMessage =
					added > 0
						? `${added} nya utmärkelser upplåsta.`
						: 'Inga nya retroaktiva utmärkelser hittades. Vissa utmärkelser låses bara upp när händelsen sker igen.';
				await loadBadges();
			}
		} catch (err) {
			console.error('[badges] force rescan failed:', err);
			rescanMessage = 'Kunde inte söka efter utmärkelser.';
		} finally {
			isRescanning = false;
		}
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
			void loadBadges();
		};
		checkAuth();
	});
</script>

<svelte:head>
	<title>Utmärkelser – Storify</title>
</svelte:head>

<main class="badges-page">
	{#if isLoading}
		<div class="loading-wrapper">
			<p class="loading-text">Laddar utmärkelser...</p>
		</div>
	{:else}
		<header class="badges-hero">
			<div class="header-icon"><UniqueEmoji><Emoji name="military-medal" size={72} /></UniqueEmoji></div>
			<h1 class="hero-title">Utmärkelser</h1>
			<p class="hero-meta">
				{earnedCount} av {totalUnlockableCount} upplåsta
			</p>
		</header>

		<section class="filters-section">
			<div class="filters">
				<div class="filter-group">
					<label class="filter-label" for="category-filter">Kategori</label>
					<select id="category-filter" bind:value={categoryFilter}>
						<option value="all">Alla kategorier</option>
						{#each CATEGORY_OPTIONS as cat}
							<option value={cat}>{CATEGORY_LABEL[cat]}</option>
						{/each}
					</select>
				</div>

				<div class="filter-group">
					<label class="filter-label" for="tier-filter">Nivå</label>
					<select id="tier-filter" bind:value={tierFilter}>
						<option value="all">Alla nivåer</option>
						{#each TIER_OPTIONS as tier}
							<option value={tier}>{TIER_LABEL[tier]}</option>
						{/each}
					</select>
				</div>

				<label class="toggle-row">
					<span class="toggle-label">Upplåsta</span>
					<span class="toggle-switch">
						<input type="checkbox" bind:checked={showOnlyEarned} />
						<span class="toggle-slider"></span>
					</span>
				</label>

				<button
					type="button"
					class="rescan-button"
					onclick={forceRescan}
					disabled={isRescanning}
					aria-label={isRescanning ? 'Söker…' : 'Uppdatera'}
					title={isRescanning ? 'Söker…' : 'Uppdatera'}
				>
					<span class="rescan-icon" class:spinning={isRescanning}>{@html refreshSvg}</span>
				</button>
			</div>

			{#if rescanMessage}
				<div class="rescan-row">
					<span class="rescan-message">{rescanMessage}</span>
				</div>
			{/if}
		</section>

		{#if sortedBadges.length === 0}
			<p class="empty">Inga utmärkelser matchar filtret.</p>
		{:else}
			<section class="badges-grid" aria-label="Lista över utmärkelser">
				{#each sortedBadges as badge (badge.id)}
					{@const isEarned = earnedMap.has(badge.id)}
					{@const earnedAt = earnedMap.get(badge.id)}
					{@const svg = svgMap.get(badge.emojiSlug)}
					<article
						class="badge-card"
						class:locked={!isEarned}
						data-tier={badge.tier}
						aria-label="{badge.name} – {isEarned ? 'upplåst' : 'ej upplåst'}"
					>
						<div class="badge-icon">
							{#if svg}
								{@html svg}
							{:else}
								<span class="fallback">{badge.emoji}</span>
							{/if}
						</div>
						<div class="badge-body">
							<div class="badge-eyebrow">
								{TIER_LABEL[badge.tier]} · {CATEGORY_LABEL[badge.category]}
							</div>
							<h3 class="badge-name">{badge.name}</h3>
							<p class="badge-description">{badge.description}</p>
							{#if isEarned && earnedAt}
								<p class="badge-status earned">Upplåst {formatDate(earnedAt)}</p>
							{:else}
								<p class="badge-status">Ej upplåst</p>
							{/if}
						</div>
					</article>
				{/each}
			</section>
		{/if}
	{/if}
	<LegalFooter />
</main>

<style>
	.badges-page {
		--content-width: 1040px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.loading-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 40vh;
	}

	.loading-text {
		color: var(--color-text-muted);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
	}

	.badges-hero {
		max-width: var(--content-width);
		width: 100%;
		padding: 2rem 1.5rem 0;
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

	.hero-title {
		font-family: var(--font-primary);
		font-size: var(--text-3xl);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.hero-meta {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		margin: 0;
	}

	.filters-section {
		max-width: var(--content-width);
		width: 100%;
		padding: 0 1.25rem;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: flex-end;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 0.875rem 1rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
		min-width: 10rem;
	}

	.filter-label {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	select {
		width: 100%;
		height: 2.5rem;
		padding: 0 0.875rem;
		padding-right: 1.75rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-elevated);
		color: var(--color-text);
		appearance: none;
		-webkit-appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f5f5f' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		cursor: pointer;
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	select:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		cursor: pointer;
		height: 2.5rem;
	}

	.toggle-label {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.toggle-switch {
		position: relative;
		display: inline-block;
		flex-shrink: 0;
		width: 2.5rem;
		height: 1.5rem;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		inset: 0;
		background: var(--color-border);
		border-radius: 999px;
		transition: background-color 0.15s ease;
	}

	.toggle-slider::before {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: calc(1.5rem - 4px);
		height: calc(1.5rem - 4px);
		background: white;
		border-radius: 50%;
		transition: transform 0.15s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}

	.toggle-switch input:checked + .toggle-slider {
		background: var(--color-accent);
	}

	.toggle-switch input:checked + .toggle-slider::before {
		transform: translateX(1rem);
	}

	.toggle-switch input:focus-visible + .toggle-slider {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 25%, transparent);
	}

	.rescan-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.75rem;
	}

	.rescan-button {
		margin-left: auto;
		width: 2.5rem;
		height: 2.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		color: var(--color-text);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: border-color 0.15s ease, background-color 0.15s ease;
	}

	.rescan-button:hover:not(:disabled) {
		border-color: var(--color-accent);
	}

	.rescan-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.rescan-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
	}

	.rescan-icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.rescan-icon.spinning {
		animation: rescan-spin 0.9s linear infinite;
	}

	@keyframes rescan-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.rescan-message {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-wide);
	}

	.empty {
		max-width: var(--content-width);
		width: 100%;
		padding: 2rem 1.25rem;
		text-align: center;
		color: var(--color-text-muted);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
	}

	.badges-grid {
		max-width: var(--content-width);
		width: 100%;
		padding: 1rem 1.25rem 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
		gap: 0.75rem;
	}

	.badge-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-items: center;
		text-align: center;
		padding: 1.25rem 1rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-top: 3px solid var(--color-accent);
		border-radius: var(--radius-md);
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.badge-card.locked {
		border-top-color: var(--color-border);
	}

	.badge-card.locked .badge-icon {
		filter: grayscale(1);
		opacity: 0.45;
	}

	.badge-card.locked .badge-name,
	.badge-card.locked .badge-description {
		color: var(--color-text-muted);
	}

	.badge-icon {
		flex: 0 0 64px;
		width: 64px;
		height: 64px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.fallback {
		font-size: 2.5rem;
		line-height: 1;
	}

	.badge-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		min-width: 0;
	}

	.badge-eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text-muted);
		font-weight: var(--weight-semibold);
	}

	.badge-name {
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		line-height: var(--leading-snug);
		color: var(--color-text);
		margin: 0;
	}

	.badge-description {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: var(--leading-base);
		margin: 0;
	}

	.badge-status {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-wide);
		margin: 0.15rem 0 0;
	}

	.badge-status.earned {
		color: var(--color-accent);
		font-weight: var(--weight-medium);
	}

	@media (max-width: 600px) {
		.badges-hero {
			padding: 1.5rem 1rem 0;
		}

		.filters-section {
			padding: 0 1rem;
		}

		.badges-grid {
			padding: 0.75rem 1rem 2rem;
			grid-template-columns: 1fr;
		}
	}
</style>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { badgesStore } from '$lib/stores/badges.svelte';
	import type { Badge, BadgeTier } from '$lib/data/badges';

	const AUTO_DISMISS_MS = 6000;

	const svgModules = import.meta.glob('$lib/assets/emojis/*.svg', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>;

	const current = $derived<Badge | undefined>(badgesStore.unlockQueue[0]);

	const svgHtml = $derived.by(() => {
		if (!current) return '';
		const raw = findSvg(current.emojiSlug);
		if (!raw) return '';
		return raw.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
			const stripped = attrs.replace(/\s(width|height|class)="[^"]*"/g, '');
			return `<svg${stripped} width="56" height="56" aria-hidden="true">`;
		});
	});

	function findSvg(slug: string): string | undefined {
		for (const [path, raw] of Object.entries(svgModules)) {
			if (path.endsWith(`/${slug}.svg`)) return raw;
		}
		return undefined;
	}

	const TIER_LABEL: Record<BadgeTier, string> = {
		bronze: 'Brons',
		silver: 'Silver',
		gold: 'Guld',
		platinum: 'Platina'
	};

	let timer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		const shown = current;
		if (!shown) return;
		clearTimer();
		timer = setTimeout(() => {
			void badgesStore.dismiss();
		}, AUTO_DISMISS_MS);
		return clearTimer;
	});

	function clearTimer() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	onDestroy(clearTimer);

	function handleClick() {
		void badgesStore.dismiss();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			void badgesStore.dismiss();
		}
	}
</script>

{#if current}
	{#key current.id}
		<div
			class="toast"
			data-tier={current.tier}
			role="alertdialog"
			aria-live="polite"
			aria-label="Ny utmärkelse upplåst: {current.name}"
			tabindex="0"
			onclick={handleClick}
			onkeydown={handleKeydown}
			transition:fly={{ y: 24, duration: 280 }}
		>
			<div class="emoji">
				{#if svgHtml}
					{@html svgHtml}
				{:else}
					<span class="fallback">{current.emoji}</span>
				{/if}
			</div>
			<div class="body">
				<div class="eyebrow">Ny utmärkelse · {TIER_LABEL[current.tier]}</div>
				<div class="name">{current.name}</div>
				<div class="description">{current.description}</div>
			</div>
		</div>
	{/key}
{/if}

<style>
	.toast {
		position: fixed;
		right: 1.25rem;
		bottom: 1.25rem;
		z-index: 200;
		display: flex;
		gap: 0.9rem;
		align-items: center;
		max-width: min(22rem, calc(100vw - 2.5rem));
		padding: 0.9rem 1rem;
		background: var(--color-bg-elevated);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-left: 3px solid var(--color-accent);
		border-radius: var(--radius-md);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		cursor: pointer;
		text-align: left;
	}

	.toast:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.emoji {
		flex: 0 0 56px;
		width: 56px;
		height: 56px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.fallback {
		font-size: 2.25rem;
		line-height: 1;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-accent);
		font-weight: var(--weight-semibold);
	}

	.name {
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		line-height: var(--leading-snug);
	}

	.description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: var(--leading-base);
	}

	@media (max-width: 480px) {
		.toast {
			right: 0.75rem;
			left: 0.75rem;
			bottom: 0.75rem;
			max-width: none;
		}
	}
</style>

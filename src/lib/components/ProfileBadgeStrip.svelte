<script lang="ts">
	import { badgesStore } from '$lib/stores/badges.svelte';
	import { BADGES_BY_ID, type Badge } from '$lib/data/badges';

	const MAX_SHOWN = 3;

	const svgModules = import.meta.glob('$lib/assets/emojis/*.svg', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>;

	function findSvg(slug: string): string | undefined {
		for (const [path, raw] of Object.entries(svgModules)) {
			if (path.endsWith(`/${slug}.svg`)) return raw;
		}
		return undefined;
	}

	function sizedSvg(slug: string): string {
		const raw = findSvg(slug);
		if (!raw) return '';
		return raw.replace(/<svg\b([^>]*)>/, (_m, attrs: string) => {
			const stripped = attrs.replace(/\s(width|height|class)="[^"]*"/g, '');
			return `<svg${stripped} width="22" height="22" aria-hidden="true">`;
		});
	}

	// earnedIds insertion order = earned_at asc (see hydrate query).
	// Reverse to surface most-recent first.
	const recent = $derived<Badge[]>(
		Array.from(badgesStore.earned)
			.reverse()
			.map((id) => BADGES_BY_ID[id])
			.filter((b): b is Badge => Boolean(b))
			.slice(0, MAX_SHOWN)
	);

	const total = $derived(badgesStore.earned.size);
</script>

{#if recent.length > 0}
	<a class="strip" href="/badges" aria-label="Visa alla utmärkelser">
		<span class="icons">
			{#each recent as badge (badge.id)}
				<span class="icon" title={badge.name}>
					{#if sizedSvg(badge.emojiSlug)}
						{@html sizedSvg(badge.emojiSlug)}
					{:else}
						<span class="fallback">{badge.emoji}</span>
					{/if}
				</span>
			{/each}
		</span>
		<span class="divider" aria-hidden="true"></span>
		<span class="label">
			{total}
			{total === 1 ? 'utmärkelse' : 'utmärkelser'}
		</span>
	</a>
{/if}

<style>
	.strip {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
		color: var(--color-text-muted);
	}

	.icons {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		line-height: 1;
		transition: transform 0.18s ease;
	}

	.fallback {
		font-size: 1.125rem;
		line-height: 1;
	}

	.divider {
		width: 1px;
		height: 0.875rem;
		background: var(--color-border);
	}

	.label {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text-muted);
		transition: color 0.18s ease;
	}

	.label::after {
		content: '';
		width: 0.35rem;
		height: 0.35rem;
		border-top: 1.5px solid currentColor;
		border-right: 1.5px solid currentColor;
		transform: translateY(-1px) rotate(45deg);
		opacity: 0.6;
		transition:
			transform 0.18s ease,
			opacity 0.18s ease;
	}

	.strip:hover .label,
	.strip:focus-visible .label {
		color: var(--color-accent);
	}

	.strip:hover .label::after,
	.strip:focus-visible .label::after {
		transform: translate(2px, -1px) rotate(45deg);
		opacity: 1;
	}

	.strip:hover .icon {
		transform: translateY(-1px);
	}

	.strip:focus-visible {
		outline: none;
	}
</style>

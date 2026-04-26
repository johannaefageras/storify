<script lang="ts">
	import { badgesStore } from '$lib/stores/badges.svelte';

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

	const total = $derived(badgesStore.earned.size);
	const medalSvg = sizedSvg('trophy');
</script>

{#if total > 0}
	<a class="strip" href="/badges" aria-label="Visa alla utmärkelser">
		<span class="icon" aria-hidden="true">
			{#if medalSvg}
				{@html medalSvg}
			{:else}
				<span class="fallback">🏆</span>
			{/if}
		</span>
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
		gap: 0.5rem;
		text-decoration: none;
		color: var(--color-text-muted);
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

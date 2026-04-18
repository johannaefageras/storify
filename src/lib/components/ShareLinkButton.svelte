<script lang="ts">
	import {
		shareFreshEntry,
		shareSavedEntry,
		type ShareFreshInput
	} from '$lib/utils/shareEntry';

	interface Props {
		entryId?: string;
		freshInput?: ShareFreshInput;
		className?: string;
	}

	let { entryId, freshInput, className = '' }: Props = $props();

	let isSharing = $state(false);
	let copied = $state(false);
	let error = $state('');

	async function handleShare() {
		if (isSharing) return;
		isSharing = true;
		error = '';
		try {
			const result = entryId
				? await shareSavedEntry(entryId)
				: freshInput
					? await shareFreshEntry(freshInput)
					: null;

			if (!result) {
				error = 'Inget att dela.';
				return;
			}

			await navigator.clipboard.writeText(result.url);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Kunde inte skapa delningslänk.';
			console.error('Share error:', err);
		} finally {
			isSharing = false;
		}
	}
</script>

<button class={className} onclick={handleShare} disabled={isSharing} title={error || ''}>
	{#if copied}
		<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
			<polyline points="20 6 9 17 4 12" />
		</svg>
		<span>Länk kopierad!</span>
	{:else if isSharing}
		<span class="spinner"></span>
		<span>Skapar länk...</span>
	{:else}
		<svg class="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
			<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
			<path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
		</svg>
		<span>Dela länk</span>
	{/if}
</button>

<style>
	.check,
	.link-icon {
		flex-shrink: 0;
	}

	.check {
		color: #22c55e;
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

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>

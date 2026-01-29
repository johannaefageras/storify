<script lang="ts">
	import EmojiInfoLine from './icons/EmojiInfoLine.svelte';

	interface Props {
		text: string;
	}

	let { text }: Props = $props();

	let isOpen = $state(false);
	let wrapperEl: HTMLSpanElement;

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		isOpen = !isOpen;
	}

	function handleOutsideClick(event: MouseEvent) {
		if (isOpen && wrapperEl && !wrapperEl.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleOutsideClick);
			return () => document.removeEventListener('click', handleOutsideClick);
		}
	});
</script>

<span
	class="info-tooltip-wrapper"
	class:is-open={isOpen}
	bind:this={wrapperEl}
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick(e as unknown as MouseEvent)}
	role="button"
	tabindex="0"
>
	<EmojiInfoLine size={14} class="info-icon" />
	<span class="info-tooltip">{text}</span>
</span>

<style>
	.info-tooltip-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
		cursor: help;
		margin-left: 0.25rem;
		-webkit-tap-highlight-color: transparent;
	}

	.info-tooltip-wrapper :global(.info-icon) {
		opacity: 0.5;
		transition: opacity 0.15s ease;
	}

	.info-tooltip-wrapper:hover :global(.info-icon),
	.info-tooltip-wrapper.is-open :global(.info-icon) {
		opacity: 1;
	}

	.info-tooltip {
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		padding: 0.5rem 0.75rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		text-transform: none;
		letter-spacing: var(--tracking-normal);
		color: var(--color-text);
		white-space: nowrap;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.15s ease, visibility 0.15s ease;
		z-index: 100;
		pointer-events: none;
	}

	.info-tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-top-color: var(--color-border);
	}

	.info-tooltip::before {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: var(--color-bg-elevated);
		z-index: 1;
	}

	/* Show on hover (desktop) or when open (mobile tap) */
	.info-tooltip-wrapper:hover .info-tooltip,
	.info-tooltip-wrapper.is-open .info-tooltip {
		opacity: 1;
		visibility: visible;
	}

	/* Mobile adjustments */
	@media (max-width: 600px) {
		.info-tooltip {
			white-space: normal;
			max-width: min(200px, 70vw);
			text-align: center;
		}

		/* Prevent tooltip from going off-screen on the left */
		.info-tooltip-wrapper:first-of-type .info-tooltip {
			left: 0;
			transform: translateX(0);
		}

		.info-tooltip-wrapper:first-of-type .info-tooltip::after,
		.info-tooltip-wrapper:first-of-type .info-tooltip::before {
			left: 10px;
			transform: none;
		}
	}
</style>

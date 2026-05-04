<script lang="ts">
	import { onMount } from 'svelte';
	import { getStoredConsent, setConsent } from '$lib/analytics';
	import { Emoji } from '$lib/assets/emojis';

	let visible = $state(false);

	onMount(() => {
		visible = getStoredConsent() === null;
	});

	function decide(decision: 'granted' | 'denied') {
		setConsent(decision);
		visible = false;
	}
</script>

{#if visible}
	<div class="consent-banner" role="dialog" aria-live="polite" aria-label="Cookie-samtycke">
		<div class="icon" aria-hidden="true">
			<Emoji name="cookie" size={56} />
		</div>
		<p>
			Vi använder analyscookies för att förstå hur Storify används. Inga annonscookies, ingen
			tredjepartsspårning. <a href="/cookies">Läs mer</a>.
		</p>
		<div class="actions">
			<button type="button" class="secondary" onclick={() => decide('denied')}>Avböj</button>
			<button type="button" class="primary" onclick={() => decide('granted')}>Acceptera</button>
		</div>
	</div>
{/if}

<style>
	.consent-banner {
		position: fixed;
		right: 1.25rem;
		bottom: 1.25rem;
		max-width: 22rem;
		width: calc(100% - 2rem);
		background: var(--color-bg-elevated);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 1.25rem 1.25rem 1rem;
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.04),
			0 12px 32px rgba(0, 0, 0, 0.12);
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		animation: slide-up 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}

	@media (prefers-reduced-motion: reduce) {
		.consent-banner {
			animation: none;
		}
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.25rem;
	}

	p {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		text-align: center;
	}

	p a {
		color: var(--color-text);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	p a:hover {
		color: var(--color-accent);
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		margin-top: 0.25rem;
	}

	button {
		font: inherit;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-wider);
		padding: 0.5rem 1rem;
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			transform 0.1s ease;
	}

	button:active {
		transform: scale(0.98);
	}

	.secondary {
		background: transparent;
		color: var(--color-text-muted);
	}

	.secondary:hover {
		background: var(--color-neutral);
		color: var(--color-text);
	}

	.primary {
		background: var(--color-accent);
		color: #fff;
	}

	.primary:hover {
		background: var(--color-accent-hover);
	}

	@media (max-width: 480px) {
		.consent-banner {
			right: 1rem;
			left: 1rem;
			bottom: 1rem;
			max-width: none;
			width: auto;
		}
	}
</style>

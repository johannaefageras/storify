<script lang="ts">
	import { onMount } from 'svelte';
	import { getStoredConsent, setConsent } from '$lib/analytics';

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
		left: 50%;
		bottom: 1rem;
		transform: translateX(-50%);
		max-width: 36rem;
		width: calc(100% - 2rem);
		background: var(--surface, #fff);
		color: var(--text, #111);
		border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		border-radius: 0.75rem;
		padding: 1rem 1.25rem;
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.4;
	}
	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}
	button {
		font: inherit;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		cursor: pointer;
	}
	.secondary {
		background: transparent;
		border-color: color-mix(in srgb, currentColor 20%, transparent);
		color: inherit;
	}
	.primary {
		background: var(--accent, #f43f7a);
		color: #fff;
	}
</style>

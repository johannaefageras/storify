<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { EmojiSpeechBalloon } from '$lib/assets/emojis';

	interface Props {
		onSend: (message: string) => void;
	}

	let { onSend }: Props = $props();

	const starters = [
		{ label: 'Berätta om min dag', message: 'Jag vill berätta om min dag' },
		{
			label: 'Något bra som hände?',
			message: 'Jag vill berätta om något bra som hände idag'
		},
		{
			label: 'Jag behöver ventilera',
			message: 'Jag behöver ventilera lite om min dag'
		},
		{
			label: 'Idag var speciell för att...',
			message: 'Idag var speciell för att...'
		}
	] as const;

	let firstName = $derived(wizardStore.data.profile.name.split(' ')[0]);
	let greeting = $derived(firstName ? `Hej, ${firstName}!` : 'Hej!');
</script>

<div class="empty-state">
	<div class="empty-greeting">
		<div class="greeting-icon">
			<EmojiSpeechBalloon size={96} />
		</div>
		<p class="greeting-text">{greeting}</p>
		<p class="greeting-sub">Vad vill du skriva om idag?</p>
	</div>

	<div class="starter-grid">
		{#each starters as starter}
			<button class="starter-chip" onclick={() => onSend(starter.message)}>
				{starter.label}
			</button>
		{/each}
	</div>
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.625rem;
		text-align: center;
		padding: 0;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}

	.empty-greeting {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.greeting-icon {
		display: flex;
		justify-content: center;
		margin-bottom: 0.5rem;
	}

	.greeting-text {
		font-family: var(--font-primary);
		font-size: var(--text-xl);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		margin: 0;
		line-height: var(--leading-tight);
	}

	.greeting-sub {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin: 0;
		line-height: var(--leading-normal);
	}

	.starter-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		width: 100%;
	}

	.starter-chip {
		background: var(--color-bg-elevated);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 0.75rem 0.625rem;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		cursor: pointer;
		text-align: center;
		line-height: var(--leading-tight);
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			transform 0.15s ease,
			box-shadow 0.2s ease;
	}

	.starter-chip:hover {
		background: var(--color-accent);
		color: white;
		border-color: var(--color-accent);
		box-shadow: 0 4px 12px rgba(244, 63, 122, 0.2);
		transform: translateY(-2px);
	}

	.starter-chip:active {
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.empty-state {
			gap: 0.5rem;
		}

		.greeting-text {
			font-size: var(--text-lg);
		}

		.greeting-sub {
			font-size: var(--text-xs);
		}

		.starter-chip {
			padding: 0.625rem 0.5rem;
		}

		.starter-grid {
			gap: 0.375rem;
		}
	}

	@media (max-height: 800px) {
		.empty-state {
			gap: 0.5rem;
		}

		.greeting-text {
			font-size: var(--text-lg);
		}

		.starter-chip {
			padding: 0.625rem 0.5rem;
		}

		.starter-grid {
			gap: 0.375rem;
		}
	}
</style>

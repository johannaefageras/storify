<script lang="ts">
	import { accentStore } from '$lib/stores/accent.svelte';

	import { Emoji } from '$lib/assets/emojis';
	import { getRandomWelcomeMessage } from '$lib/data/welcomeMessages';
	import { STARTER_IDS, pickStarterLabel, type StarterId } from '$lib/data/interviewOpeners';
	import { chatStore } from '$lib/stores/chat.svelte';

	interface Props {
		onStarter: (starter: StarterId) => void;
	}

	let { onStarter }: Props = $props();

	const interviewerId = chatStore.selectedInterviewer;

	const starters = STARTER_IDS.map((id) => ({
		id,
		label: pickStarterLabel(interviewerId, id)
	}));

	const welcome = getRandomWelcomeMessage(interviewerId);
</script>

<div class="empty-state">
	<div class="empty-greeting">
		<div class="greeting-icon">
			<Emoji name="hand-waving" size={96} />
		</div>
		<p class="greeting-text">{welcome.title}</p>
		<p class="greeting-sub">{welcome.greeting}</p>
	</div>

	<div class="starter-grid">
		{#each starters as starter}
			<button class="starter-chip" onclick={() => onStarter(starter.id)}>
				<span class="chip-icon">
					<Emoji name="speech-balloon" size={24} />
				</span>
				<span class="chip-text">{starter.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
		padding: 0;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}

	.empty-greeting {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.greeting-icon {
		display: flex;
		justify-content: center;
		margin-bottom: 0.625rem;
	}

	.greeting-text {
		font-family: var(--font-primary);
		font-size: var(--text-2xl) !important;
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
		gap: 0.625rem;
		width: 100%;
	}

	.chip-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		opacity: 0.9;
		transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.starter-chip:hover .chip-icon {
		opacity: 1;
	}

	.chip-text {
		flex: 1;
		min-width: 0;
	}

	.starter-chip {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: var(--color-bg-elevated);
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		padding: 0.875rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-normal);
		color: var(--color-text);
		cursor: pointer;
		text-align: center;
		line-height: var(--leading-snug);
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.starter-chip:hover {
		background: color-mix(in srgb, var(--color-accent) 12%, var(--color-bg-elevated));
		border-color: var(--color-accent);
	}

	.starter-chip:active {
		transform: scale(0.98);
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
			padding: 0.875rem 0.75rem;
			font-size: var(--text-xs);
		}

		.starter-grid {
			gap: 0.5rem;
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
			padding: 0.875rem 0.75rem;
		}

		.starter-grid {
			gap: 0.5rem;
		}
	}
</style>

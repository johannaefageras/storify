<script lang="ts">
	import { Emoji } from '$lib/assets/emojis';
	import { interviewers, type InterviewerId, type InterviewerMeta } from '$lib/data/chatbotPrompts';

	interface Props {
		onSelect: (id: InterviewerId) => void;
	}

	let { onSelect }: Props = $props();

	const options: InterviewerMeta[] = Object.values(interviewers);
</script>

<div class="selection">
	<div class="selection-header">
		<p class="heading">Välj din intervjuare</p>
		<p class="subheading">
			Hen styr samtalet. Valet syns bara här — dagboksinlägget får du välja röst för i nästa steg.
		</p>
	</div>

	<div class="card-grid">
		{#each options as option}
			<button
				type="button"
				class="interviewer-card"
				aria-label={`Välj intervjuare: ${option.name}. ${option.shortLabel}`}
				onclick={() => onSelect(option.id)}
			>
				<span class="card-icon">
					<Emoji name={option.emoji} size={48} />
				</span>
				<h3 class="card-name">{option.name}</h3>
				<p class="card-label">{option.shortLabel}</p>
				<p class="card-description">{option.description}</p>
				<p class="card-sample">"<em>{option.sampleQuestion}</em>"</p>
			</button>
		{/each}
	</div>
</div>

<style>
	.selection {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		width: 100%;
		max-width: 900px;
		margin: 0 auto;
		padding: 0;
	}

	.selection-header {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		text-align: center;
	}

	.heading {
		font-family: var(--font-primary);
		font-size: var(--text-2xl);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		margin: 0;
		line-height: var(--leading-tight);
	}

	.subheading {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin: 0;
		line-height: var(--leading-normal);
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		width: 100%;
	}

	.interviewer-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-bg-elevated);
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		padding: 1.25rem 1rem;
		font-family: var(--font-primary);
		color: var(--color-text);
		cursor: pointer;
		text-align: center;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			transform 0.1s ease;
	}

	.interviewer-card:hover {
		background: color-mix(in srgb, var(--color-accent) 12%, var(--color-bg-elevated));
		border-color: var(--color-accent);
	}

	.interviewer-card:active {
		transform: scale(0.98);
	}

	.interviewer-card:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.25rem;
	}

	.card-name {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-tight);
		margin: 0;
		line-height: var(--leading-tight);
	}

	.card-label {
		font-size: var(--text-xxs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
	}

	.card-description {
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-normal);
		color: var(--color-text);
		margin: 0;
		line-height: var(--leading-normal);
	}

	.card-sample {
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin: 0.25rem 0 0;
		line-height: var(--leading-relaxed);
	}

	.card-sample em {
		font-style: italic;
	}

	@media (max-width: 720px) {
		.card-grid {
			grid-template-columns: 1fr;
			gap: 0.625rem;
		}

		.interviewer-card {
			padding: 1rem 0.875rem;
		}

		.heading {
			font-size: var(--text-lg);
		}

		.subheading {
			font-size: var(--text-xs);
		}
	}
</style>

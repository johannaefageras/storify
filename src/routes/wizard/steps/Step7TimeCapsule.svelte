<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
</script>

<div class="step-content">
	<p class="step-intro">Vissa saker känns små just nu, men kan betyda allt om tio år. Skriv ner något du vill minnas.</p>
	<div class="field-group">
		<label class="field-label" for="memory">Vad vill du minnas från idag?</label>
		<textarea
			id="memory"
			placeholder="En tanke, ett ögonblick, en känsla. Något som hände eller något du kände..."
			bind:value={wizardStore.data.memoryFor10Years}
			rows="5"
		></textarea>
	</div>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.step-intro {
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		margin-top: 0;
	}

	.field-group {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-label {
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-normal);
		line-height: var(--leading-snug);
		color: var(--color-text);
		text-align: center;
	}

	textarea {
		width: 100%;
		padding: 1rem 1.25rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		font-stretch: 100%;
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-elevated);
		outline: none;
		resize: none;
		min-height: 8rem;
		transition: border-color 0.15s ease;
	}

	textarea:focus {
		border-color: var(--color-accent);
	}

	textarea::placeholder {
		color: var(--color-text-muted);
		font-weight: var(--weight-light);
		letter-spacing: var(--tracking-wider);
	}
</style>

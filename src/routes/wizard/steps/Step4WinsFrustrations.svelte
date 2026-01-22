<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import EmojiStep4Wins from '$lib/components/emojis/EmojiStep4Wins.svelte';
	import EmojiStep4PetPeeves from '$lib/components/emojis/EmojiStep4PetPeeves.svelte';

	const winPlaceholders = [
		'Gick upp ur sängen (Räknas).',
		'Kom iväg i tid',
		'Svarade på ett jobbigt mejl',
		'Tog mig igenom dagen',
		'Fixade en bugg',
		'Tränade, faktiskt'
	];

	const frustrationPlaceholders = [
		'Köer överallt',
		'Teknik som inte samarbetade',
		'Tappade bort nycklarna',
		'Glömde matlådan',
		'Folk som inte svarar',
		'Dåligt wifi',
	];

	function getPlaceholder(placeholders: string[], index: number): string {
		return placeholders[index % placeholders.length];
	}

	function updateWin(index: number, value: string) {
		const wins = [...wizardStore.data.wins];
		wins[index] = value;
		wizardStore.updateData('wins', wins);
	}

	function updateFrustration(index: number, value: string) {
		const frustrations = [...wizardStore.data.frustrations];
		frustrations[index] = value;
		wizardStore.updateData('frustrations', frustrations);
	}

	function addWin() {
		wizardStore.updateData('wins', [...wizardStore.data.wins, '']);
	}

	function removeWin(index: number) {
		if (wizardStore.data.wins.length > 1) {
			const wins = wizardStore.data.wins.filter((_, i) => i !== index);
			wizardStore.updateData('wins', wins);
		}
	}

	function addFrustration() {
		wizardStore.updateData('frustrations', [...wizardStore.data.frustrations, '']);
	}

	function removeFrustration(index: number) {
		if (wizardStore.data.frustrations.length > 1) {
			const frustrations = wizardStore.data.frustrations.filter((_, i) => i !== index);
			wizardStore.updateData('frustrations', frustrations);
		}
	}
</script>

<div class="step-content">
	<p class="step-intro">Det som gick oväntat bra, och det som… gick mindre bra. Alla dagar har oftast lite av varje.</p>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiStep4Wins size={23} /></span>
			Dagens wins (stort som smått)
		</span>
		<div class="repeater">
			{#each wizardStore.data.wins as win, index}
				<div class="repeater-item">
					<input
						type="text"
						placeholder={getPlaceholder(winPlaceholders, index)}
						value={win}
						oninput={(e) => updateWin(index, e.currentTarget.value)}
					/>
					{#if wizardStore.data.wins.length > 1}
						<button class="remove-btn" onclick={() => removeWin(index)}>×</button>
					{/if}
				</div>
			{/each}
			<button class="add-row-btn" onclick={addWin}>
				<span class="plus">+</span> Lägg till vinst
			</button>
		</div>
	</div>

	<div class="field-group">
		<span class="field-label">
			<span class="label-emoji"><EmojiStep4PetPeeves size={23} /></span>
			Dagens irritationsmoment
		</span>
		<div class="repeater">
			{#each wizardStore.data.frustrations as frustration, index}
				<div class="repeater-item">
					<input
						type="text"
						placeholder={getPlaceholder(frustrationPlaceholders, index)}
						value={frustration}
						oninput={(e) => updateFrustration(index, e.currentTarget.value)}
					/>
					{#if wizardStore.data.frustrations.length > 1}
						<button class="remove-btn" onclick={() => removeFrustration(index)}>×</button>
					{/if}
				</div>
			{/each}
			<button class="add-row-btn" onclick={addFrustration}>
				<span class="plus">+</span> Lägg till motgång
			</button>
		</div>
	</div>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
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
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.label-emoji {
		display: flex;
		align-items: center;
	}

	.repeater {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.repeater-item {
		display: flex;
		gap: 0.5rem;
	}

	.repeater-item input {
		flex: 1;
		padding: 0.875rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-normal);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-elevated);
		outline: none;
		transition: border-color 0.15s ease;
	}

	.repeater-item input:focus {
		border-color: var(--color-accent);
	}

	.repeater-item input::placeholder {
		color: var(--color-text-muted);
		font-weight: var(--weight-light);
		letter-spacing: var(--tracking-wider);
	}

	.remove-btn {
		width: 2.75rem;
		font-size: 1.25rem;
		color: var(--color-text-muted);
		background-color: var(--color-neutral);
		border-radius: var(--radius-sm);
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.remove-btn:hover {
		color: var(--color-text);
		background-color: var(--color-neutral-hover);
	}

	.add-row-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wider);
		color: var(--color-text-muted);
		background-color: transparent;
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-sm);
		transition:
			color 0.15s ease,
			border-color 0.15s ease;
	}

	.add-row-btn:hover {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.add-row-btn .plus {
		font-size: 1rem;
	}

	@media (max-width: 480px) {
		.repeater-item {
			flex-direction: column;
		}

		.remove-btn {
			width: 100%;
		}
	}
</style>

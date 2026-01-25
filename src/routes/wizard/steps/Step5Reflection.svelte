<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import type { Component } from 'svelte';
	import {
	EmojiConstruction,
	EmojiExclamationQuestion,
	EmojiCounterClockwise
} from '$lib/components/emojis/assorted';

	const fields: {
		key: 'almostHappened' | 'unnecessaryThing' | 'wouldRedo';
		label: string;
		placeholder: string;
		icon: Component;
	}[] = [
		{
			key: 'almostHappened',
			label: 'Något som nästan hände, nästan...',
			placeholder: 'Var nära att somna på mötet, höll på att skicka till fel person, på väg att köpa något onödigt...',
			icon: EmojiConstruction
		},
		{
			key: 'unnecessaryThing',
			label: 'Varför gjorde du ens det här?',
			placeholder: 'Kollade kylskåpet fyra gånger, scrollade TikTok i timmar, köpte energidryck nummer 3...',
			icon: EmojiExclamationQuestion
		},
		{
			key: 'wouldRedo',
			label: 'Om du fick göra om ett ögonblick från idag – vilket?',
			placeholder: 'Tagit det lugnt istället för att stressa, stannat kvar lite längre, eller gått tidigare...',
			icon: EmojiCounterClockwise
		}
	];
</script>

<div class="step-content">
	<p class="step-intro">Dagens nästan-händelser, onödiga val och önskade omtag. Det som snurrar i huvudet efteråt, även fast dagen är slut.</p>

	{#each fields as field}
		<div class="field-group">
			<label class="field-label" for={field.key}>
				<span class="label-emoji"><field.icon size={23} /></span>
				{field.label}
			</label>
			<textarea
				id={field.key}
				placeholder={field.placeholder}
				bind:value={wizardStore.data[field.key]}
				rows="2"
			></textarea>
		</div>
	{/each}
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.step-intro {
		text-align: center;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-light);
		letter-spacing: var(--tracking-wider);
		color: var(--color-text-muted);
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.label-emoji {
		display: flex;
		align-items: center;
	}

	textarea {
		width: 100%;
		padding: 0.875rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-elevated);
		outline: none;
		resize: none;
		min-height: 4rem;
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

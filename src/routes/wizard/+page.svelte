<script lang="ts">
	import { onMount } from 'svelte';
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { EmojiUserSilhouette, EmojiCompass, EmojiChart, EmojiCalendar, EmojiScale, EmojiMirror, EmojiCherries, EmojiCamera, EmojiSpeakingHead, EmojiCheck } from '$lib/components/emojis';
	import Step0Profile from './steps/Step0Profile.svelte';
	import Step1Emojis from './steps/Step1Emojis.svelte';
	import Step2Energy from './steps/Step2Energy.svelte';
	import Step3Activities from './steps/Step3Activities.svelte';
	import Step4WinsFrustrations from './steps/Step4WinsFrustrations.svelte';
	import Step5Reflection from './steps/Step5Reflection.svelte';
	import Step6FoodMusic from './steps/Step6FoodMusic.svelte';
	import Step7TimeCapsule from './steps/Step7TimeCapsule.svelte';
	import Step8Voice from './steps/Step8Voice.svelte';
	import Step9Summary from './steps/Step9Summary.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import LegalFooter from '$lib/components/LegalFooter.svelte';

	const optionalSteps = [0, 5, 6, 7];

	onMount(() => {
		// Fetch weather silently in the background (fails silently if denied or unavailable)
		wizardStore.initWeather();
	});

	let currentStep = $derived(wizardStore.currentStep);
	let progress = $derived(wizardStore.progress);
	let isResultView = $derived(wizardStore.isResultView);

	// Access data reactively to trigger re-renders
	let data = $derived(wizardStore.data);

	// Button logic - compute validity based on current step and data
	let isCurrentStepOptional = $derived(optionalSteps.includes(currentStep));

	let isCurrentStepValid = $derived.by(() => {
		switch (currentStep) {
			case 0: // Profile - optional
				return true;
			case 1: // Date & Emojis - emojis required
				return data.emojis.length > 0;
			case 2: // Sleep & Energy - has defaults, always valid
				return true;
			case 3: // Where & What - locations and activities required
				return (
					(data.locations.length > 0 || data.customLocations.length > 0) &&
					(data.activities.length > 0 || data.customActivities.length > 0)
				);
			case 4: // Wins & Frustrations - at least one win or frustration
				return (
					data.wins.some((w) => w.trim() !== '') ||
					data.frustrations.some((f) => f.trim() !== '')
				);
			case 5: // Reflections - optional
				return true;
			case 6: // Food & Music - optional
				return true;
			case 7: // Time Capsule - optional
				return true;
			case 8: // AI Voice - has default, always valid
				return data.selectedTone.trim() !== '';
			case 9: // Summary - no next button needed
				return true;
			default:
				return true;
		}
	});

	let hasFilledOptionalFields = $derived.by(() => {
		switch (currentStep) {
			case 0: // Profile
				return (
					data.profile.name.trim() !== '' ||
					data.profile.age.trim() !== '' ||
					data.profile.pronouns.trim() !== '' ||
					data.profile.hometown.trim() !== '' ||
					data.profile.family.length > 0 ||
					data.profile.pets.length > 0 ||
					data.profile.occupationType !== '' ||
					data.profile.occupationDetail.length > 0 ||
					data.profile.interests.length > 0
				);
			case 5: // Reflections
				return (
					data.almostHappened.trim() !== '' ||
					data.unnecessaryThing.trim() !== '' ||
					data.wouldRedo.trim() !== ''
				);
			case 6: // Food & Music
				return (
					data.meals.length > 0 ||
					data.customMeals.length > 0 ||
					data.soundtracks.length > 0 ||
					data.customSoundtracks.length > 0
				);
			case 7: // Time Capsule
				return data.memoryFor10Years.trim() !== '';
			default:
				return false;
		}
	});

	// Determine button text and state
	let showNextButton = $derived(currentStep < wizardStore.totalSteps - 1); // Hide on summary (step 9)
	let nextButtonDisabled = $derived(!isCurrentStepOptional && !isCurrentStepValid);
	let nextButtonText = $derived.by(() => {
		if (!isCurrentStepOptional) {
			return 'Nästa';
		}
		// Optional step: show "Hoppa över" only if no fields filled, otherwise "Nästa"
		return hasFilledOptionalFields ? 'Nästa' : 'Hoppa över';
	});

	const stepTitles = [
		'Lite om dig',
		'Hur var din dag?',
		'Hur mådde du?',
		'Vad hände idag?',
		'Vinster & Motgångar',
		'Reflektioner',
		'Sinnesintryck',
		'Minnesvärt',
		'Välj en röst',
		'Allt på plats'
	];
	const stepIcons = [
		EmojiUserSilhouette,
		EmojiCompass,
		EmojiChart,
		EmojiCalendar,
		EmojiScale,
		EmojiMirror,
		EmojiCherries,
		EmojiCamera,
		EmojiSpeakingHead,
		EmojiCheck
	];

	function isOptional(step: number): boolean {
		return optionalSteps.includes(step);
	}

	// Scroll to top when step changes
	$effect(() => {
		currentStep; // Track the step
		window.scrollTo({ top: 0, behavior: 'instant' });
	});

	function getStepTitle(step: number): string {
		return stepTitles[step] || '';
	}
</script>

<main class="wizard" class:result-view={isResultView}>
	{#if isResultView}
		<!-- No header in result view - cleaner presentation -->
	{:else}
		<header class="wizard-header">
			<div class="progress-container">
				<div class="progress-bar" style="width: {progress}%"></div>
			</div>
			<div class="header-actions">
				<ThemeToggle variant="inline" />
			</div>
			<div class="step-indicator">
				<span class="step-number">Steg {currentStep + 1} av {wizardStore.totalSteps}</span>
				{#if stepIcons[currentStep]}
					{@const StepIcon = stepIcons[currentStep]}
					<div class="step-icon"><StepIcon size={48} /></div>
				{/if}
				<h1 class="step-title">
					<span class="step-title-text">
						{getStepTitle(currentStep)}
						{#if isOptional(currentStep)}
							<span class="optional-badge">Valfritt</span>
						{/if}
					</span>
				</h1>
			</div>
		</header>
	{/if}

	<div class="wizard-content">
		{#if currentStep === 0}
			<Step0Profile />
		{:else if currentStep === 1}
			<Step1Emojis />
		{:else if currentStep === 2}
			<Step2Energy />
		{:else if currentStep === 3}
			<Step3Activities />
		{:else if currentStep === 4}
			<Step4WinsFrustrations />
		{:else if currentStep === 5}
			<Step5Reflection />
		{:else if currentStep === 6}
			<Step6FoodMusic />
		{:else if currentStep === 7}
			<Step7TimeCapsule />
		{:else if currentStep === 8}
			<Step8Voice />
		{:else if currentStep === 9}
			<Step9Summary />
		{/if}
	</div>

	{#if !isResultView}
		<footer class="wizard-footer">
			{#if currentStep > 0}
				<button class="btn btn-secondary" onclick={() => wizardStore.prevStep()}>
					Gå tillbaka
				</button>
			{:else}
				<a href="/" class="btn btn-secondary">Gå tillbaka</a>
			{/if}

			{#if showNextButton}
				<button
					class="btn btn-primary"
					onclick={() => wizardStore.nextStep()}
					disabled={nextButtonDisabled}
				>
					{nextButtonText}
				</button>
			{:else}
				<div></div>
			{/if}
		</footer>
		<LegalFooter />
	{/if}
</main>

<style>
	.wizard {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		max-width: 720px;
		margin: 0 auto;
		padding: 1.75rem 1.25rem;
	}

	.wizard-header {
		margin-bottom: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.progress-container {
		height: 4px;
		background-color: var(--color-neutral);
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 0;
	}

	.progress-bar {
		height: 100%;
		background-color: var(--color-accent);
		transition: width 0.3s ease;
	}

	.step-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		text-align: center;
	}

	.header-actions {
		display: none;
		justify-content: flex-end;
		align-items: center;
	}

	.wizard.result-view {
		padding: 1.25rem 1.25rem 2rem;
	}

	.step-number {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 115%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.step-title {
		font-family: var(--font-primary);
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-snug);
		margin-top: 0;
	}

	.step-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.8;
	}

	.step-title-text {
		position: relative;
	}

	.optional-badge {
		position: absolute;
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-left: 0.75rem;
		white-space: nowrap;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		background-color: var(--color-neutral);
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.wizard-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.wizard-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1.25rem;
		margin-top: auto;
	}

	@media (max-width: 600px) {
		.wizard {
			padding: calc(env(safe-area-inset-top, 0px) + 1.25rem) 1rem 1.25rem;
		}

		.wizard.result-view {
			padding: calc(env(safe-area-inset-top, 0px) + 1rem) 1rem 1.5rem;
		}

		.step-title {
			font-size: var(--text-xl);
		}

		.header-actions {
			display: flex;
		}

		:global(.theme-toggle:not(.inline)) {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.wizard-footer {
			flex-direction: column;
			gap: 0.75rem;
		}

		.wizard-footer .btn {
			width: 100%;
		}
	}
</style>

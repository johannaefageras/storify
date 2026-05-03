<script lang="ts">
	import { tones } from '$lib/data/tones';
	import { voiceSamples, type VoiceSample } from '$lib/data/voiceGallery';
	import DiaryCard from '$lib/components/DiaryCard.svelte';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';
	import arrowLeftSvg from '$lib/assets/icons/arrow-left.svg?raw';

	const toneIconMap: Record<string, string> = {
		'ai-robot': 'robot',
		'bored': 'fire',
		'british': 'flag-uk',
		'bureaucratic': 'archive',
		'cat-perspective': 'cat-face',
		'chaotic': 'tornado',
		'classic': 'ledger',
		'cringe': 'face-rolling-eyes',
		'cynical': 'face-unamused',
		'drama-queen': 'crown',
		'formal': 'top-hat',
		'nature-documentary': 'earth',
		'nerd': 'face-nerd',
		'overthinker': 'face-exploding-head',
		'passive-aggressive': 'headstone',
		'philosophical': 'owl',
		'quest-log': 'video-game',
		'self-help': 'woman-meditating',
		'shakespeare': 'theater-masks',
		'sportscaster': 'soccer-ball',
		'storytelling': 'open-book',
		'tabloid': 'newspaper',
		'therapist': 'brain',
		'tinfoil-hat': 'satellite',
		'bro': 'shorts',
		'action-hero': 'collision',
		'influencer': 'loudspeaker',
		'six-year-old': 'teddy-bear',
		'poet': 'feather',
		'culture-vulture': 'wine',
		'pirate': 'skull-crossbones',
		'gothenburger': 'tram'
	};

	const sampleByToneId = new Map<string, VoiceSample>(
		voiceSamples.map((s) => [s.toneId, s])
	);

	const orderedSamples = tones
		.map((t) => sampleByToneId.get(t.id))
		.filter((s): s is VoiceSample => Boolean(s));

	let selectedSample = $state<VoiceSample | null>(null);

	function openSample(sample: VoiceSample) {
		selectedSample = sample;
	}

	function closeModal() {
		selectedSample = null;
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && selectedSample && closeModal()} />

<svelte:head>
	<title>Röster — Storify</title>
	<meta
		name="description"
		content="Bläddra bland Storifys röster. Varje röst förvandlar din dag till en dagboksanteckning med sin egen ton, rytm och blick."
	/>
</svelte:head>

<div class="voices-page">
	<div class="voices-container">
		<div class="voices-header">
			<div class="header-icon">
				<UniqueEmoji><Emoji name="circus-tent" size={72} /></UniqueEmoji>
			</div>
			<h1 class="voices-title">Rösterna</h1>
			<p class="voices-subtitle">
				Storify har många röster. Klicka på en för att läsa ett dagboksprov.
			</p>
		</div>

		<div class="voices-grid">
			{#each orderedSamples as sample}
				{@const ToneIcon = toneIconMap[sample.toneId]}
				<button class="voice-card" onclick={() => openSample(sample)}>
					{#if ToneIcon}
						<span class="voice-card-icon">
							<UniqueEmoji><Emoji name={ToneIcon} size={64} /></UniqueEmoji>
						</span>
					{/if}
					<div class="voice-card-body">
						<h2 class="voice-card-name">{sample.voiceName}</h2>
						<p class="voice-card-description">{sample.description}</p>
					</div>
				</button>
			{/each}
		</div>

		<footer class="voices-footer">
			<a href="/" class="btn btn-secondary">
				<span class="back-icon">{@html arrowLeftSvg}</span>
				Tillbaka
			</a>
		</footer>
	</div>
	<LegalFooter />
</div>

{#if selectedSample}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="modal-overlay" onclick={closeModal} role="button" tabindex="-1">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="modal-content"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-label="Röstprov"
			tabindex="-1"
		>
			<DiaryCard
				weekday={selectedSample.weekday}
				date={selectedSample.date}
				emojis={selectedSample.emojiIds}
				toneId={selectedSample.toneId}
				generatedText={selectedSample.generatedText}
				title={selectedSample.title}
				birthday={selectedSample.birthday}
				onClose={closeModal}
			/>
		</div>
	</div>
{/if}

<style>
	.voices-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		padding-top: 1rem;
	}

	.voices-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 1100px;
	}

	.voices-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.8;
		margin-bottom: 0.75rem;
	}

	.voices-title {
		font-family: var(--font-primary);
		font-size: var(--text-3xl);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
	}

	.voices-subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		margin: 0 auto;
		max-width: 36rem;
	}

	.voices-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
		gap: 0.75rem;
	}

	@media (max-width: 600px) {
		.voices-grid {
			grid-template-columns: 1fr;
		}
	}

	.voice-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-items: center;
		text-align: center;
		padding: 1.25rem 1rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-top: 3px solid var(--color-accent);
		border-radius: var(--radius-md);
		cursor: pointer;
		font-family: var(--font-primary);
		color: var(--color-text);
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.voice-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px color-mix(in srgb, var(--color-accent) 12%, transparent);
	}

	.voice-card-icon {
		flex: 0 0 64px;
		width: 64px;
		height: 64px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.voice-card-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		min-width: 0;
	}

	.voice-card-name {
		font-family: var(--font-primary);
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		line-height: var(--leading-snug);
		color: var(--color-text);
		margin: 0;
	}

	.voice-card-description {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		line-height: var(--leading-base);
		margin: 0;
		font-weight: var(--weight-regular);
	}

	.voices-footer {
		display: flex;
		justify-content: flex-start;
		padding-top: 2.25rem;
		margin-top: auto;
	}

	.back-icon {
		display: inline-flex;
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		z-index: 1000;
		padding: 2rem 1rem;
		overflow-y: auto;
		animation: fadeIn 0.15s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-content {
		position: relative;
		width: 100%;
		max-width: var(--content-width);
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		padding: 1.25rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		animation: slideUp 0.2s ease;
	}

	@keyframes slideUp {
		from { transform: translateY(10px); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}

	@media (max-width: 600px) {
		.voices-page {
			padding: 1rem;
			padding-top: 0.5rem;
		}

		.modal-overlay {
			padding: 1rem 0.75rem;
		}
	}
</style>

<script lang="ts">
	import { tones } from '$lib/data/tones';
	import { emojiSvgMap } from '$lib/data/emojiSvgs';
	import { uniqueSvgIds } from '$lib/utils/uniqueSvgIds';
	import { getRenderParagraphs, formatParagraph } from '$lib/utils/paragraphs';
	import { getZodiacFromBirthday } from '$lib/utils/zodiac';
	import { Emoji } from '$lib/assets/emojis';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';

	interface Props {
		weekday: string;
		date: string;
		emojis: string[];
		toneId: string;
		generatedText: string;
		birthday?: string;
	}

	let { weekday, date, emojis, toneId, generatedText, birthday = '' }: Props = $props();

	let element: HTMLDivElement = $state(null!);
	export function getElement() {
		return element;
	}

	const zodiacComponents: Record<string, string> = {
		aries: 'zodiac-aries',
		taurus: 'zodiac-taurus',
		gemini: 'zodiac-gemini',
		cancer: 'zodiac-cancer',
		leo: 'zodiac-leo',
		virgo: 'zodiac-virgo',
		libra: 'zodiac-libra',
		scorpio: 'zodiac-scorpio',
		sagittarius: 'zodiac-sagittarius',
		capricorn: 'zodiac-capricorn',
		aquarius: 'zodiac-aquarius',
		pisces: 'zodiac-pisces'
	};

	const toneIconMap: Record<string, string> = {
		'ai-robot': 'robot',
		'bored': 'face-yawning',
		'british': 'flag-uk',
		'bureaucratic': 'archive',
		'cat-perspective': 'cat',
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
		'sportscaster': 'studio-microphone',
		'storytelling': 'open-book',
		'tabloid': 'newspaper',
		'therapist': 'brain',
		'tinfoil-hat': 'satellite',
		'bro': 'shorts',
		'action-hero': 'collision',
		'influencer': 'loudspeaker',
		'six-year-old': 'teddy-bear'
	};

	function getEmojiSvg(emojiId: string): string | undefined {
		return emojiSvgMap.get(emojiId);
	}

	function getZodiacComponent(): string | undefined {
		if (!birthday) return undefined;
		const sign = getZodiacFromBirthday(birthday);
		if (!sign) return undefined;
		return zodiacComponents[sign.id];
	}

	const renderParagraphs = $derived(getRenderParagraphs(generatedText));
	const tone = $derived(tones.find((t) => t.id === toneId));
	const ToneIcon = $derived(toneIconMap[toneId]);
</script>

<div class="pdf-document" bind:this={element}>
	<div class="pdf-header">
		<div class="pdf-emojis">
			{#each emojis as emojiId}
				{@const svg = getEmojiSvg(emojiId)}
				{#if svg}
					<span class="pdf-emoji">{@html uniqueSvgIds(svg)}</span>
				{/if}
			{/each}
		</div>
		<h1 class="pdf-title">{weekday}, {date}</h1>
	</div>

	<div class="pdf-content">
		{#each renderParagraphs as paragraph}
			{#if paragraph.type === 'horoscope-heading'}
				{@const ZodiacIcon = getZodiacComponent()}
				<p class="pdf-addon-heading">
					{#if ZodiacIcon}
						<span class="pdf-addon-icon"><UniqueEmoji><Emoji name={ZodiacIcon} size={20} /></UniqueEmoji></span>
					{:else}
						<span class="pdf-addon-icon"><UniqueEmoji><Emoji name="crystal-ball" size={20} /></UniqueEmoji></span>
					{/if}
					<span>{@html formatParagraph(paragraph.text)}</span>
				</p>
			{:else if paragraph.type === 'onthisday-heading'}
				<p class="pdf-addon-heading">
					<span class="pdf-addon-icon"><UniqueEmoji><Emoji name="mantelpiece-clock" size={20} /></UniqueEmoji></span>
					<span>{@html formatParagraph(paragraph.text)}</span>
				</p>
			{:else if paragraph.type === 'homework-heading'}
				<p class="pdf-addon-heading">
					<span class="pdf-addon-icon"><UniqueEmoji><Emoji name="light-bulb" size={20} /></UniqueEmoji></span>
					<span>{@html formatParagraph(paragraph.text)}</span>
				</p>
			{:else}
				<p>
					{@html formatParagraph(paragraph.text)}
				</p>
			{/if}
		{/each}
	</div>

	<div class="pdf-footer">
		{#if tone}
			{#if ToneIcon}
				<span class="pdf-tone-icon"><UniqueEmoji><Emoji name={ToneIcon} size={24} /></UniqueEmoji></span>
			{/if}
			<span class="pdf-tone-name">{tone.name}</span>
		{/if}
	</div>
</div>

<style>
	.pdf-document {
		position: fixed;
		left: -9999px;
		top: 0;
		width: 794px;
		padding: 2.5rem 3.5rem;
		background: #ffffff;
		font-family: var(--font-primary);
		box-sizing: border-box;
	}

	.pdf-header {
		margin-bottom: 2rem;
	}

	.pdf-emojis {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.pdf-emoji {
		display: flex;
		align-items: center;
		width: 44px;
		height: 44px;
	}

	.pdf-emoji :global(svg) {
		width: 100%;
		height: 100%;
	}

	.pdf-title {
		font-family: var(--font-primary);
		font-size: 32px;
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: #1a1a1a;
		margin: 0;
		line-height: 1.2;
	}

	.pdf-content {
		font-family: var(--font-primary);
		font-size: 19px;
		font-weight: var(--weight-book);
		line-height: 1.75;
		letter-spacing: var(--tracking-wide);
		color: #1a1a1a;
	}

	.pdf-content p {
		margin: 0 0 1.25rem 0;
		text-align: left;
	}

	.pdf-content p:last-child {
		margin-bottom: 0;
	}

	.pdf-content p:first-child {
		font-weight: var(--weight-medium);
		font-size: 21px;
	}

	.pdf-content p.pdf-addon-heading {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-weight: var(--weight-medium);
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
	}

	.pdf-addon-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.pdf-footer {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 2.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
	}

	.pdf-tone-icon {
		display: flex;
		align-items: center;
		opacity: 0.6;
	}

	.pdf-tone-name {
		font-family: var(--font-primary);
		font-size: 14px;
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: #666;
	}

</style>

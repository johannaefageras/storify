<script lang="ts">
	import { tones } from '$lib/data/tones';
	import { jomojiSvgMap } from '$lib/data/jomojis';
	import { uniqueSvgIds } from '$lib/utils/uniqueSvgIds';
	import type { Component } from 'svelte';
	import { EmojiCrystalBall, EmojiBooks, EmojiScroll, EmojiZodiacAries, EmojiZodiacTaurus, EmojiZodiacGemini, EmojiZodiacCancer, EmojiZodiacLeo, EmojiZodiacVirgo, EmojiZodiacLibra, EmojiZodiacScorpio, EmojiZodiacSagittarius, EmojiZodiacCapricorn, EmojiZodiacAquarius, EmojiZodiacPisces, EmojiRobot, EmojiFaceYawning, EmojiFlagUk, EmojiArchive, EmojiCat, EmojiTornado, EmojiLedger, EmojiFaceGrimacing, EmojiFaceUnamused, EmojiTopHat, EmojiHeartOnFire, EmojiFaceUpsideDown, EmojiOwl, EmojiVideoGame, EmojiWomanDetective, EmojiCrown, EmojiEarth, EmojiMicrophone, EmojiPoo, EmojiBrain, EmojiOpenBook, EmojiSatellite, EmojiWomanMeditating, EmojiNewspaper, EmojiMusicalNotes, EmojiTheaterMasks, EmojiFaceNerd, EmojiFaceExplodingHead } from '$lib/assets/emojis';
	import UniqueEmoji from '$lib/components/UniqueEmoji.svelte';
	import { getZodiacFromBirthday } from '$lib/utils/zodiac';

	interface Props {
		weekday: string;
		date: string;
		emojis: string[];
		toneId: string;
		generatedText: string;
		birthday?: string;
	}

	let { weekday, date, emojis, toneId, generatedText, birthday = '' }: Props = $props();

	// Expose the document element for parent image/PDF export
	let documentElement: HTMLDivElement = $state(null!);
	export function getDocumentElement() {
		return documentElement;
	}

	const zodiacComponents: Record<string, Component> = {
		aries: EmojiZodiacAries,
		taurus: EmojiZodiacTaurus,
		gemini: EmojiZodiacGemini,
		cancer: EmojiZodiacCancer,
		leo: EmojiZodiacLeo,
		virgo: EmojiZodiacVirgo,
		libra: EmojiZodiacLibra,
		scorpio: EmojiZodiacScorpio,
		sagittarius: EmojiZodiacSagittarius,
		capricorn: EmojiZodiacCapricorn,
		aquarius: EmojiZodiacAquarius,
		pisces: EmojiZodiacPisces
	};

	const toneIconMap: Record<string, Component> = {
		'ai-robot': EmojiRobot,
		'bored': EmojiFaceYawning,
		'british': EmojiFlagUk,
		'bureaucratic': EmojiArchive,
		'cat-perspective': EmojiCat,
		'chaotic': EmojiTornado,
		'classic': EmojiLedger,
		'cringe': EmojiFaceGrimacing,
		'cynical': EmojiFaceUnamused,
		'detective': EmojiWomanDetective,
		'drama-queen': EmojiCrown,
		'formal': EmojiTopHat,
		'melodramatic': EmojiHeartOnFire,
		'meme': EmojiPoo,
		'nature-documentary': EmojiEarth,
		'nerd': EmojiFaceNerd,
		'overthinker': EmojiFaceExplodingHead,
		'passive-aggressive': EmojiFaceUpsideDown,
		'philosophical': EmojiOwl,
		'quest-log': EmojiVideoGame,
		'self-help': EmojiWomanMeditating,
		'shakespeare': EmojiTheaterMasks,
		'sportscaster': EmojiMicrophone,
		'storytelling': EmojiOpenBook,
		'tabloid': EmojiNewspaper,
		'therapist': EmojiBrain,
		'tinfoil-hat': EmojiSatellite,
		'troubadour': EmojiMusicalNotes
	};

	type ParagraphType = 'horoscope-heading' | 'onthisday-heading' | 'homework-heading' | 'regular';
	type RenderParagraph = { type: ParagraphType; text: string };

	function getParagraphType(text: string): ParagraphType {
		const trimmed = text.trim().replace(/^\*+|\*+$/g, '');
		if (/^Horoskop för /i.test(trimmed) || /^Horoscope for /i.test(trimmed)) {
			return 'horoscope-heading';
		}
		if (
			/^På denna dag(?:[\s.!:…—–-]*)$/i.test(trimmed) ||
			/^On this day(?:[\s.!:…—–-]*)$/i.test(trimmed)
		) {
			return 'onthisday-heading';
		}
		if (/^Hemläxa/i.test(trimmed) || /^Homework/i.test(trimmed)) {
			return 'homework-heading';
		}
		return 'regular';
	}

	function formatParagraph(text: string): string {
		return text
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/\n/g, '<br>');
	}

	function isSeparatorParagraph(text: string): boolean {
		return /^-{3,}$/.test(text.trim());
	}

	function getRenderParagraphs(entry: string): RenderParagraph[] {
		if (!entry) return [];
		const paragraphs = entry.split(/\n{2,}/);
		const result: RenderParagraph[] = [];

		for (const paragraph of paragraphs) {
			if (!paragraph.trim()) continue;
			if (isSeparatorParagraph(paragraph)) continue;

			const paragraphType = getParagraphType(paragraph);
			if (paragraphType === 'regular') {
				result.push({ type: 'regular', text: paragraph });
				continue;
			}

			const lines = paragraph
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line && !isSeparatorParagraph(line));
			if (lines.length === 0) continue;

			result.push({ type: paragraphType, text: lines[0] });

			if (lines.length > 1) {
				result.push({ type: 'regular', text: lines.slice(1).join('\n') });
			}
		}

		return result;
	}

	function getEmojiSvg(emojiId: string): string | undefined {
		return jomojiSvgMap.get(emojiId);
	}

	function getToneIcon(id: string): Component | undefined {
		return toneIconMap[id];
	}

	function getZodiacComponent(): Component | undefined {
		if (!birthday) return undefined;
		const sign = getZodiacFromBirthday(birthday);
		if (!sign) return undefined;
		return zodiacComponents[sign.id];
	}

	const renderParagraphs = $derived(getRenderParagraphs(generatedText));
	const tone = $derived(tones.find((t) => t.id === toneId));
	const ToneIcon = $derived(getToneIcon(toneId));
</script>

<div class="result-document" bind:this={documentElement}>
	<div class="paper-texture"></div>

	<div class="document-header">
		<div class="document-date">
			<span class="document-weekday">{weekday}</span>
			<span class="document-date-text">{date}</span>
		</div>
		<span class="document-emojis">
			{#each emojis as emojiId}
				{@const svg = getEmojiSvg(emojiId)}
				{#if svg}
					<span class="document-emoji">{@html uniqueSvgIds(svg)}</span>
				{/if}
			{/each}
		</span>
	</div>

	<div class="document-content">
		{#each renderParagraphs as paragraph}
			{#if paragraph.type === 'horoscope-heading'}
				{@const ZodiacIcon = getZodiacComponent()}
				<p class="addon-heading">
					{#if ZodiacIcon}
						<span class="addon-icon"><UniqueEmoji><ZodiacIcon size={24} /></UniqueEmoji></span>
					{:else}
						<span class="addon-icon"><UniqueEmoji><EmojiCrystalBall size={24} /></UniqueEmoji></span>
					{/if}
					<span>{@html formatParagraph(paragraph.text)}</span>
				</p>
			{:else if paragraph.type === 'onthisday-heading'}
				<p class="addon-heading">
					<span class="addon-icon"><UniqueEmoji><EmojiScroll size={24} /></UniqueEmoji></span>
					<span>{@html formatParagraph(paragraph.text)}</span>
				</p>
			{:else if paragraph.type === 'homework-heading'}
				<p class="addon-heading">
					<span class="addon-icon"><UniqueEmoji><EmojiBooks size={24} /></UniqueEmoji></span>
					<span>{@html formatParagraph(paragraph.text)}</span>
				</p>
			{:else}
				<p>
					{@html formatParagraph(paragraph.text)}
				</p>
			{/if}
		{/each}
	</div>

	<div class="document-footer">
		<div class="footer-line"></div>
		<div class="footer-content">
			{#if tone}
				<div class="document-tone">
					{#if ToneIcon}
						<span class="tone-icon"><UniqueEmoji><ToneIcon size={30} /></UniqueEmoji></span>
					{/if}
					<span class="tone-name">{tone.name}</span>
				</div>
			{/if}
			<span class="brand-text">Berättat av Storify</span>
		</div>
	</div>
</div>

<style>
	.result-document {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem;
		font-family: var(--font-primary);
		background-color: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.04),
			0 4px 12px rgba(0, 0, 0, 0.03),
			0 8px 32px rgba(0, 0, 0, 0.02);
		overflow: hidden;
	}

	.paper-texture {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
		opacity: 0.02;
		pointer-events: none;
	}

	.document-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.document-emojis {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.document-emoji {
		display: flex;
		align-items: center;
		width: 30px;
		height: 30px;
	}

	.document-emoji :global(svg) {
		width: 100%;
		height: 100%;
	}

	.document-date {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.125rem;
	}

	.document-weekday {
		font-size: var(--text-xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		color: var(--color-text);
	}

	.document-date-text {
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.document-content {
		font-size: var(--text-base);
		font-weight: var(--weight-book);
		line-height: var(--leading-loose);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.document-content p {
		margin: 0 0 1.125rem 0;
		text-indent: 0;
	}

	.document-content p:first-child {
		font-weight: var(--weight-medium);
	}

	.document-content p:last-child {
		margin-bottom: 0;
	}

	.document-content p.addon-heading {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-weight: var(--weight-medium);
		margin-top: 1.5rem;
	}

	.document-content p.addon-heading:first-child {
		margin-top: 0;
		padding-top: 0;
		border-top: none;
	}

	.addon-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.document-footer {
		display: flex;
		flex-direction: column;
	}

	.footer-line {
		height: 1px;
		background: var(--color-border);
		margin-bottom: 1.25rem;
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.document-tone {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.tone-icon {
		display: flex;
		align-items: center;
	}

	.tone-name {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.brand-text {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-accent-hover);
		transition: color 0.2s ease, opacity 0.2s ease;
		cursor: default;
	}

	.brand-text:hover {
		color: var(--color-accent);
		opacity: 1;
	}

	@media (max-width: 640px) {
		.result-document {
			padding: 1.5rem;
			gap: 1rem;
		}

		.document-header {
			padding-bottom: 1rem;
		}

		.document-weekday {
			font-size: var(--text-lg);
		}

		.document-emojis {
			gap: 0.5rem;
		}

		.document-emoji :global(svg) {
			width: 24px;
			height: 24px;
		}

		.footer-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}
	}
</style>

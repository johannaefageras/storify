export type ParagraphType = 'horoscope-heading' | 'onthisday-heading' | 'homework-heading' | 'regular';
export type RenderParagraph = { type: ParagraphType; text: string };

export function getParagraphType(text: string): ParagraphType {
	const trimmed = text.trim().replace(/^\*+|\*+$/g, '');
	if (/^Horoskop för /i.test(trimmed) || /^Horoscope for /i.test(trimmed)) {
		return 'horoscope-heading';
	}
	if (
		/^På denna dag(?:[\s.!…—–-]*)$/i.test(trimmed) ||
		/^On this day(?:[\s.!…—–-]*)$/i.test(trimmed)
	) {
		return 'onthisday-heading';
	}
	if (/^Hemläxa(?:[\s.!…—–-]*)$/i.test(trimmed) || /^Homework(?:[\s.!…—–-]*)$/i.test(trimmed)) {
		return 'homework-heading';
	}
	return 'regular';
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function isSafeUrl(url: string): boolean {
	return /^(https?:\/\/|mailto:)/i.test(url.trim());
}

const LINK_PLACEHOLDER_PREFIX = '\u0000LINK';
const LINK_PLACEHOLDER_SUFFIX = '\u0000';

export function formatParagraph(text: string): string {
	const links: Array<{ text: string; href: string }> = [];
	const withPlaceholders = text.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (match, linkText, href) => {
		if (!isSafeUrl(href)) return match;
		const i = links.length;
		links.push({ text: linkText, href });
		return `${LINK_PLACEHOLDER_PREFIX}${i}${LINK_PLACEHOLDER_SUFFIX}`;
	});

	let formatted = escapeHtml(withPlaceholders)
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/\n/g, '<br>');

	formatted = formatted.replace(/\u0000LINK(\d+)\u0000/g, (_, i) => {
		const link = links[Number(i)];
		return `<a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.text)}</a>`;
	});

	return formatted;
}

export function isSeparatorParagraph(text: string): boolean {
	return /^-{3,}$/.test(text.trim());
}

export function getRenderParagraphs(entry: string): RenderParagraph[] {
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

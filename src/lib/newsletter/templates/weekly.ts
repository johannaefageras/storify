import { escapeHtml } from '../../validation/sanitizers';
import type { WeeklyContent, EntryExcerpt, WeekStats } from '../selectWeeklyContent';

export type RenderWeeklyEmailOptions = {
	firstName: string;
	content: WeeklyContent;
	unsubscribeUrl: string;
	newEntryUrl: string;
	journalBaseUrl?: string;
};

export type RenderedEmail = {
	subject: string;
	html: string;
};

const BRAND_INK = '#1a1a1a';
const BRAND_MUTED = '#666666';
const BRAND_FAINT = '#888888';
const BRAND_BORDER = '#eeeeee';
const BRAND_BG = '#f5f5f5';
const BRAND_ACCENT = '#f43f7a';

export function renderWeeklyEmail(opts: RenderWeeklyEmailOptions): RenderedEmail {
	const firstName = opts.firstName?.trim() || 'Kära dagboksskrivare';
	const safeName = escapeHtml(firstName);
	const journalBase = opts.journalBaseUrl ?? 'https://mystorify.se/journal';

	if (opts.content.variant === 'skip') {
		// Defensive: the sender should never call render on 'skip', but avoid throwing.
		return {
			subject: '',
			html: ''
		};
	}

	if (opts.content.variant === 'nudge') {
		return renderNudge(safeName, opts.content.promptText, opts.unsubscribeUrl, opts.newEntryUrl);
	}

	return renderRecap(
		safeName,
		opts.content.entries,
		opts.content.stats,
		opts.unsubscribeUrl,
		opts.newEntryUrl,
		journalBase
	);
}

function renderRecap(
	safeName: string,
	entries: EntryExcerpt[],
	stats: WeekStats,
	unsubscribeUrl: string,
	newEntryUrl: string,
	journalBase: string
): RenderedEmail {
	const subject = `Din vecka: ${stats.entriesCount} ${stats.entriesCount === 1 ? 'inlägg' : 'inlägg'}`;

	const entryBlocks = entries
		.map((entry) => renderEntryBlock(entry, journalBase))
		.join('\n');

	const statsLine = renderStatsLine(stats);

	const body = `
		<p style="margin: 0 0 16px 0; font-size: 16px; color: ${BRAND_INK}; line-height: 1.6;">
			Hej ${safeName}!
		</p>
		<p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_INK}; line-height: 1.6;">
			Här är utdrag från din vecka i My Storify.
		</p>
		${entryBlocks}
		${statsLine}
		${renderCtaButton(newEntryUrl, 'Skriv dagens inlägg')}
	`;

	return {
		subject,
		html: renderShell(body, unsubscribeUrl, 'Din vecka i My Storify')
	};
}

function renderNudge(
	safeName: string,
	promptText: string,
	unsubscribeUrl: string,
	newEntryUrl: string
): RenderedEmail {
	const subject = 'En tanke från My Storify';
	const safePrompt = escapeHtml(promptText);

	const body = `
		<p style="margin: 0 0 16px 0; font-size: 16px; color: ${BRAND_INK}; line-height: 1.6;">
			Hej ${safeName}!
		</p>
		<p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_INK}; line-height: 1.6;">
			Ingen dagbok den här veckan — ingen fara. Här är en fråga att bära med sig:
		</p>
		<blockquote style="margin: 0 0 24px 0; padding: 20px 24px; background: ${BRAND_BG}; border-left: 3px solid ${BRAND_ACCENT}; border-radius: 6px;">
			<p style="margin: 0; font-size: 18px; color: ${BRAND_INK}; line-height: 1.5; font-style: italic;">
				${safePrompt}
			</p>
		</blockquote>
		<p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND_INK}; line-height: 1.6;">
			Känns det som en ingång? Öppna ett nytt inlägg så är vi med dig.
		</p>
		${renderCtaButton(newEntryUrl, 'Skriv dagens inlägg')}
	`;

	return {
		subject,
		html: renderShell(body, unsubscribeUrl, 'En tanke från My Storify')
	};
}

function renderEntryBlock(entry: EntryExcerpt, journalBase: string): string {
	const safeDate = escapeHtml(entry.date);
	const safeExcerpt = escapeHtml(entry.excerpt);
	const safeEmojis = entry.emojis.map((e) => escapeHtml(e)).join(' ');
	const safeId = encodeURIComponent(entry.id);
	const entryUrl = `${journalBase}#entry-${safeId}`;

	return `
		<div style="padding: 16px 0; border-bottom: 1px solid ${BRAND_BORDER};">
			<p style="margin: 0 0 8px 0; font-size: 13px; color: ${BRAND_MUTED}; text-transform: uppercase; letter-spacing: 0.5px;">
				${safeDate}${safeEmojis ? ` · ${safeEmojis}` : ''}
			</p>
			<p style="margin: 0 0 8px 0; font-size: 16px; color: ${BRAND_INK}; line-height: 1.6;">
				${safeExcerpt}
			</p>
			<p style="margin: 0;">
				<a href="${entryUrl}" style="font-size: 14px; color: ${BRAND_ACCENT}; text-decoration: none;">
					Läs hela inlägget →
				</a>
			</p>
		</div>
	`;
}

function renderStatsLine(stats: WeekStats): string {
	const parts: string[] = [];
	parts.push(`${stats.entriesCount} ${stats.entriesCount === 1 ? 'inlägg' : 'inlägg'}`);
	parts.push(`${stats.totalWords} ord`);

	return `
		<p style="margin: 24px 0 24px 0; font-size: 14px; color: ${BRAND_MUTED}; line-height: 1.6;">
			Den här veckan: ${parts.join(' · ')}.
		</p>
	`;
}

function renderCtaButton(href: string, label: string): string {
	return `
		<div style="text-align: center; margin: 32px 0 8px 0;">
			<a href="${href}" style="display: inline-block; background-color: ${BRAND_ACCENT}; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 2px; font-size: 16px; font-weight: 600; letter-spacing: 0.025em;">
				${escapeHtml(label)}
			</a>
		</div>
	`;
}

function renderShell(body: string, unsubscribeUrl: string, heading: string): string {
	const safeHeading = escapeHtml(heading);
	return `<!DOCTYPE html>
<html lang="sv">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${safeHeading}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
	<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
		<div style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
			<div style="border-bottom: 1px solid ${BRAND_BORDER}; padding-bottom: 20px; margin-bottom: 24px;">
				<h1 style="margin: 0; font-size: 22px; font-weight: 600; color: ${BRAND_INK};">${safeHeading}</h1>
			</div>
			${body}
			<div style="border-top: 1px solid ${BRAND_BORDER}; padding-top: 20px; margin-top: 32px;">
				<p style="margin: 0 0 8px 0; font-size: 12px; color: ${BRAND_FAINT}; line-height: 1.5;">
					Du får detta för att du prenumererar på My Storifys veckobrev.
				</p>
				<p style="margin: 0; font-size: 12px; color: ${BRAND_FAINT}; line-height: 1.5;">
					<a href="${unsubscribeUrl}" style="color: ${BRAND_FAINT}; text-decoration: underline;">Avprenumerera</a>
				</p>
			</div>
		</div>
	</div>
</body>
</html>`;
}

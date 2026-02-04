import { marked, type MarkedOptions } from 'marked';

// Configure marked for safe email HTML output
const markedOptions: MarkedOptions = {
	async: false,
	gfm: true,
	breaks: true
};

// Remove potential XSS vectors and clean user input
export function sanitizeString(input: string): string {
	if (!input) return '';

	return (
		input
			.trim()
			// Remove HTML tags
			.replace(/<[^>]*>/g, '')
			// Remove javascript: protocol
			.replace(/javascript:/gi, '')
			// Remove event handlers
			.replace(/on\w+\s*=/gi, '')
			// Normalize whitespace
			.replace(/\s+/g, ' ')
	);
}

export function sanitizeArray(items: string[]): string[] {
	if (!items) return [];

	return items.map(sanitizeString).filter((item) => item.length > 0);
}

// Escape HTML for safe insertion in email templates
export function escapeHtml(unsafe: string): string {
	if (!unsafe) return '';

	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

// Markdown-to-HTML conversion for emails using marked
// Note: Does NOT escape HTML in input - callers should sanitize if needed
export function safeMarkdownToHtml(text: string): string {
	if (!text) return '';

	const html = marked.parse(text, markedOptions) as string;
	return html.trim();
}

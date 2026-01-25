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

// Safe markdown-to-HTML conversion for emails
// Only allows bold (**) and italic (*) - escapes everything else first
export function safeMarkdownToHtml(text: string): string {
	if (!text) return '';

	// First escape all HTML
	let safe = escapeHtml(text);

	// Then apply safe markdown transformations
	safe = safe
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		.replace(/\n/g, '<br>');

	return safe;
}

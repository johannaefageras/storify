import { getApiUrl } from '$lib/config';

// Client-side helper used by the four entry creation flows. Returns null if
// the title couldn't be generated (rate limit, network error, etc.) — callers
// save the entry without a title rather than blocking.
export async function generateTitle(text: string, toneId?: string): Promise<string | null> {
	if (!text.trim()) return null;
	try {
		const res = await fetch(getApiUrl('/api/title'), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text, toneId })
		});
		if (!res.ok) return null;
		const data = await res.json();
		return data.success && typeof data.title === 'string' ? data.title : null;
	} catch {
		return null;
	}
}

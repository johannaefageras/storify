import { getApiUrl } from '$lib/config';

export interface ShareFreshInput {
	generated_text: string;
	tone_id: string;
	entry_date: string;
	emojis?: string[];
	weekday?: string | null;
}

export interface ShareResult {
	shareId: string;
	url: string;
}

function buildShareUrl(shareId: string): string {
	const origin =
		typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
	return `${origin}/shared/${shareId}`;
}

async function postShare(body: Record<string, unknown>): Promise<ShareResult> {
	const res = await fetch(getApiUrl('/api/share'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	const payload = await res.json().catch(() => ({}));
	if (!res.ok || !payload?.shareId) {
		throw new Error(payload?.error || 'Kunde inte skapa delningslänk.');
	}
	const shareId = String(payload.shareId);
	return { shareId, url: buildShareUrl(shareId) };
}

export function shareSavedEntry(entryId: string): Promise<ShareResult> {
	return postShare({ entryId });
}

export function shareFreshEntry(input: ShareFreshInput): Promise<ShareResult> {
	return postShare({ ...input });
}

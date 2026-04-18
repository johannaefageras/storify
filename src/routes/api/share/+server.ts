import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server';
import { tones } from '$lib/data/tones';
import { LIMITS } from '$lib/validation';
import { checkRateLimit, getClientIdentifier } from '$lib/validation/ratelimit';

const toneIds = new Set(tones.map((t) => t.id));
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMOJI_ID_PATTERN = /^[a-z0-9-]+$/i;
const WEEKDAY_PATTERN = /^[\p{L}\s.-]{1,30}$/u;

function isValidIsoDate(value: string): boolean {
	if (!DATE_PATTERN.test(value)) return false;
	const d = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function generateShareId(): string {
	// 16 url-safe chars (~96 bits) — enough to make enumeration impractical
	const bytes = new Uint8Array(12);
	crypto.getRandomValues(bytes);
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	const clientId = getClientIdentifier(request);
	const rl = await checkRateLimit(`share:${clientId}`);
	if (!rl.success) {
		return json({ error: 'För många försök. Försök igen senare.' }, { status: 429 });
	}

	const supabase = createSupabaseServerClient(cookies);
	const { data: { user } } = await supabase.auth.getUser();

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Ogiltigt format.' }, { status: 400 });
	}

	if (!body || typeof body !== 'object') {
		return json({ error: 'Ogiltigt format.' }, { status: 400 });
	}

	const payload = body as Record<string, unknown>;

	// Path A: share an existing saved entry (must be owner).
	if (typeof payload.entryId === 'string' && payload.entryId) {
		if (!user) {
			return json({ error: 'Inte inloggad.' }, { status: 401 });
		}

		const { data: existing, error: fetchError } = await supabase
			.from('entries')
			.select('id, user_id, share_id, is_public')
			.eq('id', payload.entryId)
			.maybeSingle();

		if (fetchError || !existing) {
			return json({ error: 'Hittade inte inlägget.' }, { status: 404 });
		}
		if (existing.user_id !== user.id) {
			return json({ error: 'Saknar behörighet.' }, { status: 403 });
		}

		if (existing.share_id && existing.is_public) {
			return json({ shareId: existing.share_id });
		}

		const shareId = existing.share_id || generateShareId();
		const { error: updateError } = await supabase
			.from('entries')
			.update({ share_id: shareId, is_public: true })
			.eq('id', existing.id);

		if (updateError) {
			console.error('Share update error:', updateError);
			return json({ error: 'Kunde inte skapa delningslänk.' }, { status: 500 });
		}
		return json({ shareId });
	}

	// Path B: share a freshly-generated entry that isn't saved yet (anon or logged-in).
	const generatedText = typeof payload.generated_text === 'string' ? payload.generated_text.trim() : '';
	const toneId = typeof payload.tone_id === 'string' ? payload.tone_id.trim() : '';
	const entryDate = typeof payload.entry_date === 'string' ? payload.entry_date.trim() : '';

	if (!generatedText || !toneId || !entryDate) {
		return json({ error: 'Saknar obligatoriska fält.' }, { status: 400 });
	}
	if (generatedText.length > LIMITS.GENERATED_ENTRY) {
		return json({ error: 'Texten är för lång.' }, { status: 400 });
	}
	if (!toneIds.has(toneId)) {
		return json({ error: 'Ogiltig röst.' }, { status: 400 });
	}
	if (!isValidIsoDate(entryDate)) {
		return json({ error: 'Ogiltigt datum.' }, { status: 400 });
	}

	let emojis: string[] = [];
	if (payload.emojis !== undefined) {
		if (!Array.isArray(payload.emojis) || payload.emojis.length > LIMITS.MAX_EMOJIS) {
			return json({ error: 'Ogiltiga emojis.' }, { status: 400 });
		}
		for (const e of payload.emojis) {
			if (typeof e !== 'string') return json({ error: 'Ogiltiga emojis.' }, { status: 400 });
			const n = e.trim();
			if (!n || n.length > 80 || !EMOJI_ID_PATTERN.test(n)) {
				return json({ error: 'Ogiltiga emojis.' }, { status: 400 });
			}
			emojis.push(n);
		}
	}

	let weekday: string | null = null;
	if (typeof payload.weekday === 'string' && payload.weekday.trim()) {
		const n = payload.weekday.replace(/\s+/g, ' ').trim();
		if (!WEEKDAY_PATTERN.test(n)) return json({ error: 'Ogiltig veckodag.' }, { status: 400 });
		weekday = n;
	}

	const shareId = generateShareId();
	const { error: insertError } = await supabase.from('entries').insert({
		user_id: user?.id ?? null,
		generated_text: generatedText,
		tone_id: toneId,
		entry_date: entryDate,
		weekday,
		emojis,
		share_id: shareId,
		is_public: true
	});

	if (insertError) {
		console.error('Share insert error:', insertError);
		return json({ error: 'Kunde inte skapa delningslänk.' }, { status: 500 });
	}

	return json({ shareId });
};

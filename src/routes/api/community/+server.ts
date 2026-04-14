import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseServerClient } from '$lib/supabase/server';
import { tones } from '$lib/data/tones';
import { LIMITS } from '$lib/validation';
import { checkRateLimit, getClientIdentifier } from '$lib/validation/ratelimit';

const toneIds = new Set(tones.map((tone) => tone.id));
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMOJI_ID_PATTERN = /^[a-z0-9-]+$/i;
const WEEKDAY_PATTERN = /^[\p{L}\s.-]{1,30}$/u;

interface CommunityPostBody {
	generated_text?: unknown;
	tone_id?: unknown;
	entry_date?: unknown;
	display_name?: unknown;
	emojis?: unknown;
	weekday?: unknown;
}

function isValidIsoDate(value: string): boolean {
	if (!DATE_PATTERN.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function normalizeCommunityPost(body: unknown):
	| {
			success: true;
			value: {
				generated_text: string;
				tone_id: string;
				entry_date: string;
				display_name: string;
				emojis: string[];
				weekday: string | null;
			};
	  }
	| { success: false; error: string } {
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return { success: false, error: 'Ogiltigt format.' };
	}

	const payload = body as CommunityPostBody;

	if (
		typeof payload.generated_text !== 'string' ||
		typeof payload.tone_id !== 'string' ||
		typeof payload.entry_date !== 'string'
	) {
		return { success: false, error: 'Saknar obligatoriska fält.' };
	}

	const generatedText = payload.generated_text.trim();
	const toneId = payload.tone_id.trim();
	const entryDate = payload.entry_date.trim();

	if (!generatedText || !toneId || !entryDate) {
		return { success: false, error: 'Saknar obligatoriska fält.' };
	}

	if (generatedText.length > LIMITS.GENERATED_ENTRY) {
		return { success: false, error: 'Texten är för lång.' };
	}

	if (!toneIds.has(toneId)) {
		return { success: false, error: 'Ogiltig röst.' };
	}

	if (!isValidIsoDate(entryDate)) {
		return { success: false, error: 'Ogiltigt datum.' };
	}

	let displayName = 'Anonym';
	if (typeof payload.display_name === 'string') {
		displayName = payload.display_name
			.replace(/<[^>]*>/g, '')
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, 50) || 'Anonym';
	}

	let emojis: string[] = [];
	if (payload.emojis !== undefined) {
		if (!Array.isArray(payload.emojis)) {
			return { success: false, error: 'Ogiltiga emojis.' };
		}
		if (payload.emojis.length > LIMITS.MAX_EMOJIS) {
			return { success: false, error: 'För många emojis.' };
		}
		const normalizedEmojis = payload.emojis.map((emoji) => {
			if (typeof emoji !== 'string') {
				return null;
			}
			const normalized = emoji.trim();
			if (!normalized || normalized.length > 80 || !EMOJI_ID_PATTERN.test(normalized)) {
				return null;
			}
			return normalized;
		});
		if (normalizedEmojis.some((emoji) => emoji === null)) {
			return { success: false, error: 'Ogiltiga emojis.' };
		}
		emojis = normalizedEmojis as string[];
	}

	let weekday: string | null = null;
	if (typeof payload.weekday === 'string' && payload.weekday.trim()) {
		const normalizedWeekday = payload.weekday.replace(/\s+/g, ' ').trim();
		if (!WEEKDAY_PATTERN.test(normalizedWeekday)) {
			return { success: false, error: 'Ogiltig veckodag.' };
		}
		weekday = normalizedWeekday;
	}

	return {
		success: true,
		value: {
			generated_text: generatedText,
			tone_id: toneId,
			entry_date: entryDate,
			display_name: displayName,
			emojis,
			weekday
		}
	};
}

/**
 * GET /api/community
 * Fetch paginated community entries (newest first).
 * Query params:
 *   page    (default 1)
 *   limit   (default 20, max 50)
 *   search  (full-text search, Swedish config)
 *   tone    (filter by tone_id)
 *   from    (entry_date >= YYYY-MM-DD)
 *   to      (entry_date <= YYYY-MM-DD)
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
	const supabase = createSupabaseServerClient(cookies);
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20));
	const offset = (page - 1) * limit;

	const search = url.searchParams.get('search')?.trim() || '';
	const tone = url.searchParams.get('tone')?.trim() || '';
	const dateFrom = url.searchParams.get('from')?.trim() || '';
	const dateTo = url.searchParams.get('to')?.trim() || '';

	let query = supabase
		.from('community_entries')
		.select('*', { count: 'exact' });

	if (search) {
		const pattern = `%${search}%`;
		query = query.or(`generated_text.ilike.${pattern},display_name.ilike.${pattern}`);
	}

	if (tone && toneIds.has(tone)) {
		query = query.eq('tone_id', tone);
	}

	if (dateFrom && DATE_PATTERN.test(dateFrom)) {
		query = query.gte('entry_date', dateFrom);
	}

	if (dateTo && DATE_PATTERN.test(dateTo)) {
		query = query.lte('entry_date', dateTo);
	}

	const { data, error, count } = await query
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		console.error('Community fetch error:', error);
		return json({ success: false, error: 'Kunde inte hämta inlägg.' }, { status: 500 });
	}

	return json({
		success: true,
		entries: data || [],
		total: count || 0,
		page,
		limit
	});
};

/**
 * POST /api/community
 * Share a diary entry to the community.
 * Works for both logged-in and anonymous users.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const supabase = createSupabaseServerClient(cookies);

	const clientId = getClientIdentifier(request);
	const rateLimitResult = await checkRateLimit(`community:${clientId}`);

	if (!rateLimitResult.success) {
		return json(
			{
				success: false,
				error: 'Du har delat för många inlägg. Försök igen senare.'
			},
			{
				status: 429,
				headers: {
					'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000))
				}
			}
		);
	}

	if (!env.SUPABASE_SERVICE_ROLE_KEY) {
		console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
		return json(
			{ success: false, error: 'Gemenskapsdelning är inte konfigurerad.' },
			{ status: 500 }
		);
	}

	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Ogiltigt format.' }, { status: 400 });
	}

	const normalized = normalizeCommunityPost(body);
	if (!normalized.success) {
		return json({ success: false, error: normalized.error }, { status: 400 });
	}
	const { generated_text, tone_id, entry_date, display_name, emojis, weekday } = normalized.value;

	// Create excerpt from the first ~150 chars, trimmed to last whole word
	const rawExcerpt = generated_text.replace(/\n+/g, ' ').trim();
	let excerpt = rawExcerpt.slice(0, 150);
	if (rawExcerpt.length > 150) {
		const lastSpace = excerpt.lastIndexOf(' ');
		if (lastSpace > 80) excerpt = excerpt.slice(0, lastSpace);
		excerpt += '…';
	}

	// Check if user is logged in (optional)
	const {
		data: { user }
	} = await supabase.auth.getUser();

	const adminSupabase = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	const { data, error } = await adminSupabase.from('community_entries').insert({
		user_id: user?.id || null,
		display_name,
		entry_date,
		tone_id,
		generated_text,
		excerpt,
		emojis,
		weekday
	}).select().single();

	if (error) {
		console.error('Community insert error:', error);
		return json({ success: false, error: 'Kunde inte spara inlägget.' }, { status: 500 });
	}

	return json({ success: true, entry: data });
};

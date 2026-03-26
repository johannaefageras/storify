import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server';

/**
 * GET /api/community
 * Fetch paginated community entries (newest first).
 * Query params: page (default 1), limit (default 20)
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
	const supabase = createSupabaseServerClient(cookies);
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20));
	const offset = (page - 1) * limit;

	const { data, error, count } = await supabase
		.from('community_entries')
		.select('*', { count: 'exact' })
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

	let body: {
		generated_text: string;
		tone_id: string;
		entry_date: string;
		display_name?: string;
		emojis?: string[];
		weekday?: string;
	};

	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Ogiltigt format.' }, { status: 400 });
	}

	const { generated_text, tone_id, entry_date, display_name, emojis, weekday } = body;

	if (!generated_text || !tone_id || !entry_date) {
		return json({ success: false, error: 'Saknar obligatoriska fält.' }, { status: 400 });
	}

	if (generated_text.length > 20000) {
		return json({ success: false, error: 'Texten är för lång.' }, { status: 400 });
	}

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

	const { data, error } = await supabase.from('community_entries').insert({
		user_id: user?.id || null,
		display_name: display_name?.trim().slice(0, 50) || 'Anonym',
		entry_date,
		tone_id,
		generated_text,
		excerpt,
		emojis: emojis || [],
		weekday: weekday || null
	}).select().single();

	if (error) {
		console.error('Community insert error:', error);
		return json({ success: false, error: 'Kunde inte spara inlägget.' }, { status: 500 });
	}

	return json({ success: true, entry: data });
};

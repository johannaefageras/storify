import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { RequestHandler } from './$types';
import { getBadgeRouteUser } from '$lib/server/badges-auth';

export const GET: RequestHandler = async (event) => {
	const user = await getBadgeRouteUser(event);
	if (!user) {
		return json({ error: 'Inte inloggad.' }, { status: 401 });
	}

	if (!env.SUPABASE_SERVICE_ROLE_KEY) {
		console.error('[badges] SUPABASE_SERVICE_ROLE_KEY missing');
		return json({ error: 'Badge-laddning kunde inte köras.' }, { status: 500 });
	}

	const admin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	const { data, error } = await admin
		.from('user_badges')
		.select('badge_id, earned_at, seen_at')
		.eq('user_id', user.id)
		.order('earned_at', { ascending: true });

	if (error) {
		console.error('[badges] list failed:', error);
		return json({ error: 'Kunde inte ladda utmärkelser.' }, { status: 500 });
	}

	return json({ rows: data ?? [] });
};

import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { RequestHandler } from './$types';
import { backfillBadges } from '$lib/gamification/backfill';
import { checkBadgeRateLimit } from '$lib/validation/ratelimit';
import { getBadgeRouteUser } from '$lib/server/badges-auth';

export const POST: RequestHandler = async (event) => {
	const { url } = event;
	const user = await getBadgeRouteUser(event);
	if (!user) {
		return json({ error: 'Inte inloggad.' }, { status: 401 });
	}

	const rl = await checkBadgeRateLimit(`badges-backfill:${user.id}`);
	if (!rl.success) {
		return json({ error: 'För många försök.' }, { status: 429 });
	}

	if (!env.SUPABASE_SERVICE_ROLE_KEY) {
		console.error('[badges] SUPABASE_SERVICE_ROLE_KEY missing');
		return json(
			{
				error: 'Badge-scanningen kunde inte köras eftersom serverkonfiguration saknas.'
			},
			{ status: 500 }
		);
	}

	const admin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	const force = url.searchParams.get('force') === '1';

	try {
		const { newlyEarned, skipped } = await backfillBadges(admin, user.id, { force });
		return json({ newlyEarned, skipped });
	} catch (err) {
		console.error('[badges] backfill failed:', err);
		return json(
			{
				error: 'Badge-scanningen misslyckades på servern.'
			},
			{ status: 500 }
		);
	}
};

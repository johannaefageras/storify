import { redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { getSameOriginRedirectPath } from '$lib/utils/redirect';
import { checkAndAward } from '$lib/gamification/award';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const next = getSameOriginRedirectPath(url.searchParams.get('next'));

	if (code) {
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			// Both criteria are one-shot (return true when fired); checkAndAward
			// dedupes against user_badges so firing on every login is safe.
			const userId = data.user?.id;
			if (userId && env.SUPABASE_SERVICE_ROLE_KEY) {
				const admin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
					auth: { persistSession: false }
				});
				await checkAndAward(admin, userId, 'account-created');
				await checkAndAward(admin, userId, 'first-login');
			}
			throw redirect(303, next);
		}
	}

	// Auth failed — redirect to login with error indicator
	throw redirect(303, '/login?error=auth');
};

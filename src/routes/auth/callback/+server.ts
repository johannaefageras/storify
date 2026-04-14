import { redirect } from '@sveltejs/kit';
import { getSameOriginRedirectPath } from '$lib/utils/redirect';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const next = getSameOriginRedirectPath(url.searchParams.get('next'));

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			throw redirect(303, next);
		}
	}

	// Auth failed — redirect to login with error indicator
	throw redirect(303, '/login?error=auth');
};

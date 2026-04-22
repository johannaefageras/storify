import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

type SafeGetSession = () => Promise<{ session: { access_token?: string } | null; user: { id: string } | null }>;

function getBearerToken(request: Request): string | null {
	const auth = request.headers.get('authorization');
	if (!auth) return null;
	const match = /^Bearer\s+(.+)$/i.exec(auth);
	return match?.[1] ?? null;
}

export async function getBadgeRouteUser(
	event: Pick<RequestEvent, 'request' | 'locals'>
): Promise<{ id: string } | null> {
	const safeGetSession = event.locals.safeGetSession as SafeGetSession | undefined;
	if (safeGetSession) {
		const { user } = await safeGetSession();
		if (user) return user;
	}

	const token = getBearerToken(event.request);
	if (!token) return null;

	const client = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: { persistSession: false, autoRefreshToken: false }
	});
	const { data, error } = await client.auth.getUser(token);
	if (error) {
		console.error('[badges] bearer auth failed:', error.message);
		return null;
	}
	return data.user ? { id: data.user.id } : null;
}

export function hasBadgeServiceRole(): boolean {
	return Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
}

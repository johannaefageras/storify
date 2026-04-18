import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

const ANON_SHARE_TTL_DAYS = 30;

function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

export const POST: RequestHandler = async ({ request }) => {
	const secret = env.CLEANUP_SECRET;
	if (!secret) {
		return json({ error: 'Cleanup not configured.' }, { status: 503 });
	}

	const auth = request.headers.get('authorization') ?? '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
	if (!token || !timingSafeEqual(token, secret)) {
		return json({ error: 'Unauthorized.' }, { status: 401 });
	}

	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceRoleKey) {
		return json({ error: 'Service role key missing.' }, { status: 503 });
	}

	const admin = createClient(PUBLIC_SUPABASE_URL, serviceRoleKey, {
		auth: { persistSession: false, autoRefreshToken: false }
	});

	const cutoff = new Date(Date.now() - ANON_SHARE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

	const { data, error } = await admin
		.from('entries')
		.delete()
		.is('user_id', null)
		.lt('created_at', cutoff)
		.select('id');

	if (error) {
		console.error('Cleanup error:', error);
		return json({ error: 'Cleanup failed.' }, { status: 500 });
	}

	return json({ deleted: data?.length ?? 0, cutoff });
};

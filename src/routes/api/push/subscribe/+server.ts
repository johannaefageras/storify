import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// CORS headers for Capacitor native app (matches /api/email pattern).
// Note: native Capacitor won't deliver browser Push API events — this endpoint
// only stores subscriptions that the browser PushManager produced.
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

export const OPTIONS: RequestHandler = async () => {
	return new Response(null, { headers: corsHeaders });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return json({ success: false, error: 'Not authenticated' }, { status: 401, headers: corsHeaders });
	}

	let body: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });
	}

	const endpoint = body.endpoint;
	const p256dh = body.keys?.p256dh;
	const auth = body.keys?.auth;
	if (!endpoint || !p256dh || !auth) {
		return json({ success: false, error: 'Missing subscription fields' }, { status: 400, headers: corsHeaders });
	}

	const { error } = await locals.supabase
		.from('push_subscriptions')
		.upsert(
			{
				user_id: user.id,
				endpoint,
				p256dh,
				auth,
				platform: 'web',
				user_agent: request.headers.get('user-agent')
			},
			{ onConflict: 'endpoint' }
		);

	if (error) {
		console.error('push subscribe error:', error);
		return json({ success: false, error: 'Could not save subscription' }, { status: 500, headers: corsHeaders });
	}

	return json({ success: true }, { headers: corsHeaders });
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return json({ success: false, error: 'Not authenticated' }, { status: 401, headers: corsHeaders });
	}

	let body: { endpoint?: string };
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });
	}

	if (!body.endpoint) {
		return json({ success: false, error: 'Missing endpoint' }, { status: 400, headers: corsHeaders });
	}

	const { error } = await locals.supabase
		.from('push_subscriptions')
		.delete()
		.eq('user_id', user.id)
		.eq('endpoint', body.endpoint);

	if (error) {
		console.error('push unsubscribe error:', error);
		return json({ success: false, error: 'Could not remove subscription' }, { status: 500, headers: corsHeaders });
	}

	return json({ success: true }, { headers: corsHeaders });
};

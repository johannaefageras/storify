import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyIntegrityToken, isIntegrityConfigured } from '$lib/server/playIntegrity';

// CORS headers for Capacitor native app
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

// Handle CORS preflight
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, { headers: corsHeaders });
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Check if credentials are configured
		if (!isIntegrityConfigured()) {
			console.warn('Play Integrity verification not configured - skipping');
			return json({ verified: true, skipped: true }, { headers: corsHeaders });
		}

		const { token, nonce } = await request.json();

		if (!token || !nonce) {
			return json(
				{ verified: false, error: 'Token and nonce are required' },
				{ status: 400, headers: corsHeaders }
			);
		}

		// Verify the token
		const result = await verifyIntegrityToken(token, nonce);

		if (!result.valid) {
			console.warn('Integrity verification failed:', result.reason);
			return json(
				{ verified: false, reason: result.reason },
				{ status: 403, headers: corsHeaders }
			);
		}

		return json({ verified: true }, { headers: corsHeaders });
	} catch (error) {
		console.error('Integrity verification error:', error);
		return json(
			{
				verified: false,
				error: error instanceof Error ? error.message : 'Verification failed'
			},
			{ status: 500, headers: corsHeaders }
		);
	}
};

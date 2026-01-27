import { env } from '$env/dynamic/private';

// Helper to get env vars (they may not exist)
const getProjectId = () => env.GOOGLE_CLOUD_PROJECT_ID;
const getCredentials = () => env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

interface IntegrityVerdict {
	requestDetails: {
		requestPackageName: string;
		nonce: string;
		timestampMillis: string;
	};
	appIntegrity: {
		appRecognitionVerdict: 'PLAY_RECOGNIZED' | 'UNRECOGNIZED_VERSION' | 'UNEVALUATED';
		packageName?: string;
		certificateSha256Digest?: string[];
		versionCode?: number;
	};
	deviceIntegrity: {
		deviceRecognitionVerdict: string[];
	};
	accountDetails: {
		appLicensingVerdict: 'LICENSED' | 'UNLICENSED' | 'UNEVALUATED';
	};
}

interface DecodeResponse {
	tokenPayloadExternal: IntegrityVerdict;
}

async function getAccessToken(): Promise<string> {
	const credentialsJson = getCredentials();
	if (!credentialsJson) {
		throw new Error('Google credentials not configured');
	}

	const credentials = JSON.parse(credentialsJson);

	// Create JWT for service account authentication
	const header = {
		alg: 'RS256',
		typ: 'JWT'
	};

	const now = Math.floor(Date.now() / 1000);
	const claim = {
		iss: credentials.client_email,
		scope: 'https://www.googleapis.com/auth/playintegrity',
		aud: 'https://oauth2.googleapis.com/token',
		iat: now,
		exp: now + 3600
	};

	// Encode header and claim
	const base64Header = btoa(JSON.stringify(header))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
	const base64Claim = btoa(JSON.stringify(claim))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');

	const signatureInput = `${base64Header}.${base64Claim}`;

	// Import the private key and sign
	const privateKeyPem = credentials.private_key;
	const pemContents = privateKeyPem
		.replace('-----BEGIN PRIVATE KEY-----', '')
		.replace('-----END PRIVATE KEY-----', '')
		.replace(/\n/g, '');

	const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

	const cryptoKey = await crypto.subtle.importKey(
		'pkcs8',
		binaryKey,
		{
			name: 'RSASSA-PKCS1-v1_5',
			hash: 'SHA-256'
		},
		false,
		['sign']
	);

	const signature = await crypto.subtle.sign(
		'RSASSA-PKCS1-v1_5',
		cryptoKey,
		new TextEncoder().encode(signatureInput)
	);

	const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');

	const jwt = `${signatureInput}.${base64Signature}`;

	// Exchange JWT for access token
	const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion: jwt
		})
	});

	if (!tokenResponse.ok) {
		const error = await tokenResponse.text();
		throw new Error(`Failed to get access token: ${error}`);
	}

	const tokenData = await tokenResponse.json();
	return tokenData.access_token;
}

async function decodeIntegrityToken(token: string): Promise<IntegrityVerdict> {
	const accessToken = await getAccessToken();

	const response = await fetch(
		`https://playintegrity.googleapis.com/v1/${getProjectId()}:decodeIntegrityToken`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				integrityToken: token
			})
		}
	);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to decode integrity token: ${error}`);
	}

	const data: DecodeResponse = await response.json();
	return data.tokenPayloadExternal;
}

function validateVerdict(
	verdict: IntegrityVerdict,
	expectedNonce: string
): { valid: boolean; reason?: string } {
	// Verify nonce matches
	if (verdict.requestDetails.nonce !== expectedNonce) {
		return { valid: false, reason: 'Nonce mismatch' };
	}

	// Verify package name
	if (verdict.requestDetails.requestPackageName !== 'com.storify.app') {
		return { valid: false, reason: 'Invalid package name' };
	}

	// Check device integrity - require at least MEETS_DEVICE_INTEGRITY
	const deviceVerdict = verdict.deviceIntegrity.deviceRecognitionVerdict;
	const hasDeviceIntegrity = deviceVerdict.includes('MEETS_DEVICE_INTEGRITY');

	if (!hasDeviceIntegrity) {
		return { valid: false, reason: 'Device integrity check failed' };
	}

	// Check app integrity - require PLAY_RECOGNIZED for production
	const appVerdict = verdict.appIntegrity.appRecognitionVerdict;
	if (appVerdict !== 'PLAY_RECOGNIZED' && appVerdict !== 'UNEVALUATED') {
		// UNEVALUATED can occur during testing or for unpublished apps
		return { valid: false, reason: 'App integrity check failed' };
	}

	return { valid: true };
}

/**
 * Check if Play Integrity verification is configured
 */
export function isIntegrityConfigured(): boolean {
	return !!(getProjectId() && getCredentials());
}

/**
 * Verify a Play Integrity token from an API request.
 * Returns { valid: true } if verification passes or is skipped (not configured).
 * Returns { valid: false, reason: string } if verification fails.
 */
export async function verifyIntegrityToken(
	token: string | null,
	nonce: string | null
): Promise<{ valid: boolean; reason?: string; skipped?: boolean }> {
	// Skip verification if not configured
	if (!isIntegrityConfigured()) {
		return { valid: true, skipped: true };
	}

	// If token/nonce not provided, allow request (for web clients)
	if (!token || !nonce) {
		return { valid: true, skipped: true };
	}

	try {
		const verdict = await decodeIntegrityToken(token);
		return validateVerdict(verdict, nonce);
	} catch (error) {
		console.error('Integrity verification error:', error);
		return {
			valid: false,
			reason: error instanceof Error ? error.message : 'Verification failed'
		};
	}
}

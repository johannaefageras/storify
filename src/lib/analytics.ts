import { browser } from '$app/environment';

declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
		dataLayer?: unknown[];
	}
}

const CONSENT_KEY = 'ga_consent_v2';

// Query param keys whose VALUES expose auth, identity, or private capability tokens.
// `id` is intentionally NOT redacted — too generic, would kill legitimate funnel analysis.
const SENSITIVE_QUERY_KEYS = new Set([
	'token',
	'access_token',
	'refresh_token',
	'token_hash',
	'code',
	'email',
	'session_id',
	'share_id',
	'shareid'
]);

// Path patterns whose dynamic segment is itself a private capability token.
// /shared/<shareId> is a capability URL granting read access to a private entry.
const SENSITIVE_PATH_REDACTIONS: Array<{ prefix: string; segmentIndex: number }> = [
	{ prefix: '/shared/', segmentIndex: 2 }
];

export type SanitizedUrl = { path: string; location: string };

export function sanitizeUrl(input: URL): SanitizedUrl {
	const u = new URL(input.href);

	for (const key of [...u.searchParams.keys()]) {
		if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
			u.searchParams.set(key, 'redacted');
		}
	}

	for (const rule of SENSITIVE_PATH_REDACTIONS) {
		if (u.pathname.startsWith(rule.prefix)) {
			const parts = u.pathname.split('/');
			if (parts[rule.segmentIndex]) {
				parts[rule.segmentIndex] = '[redacted]';
				u.pathname = parts.join('/');
			}
		}
	}

	return {
		path: u.pathname + u.search,
		location: u.toString()
	};
}

export const analyticsReady = (): boolean => browser && typeof window.gtag === 'function';

export function trackPageView(toUrl: URL, fromUrl: URL | null) {
	if (!analyticsReady()) return;
	const to = sanitizeUrl(toUrl);
	window.gtag!('event', 'page_view', {
		page_path: to.path,
		page_location: to.location,
		page_title: document.title,
		page_referrer: fromUrl ? sanitizeUrl(fromUrl).location : undefined
	});
}

export function track(event: string, params: Record<string, unknown> = {}) {
	if (!analyticsReady()) return;
	window.gtag!('event', event, params);
}

export type Consent = 'granted' | 'denied';

export function getStoredConsent(): Consent | null {
	if (!browser) return null;
	try {
		const v = localStorage.getItem(CONSENT_KEY);
		return v === 'granted' || v === 'denied' ? v : null;
	} catch {
		return null;
	}
}

export function setConsent(decision: Consent) {
	if (!browser) return;
	try {
		localStorage.setItem(CONSENT_KEY, decision);
	} catch {
		/* storage may be unavailable in private mode */
	}
	if (!analyticsReady()) return;
	window.gtag!('consent', 'update', {
		analytics_storage: decision,
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied'
	});
}

export function applyStoredConsent() {
	const decision = getStoredConsent();
	if (decision) setConsent(decision);
}

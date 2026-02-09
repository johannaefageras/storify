import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';

// Initialize Redis client (lazy - only when needed)
let ratelimit: Ratelimit | null = null;

function getRateLimiter(): Ratelimit | null {
	if (ratelimit) return ratelimit;

	const upstashUrl = env.UPSTASH_REDIS_REST_URL;
	const upstashToken = env.UPSTASH_REDIS_REST_TOKEN;

	if (!upstashUrl || !upstashToken) {
		console.error('Upstash credentials not configured. Rate limiting will fail closed.');
		return null;
	}

	const redis = new Redis({
		url: upstashUrl,
		token: upstashToken
	});

	ratelimit = new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
		analytics: true
	});

	return ratelimit;
}

export interface RateLimitResult {
	success: boolean;
	remaining: number;
	reset: number;
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
	const limiter = getRateLimiter();

	if (!limiter) {
		// Rate limiting not configured - fail closed to prevent abuse
		console.error('Rate limiter unavailable. Blocking request.');
		return { success: false, remaining: 0, reset: Date.now() + 60_000 };
	}

	try {
		const { success, remaining, reset } = await limiter.limit(identifier);
		return { success, remaining, reset };
	} catch (error) {
		console.error('Rate limit check failed:', error);
		// On error, fail closed to prevent abuse
		return { success: false, remaining: 0, reset: Date.now() + 60_000 };
	}
}

// Extract IP from SvelteKit request
export function getClientIdentifier(request: Request): string {
	// Vercel sets x-forwarded-for header
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}

	// Fallback to x-real-ip
	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp;
	}

	// Final fallback
	return 'unknown';
}

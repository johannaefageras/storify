import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { limitMock, RatelimitMock, RedisMock } = vi.hoisted(() => {
	const limitMock = vi.fn();
	function RatelimitCtor(this: { limit: typeof limitMock }) {
		this.limit = limitMock;
	}
	(RatelimitCtor as unknown as { slidingWindow: (...a: unknown[]) => unknown }).slidingWindow = (
		...args
	) => ({ kind: 'slidingWindow', args });
	const RatelimitMock = vi.fn(RatelimitCtor as unknown as () => void);
	(RatelimitMock as unknown as { slidingWindow: (...a: unknown[]) => unknown }).slidingWindow = (
		...args
	) => ({ kind: 'slidingWindow', args });
	function RedisCtor() {}
	const RedisMock = vi.fn(RedisCtor as unknown as () => void);
	return { limitMock, RatelimitMock, RedisMock };
});

vi.mock('@upstash/ratelimit', () => ({
	Ratelimit: RatelimitMock
}));

vi.mock('@upstash/redis', () => ({
	Redis: RedisMock
}));

// Default to credentials present; individual tests override via vi.doMock + resetModules
vi.mock('$env/dynamic/private', () => ({
	env: {
		UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
		UPSTASH_REDIS_REST_TOKEN: 'test-token'
	}
}));

beforeEach(() => {
	vi.resetModules();
	limitMock.mockReset();
	RatelimitMock.mockClear();
	RedisMock.mockClear();
});

afterEach(() => {
	vi.doUnmock('$env/dynamic/private');
});

async function loadModule() {
	return await import('./ratelimit');
}

type RatelimitConfig = { prefix?: string };

function getRatelimitConstructionConfigs(): RatelimitConfig[] {
	return (RatelimitMock.mock.calls as unknown as Array<[RatelimitConfig]>).map(([cfg]) => cfg);
}

describe('checkRateLimit', () => {
	it('returns success result from limiter', async () => {
		limitMock.mockResolvedValueOnce({ success: true, remaining: 9, reset: 1234 });
		const { checkRateLimit } = await loadModule();
		const result = await checkRateLimit('1.2.3.4');
		expect(result).toEqual({ success: true, remaining: 9, reset: 1234 });
		expect(limitMock).toHaveBeenCalledWith('1.2.3.4');
	});

	it('returns failure when limiter denies', async () => {
		limitMock.mockResolvedValueOnce({ success: false, remaining: 0, reset: 9999 });
		const { checkRateLimit } = await loadModule();
		const result = await checkRateLimit('1.2.3.4');
		expect(result).toEqual({ success: false, remaining: 0, reset: 9999 });
	});

	it('fails closed when Upstash credentials are missing', async () => {
		vi.doMock('$env/dynamic/private', () => ({
			env: { UPSTASH_REDIS_REST_URL: undefined, UPSTASH_REDIS_REST_TOKEN: undefined }
		}));
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { checkRateLimit } = await loadModule();
		const result = await checkRateLimit('1.2.3.4');
		expect(result.success).toBe(false);
		expect(result.remaining).toBe(0);
		expect(result.reset).toBeGreaterThan(Date.now());
		expect(limitMock).not.toHaveBeenCalled();
		errSpy.mockRestore();
	});

	it('fails closed when limiter throws', async () => {
		limitMock.mockRejectedValueOnce(new Error('redis down'));
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { checkRateLimit } = await loadModule();
		const result = await checkRateLimit('1.2.3.4');
		expect(result.success).toBe(false);
		expect(result.remaining).toBe(0);
		expect(result.reset).toBeGreaterThan(Date.now());
		errSpy.mockRestore();
	});

	it('reuses the same limiter instance across calls', async () => {
		limitMock.mockResolvedValue({ success: true, remaining: 1, reset: 0 });
		const { checkRateLimit } = await loadModule();
		await checkRateLimit('a');
		await checkRateLimit('b');
		// One Ratelimit construction for the generate limiter
		const generateConstructions = getRatelimitConstructionConfigs().filter((cfg) => !cfg.prefix);
		expect(generateConstructions).toHaveLength(1);
	});
});

describe('checkChatRateLimit', () => {
	it('uses chat-prefixed limiter with 50/hr window', async () => {
		limitMock.mockResolvedValueOnce({ success: true, remaining: 49, reset: 1 });
		const { checkChatRateLimit } = await loadModule();
		await checkChatRateLimit('ip');
		const chatCall = getRatelimitConstructionConfigs().find(
			(cfg) => cfg.prefix === 'ratelimit:chat'
		);
		expect(chatCall).toBeDefined();
	});

	it('fails closed on missing credentials', async () => {
		vi.doMock('$env/dynamic/private', () => ({
			env: { UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '' }
		}));
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { checkChatRateLimit } = await loadModule();
		const result = await checkChatRateLimit('ip');
		expect(result.success).toBe(false);
		errSpy.mockRestore();
	});

	it('fails closed when limiter throws', async () => {
		limitMock.mockRejectedValueOnce(new Error('boom'));
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { checkChatRateLimit } = await loadModule();
		const result = await checkChatRateLimit('ip');
		expect(result.success).toBe(false);
		errSpy.mockRestore();
	});
});

describe('checkBadgeRateLimit', () => {
	it('uses badges-prefixed limiter', async () => {
		limitMock.mockResolvedValueOnce({ success: true, remaining: 119, reset: 1 });
		const { checkBadgeRateLimit } = await loadModule();
		await checkBadgeRateLimit('ip');
		const call = getRatelimitConstructionConfigs().find(
			(cfg) => cfg.prefix === 'ratelimit:badges'
		);
		expect(call).toBeDefined();
	});

	it('fails closed when limiter throws', async () => {
		limitMock.mockRejectedValueOnce(new Error('boom'));
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { checkBadgeRateLimit } = await loadModule();
		const result = await checkBadgeRateLimit('ip');
		expect(result.success).toBe(false);
		errSpy.mockRestore();
	});

	it('fails closed on missing credentials', async () => {
		vi.doMock('$env/dynamic/private', () => ({
			env: {}
		}));
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { checkBadgeRateLimit } = await loadModule();
		const result = await checkBadgeRateLimit('ip');
		expect(result.success).toBe(false);
		errSpy.mockRestore();
	});
});

describe('checkTranscribeRateLimit', () => {
	it('uses transcribe-prefixed limiter', async () => {
		limitMock.mockResolvedValueOnce({ success: true, remaining: 19, reset: 1 });
		const { checkTranscribeRateLimit } = await loadModule();
		await checkTranscribeRateLimit('ip');
		const call = getRatelimitConstructionConfigs().find(
			(cfg) => cfg.prefix === 'ratelimit:transcribe'
		);
		expect(call).toBeDefined();
	});

	it('fails closed when limiter throws', async () => {
		limitMock.mockRejectedValueOnce(new Error('boom'));
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { checkTranscribeRateLimit } = await loadModule();
		const result = await checkTranscribeRateLimit('ip');
		expect(result.success).toBe(false);
		errSpy.mockRestore();
	});

	it('fails closed on missing credentials', async () => {
		vi.doMock('$env/dynamic/private', () => ({ env: {} }));
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { checkTranscribeRateLimit } = await loadModule();
		const result = await checkTranscribeRateLimit('ip');
		expect(result.success).toBe(false);
		errSpy.mockRestore();
	});
});

describe('getClientIdentifier', () => {
	it('returns first IP from x-forwarded-for', async () => {
		const { getClientIdentifier } = await loadModule();
		const req = new Request('https://example.com', {
			headers: { 'x-forwarded-for': '203.0.113.1, 70.41.3.18, 150.172.238.178' }
		});
		expect(getClientIdentifier(req)).toBe('203.0.113.1');
	});

	it('trims whitespace from forwarded IP', async () => {
		const { getClientIdentifier } = await loadModule();
		const req = new Request('https://example.com', {
			headers: { 'x-forwarded-for': '   203.0.113.1   , 70.41.3.18' }
		});
		expect(getClientIdentifier(req)).toBe('203.0.113.1');
	});

	it('handles single-IP x-forwarded-for', async () => {
		const { getClientIdentifier } = await loadModule();
		const req = new Request('https://example.com', {
			headers: { 'x-forwarded-for': '203.0.113.1' }
		});
		expect(getClientIdentifier(req)).toBe('203.0.113.1');
	});

	it('falls back to x-real-ip when x-forwarded-for missing', async () => {
		const { getClientIdentifier } = await loadModule();
		const req = new Request('https://example.com', {
			headers: { 'x-real-ip': '198.51.100.7' }
		});
		expect(getClientIdentifier(req)).toBe('198.51.100.7');
	});

	it('prefers x-forwarded-for over x-real-ip', async () => {
		const { getClientIdentifier } = await loadModule();
		const req = new Request('https://example.com', {
			headers: { 'x-forwarded-for': '203.0.113.1', 'x-real-ip': '198.51.100.7' }
		});
		expect(getClientIdentifier(req)).toBe('203.0.113.1');
	});

	it('returns "unknown" when no IP headers present', async () => {
		const { getClientIdentifier } = await loadModule();
		const req = new Request('https://example.com');
		expect(getClientIdentifier(req)).toBe('unknown');
	});
});

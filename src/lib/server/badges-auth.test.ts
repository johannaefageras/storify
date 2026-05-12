import { describe, it, expect, vi, beforeEach } from 'vitest';

const { createClientMock, getUserMock } = vi.hoisted(() => {
	const getUserMock = vi.fn();
	const createClientMock = vi.fn(() => ({ auth: { getUser: getUserMock } }));
	return { createClientMock, getUserMock };
});

vi.mock('@supabase/supabase-js', () => ({ createClient: createClientMock }));
vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
	PUBLIC_SUPABASE_ANON_KEY: 'anon-key'
}));
vi.mock('$env/dynamic/private', () => ({
	env: { SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
}));

import { getBadgeRouteUser, hasBadgeServiceRole } from './badges-auth';

function makeEvent(opts: {
	authHeader?: string;
	session?: { user: { id: string } | null };
}) {
	const headers = new Headers();
	if (opts.authHeader) headers.set('authorization', opts.authHeader);
	const request = new Request('https://example.com', { headers });

	const locals: Record<string, unknown> = {};
	if (opts.session !== undefined) {
		locals.safeGetSession = vi.fn().mockResolvedValue({
			session: opts.session.user ? { access_token: 't' } : null,
			user: opts.session.user
		});
	}
	return { request, locals } as Parameters<typeof getBadgeRouteUser>[0];
}

beforeEach(() => {
	createClientMock.mockClear();
	getUserMock.mockReset();
});

describe('getBadgeRouteUser', () => {
	it('returns user from session when safeGetSession resolves a user', async () => {
		const event = makeEvent({ session: { user: { id: 'user-1' } } });
		const result = await getBadgeRouteUser(event);
		expect(result).toEqual({ id: 'user-1' });
		expect(createClientMock).not.toHaveBeenCalled();
	});

	it('falls back to bearer token when session has no user', async () => {
		const event = makeEvent({
			session: { user: null },
			authHeader: 'Bearer abc123'
		});
		getUserMock.mockResolvedValueOnce({ data: { user: { id: 'user-2' } }, error: null });

		const result = await getBadgeRouteUser(event);

		expect(result).toEqual({ id: 'user-2' });
		expect(createClientMock).toHaveBeenCalledWith(
			'https://test.supabase.co',
			'anon-key',
			expect.objectContaining({
				auth: expect.objectContaining({ persistSession: false, autoRefreshToken: false })
			})
		);
		expect(getUserMock).toHaveBeenCalledWith('abc123');
	});

	it('accepts case-insensitive Bearer prefix', async () => {
		const event = makeEvent({ session: { user: null }, authHeader: 'bearer xyz' });
		getUserMock.mockResolvedValueOnce({ data: { user: { id: 'u' } }, error: null });
		await getBadgeRouteUser(event);
		expect(getUserMock).toHaveBeenCalledWith('xyz');
	});

	it('returns null when no session and no auth header', async () => {
		const event = makeEvent({ session: { user: null } });
		const result = await getBadgeRouteUser(event);
		expect(result).toBeNull();
		expect(getUserMock).not.toHaveBeenCalled();
	});

	it('returns null when auth header is malformed', async () => {
		const event = makeEvent({ session: { user: null }, authHeader: 'NotBearer xyz' });
		const result = await getBadgeRouteUser(event);
		expect(result).toBeNull();
		expect(getUserMock).not.toHaveBeenCalled();
	});

	it('returns null and logs when bearer auth fails', async () => {
		const event = makeEvent({ session: { user: null }, authHeader: 'Bearer bad' });
		getUserMock.mockResolvedValueOnce({ data: { user: null }, error: { message: 'invalid' } });
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await getBadgeRouteUser(event);

		expect(result).toBeNull();
		expect(errSpy).toHaveBeenCalled();
		errSpy.mockRestore();
	});

	it('returns null when bearer call returns no user', async () => {
		const event = makeEvent({ session: { user: null }, authHeader: 'Bearer t' });
		getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });
		expect(await getBadgeRouteUser(event)).toBeNull();
	});

	it('skips session lookup when safeGetSession not in locals', async () => {
		const headers = new Headers({ authorization: 'Bearer tok' });
		const event = {
			request: new Request('https://example.com', { headers }),
			locals: {}
		} as Parameters<typeof getBadgeRouteUser>[0];
		getUserMock.mockResolvedValueOnce({ data: { user: { id: 'u' } }, error: null });

		expect(await getBadgeRouteUser(event)).toEqual({ id: 'u' });
	});
});

describe('hasBadgeServiceRole', () => {
	it('returns true when SUPABASE_SERVICE_ROLE_KEY is set', () => {
		expect(hasBadgeServiceRole()).toBe(true);
	});
});

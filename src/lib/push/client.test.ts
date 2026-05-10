import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('$env/static/public', () => ({
	PUBLIC_VAPID_KEY: 'BPgZ-test-vapid-key_AAAA'
}));

const fetchMock = vi.fn();

type MockSubscription = {
	endpoint: string;
	toJSON: () => Record<string, unknown>;
	unsubscribe: ReturnType<typeof vi.fn>;
};

function makeSubscription(overrides: Partial<MockSubscription> = {}): MockSubscription {
	return {
		endpoint: 'https://push.example/abc',
		toJSON: () => ({ endpoint: 'https://push.example/abc' }),
		unsubscribe: vi.fn().mockResolvedValue(true),
		...overrides
	};
}

function installPushEnvironment(opts: {
	getSubscription?: ReturnType<typeof vi.fn>;
	subscribe?: ReturnType<typeof vi.fn>;
	requestPermission?: NotificationPermission | Error;
	permission?: NotificationPermission;
} = {}) {
	const getSubscription = opts.getSubscription ?? vi.fn().mockResolvedValue(null);
	const subscribe = opts.subscribe ?? vi.fn().mockResolvedValue(makeSubscription());

	vi.stubGlobal('navigator', {
		serviceWorker: {
			ready: Promise.resolve({
				pushManager: { getSubscription, subscribe }
			})
		}
	});
	vi.stubGlobal('PushManager', class {});
	const NotificationStub = {
		permission: opts.permission ?? 'default',
		requestPermission: vi.fn().mockImplementation(() => {
			if (opts.requestPermission instanceof Error) return Promise.reject(opts.requestPermission);
			return Promise.resolve(opts.requestPermission ?? 'granted');
		})
	};
	vi.stubGlobal('Notification', NotificationStub);
	vi.stubGlobal('fetch', fetchMock);

	return { getSubscription, subscribe, NotificationStub };
}

beforeEach(() => {
	vi.resetModules();
	fetchMock.mockReset();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('checkPushSupport', () => {
	it('returns supported when all APIs and VAPID key are present', async () => {
		installPushEnvironment();
		const { checkPushSupport } = await import('./client');
		expect(checkPushSupport()).toEqual({ supported: true });
	});

	it('returns no-sw when serviceWorker missing from navigator', async () => {
		vi.stubGlobal('navigator', {});
		vi.stubGlobal('PushManager', class {});
		vi.stubGlobal('Notification', { permission: 'default' });
		const { checkPushSupport } = await import('./client');
		expect(checkPushSupport()).toEqual({ supported: false, reason: 'no-sw' });
	});

	it('returns no-push when PushManager not on window', async () => {
		vi.stubGlobal('navigator', { serviceWorker: {} });
		// @ts-expect-error remove global
		delete globalThis.PushManager;
		vi.stubGlobal('Notification', { permission: 'default' });
		const { checkPushSupport } = await import('./client');
		expect(checkPushSupport()).toEqual({ supported: false, reason: 'no-push' });
	});

	it('returns no-notification when Notification missing', async () => {
		vi.stubGlobal('navigator', { serviceWorker: {} });
		vi.stubGlobal('PushManager', class {});
		// @ts-expect-error remove global
		delete globalThis.Notification;
		const { checkPushSupport } = await import('./client');
		expect(checkPushSupport()).toEqual({ supported: false, reason: 'no-notification' });
	});

	it('returns no-vapid-key when VAPID key empty', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_VAPID_KEY: '' }));
		installPushEnvironment();
		const { checkPushSupport } = await import('./client');
		expect(checkPushSupport()).toEqual({ supported: false, reason: 'no-vapid-key' });
		vi.doUnmock('$env/static/public');
	});
});

describe('subscribeToPush', () => {
	it('creates a new subscription and POSTs it when none exists', async () => {
		const sub = makeSubscription();
		const subscribe = vi.fn().mockResolvedValue(sub);
		const getSubscription = vi.fn().mockResolvedValue(null);
		installPushEnvironment({ getSubscription, subscribe });
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

		const { subscribeToPush } = await import('./client');
		const result = await subscribeToPush();

		expect(result).toEqual({ ok: true, subscription: sub });
		expect(subscribe).toHaveBeenCalledTimes(1);
		const subscribeArg = subscribe.mock.calls[0][0];
		expect(subscribeArg.userVisibleOnly).toBe(true);
		expect(subscribeArg.applicationServerKey).toBeInstanceOf(Uint8Array);
		expect((subscribeArg.applicationServerKey as Uint8Array).length).toBeGreaterThan(0);
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/push/subscribe',
			expect.objectContaining({ method: 'POST' })
		);
	});

	it('reuses existing subscription without calling subscribe', async () => {
		const existing = makeSubscription({ endpoint: 'https://existing/' });
		const subscribe = vi.fn();
		const getSubscription = vi.fn().mockResolvedValue(existing);
		installPushEnvironment({ getSubscription, subscribe });
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

		const { subscribeToPush } = await import('./client');
		const result = await subscribeToPush();

		expect(result).toEqual({ ok: true, subscription: existing });
		expect(subscribe).not.toHaveBeenCalled();
	});

	it('returns permission-denied when user denies notification', async () => {
		installPushEnvironment({ requestPermission: 'denied' });
		const { subscribeToPush } = await import('./client');
		expect(await subscribeToPush()).toEqual({ ok: false, reason: 'permission-denied' });
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('returns subscribe-failed when pushManager.subscribe throws', async () => {
		const subscribe = vi.fn().mockRejectedValue(new Error('boom'));
		installPushEnvironment({ subscribe });
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { subscribeToPush } = await import('./client');
		expect(await subscribeToPush()).toEqual({ ok: false, reason: 'subscribe-failed' });
		expect(fetchMock).not.toHaveBeenCalled();
		errSpy.mockRestore();
	});

	it('returns save-failed when backend POST returns non-2xx', async () => {
		installPushEnvironment();
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
		const { subscribeToPush } = await import('./client');
		expect(await subscribeToPush()).toEqual({ ok: false, reason: 'save-failed' });
	});

	it('encodes VAPID key as a non-empty Uint8Array', async () => {
		const subscribe = vi.fn().mockResolvedValue(makeSubscription());
		installPushEnvironment({ subscribe });
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
		const { subscribeToPush } = await import('./client');
		await subscribeToPush();
		const key = subscribe.mock.calls[0][0].applicationServerKey as Uint8Array;
		// "BPgZ-test-vapid-key_AAAA" decodes through base64; just sanity-check a byte
		expect(key[0]).toBe(0x04); // 'B' base64 → 0b000001 → first decoded byte starts with 0x04
	});
});

describe('unsubscribeFromPush', () => {
	it('returns true when no existing subscription', async () => {
		installPushEnvironment({ getSubscription: vi.fn().mockResolvedValue(null) });
		const { unsubscribeFromPush } = await import('./client');
		expect(await unsubscribeFromPush()).toBe(true);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('calls DELETE with endpoint and unsubscribes', async () => {
		const sub = makeSubscription();
		installPushEnvironment({ getSubscription: vi.fn().mockResolvedValue(sub) });
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

		const { unsubscribeFromPush } = await import('./client');
		const result = await unsubscribeFromPush();

		expect(result).toBe(true);
		expect(sub.unsubscribe).toHaveBeenCalled();
		const [, init] = fetchMock.mock.calls[0];
		expect(init.method).toBe('DELETE');
		expect(JSON.parse(init.body as string)).toEqual({ endpoint: sub.endpoint });
	});

	it('still unsubscribes locally when DELETE fails', async () => {
		const sub = makeSubscription();
		installPushEnvironment({ getSubscription: vi.fn().mockResolvedValue(sub) });
		fetchMock.mockRejectedValueOnce(new Error('network'));

		const { unsubscribeFromPush } = await import('./client');
		const result = await unsubscribeFromPush();

		expect(result).toBe(true);
		expect(sub.unsubscribe).toHaveBeenCalled();
	});

	it('returns the result of subscription.unsubscribe()', async () => {
		const sub = makeSubscription({ unsubscribe: vi.fn().mockResolvedValue(false) });
		installPushEnvironment({ getSubscription: vi.fn().mockResolvedValue(sub) });
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

		const { unsubscribeFromPush } = await import('./client');
		expect(await unsubscribeFromPush()).toBe(false);
	});
});

describe('getPermissionState / getExistingSubscription', () => {
	it('returns Notification.permission', async () => {
		installPushEnvironment({ permission: 'granted' });
		const { getPermissionState } = await import('./client');
		expect(await getPermissionState()).toBe('granted');
	});

	it('returns the existing subscription via pushManager', async () => {
		const sub = makeSubscription();
		installPushEnvironment({ getSubscription: vi.fn().mockResolvedValue(sub) });
		const { getExistingSubscription } = await import('./client');
		expect(await getExistingSubscription()).toBe(sub);
	});
});

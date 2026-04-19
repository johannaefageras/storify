import { PUBLIC_VAPID_KEY } from '$env/static/public';

export type PushSupport =
	| { supported: true }
	| { supported: false; reason: 'no-sw' | 'no-push' | 'no-notification' | 'no-vapid-key' };

export function checkPushSupport(): PushSupport {
	if (typeof window === 'undefined') return { supported: false, reason: 'no-sw' };
	if (!('serviceWorker' in navigator)) return { supported: false, reason: 'no-sw' };
	if (!('PushManager' in window)) return { supported: false, reason: 'no-push' };
	if (!('Notification' in window)) return { supported: false, reason: 'no-notification' };
	if (!PUBLIC_VAPID_KEY) return { supported: false, reason: 'no-vapid-key' };
	return { supported: true };
}

export async function getPermissionState(): Promise<NotificationPermission> {
	return Notification.permission;
}

// Returns the current PushSubscription if one already exists for this browser.
export async function getExistingSubscription(): Promise<PushSubscription | null> {
	const reg = await navigator.serviceWorker.ready;
	return reg.pushManager.getSubscription();
}

export async function subscribeToPush(): Promise<
	{ ok: true; subscription: PushSubscription } | { ok: false; reason: 'permission-denied' | 'subscribe-failed' | 'save-failed' }
> {
	const permission = await Notification.requestPermission();
	if (permission !== 'granted') return { ok: false, reason: 'permission-denied' };

	const reg = await navigator.serviceWorker.ready;

	let subscription = await reg.pushManager.getSubscription();
	if (!subscription) {
		try {
			subscription = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
			});
		} catch (err) {
			console.error('pushManager.subscribe failed:', err);
			return { ok: false, reason: 'subscribe-failed' };
		}
	}

	const res = await fetch('/api/push/subscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(subscription.toJSON())
	});

	if (!res.ok) return { ok: false, reason: 'save-failed' };
	return { ok: true, subscription };
}

export async function unsubscribeFromPush(): Promise<boolean> {
	const subscription = await getExistingSubscription();
	if (!subscription) return true;

	await fetch('/api/push/subscribe', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ endpoint: subscription.endpoint })
	}).catch(() => {});

	return subscription.unsubscribe();
}

// VAPID public keys come as URL-safe base64 strings; PushManager wants a BufferSource.
// Construct via explicit ArrayBuffer (not ArrayBufferLike) so the type narrows correctly.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64);
	const buffer = new ArrayBuffer(raw.length);
	const output = new Uint8Array(buffer);
	for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
	return output;
}

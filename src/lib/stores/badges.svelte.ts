import { browser } from '$app/environment';
import { supabase } from '$lib/supabase/client';
import { authStore } from '$lib/stores/auth.svelte';
import { BADGES_BY_ID, type Badge } from '$lib/data/badges';

interface UserBadgeRow {
	badge_id: string;
	earned_at: string;
	seen_at: string | null;
}

async function getAuthHeaders(): Promise<Record<string, string> | undefined> {
	const {
		data: { session }
	} = await supabase.auth.getSession();
	return session?.access_token
		? { Authorization: `Bearer ${session.access_token}` }
		: undefined;
}

function createBadgesStore() {
	let earnedIds = $state<Set<string>>(new Set());
	let unlockQueue = $state<Badge[]>([]);
	let hydratedFor = $state<string | null>(null);
	let subscribed = false;

	async function init() {
		if (!browser) return;

		// React to login/logout. Subscribing separately from authStore keeps
		// this module self-contained and avoids cross-store reactivity hacks.
		if (!subscribed) {
			subscribed = true;
			supabase.auth.onAuthStateChange((_event, session) => {
				const uid = session?.user?.id ?? null;
				if (uid === hydratedFor) return;
				if (uid) {
					void hydrate(uid);
				} else {
					reset();
				}
			});
		}

		if (authStore.user) {
			await hydrate(authStore.user.id);
		}
	}

	async function hydrate(userId: string) {
		try {
			const res = await fetch('/api/badges/list', {
				headers: (await getAuthHeaders()) ?? {}
			});
			if (!res.ok) {
				throw new Error(`Failed to load badges (${res.status})`);
			}
			const data = (await res.json()) as { rows?: UserBadgeRow[] };
			const rows = data.rows ?? [];
			const next = new Set<string>();
			const queue: Badge[] = [];
			for (const row of rows) {
				next.add(row.badge_id);
				if (row.seen_at === null) {
					const badge = BADGES_BY_ID[row.badge_id];
					if (badge) queue.push(badge);
				}
			}
			earnedIds = next;
			unlockQueue = queue;
			hydratedFor = userId;
		} catch (err) {
			console.error('[badges] hydrate failed:', err);
		}

		// Fire-and-forget: retroactively award badges for existing activity.
		// Server short-circuits when `profiles.badges_backfilled_at` is set,
		// so this is cheap on subsequent logins.
		void backfill();
	}

	async function backfill() {
		try {
			const res = await fetch('/api/badges/backfill', {
				method: 'POST',
				headers: (await getAuthHeaders()) ?? {}
			});
			if (!res.ok) return;
			const data = (await res.json()) as { newlyEarned?: Badge[]; skipped?: boolean };
			if (data.skipped || !data.newlyEarned || data.newlyEarned.length === 0) return;

			// Merge silently — backfill rows are pre-marked seen_at, so we skip
			// the unlock queue to avoid toast-spamming users for retroactive
			// awards describing activity they already completed.
			const next = new Set(earnedIds);
			for (const b of data.newlyEarned) next.add(b.id);
			earnedIds = next;
		} catch (err) {
			console.error('[badges] backfill failed:', err);
		}
	}

	// Call from save sites after the server responds with freshly-awarded
	// badge ids (from `checkAndAward`). Safe to call with unknown or already-
	// earned ids — they're filtered here.
	function applyAwarded(ids: readonly string[]) {
		if (ids.length === 0) return;
		const next = new Set(earnedIds);
		const added: Badge[] = [];
		for (const id of ids) {
			if (earnedIds.has(id)) continue;
			const badge = BADGES_BY_ID[id];
			if (!badge) continue;
			next.add(id);
			added.push(badge);
		}
		if (added.length === 0) return;
		earnedIds = next;
		unlockQueue = [...unlockQueue, ...added];
	}

	// Drops the first queued badge and marks it seen in the DB. The RLS
	// policy allows this via the user's own auth; the write is best-effort.
	async function dismiss() {
		const [head, ...rest] = unlockQueue;
		if (!head) return;
		unlockQueue = rest;

		if (!authStore.user) return;
		try {
			const { error } = await supabase
				.from('user_badges')
				.update({ seen_at: new Date().toISOString() })
				.eq('user_id', authStore.user.id)
				.eq('badge_id', head.id)
				.is('seen_at', null);
			if (error) throw error;
		} catch (err) {
			console.error('[badges] mark seen failed:', err);
		}
	}

	function reset() {
		earnedIds = new Set();
		unlockQueue = [];
		hydratedFor = null;
	}

	return {
		get earned() {
			return earnedIds;
		},
		get unlockQueue() {
			return unlockQueue;
		},
		has(id: string) {
			return earnedIds.has(id);
		},
		init,
		applyAwarded,
		dismiss
	};
}

export const badgesStore = createBadgesStore();

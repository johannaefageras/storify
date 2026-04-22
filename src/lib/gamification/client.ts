/**
 * Client-side helper for firing badge events at POST /api/badges/event.
 *
 * Badge awarding is a side-effect: it must never throw into the caller's flow
 * (save succeeded, share succeeded, …). All errors are swallowed and the
 * returned list is empty on failure.
 */

import type { Badge } from '$lib/data/badges';
import { badgesStore } from '$lib/stores/badges.svelte';
import { supabase } from '$lib/supabase/client';
import type { BadgeEvent, EvaluationContext } from './evaluate';

type Sendable = Pick<
	EvaluationContext,
	| 'createdAt'
	| 'entryDate'
	| 'toneId'
	| 'moodLevel'
	| 'sleepQuality'
	| 'energyLevel'
	| 'wordCount'
	| 'mode'
	| 'chatTranscript'
	| 'isRandomTone'
	| 'readFinePrint'
	| 'interviewerLaughed'
>;

export async function fireBadgeEvent(
	event: BadgeEvent,
	payload: Sendable = {}
): Promise<Badge[]> {
	try {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		const res = await fetch('/api/badges/event', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(session?.access_token
					? { Authorization: `Bearer ${session.access_token}` }
					: {})
			},
			body: JSON.stringify({
				event,
				payload: {
					...payload,
					createdAt: payload.createdAt?.toISOString()
				}
			})
		});
		if (!res.ok) return [];
		const data = (await res.json()) as { newlyEarned?: Badge[] };
		const newlyEarned = data.newlyEarned ?? [];
		badgesStore.applyAwarded(newlyEarned.map((badge) => badge.id));
		return newlyEarned;
	} catch {
		return [];
	}
}

import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { RequestHandler } from './$types';
import { checkAndAward } from '$lib/gamification/award';
import type { BadgeEvent, EvaluationContext } from '$lib/gamification/evaluate';
import type { WritingMode } from '$lib/data/badges';
import { checkBadgeRateLimit } from '$lib/validation/ratelimit';
import { getBadgeRouteUser } from '$lib/server/badges-auth';

const VALID_EVENTS: ReadonlySet<BadgeEvent> = new Set<BadgeEvent>([
	'account-created',
	'first-login',
	'profile-updated',
	'profile-photo-uploaded',
	'newsletter-subscribed',
	'notifications-enabled',
	'entry-created',
	'entry-updated',
	'entry-deleted',
	'entry-archived',
	'entry-shared',
	'entry-viewed-own',
	'entry-viewed-community',
	'random-tone-used',
	'regenerated-in-new-tone',
	'on-this-day-viewed',
	'read-fine-print'
]);

const VALID_MODES: ReadonlySet<WritingMode> = new Set<WritingMode>([
	'wizard',
	'quick',
	'interview',
	'manual'
]);

const MAX_TRANSCRIPT_MESSAGES = 50;
const MAX_TRANSCRIPT_CHARS = 2000;

function toFinitePositiveInt(v: unknown, max: number): number | undefined {
	if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return undefined;
	const n = Math.floor(v);
	return n > max ? max : n;
}

function toDate(v: unknown): Date | undefined {
	if (typeof v !== 'string') return undefined;
	const d = new Date(v);
	return Number.isFinite(d.getTime()) ? d : undefined;
}

function toIsoDate(v: unknown): string | undefined {
	if (typeof v !== 'string') return undefined;
	return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
}

// Strict whitelist: only fields that describe the current event/entry are
// accepted from the client. Aggregates (totalEntries, streaks, …) and profile
// fields (birthday, profileComplete, accountCreatedAt) are derived server-side
// inside checkAndAward; trusting the client for those would let a bad actor
// claim any badge by posting fake counts.
function sanitizePayload(raw: unknown): Partial<EvaluationContext> {
	if (!raw || typeof raw !== 'object') return {};
	const p = raw as Record<string, unknown>;
	const out: Partial<EvaluationContext> = {};

	const createdAt = toDate(p.createdAt);
	if (createdAt) out.createdAt = createdAt;

	const entryDate = toIsoDate(p.entryDate);
	if (entryDate) out.entryDate = entryDate;

	if (typeof p.toneId === 'string' && p.toneId.length <= 100) out.toneId = p.toneId;

	const mood = toFinitePositiveInt(p.moodLevel, 10);
	if (mood !== undefined) out.moodLevel = mood;

	const sleep = toFinitePositiveInt(p.sleepQuality, 10);
	if (sleep !== undefined) out.sleepQuality = sleep;

	const energy = toFinitePositiveInt(p.energyLevel, 10);
	if (energy !== undefined) out.energyLevel = energy;

	const words = toFinitePositiveInt(p.wordCount, 1_000_000);
	if (words !== undefined) out.wordCount = words;

	if (typeof p.mode === 'string' && VALID_MODES.has(p.mode as WritingMode)) {
		out.mode = p.mode as WritingMode;
	}

	if (Array.isArray(p.chatTranscript)) {
		const messages: { role: 'user' | 'assistant'; content: string }[] = [];
		for (const m of p.chatTranscript.slice(0, MAX_TRANSCRIPT_MESSAGES)) {
			if (!m || typeof m !== 'object') continue;
			const row = m as Record<string, unknown>;
			if (row.role !== 'user' && row.role !== 'assistant') continue;
			if (typeof row.content !== 'string') continue;
			messages.push({
				role: row.role,
				content: row.content.slice(0, MAX_TRANSCRIPT_CHARS)
			});
		}
		if (messages.length > 0) out.chatTranscript = messages;
	}

	if (typeof p.isRandomTone === 'boolean') out.isRandomTone = p.isRandomTone;
	if (typeof p.readFinePrint === 'boolean') out.readFinePrint = p.readFinePrint;
	if (typeof p.interviewerLaughed === 'boolean') out.interviewerLaughed = p.interviewerLaughed;

	return out;
}

export const POST: RequestHandler = async (requestEvent) => {
	const { request } = requestEvent;
	const user = await getBadgeRouteUser(requestEvent);
	if (!user) {
		return json({ error: 'Inte inloggad.' }, { status: 401 });
	}

	const rl = await checkBadgeRateLimit(`badges:${user.id}`);
	if (!rl.success) {
		return json({ error: 'För många försök.' }, { status: 429 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Ogiltigt format.' }, { status: 400 });
	}

	if (!body || typeof body !== 'object') {
		return json({ error: 'Ogiltigt format.' }, { status: 400 });
	}

	const { event: badgeEvent, payload } = body as { event?: unknown; payload?: unknown };
	if (typeof badgeEvent !== 'string' || !VALID_EVENTS.has(badgeEvent as BadgeEvent)) {
		return json({ error: 'Okänt event.' }, { status: 400 });
	}

	if (!env.SUPABASE_SERVICE_ROLE_KEY) {
		console.error('[badges] SUPABASE_SERVICE_ROLE_KEY missing');
		// Don't surface as 500 — badge awarding must never block the caller.
		return json({ newlyEarned: [] });
	}

	const admin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	const clean = sanitizePayload(payload);
	const winners = await checkAndAward(admin, user.id, badgeEvent as BadgeEvent, clean);
	return json({ newlyEarned: winners });
};

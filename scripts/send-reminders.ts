// Daily push-reminder cron entry. Runs hourly on Render; for each user whose
// local time is currently REMINDER_HOUR, sends a Web Push reminder to each of
// their registered subscriptions — unless they already wrote an entry today.
//
// Bundled via scripts/build-cron.mjs into dist/cron/send-reminders.js.
//
// Flags:
//   --dry-run   find candidates and render payloads but do not call web-push
//               or write to push_sends. Safe to run against production.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { isLocalHourNow, localDateString } from '../src/lib/push/sendWindow';
import { processInBatches } from '../src/lib/newsletter/sendWindow';

type ProfileRow = {
	id: string;
	name: string | null;
	timezone: string;
};

type SubscriptionRow = {
	id: string;
	user_id: string;
	endpoint: string;
	p256dh: string;
	auth: string;
};

const DRY_RUN = process.argv.includes('--dry-run');
const REMINDER_HOUR = 20; // 20:00 local time
const BATCH_CONCURRENCY = 10;

function requireEnv(key: string): string {
	const v = process.env[key];
	if (!v) throw new Error(`Missing required env var: ${key}`);
	return v;
}

function buildPayload(profile: ProfileRow): string {
	const first = profile.name?.trim().split(/\s+/)[0];
	const body = first
		? `${first}, en minut med dig själv — vad har hänt idag?`
		: 'En minut med dig själv — vad har hänt idag?';
	return JSON.stringify({
		title: 'Dags att skriva',
		body,
		url: '/wizard',
		tag: 'daily-reminder'
	});
}

async function sendToSubscription(
	supabase: SupabaseClient,
	profile: ProfileRow,
	sub: SubscriptionRow,
	payload: string
): Promise<void> {
	if (DRY_RUN) {
		console.log(
			`[cron][dry-run] would push user=${profile.id} sub=${sub.id} endpoint=${sub.endpoint.slice(0, 60)}…`
		);
		return;
	}

	let statusCode: number | null = null;
	let errorMsg: string | null = null;

	try {
		const result = await webpush.sendNotification(
			{ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
			payload
		);
		statusCode = result.statusCode;
	} catch (e) {
		// web-push throws on non-2xx; statusCode is on the error.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const err = e as any;
		statusCode = typeof err.statusCode === 'number' ? err.statusCode : null;
		errorMsg = err.body ?? err.message ?? String(e);

		// 404/410 mean the browser has permanently revoked the subscription.
		// Delete it so future crons don't keep trying.
		if (statusCode === 404 || statusCode === 410) {
			await supabase.from('push_subscriptions').delete().eq('id', sub.id);
			console.log(`[cron] pruned stale sub=${sub.id} user=${profile.id} status=${statusCode}`);
		} else {
			await supabase
				.from('push_subscriptions')
				.update({ last_failed_at: new Date().toISOString() })
				.eq('id', sub.id);
			console.error(
				`[cron] push failed user=${profile.id} sub=${sub.id} status=${statusCode}: ${errorMsg}`
			);
		}
	}

	if (!errorMsg) {
		await supabase
			.from('push_subscriptions')
			.update({ last_sent_at: new Date().toISOString() })
			.eq('id', sub.id);
	}

	const { error: logError } = await supabase.from('push_sends').insert({
		user_id: profile.id,
		subscription_id: sub.id,
		kind: 'daily_reminder',
		status_code: statusCode,
		error: errorMsg
	});
	if (logError) {
		console.error(`[cron] failed to log push_send for user=${profile.id}: ${logError.message}`);
	}
}

async function main() {
	const supabaseUrl = requireEnv('PUBLIC_SUPABASE_URL');
	const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
	const vapidPublic = requireEnv('PUBLIC_VAPID_KEY');
	const vapidPrivate = DRY_RUN
		? process.env.VAPID_PRIVATE_KEY ?? ''
		: requireEnv('VAPID_PRIVATE_KEY');
	const vapidSubject = DRY_RUN
		? process.env.VAPID_SUBJECT ?? 'mailto:noreply@example.com'
		: requireEnv('VAPID_SUBJECT');

	if (!DRY_RUN) {
		webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
	}

	const supabase = createClient(supabaseUrl, serviceKey, {
		auth: { persistSession: false, autoRefreshToken: false }
	});

	const now = new Date();

	// 1. Pull all opted-in profiles; filter by local-hour in JS (same pattern
	//    as send-weekly).
	const { data: candidates, error } = await supabase
		.from('profiles')
		.select('id, name, timezone')
		.eq('push_reminders_enabled', true);

	if (error) throw error;

	const all = (candidates ?? []) as ProfileRow[];
	const due = all.filter((p) => isLocalHourNow(p.timezone, REMINDER_HOUR, now));

	if (due.length === 0) {
		console.log(
			`[cron] now=${now.toISOString()} opted-in=${all.length} due=0${DRY_RUN ? ' (dry-run)' : ''}`
		);
		return;
	}

	// 2. Drop users who already journaled today (local date).
	const dueByDate = new Map<string, ProfileRow[]>();
	for (const p of due) {
		const date = localDateString(p.timezone, now);
		if (!date) continue;
		const bucket = dueByDate.get(date) ?? [];
		bucket.push(p);
		dueByDate.set(date, bucket);
	}

	const writtenToday = new Set<string>();
	for (const [date, users] of dueByDate) {
		const ids = users.map((u) => u.id);
		const { data: entries } = await supabase
			.from('entries')
			.select('user_id')
			.eq('entry_date', date)
			.in('user_id', ids);
		for (const row of entries ?? []) writtenToday.add(row.user_id);
	}

	const toRemind = due.filter((p) => !writtenToday.has(p.id));

	// 3. Fetch subscriptions in one round-trip.
	const { data: subs, error: subsError } = await supabase
		.from('push_subscriptions')
		.select('id, user_id, endpoint, p256dh, auth')
		.in(
			'user_id',
			toRemind.map((p) => p.id)
		);
	if (subsError) throw subsError;

	const subsByUser = new Map<string, SubscriptionRow[]>();
	for (const s of (subs ?? []) as SubscriptionRow[]) {
		const bucket = subsByUser.get(s.user_id) ?? [];
		bucket.push(s);
		subsByUser.set(s.user_id, bucket);
	}

	const jobs: Array<{ profile: ProfileRow; sub: SubscriptionRow; payload: string }> = [];
	for (const profile of toRemind) {
		const userSubs = subsByUser.get(profile.id) ?? [];
		if (userSubs.length === 0) continue;
		const payload = buildPayload(profile);
		for (const sub of userSubs) jobs.push({ profile, sub, payload });
	}

	console.log(
		`[cron] now=${now.toISOString()} opted-in=${all.length} due=${due.length} after-dedupe=${toRemind.length} pushes=${jobs.length}${DRY_RUN ? ' (dry-run)' : ''}`
	);

	await processInBatches(jobs, BATCH_CONCURRENCY, ({ profile, sub, payload }) =>
		sendToSubscription(supabase, profile, sub, payload)
	);

	console.log(`[cron] reminders complete: pushes=${jobs.length}`);
}

main().catch((e) => {
	console.error('[cron] reminders failed:', e);
	process.exit(1);
});

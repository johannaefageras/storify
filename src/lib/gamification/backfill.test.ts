import { describe, it, expect } from 'vitest';
import { backfillBadges } from './backfill';

interface EntryFixture {
	created_at: string;
	updated_at: string | null;
	entry_date: string;
	tone_id: string;
	writing_mode: 'wizard' | 'quick' | 'interview' | 'manual' | null;
	generated_text: string;
	mood_level: number | null;
	sleep_quality: number | null;
	energy_level: number | null;
	is_public: boolean;
}

interface ProfileFixture {
	birthday?: string | null;
	name?: string | null;
	pronouns?: string | null;
	hometown?: string | null;
	avatar_url?: string | null;
	timezone?: string | null;
	push_reminders_enabled?: boolean | null;
	newsletter_weekly_enabled?: boolean | null;
	newsletter_monthly_enabled?: boolean | null;
	badges_backfilled_at?: string | null;
}

interface Fixtures {
	entries?: EntryFixture[];
	earned?: string[];
	profile?: ProfileFixture | null;
}

function createSupabaseFake(fx: Fixtures = {}) {
	const inserted: Array<{ user_id: string; badge_id: string; seen_at?: string | null }> = [];
	const updates: Array<{ table: string; values: Record<string, unknown> }> = [];

	const profile = {
		birthday: null,
		name: null,
		pronouns: null,
		hometown: null,
		avatar_url: null,
		timezone: 'Europe/Stockholm',
		push_reminders_enabled: false,
		newsletter_weekly_enabled: false,
		newsletter_monthly_enabled: false,
		badges_backfilled_at: null,
		...(fx.profile ?? {})
	};

	const fake = {
		from(table: string) {
			if (table === 'profiles') {
				return {
					select: () => ({
						eq: () => ({
							maybeSingle: () => Promise.resolve({ data: profile, error: null })
						})
					}),
					update: (values: Record<string, unknown>) => ({
						eq: () => {
							updates.push({ table, values });
							return Promise.resolve({ error: null });
						}
					})
				};
			}

			if (table === 'entries') {
				return {
					select: () => ({
						eq: () => ({
							order: () => Promise.resolve({ data: fx.entries ?? [], error: null })
						})
					})
				};
			}

			if (table === 'user_badges') {
				return {
					select: () => ({
						eq: () =>
							Promise.resolve({
								data: (fx.earned ?? []).map((badge_id) => ({ badge_id })),
								error: null
							})
					}),
					upsert: (
						rows: Array<{ user_id: string; badge_id: string; seen_at?: string | null }>
					) => {
						inserted.push(...rows);
						return {
							select: () =>
								Promise.resolve({
									data: rows.map((row) => ({ badge_id: row.badge_id })),
									error: null
								})
						};
					}
				};
			}

			throw new Error(`unexpected table: ${table}`);
		}
	};

	return { fake: fake as unknown as Parameters<typeof backfillBadges>[0], inserted, updates };
}

describe('backfillBadges', () => {
	it('retroactively awards forsta-raden when the user already has entries', async () => {
		const { fake, inserted } = createSupabaseFake({
			entries: [
				{
					created_at: '2026-04-01T10:00:00Z',
					updated_at: null,
					entry_date: '2026-04-01',
					tone_id: 'warm',
					writing_mode: 'wizard',
					generated_text: 'Min första anteckning',
					mood_level: null,
					sleep_quality: null,
					energy_level: null,
					is_public: false
				}
			]
		});

		const got = await backfillBadges(fake, 'user-1', { force: true });

		expect(got.newlyEarned.map((b) => b.id)).toContain('forsta-raden');
		expect(inserted.map((row) => row.badge_id)).toContain('forsta-raden');
	});

	it('retroactively awards notifications-enabled from saved profile state', async () => {
		const { fake, inserted } = createSupabaseFake({
			profile: { push_reminders_enabled: true }
		});

		const got = await backfillBadges(fake, 'user-1', { force: true });

		expect(got.newlyEarned.map((b) => b.id)).toContain('alltid-alert');
		expect(inserted.map((row) => row.badge_id)).toContain('alltid-alert');
	});

	it('does not award notifications-enabled when push reminders are off', async () => {
		const { fake, inserted } = createSupabaseFake({
			profile: { push_reminders_enabled: false }
		});

		const got = await backfillBadges(fake, 'user-1', { force: true });

		expect(got.newlyEarned.map((b) => b.id)).not.toContain('alltid-alert');
		expect(inserted.map((row) => row.badge_id)).not.toContain('alltid-alert');
	});

	it('retroactively awards nattugglan using the saved profile timezone', async () => {
		const { fake, inserted } = createSupabaseFake({
			profile: { timezone: 'America/New_York' },
			entries: Array.from({ length: 5 }, (_, i) => ({
				created_at: `2026-04-0${i + 1}T04:30:00Z`,
				updated_at: null,
				entry_date: `2026-04-0${i + 1}`,
				tone_id: 'warm',
				writing_mode: 'wizard',
				generated_text: 'Nattlig anteckning',
				mood_level: null,
				sleep_quality: null,
				energy_level: null,
				is_public: false
			}))
		});

		const got = await backfillBadges(fake, 'user-1', { force: true });

		expect(got.newlyEarned.map((b) => b.id)).toContain('nattugglan');
		expect(inserted.map((row) => row.badge_id)).toContain('nattugglan');
	});
});

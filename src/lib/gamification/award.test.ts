import { describe, it, expect, vi } from 'vitest';
import { checkAndAward } from './award';

interface EntryFixture {
	created_at: string;
	entry_date: string;
	tone_id: string;
	writing_mode: 'wizard' | 'quick' | 'interview' | 'manual' | null;
}

interface Fixtures {
	earned?: string[];
	entries?: EntryFixture[];
	profileBirthday?: string | null;
	profileAvatarUrl?: string | null;
	profileTimezone?: string | null;
	insertError?: { message: string };
	earnedError?: { message: string };
	onInsert?: (rows: Array<{ user_id: string; badge_id: string }>) => string[];
}

function createSupabaseFake(fx: Fixtures = {}) {
	const inserts: Array<{ user_id: string; badge_id: string }> = [];

	const fake = {
		from(table: string) {
			if (table === 'user_badges') {
				return {
					select: () => ({
						eq: () =>
							Promise.resolve({
								data: fx.earnedError ? null : (fx.earned ?? []).map((id) => ({ badge_id: id })),
								error: fx.earnedError ?? null
							})
					}),
					upsert: (rows: Array<{ user_id: string; badge_id: string }>) => {
						inserts.push(...rows);
						return {
							select: () => {
								if (fx.insertError) {
									return Promise.resolve({ data: null, error: fx.insertError });
								}
								const ids = fx.onInsert
									? fx.onInsert(rows)
									: rows.map((r) => r.badge_id);
								return Promise.resolve({
									data: ids.map((id) => ({ badge_id: id })),
									error: null
								});
							}
						};
					}
				};
			}
			if (table === 'entries') {
				return {
					select: () => ({
						eq: () => ({
							order: () =>
								Promise.resolve({ data: fx.entries ?? [], error: null })
						})
					})
				};
			}
			if (table === 'profiles') {
				return {
					select: () => ({
						eq: () => ({
							maybeSingle: () =>
								Promise.resolve({
									data:
										fx.profileBirthday === undefined &&
										fx.profileAvatarUrl === undefined &&
										fx.profileTimezone === undefined
											? null
											: {
													birthday: fx.profileBirthday,
													avatar_url: fx.profileAvatarUrl,
													timezone: fx.profileTimezone
											  },
									error: null
								})
						})
					})
				};
			}
			throw new Error(`unexpected table: ${table}`);
		}
	};

	return { fake: fake as unknown as Parameters<typeof checkAndAward>[0], inserts };
}

describe('checkAndAward', () => {
	it('awards aterkommaren on entry-viewed-own', async () => {
		const { fake, inserts } = createSupabaseFake();
		const got = await checkAndAward(fake, 'user-1', 'entry-viewed-own');
		expect(got.map((b) => b.id)).toEqual(['aterkommaren']);
		expect(inserts).toEqual([{ user_id: 'user-1', badge_id: 'aterkommaren' }]);
	});

	it('filters out already-earned badges', async () => {
		const { fake, inserts } = createSupabaseFake({ earned: ['forsta-steget'] });
		const got = await checkAndAward(fake, 'user-1', 'account-created');
		expect(got).toEqual([]);
		expect(inserts).toEqual([]);
	});

	it('awards a coincident badge the first time', async () => {
		const { fake, inserts } = createSupabaseFake();
		const got = await checkAndAward(fake, 'user-1', 'account-created');
		expect(got.map((b) => b.id)).toEqual(['forsta-steget']);
		expect(inserts).toEqual([{ user_id: 'user-1', badge_id: 'forsta-steget' }]);
	});

	it('awards profile-photo-uploaded only when avatar_url is persisted', async () => {
		const { fake, inserts } = createSupabaseFake({
			profileAvatarUrl: 'https://cdn.example.com/avatar.jpg'
		});
		const got = await checkAndAward(fake, 'user-1', 'profile-photo-uploaded');
		expect(got.map((b) => b.id)).toEqual(['ansiktet-utat']);
		expect(inserts).toEqual([{ user_id: 'user-1', badge_id: 'ansiktet-utat' }]);
	});

	it('does not award profile-photo-uploaded when avatar_url is missing', async () => {
		const { fake, inserts } = createSupabaseFake({ profileAvatarUrl: null });
		const got = await checkAndAward(fake, 'user-1', 'profile-photo-uploaded');
		expect(got).toEqual([]);
		expect(inserts).toEqual([]);
	});

	it('awards entries-total milestone on entry-created when total hits threshold', async () => {
		const entries: EntryFixture[] = [
			{
				created_at: '2026-04-21T10:00:00Z',
				entry_date: '2026-04-21',
				tone_id: 'warm',
				writing_mode: 'wizard'
			}
		];
		const { fake } = createSupabaseFake({ entries });
		const got = await checkAndAward(fake, 'user-1', 'entry-created');
		expect(got.map((b) => b.id)).toContain('forsta-raden');
	});

	it('honours the payload for per-entry criteria (low mood)', async () => {
		const entries: EntryFixture[] = [
			{
				created_at: '2026-04-21T10:00:00Z',
				entry_date: '2026-04-21',
				tone_id: 'warm',
				writing_mode: 'wizard'
			}
		];
		const { fake } = createSupabaseFake({ entries });
		const got = await checkAndAward(fake, 'user-1', 'entry-created', { moodLevel: 2 });
		expect(got.map((b) => b.id)).toContain('trots-allt');
	});

	it('computes a 7-day streak from entries and awards veckovanan', async () => {
		const dates = [
			'2026-04-21',
			'2026-04-20',
			'2026-04-19',
			'2026-04-18',
			'2026-04-17',
			'2026-04-16',
			'2026-04-15'
		];
		const entries: EntryFixture[] = dates.map((d) => ({
			created_at: `${d}T10:00:00Z`,
			entry_date: d,
			tone_id: 'warm',
			writing_mode: 'wizard'
		}));
		const { fake } = createSupabaseFake({ entries });
		const got = await checkAndAward(fake, 'user-1', 'entry-created');
		expect(got.map((b) => b.id)).toContain('veckovanan');
	});

	it('counts night entries in the user timezone for nattugglan', async () => {
		const dates = [
			'2026-04-01T04:30:00Z',
			'2026-04-02T04:30:00Z',
			'2026-04-03T04:30:00Z',
			'2026-04-04T04:30:00Z',
			'2026-04-05T04:30:00Z'
		];
		const entries: EntryFixture[] = dates.map((createdAt, i) => ({
			created_at: createdAt,
			entry_date: `2026-04-0${i + 1}`,
			tone_id: 'warm',
			writing_mode: 'wizard'
		}));
		const { fake } = createSupabaseFake({
			entries,
			profileTimezone: 'America/New_York'
		});
		const got = await checkAndAward(fake, 'user-1', 'entry-created');
		expect(got.map((b) => b.id)).toContain('nattugglan');
	});

	it('loads birthday from profiles when entry-on-birthday is a candidate', async () => {
		const entries: EntryFixture[] = [
			{
				created_at: '2026-06-15T10:00:00Z',
				entry_date: '2026-06-15',
				tone_id: 'warm',
				writing_mode: 'wizard'
			}
		];
		const { fake } = createSupabaseFake({ entries, profileBirthday: '1990-06-15' });
		const got = await checkAndAward(fake, 'user-1', 'entry-created', {
			createdAt: new Date('2026-06-15T10:00:00Z')
		});
		expect(got.map((b) => b.id)).toContain('fodelsedagsdagboken');
	});

	it('uses the saved entry_date for birthday badges when the entry is backdated', async () => {
		const entries: EntryFixture[] = [
			{
				created_at: '2026-04-22T10:00:00Z',
				entry_date: '2026-06-15',
				tone_id: 'warm',
				writing_mode: 'wizard'
			}
		];
		const { fake } = createSupabaseFake({ entries, profileBirthday: '1990-06-15' });
		const got = await checkAndAward(fake, 'user-1', 'entry-created', {
			createdAt: new Date('2026-04-22T10:00:00Z'),
			entryDate: '2026-06-15'
		});
		expect(got.map((b) => b.id)).toContain('fodelsedagsdagboken');
	});

	it('payload birthday overrides profile lookup', async () => {
		const entries: EntryFixture[] = [
			{
				created_at: '2026-06-15T10:00:00Z',
				entry_date: '2026-06-15',
				tone_id: 'warm',
				writing_mode: 'wizard'
			}
		];
		const { fake } = createSupabaseFake({ entries, profileBirthday: '1990-01-01' });
		const got = await checkAndAward(fake, 'user-1', 'entry-created', {
			createdAt: new Date('2026-06-15T10:00:00Z'),
			birthday: { month: 6, day: 15 }
		});
		expect(got.map((b) => b.id)).toContain('fodelsedagsdagboken');
	});

	it('does not re-award badges already in user_badges', async () => {
		const entries: EntryFixture[] = [
			{
				created_at: '2026-04-21T10:00:00Z',
				entry_date: '2026-04-21',
				tone_id: 'warm',
				writing_mode: 'wizard'
			}
		];
		const { fake, inserts } = createSupabaseFake({ earned: ['forsta-raden'], entries });
		const got = await checkAndAward(fake, 'user-1', 'entry-created');
		expect(got.map((b) => b.id)).not.toContain('forsta-raden');
		expect(inserts.map((r) => r.badge_id)).not.toContain('forsta-raden');
	});

	it('awards streak badges from any qualifying streak in history', async () => {
		const dates = [
			'2026-04-21',
			'2026-04-10',
			'2026-04-09',
			'2026-04-08',
			'2026-04-07',
			'2026-04-06',
			'2026-04-05',
			'2026-04-04'
		];
		const entries: EntryFixture[] = dates.map((d) => ({
			created_at: `${d}T10:00:00Z`,
			entry_date: d,
			tone_id: 'warm',
			writing_mode: 'wizard'
		}));
		const { fake } = createSupabaseFake({ entries });
		const got = await checkAndAward(fake, 'user-1', 'entry-created', {
			createdAt: new Date('2026-04-04T10:00:00Z'),
			entryDate: '2026-04-04'
		});
		expect(got.map((b) => b.id)).toContain('veckovanan');
	});

	it('awards same-day badges for any day with multiple entries, not only the latest day', async () => {
		const entries: EntryFixture[] = [
			{
				created_at: '2026-04-21T10:00:00Z',
				entry_date: '2026-04-21',
				tone_id: 'warm',
				writing_mode: 'wizard'
			},
			{
				created_at: '2026-04-10T10:00:00Z',
				entry_date: '2026-04-10',
				tone_id: 'warm',
				writing_mode: 'wizard'
			},
			{
				created_at: '2026-04-10T18:00:00Z',
				entry_date: '2026-04-10',
				tone_id: 'warm',
				writing_mode: 'wizard'
			}
		];
		const { fake } = createSupabaseFake({ entries });
		const got = await checkAndAward(fake, 'user-1', 'entry-created', {
			createdAt: new Date('2026-04-10T18:00:00Z'),
			entryDate: '2026-04-10'
		});
		expect(got.map((b) => b.id)).toContain('dubbeldagboken');
	});

	it('awards comeback badges from any historical gap that meets the threshold', async () => {
		const entries: EntryFixture[] = [
			{
				created_at: '2026-04-21T10:00:00Z',
				entry_date: '2026-04-21',
				tone_id: 'warm',
				writing_mode: 'wizard'
			},
			{
				created_at: '2026-03-01T10:00:00Z',
				entry_date: '2026-03-01',
				tone_id: 'warm',
				writing_mode: 'wizard'
			},
			{
				created_at: '2026-01-15T10:00:00Z',
				entry_date: '2026-01-15',
				tone_id: 'warm',
				writing_mode: 'wizard'
			}
		];
		const { fake } = createSupabaseFake({ entries });
		const got = await checkAndAward(fake, 'user-1', 'entry-created', {
			createdAt: new Date('2026-03-01T10:00:00Z'),
			entryDate: '2026-03-01'
		});
		expect(got.map((b) => b.id)).toContain('atervandaren');
	});

	it('filters returned badges to those the upsert actually inserted', async () => {
		const { fake } = createSupabaseFake({
			// Simulate a race: upsert reports nothing was inserted (conflict).
			onInsert: () => []
		});
		const got = await checkAndAward(fake, 'user-1', 'account-created');
		expect(got).toEqual([]);
	});

	it('swallows errors instead of throwing', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { fake } = createSupabaseFake({ earnedError: { message: 'boom' } });
		const got = await checkAndAward(fake, 'user-1', 'account-created');
		expect(got).toEqual([]);
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});
});

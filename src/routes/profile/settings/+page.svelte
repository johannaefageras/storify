<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { authStore } from '$lib/stores/auth.svelte';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import { fireBadgeEvent } from '$lib/gamification/client';
	import arrowLeftSvg from '$lib/assets/icons/arrow-left.svg?raw';
	import {
		checkPushSupport,
		subscribeToPush,
		unsubscribeFromPush
	} from '$lib/push/client';
	import '../profile.css';

	// UI state
	let loading = $state(true);

	// Newsletter / timezone state
	let weeklyEnabled = $state(false);
	let monthlyEnabled = $state(false);
	let timezone = $state('Europe/Stockholm');
	let timezoneOptions = $state<string[]>([]);
	let newsletterError = $state('');

	// Push notification state
	let pushEnabled = $state(false);
	let pushBusy = $state(false);
	let pushError = $state('');
	let pushUnavailable = $state<false | 'unsupported' | 'needs-ios-install'>(false);

	async function loadSettings() {
		if (!authStore.user) return;

		const { data, error: fetchError } = await supabase
			.from('profiles')
			.select('newsletter_weekly_enabled, newsletter_monthly_enabled, timezone, push_reminders_enabled')
			.eq('id', authStore.user.id)
			.single();

		if (fetchError) {
			newsletterError = 'Kunde inte ladda inställningarna.';
			loading = false;
			return;
		}

		if (data) {
			weeklyEnabled = data.newsletter_weekly_enabled ?? false;
			monthlyEnabled = data.newsletter_monthly_enabled ?? false;
			timezone = data.timezone || 'Europe/Stockholm';
			pushEnabled = data.push_reminders_enabled ?? false;

			// Auto-detect timezone on first visit (only if still at default)
			if (timezone === 'Europe/Stockholm') {
				try {
					const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
					if (detected && detected !== timezone) {
						timezone = detected;
						await supabase
							.from('profiles')
							.update({ timezone: detected, updated_at: new Date().toISOString() })
							.eq('id', authStore.user.id);
					}
				} catch {
					// Intl unavailable — keep default
				}
			}
		}

		// Populate timezone options (ES2022 API; fall back to a minimal list)
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const supported = (Intl as any).supportedValuesOf?.('timeZone');
			if (Array.isArray(supported) && supported.length > 0) {
				timezoneOptions = supported;
			}
		} catch {
			// ignored
		}
		if (timezoneOptions.length === 0) {
			timezoneOptions = [
				'Europe/Stockholm',
				'Europe/Oslo',
				'Europe/Copenhagen',
				'Europe/Helsinki',
				'Europe/London',
				'Europe/Berlin',
				'Europe/Paris',
				'Europe/Madrid',
				'UTC',
				'America/New_York',
				'America/Los_Angeles'
			];
		}
		// Ensure the stored value is selectable even if not in the list
		if (!timezoneOptions.includes(timezone)) {
			timezoneOptions = [timezone, ...timezoneOptions];
		}

		// Push support detection. iOS Safari only delivers Web Push inside an
		// installed PWA, so flag that case separately for a more helpful message.
		const support = checkPushSupport();
		if (!support.supported) {
			pushUnavailable = 'unsupported';
		} else {
			const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
			const isStandalone =
				window.matchMedia('(display-mode: standalone)').matches ||
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(navigator as any).standalone === true;
			if (isIOS && !isStandalone) pushUnavailable = 'needs-ios-install';
		}

		loading = false;
	}

	async function handlePushToggle(checked: boolean) {
		if (!authStore.user || pushBusy) return;
		pushError = '';
		pushBusy = true;
		const prev = pushEnabled;
		pushEnabled = checked;

		try {
			if (checked) {
				const result = await subscribeToPush();
				if (!result.ok) {
					pushEnabled = prev;
					pushError =
						result.reason === 'permission-denied'
							? 'Du behöver tillåta notiser i webbläsaren.'
							: 'Kunde inte aktivera notiser. Försök igen.';
					return;
				}
			} else {
				await unsubscribeFromPush();
			}

			const { error: err } = await supabase
				.from('profiles')
				.update({
					push_reminders_enabled: checked,
					updated_at: new Date().toISOString()
				})
				.eq('id', authStore.user.id);

			if (err) {
				pushEnabled = prev;
				pushError = 'Kunde inte spara inställningen. Försök igen.';
			} else if (checked) {
				void fireBadgeEvent('notifications-enabled');
			}
		} finally {
			pushBusy = false;
		}
	}

	async function handleWeeklyToggle(checked: boolean) {
		if (!authStore.user) return;
		const prev = weeklyEnabled;
		weeklyEnabled = checked;
		newsletterError = '';

		// When turning ON, clear last_sent_at so the next Sunday cron picks the user up
		const update: Record<string, unknown> = {
			newsletter_weekly_enabled: checked,
			updated_at: new Date().toISOString()
		};
		if (checked) update.weekly_last_sent_at = null;

		const { error: err } = await supabase
			.from('profiles')
			.update(update)
			.eq('id', authStore.user.id);

		if (err) {
			newsletterError = 'Kunde inte spara inställningen. Försök igen.';
			weeklyEnabled = prev;
		}
	}

	async function handleMonthlyToggle(checked: boolean) {
		if (!authStore.user) return;
		const prev = monthlyEnabled;
		monthlyEnabled = checked;
		newsletterError = '';

		const { error: err } = await supabase
			.from('profiles')
			.update({
				newsletter_monthly_enabled: checked,
				updated_at: new Date().toISOString()
			})
			.eq('id', authStore.user.id);

		if (err) {
			newsletterError = 'Kunde inte spara inställningen. Försök igen.';
			monthlyEnabled = prev;
		}
	}

	async function handleTimezoneChange(value: string) {
		if (!authStore.user) return;
		const prev = timezone;
		timezone = value;
		newsletterError = '';

		const { error: err } = await supabase
			.from('profiles')
			.update({ timezone: value, updated_at: new Date().toISOString() })
			.eq('id', authStore.user.id);

		if (err) {
			newsletterError = 'Kunde inte spara tidszonen. Försök igen.';
			timezone = prev;
		}
	}

	onMount(() => {
		const checkAuth = () => {
			if (authStore.isLoading) {
				setTimeout(checkAuth, 50);
				return;
			}
			if (!authStore.isLoggedIn) {
				goto('/login');
				return;
			}
			loadSettings();
		};
		checkAuth();
	});
</script>

<main class="profile-page">
	{#if loading}
		<div class="loading-wrapper">
			<p class="loading-text">Laddar inställningar...</p>
		</div>
	{:else}
		<div class="profile-body">
			<a href="/profile" class="back-link">
				<span class="back-link-icon">{@html arrowLeftSvg}</span>
				Tillbaka till profil
			</a>

			<section class="profile-section">
				<h2 class="section-title">Aviseringar</h2>

				{#if newsletterError}
					<div class="profile-alert profile-alert-error" style="margin-bottom: 0.875rem;">{newsletterError}</div>
				{/if}

				<div class="section-fields">
					<label class="toggle-row">
						<span class="toggle-text">
							<span class="toggle-label">Veckobrev varje söndag</span>
							<span class="toggle-helper">Få en sammanfattning av din vecka med utdrag från dina dagboksinlägg.</span>
						</span>
						<span class="toggle-switch">
							<input
								type="checkbox"
								checked={weeklyEnabled}
								onchange={(e) => handleWeeklyToggle(e.currentTarget.checked)}
							/>
							<span class="toggle-slider"></span>
						</span>
					</label>

					<label class="toggle-row">
						<span class="toggle-text">
							<span class="toggle-label">Månadsbrev från Storify</span>
							<span class="toggle-helper">Nyheter, tips och inspiration från Storify-teamet en gång i månaden.</span>
						</span>
						<span class="toggle-switch">
							<input
								type="checkbox"
								checked={monthlyEnabled}
								onchange={(e) => handleMonthlyToggle(e.currentTarget.checked)}
							/>
							<span class="toggle-slider"></span>
						</span>
					</label>

					<label class="toggle-row">
						<span class="toggle-text">
							<span class="toggle-label">Påminnelser om att skriva</span>
							<span class="toggle-helper">
								{#if pushUnavailable === 'unsupported'}
									Din webbläsare stöder inte push-notiser.
								{:else if pushUnavailable === 'needs-ios-install'}
									Lägg till appen på hemskärmen för att aktivera notiser på iPhone.
								{:else}
									Få en liten push-notis när det är dags att skriva dagens inlägg.
								{/if}
							</span>
						</span>
						<span class="toggle-switch">
							<input
								type="checkbox"
								checked={pushEnabled}
								disabled={pushBusy || pushUnavailable !== false}
								onchange={(e) => handlePushToggle(e.currentTarget.checked)}
							/>
							<span class="toggle-slider"></span>
						</span>
					</label>

					{#if pushError}
						<div class="profile-alert profile-alert-error" style="margin-bottom: 0.875rem;">{pushError}</div>
					{/if}

					<div class="field-group">
						<label class="field-label" for="timezone">Tidszon</label>
						<select
							id="timezone"
							value={timezone}
							onchange={(e) => handleTimezoneChange(e.currentTarget.value)}
						>
							{#each timezoneOptions as tz}
								<option value={tz}>{tz}</option>
							{/each}
						</select>
					</div>
				</div>
			</section>
		</div>
	{/if}
	<LegalFooter />
</main>

<style>
	#timezone {
		appearance: none;
		-webkit-appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f5f5f' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		padding-right: 1.75rem;
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		cursor: pointer;
	}

	.toggle-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		flex: 1;
		min-width: 0;
	}

	.toggle-label {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.toggle-helper {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		line-height: var(--leading-snug);
	}

	.toggle-switch {
		position: relative;
		display: inline-block;
		flex-shrink: 0;
		width: 2.5rem;
		height: 1.5rem;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		inset: 0;
		background: var(--color-border);
		border-radius: 999px;
		transition: background-color 0.15s ease;
	}

	.toggle-slider::before {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: calc(1.5rem - 4px);
		height: calc(1.5rem - 4px);
		background: white;
		border-radius: 50%;
		transition: transform 0.15s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}

	.toggle-switch input:checked + .toggle-slider {
		background: var(--color-accent);
	}

	.toggle-switch input:checked + .toggle-slider::before {
		transform: translateX(1rem);
	}

	.toggle-switch input:focus-visible + .toggle-slider {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 25%, transparent);
	}
</style>

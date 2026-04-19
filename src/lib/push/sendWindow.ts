// Pure helper for daily push reminders. SvelteKit-free so the cron bundler
// pulls it in without a runtime shim. Parallels newsletter/sendWindow.ts.

export function isLocalHourNow(
	timezone: string,
	targetHour: number,
	now: Date = new Date()
): boolean {
	let parts: Intl.DateTimeFormatPart[];
	try {
		parts = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			hour: '2-digit',
			hour12: false
		}).formatToParts(now);
	} catch {
		return false;
	}

	const rawHour = parts.find((p) => p.type === 'hour')?.value ?? '';
	const hour = parseInt(rawHour, 10);
	if (Number.isNaN(hour)) return false;
	return hour === targetHour;
}

// Returns the user's local date as YYYY-MM-DD. Used to check "has the user
// already written today?" against entries.entry_date, which stores the local
// date chosen by the user at write time.
export function localDateString(timezone: string, now: Date = new Date()): string | null {
	try {
		const parts = new Intl.DateTimeFormat('en-CA', {
			timeZone: timezone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}).formatToParts(now);
		const y = parts.find((p) => p.type === 'year')?.value;
		const m = parts.find((p) => p.type === 'month')?.value;
		const d = parts.find((p) => p.type === 'day')?.value;
		if (!y || !m || !d) return null;
		return `${y}-${m}-${d}`;
	} catch {
		return null;
	}
}

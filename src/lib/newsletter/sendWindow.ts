// Pure helpers used by the weekly cron. Kept SvelteKit-free (no $lib, no $env)
// so the cron bundler can pull this in without a runtime shim.

// Target local weekday + hour for the weekly send window.
const SEND_WEEKDAY = 'Sun';
const SEND_HOUR = 9;

export function isDueNow(timezone: string, now: Date = new Date()): boolean {
	// en-US 'short' weekday is stable ('Sun', 'Mon', …) across ICU versions.
	// sv-SE 'short' varies ('sön' / 'sön.') so we deliberately avoid it here.
	let parts: Intl.DateTimeFormatPart[];
	try {
		parts = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			weekday: 'short',
			hour: '2-digit',
			hour12: false
		}).formatToParts(now);
	} catch {
		return false;
	}

	const weekday = parts.find((p) => p.type === 'weekday')?.value;
	const rawHour = parts.find((p) => p.type === 'hour')?.value ?? '';
	const hour = parseInt(rawHour, 10);
	if (Number.isNaN(hour)) return false;
	return weekday === SEND_WEEKDAY && hour === SEND_HOUR;
}

export async function processInBatches<T>(
	items: readonly T[],
	concurrency: number,
	fn: (item: T) => Promise<void>
): Promise<void> {
	if (items.length === 0) return;
	const width = Math.max(1, Math.min(concurrency, items.length));
	let cursor = 0;

	async function worker() {
		while (true) {
			const idx = cursor++;
			if (idx >= items.length) return;
			try {
				await fn(items[idx]);
			} catch (err) {
				console.error('[sendWindow] worker error:', err);
			}
		}
	}

	await Promise.all(Array.from({ length: width }, worker));
}

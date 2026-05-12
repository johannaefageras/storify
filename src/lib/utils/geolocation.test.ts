import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));

import { getCurrentPosition } from './geolocation';

beforeEach(() => {
	vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

function stubGeolocation(
	impl: (success: PositionCallback, error?: PositionErrorCallback) => void
) {
	vi.stubGlobal('navigator', {
		geolocation: { getCurrentPosition: impl }
	});
}

describe('getCurrentPosition', () => {
	it('resolves coordinates on success', async () => {
		stubGeolocation((success) => {
			success({
				coords: { latitude: 59.33, longitude: 18.07 } as GeolocationCoordinates,
				timestamp: Date.now()
			} as GeolocationPosition);
		});

		expect(await getCurrentPosition()).toEqual({ latitude: 59.33, longitude: 18.07 });
	});

	it('resolves null on error callback', async () => {
		stubGeolocation((_success, error) => {
			error?.({ message: 'denied' } as GeolocationPositionError);
		});

		expect(await getCurrentPosition()).toBeNull();
	});

	it('resolves null when geolocation API not available', async () => {
		vi.stubGlobal('navigator', {});
		expect(await getCurrentPosition()).toBeNull();
	});

	it('passes timeout/maximumAge options', async () => {
		const getCurrent = vi.fn();
		vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: getCurrent } });
		void getCurrentPosition();
		await Promise.resolve();
		const opts = getCurrent.mock.calls[0][2];
		expect(opts).toEqual(
			expect.objectContaining({
				enableHighAccuracy: false,
				timeout: 10000,
				maximumAge: 300000
			})
		);
	});
});

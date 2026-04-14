const SAME_ORIGIN_BASE = 'http://storify.local';
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

export function getSameOriginRedirectPath(path: string | null | undefined): string {
	if (
		!path ||
		!path.startsWith('/') ||
		path.startsWith('//') ||
		path.includes('\\') ||
		CONTROL_CHARACTERS.test(path)
	) {
		return '/';
	}

	try {
		const url = new URL(path, SAME_ORIGIN_BASE);

		if (url.origin !== SAME_ORIGIN_BASE) {
			return '/';
		}

		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return '/';
	}
}

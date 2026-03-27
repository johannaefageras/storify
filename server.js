import http from 'node:http';
import process from 'node:process';
import { handler } from './build/handler.js';

const HOST = process.env.HOST ?? '0.0.0.0';
const PORT = Number(process.env.PORT ?? 3000);

const LONG_LIVED_STATIC_CACHE = 'public, max-age=2592000, stale-while-revalidate=86400';
const SHORT_LIVED_METADATA_CACHE = 'public, max-age=3600, stale-while-revalidate=86400';

function getCacheControl(pathname) {
	if (pathname.startsWith('/api/') || pathname.startsWith('/_app/immutable/')) {
		return null;
	}

	if (pathname === '/site.webmanifest') {
		return SHORT_LIVED_METADATA_CACHE;
	}

	if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
		return SHORT_LIVED_METADATA_CACHE;
	}

	if (/\.(?:css|js|mjs|svg|png|ico|webp|avif|woff2?|ttf|otf)$/i.test(pathname)) {
		return LONG_LIVED_STATIC_CACHE;
	}

	return null;
}

const server = http.createServer((request, response) => {
	const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
	const cacheControl = getCacheControl(url.pathname);

	if (cacheControl) {
		response.setHeader('cache-control', cacheControl);
	}

	handler(request, response);
});

server.listen(PORT, HOST, () => {
	console.log(`Listening on http://${HOST}:${PORT}`);
});

function shutdown(signal) {
	console.log(`${signal} received, shutting down`);
	server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

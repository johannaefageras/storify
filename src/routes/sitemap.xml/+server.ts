import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server';

export const prerender = false;

const SITE = 'https://mystorify.se';
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_URLS: Array<{ path: string; lastmod: string }> = [
	{ path: '', lastmod: TODAY },
	{ path: '/about', lastmod: TODAY },
	{ path: '/guide', lastmod: TODAY },
	{ path: '/contact', lastmod: TODAY },
	{ path: '/privacy', lastmod: TODAY },
	{ path: '/terms', lastmod: TODAY },
	{ path: '/cookies', lastmod: TODAY }
];

export const GET: RequestHandler = async ({ cookies, setHeaders }) => {
	const supabase = createSupabaseServerClient(cookies);

	const { data } = await supabase
		.from('community_entries')
		.select('created_at')
		.order('created_at', { ascending: false })
		.limit(1);

	const communityLastmod = data?.[0]?.created_at
		? new Date(data[0].created_at).toISOString().slice(0, 10)
		: TODAY;

	const urls = [
		...STATIC_URLS,
		{ path: '/community', lastmod: communityLastmod }
	];

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		urls
			.map(
				({ path, lastmod }) =>
					`  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
			)
			.join('\n') +
		`\n</urlset>\n`;

	setHeaders({
		'content-type': 'application/xml; charset=utf-8',
		'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	return new Response(body);
};

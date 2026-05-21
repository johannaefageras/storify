import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server';
import { getAllPosts } from '$lib/server/blog';
import { changelogEntries } from '$lib/data/changelog';

export const prerender = false;

const SITE = 'https://mystorify.se';

type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

type SitemapUrl = {
	path: string;
	lastmod: string;
	changefreq: ChangeFrequency;
	priority: string;
};

const FALLBACK_LASTMOD = '2026-05-14';

const latestChangelogDate = changelogEntries[0]?.date ?? FALLBACK_LASTMOD;
const latestPostDate = getAllPosts()[0]?.date ?? FALLBACK_LASTMOD;

const STATIC_URLS: SitemapUrl[] = [
	{ path: '/', lastmod: FALLBACK_LASTMOD, changefreq: 'weekly', priority: '1.0' },
	{ path: '/about', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.7' },
	{ path: '/guide', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.8' },
	{ path: '/contact', lastmod: '2026-05-14', changefreq: 'yearly', priority: '0.4' },
	{ path: '/privacy', lastmod: '2026-05-14', changefreq: 'yearly', priority: '0.4' },
	{ path: '/terms', lastmod: '2026-05-03', changefreq: 'yearly', priority: '0.4' },
	{ path: '/cookies', lastmod: '2026-05-14', changefreq: 'yearly', priority: '0.4' },
	{ path: '/voices', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.8' },
	{ path: '/blog', lastmod: latestPostDate, changefreq: 'weekly', priority: '0.8' },
	{ path: '/changelog', lastmod: latestChangelogDate, changefreq: 'weekly', priority: '0.5' },
	{ path: '/accessibility', lastmod: '2026-05-14', changefreq: 'yearly', priority: '0.3' }
];

const BLOG_URLS: SitemapUrl[] = getAllPosts().map((post) => ({
	path: `/blog/${post.slug}`,
	lastmod: post.date || FALLBACK_LASTMOD,
	changefreq: 'monthly',
	priority: '0.6'
}));

function toUrlEntry({ path, lastmod, changefreq, priority }: SitemapUrl) {
	const loc = path === '/' ? `${SITE}/` : `${SITE}${path}`;

	return [
		'  <url>',
		`    <loc>${loc}</loc>`,
		`    <lastmod>${lastmod}</lastmod>`,
		`    <changefreq>${changefreq}</changefreq>`,
		`    <priority>${priority}</priority>`,
		'  </url>'
	].join('\n');
}

export const GET: RequestHandler = async ({ cookies, setHeaders }) => {
	const supabase = createSupabaseServerClient(cookies);

	const { data } = await supabase
		.from('community_entries')
		.select('created_at')
		.order('created_at', { ascending: false })
		.limit(1);

	const communityLastmod = data?.[0]?.created_at
		? new Date(data[0].created_at).toISOString().slice(0, 10)
		: FALLBACK_LASTMOD;

	const urls: SitemapUrl[] = [
		...STATIC_URLS,
		...BLOG_URLS,
		{
			path: '/community',
			lastmod: communityLastmod,
			changefreq: 'daily',
			priority: '0.7'
		}
	];

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		urls.map(toUrlEntry).join('\n') +
		`\n</urlset>\n`;

	setHeaders({
		'content-type': 'application/xml; charset=utf-8',
		'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	return new Response(body);
};

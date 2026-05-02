import matter from 'gray-matter';
import { marked } from 'marked';

export type PostMeta = {
	slug: string;
	title: string;
	date: string;
	description: string;
	tags: string[];
	featured: string;
	featuredAlt: string;
};

export type Post = PostMeta & {
	html: string;
};

const files = import.meta.glob('/src/posts/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const markedOptions = { async: false, gfm: true, breaks: false } as const;

function parse(path: string, raw: string): Post {
	const slug = path.split('/').pop()!.replace(/\.md$/, '');
	const { data, content } = matter(raw);

	const date =
		data.date instanceof Date
			? data.date.toISOString().slice(0, 10)
			: typeof data.date === 'string'
				? data.date
				: '';

	const tags = Array.isArray(data.tags)
		? data.tags.map(String)
		: typeof data.tags === 'string'
			? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
			: [];

	return {
		slug,
		title: typeof data.title === 'string' ? data.title : slug,
		date,
		description: typeof data.description === 'string' ? data.description : '',
		tags,
		featured: typeof data.featured === 'string' ? data.featured : '',
		featuredAlt: typeof data.featuredAlt === 'string' ? data.featuredAlt : '',
		html: marked.parse(content, markedOptions) as string
	};
}

const posts: Post[] = Object.entries(files)
	.map(([path, raw]) => parse(path, raw))
	.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function getAllPosts(): PostMeta[] {
	return posts.map(({ html: _html, ...meta }) => meta);
}

export function getPost(slug: string): Post | undefined {
	return posts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
	return posts.map((p) => p.slug);
}

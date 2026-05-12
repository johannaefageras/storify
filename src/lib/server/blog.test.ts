import { describe, it, expect } from 'vitest';
import { getAllPosts, getPost, getAllSlugs } from './blog';

// Integration-style: blog.ts uses import.meta.glob to bundle src/posts/*.md
// at build/test time, so these run against the real corpus.

describe('blog', () => {
	it('returns at least one post', () => {
		expect(getAllPosts().length).toBeGreaterThan(0);
	});

	it('every post has slug, title, and date', () => {
		for (const meta of getAllPosts()) {
			expect(meta.slug).toBeTruthy();
			expect(meta.title).toBeTruthy();
			expect(meta.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(Array.isArray(meta.tags)).toBe(true);
		}
	});

	it('sorts posts by date descending', () => {
		const dates = getAllPosts().map((p) => p.date);
		const sorted = [...dates].sort().reverse();
		expect(dates).toEqual(sorted);
	});

	it('slugs are unique', () => {
		const slugs = getAllSlugs();
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('getPost returns a post with rendered HTML', () => {
		const slug = getAllSlugs()[0];
		const post = getPost(slug);
		expect(post).toBeDefined();
		expect(post!.slug).toBe(slug);
		expect(post!.html).toContain('<'); // some HTML tag rendered
	});

	it('getPost returns undefined for unknown slug', () => {
		expect(getPost('definitely-not-a-real-post-xyz')).toBeUndefined();
	});

	it('getAllPosts omits the html field', () => {
		const meta = getAllPosts()[0] as unknown as Record<string, unknown>;
		expect(meta.html).toBeUndefined();
	});

	it('tags are normalized to string arrays', () => {
		for (const meta of getAllPosts()) {
			for (const tag of meta.tags) {
				expect(typeof tag).toBe('string');
				expect(tag.length).toBeGreaterThan(0);
			}
		}
	});
});

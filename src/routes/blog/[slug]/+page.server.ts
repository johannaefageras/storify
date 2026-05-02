import { error } from '@sveltejs/kit';
import { getAllSlugs, getPost } from '$lib/server/blog';

export const prerender = true;

export function entries() {
	return getAllSlugs().map((slug) => ({ slug }));
}

export function load({ params }) {
	const post = getPost(params.slug);
	if (!post) throw error(404, 'Inlägg hittades inte');
	return { post };
}

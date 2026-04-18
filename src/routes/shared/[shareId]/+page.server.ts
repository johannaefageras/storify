import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data, error: fetchError } = await locals.supabase
		.from('entries')
		.select('generated_text, tone_id, entry_date, weekday, emojis, created_at')
		.eq('share_id', params.shareId)
		.eq('is_public', true)
		.maybeSingle();

	if (fetchError || !data) {
		throw error(404, 'Delningen hittades inte eller är inte längre tillgänglig.');
	}

	return { entry: data };
};

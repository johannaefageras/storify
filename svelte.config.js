import adapterVercel from '@sveltejs/adapter-vercel';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isVercel = process.env.VERCEL === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: isVercel
			? adapterVercel()
			: adapterStatic({
					// Output directory for the static build (Capacitor will use this)
					pages: 'build',
					assets: 'build',
					fallback: 'index.html', // SPA fallback for client-side routing
					precompress: false,
					strict: true
				})
	}
};

export default config;

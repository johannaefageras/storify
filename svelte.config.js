import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Render sets RENDER=true automatically
const isRender = process.env.RENDER === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: isRender
			? adapterNode()
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

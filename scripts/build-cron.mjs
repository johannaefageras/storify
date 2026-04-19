// Bundle the weekly-newsletter cron entry into a single self-contained ESM
// file. Run by Render's cron service buildCommand and by `npm run build:cron`.

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

await build({
	entryPoints: [resolve(root, 'scripts/send-weekly.ts')],
	outfile: resolve(root, 'dist/cron/send-weekly.js'),
	bundle: true,
	platform: 'node',
	target: 'node20',
	format: 'esm',
	sourcemap: true,
	logLevel: 'info',
	// A handful of bundled deps reach for CommonJS-only helpers via require();
	// shim it so the ESM output still resolves those calls at runtime.
	banner: {
		js: "import { createRequire as __createRequire } from 'module'; const require = __createRequire(import.meta.url);"
	}
});

console.log('✓ built dist/cron/send-weekly.js');

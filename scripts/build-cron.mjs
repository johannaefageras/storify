// Bundle cron entries into self-contained ESM files.
// Run by Render's cron service buildCommand and by `npm run build:cron`.

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const entries = [
	{ in: 'scripts/send-weekly.ts', out: 'dist/cron/send-weekly.js' },
	{ in: 'scripts/send-reminders.ts', out: 'dist/cron/send-reminders.js' }
];

for (const entry of entries) {
	await build({
		entryPoints: [resolve(root, entry.in)],
		outfile: resolve(root, entry.out),
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
	console.log(`✓ built ${entry.out}`);
}

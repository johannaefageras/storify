import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SEARCH_DIRS = ['src/routes', 'src/posts'];
const ALLOWED_FROZEN_POST = path.normalize('src/posts/32-roster-dagbok-inte-gimmick.md');
const PUBLIC_VOICE_COUNT_PATTERN =
	/\b\d{1,3}\s+(?:olika\s+)?(?:röster|skrivstilar)\b|\b(?:en|ingen)\s+av\s+de\s+\d{1,3}\s+rösterna\b/gi;

function listPublicCopyFiles(dir: string): string[] {
	if (!existsSync(dir)) return [];

	return readdirSync(dir).flatMap((entry) => {
		const fullPath = path.join(dir, entry);
		const stats = statSync(fullPath);

		if (stats.isDirectory()) return listPublicCopyFiles(fullPath);
		if (stats.isFile() && (fullPath.endsWith('.svelte') || fullPath.endsWith('.md'))) {
			return [fullPath];
		}

		return [];
	});
}

describe('public copy count guardrails', () => {
	it('does not hardcode public voice counts outside the frozen 32-voices article', () => {
		const files = SEARCH_DIRS.flatMap((dir) => listPublicCopyFiles(path.join(ROOT, dir)));
		const violations = files.flatMap((file) => {
			const relative = path.relative(ROOT, file);
			if (path.normalize(relative) === ALLOWED_FROZEN_POST) return [];

			const content = readFileSync(file, 'utf8');
			return [...content.matchAll(PUBLIC_VOICE_COUNT_PATTERN)].map((match) => {
				const line = content.slice(0, match.index ?? 0).split('\n').length;
				return `${relative}:${line}: ${match[0]}`;
			});
		});

		expect(violations).toEqual([]);
	});
});

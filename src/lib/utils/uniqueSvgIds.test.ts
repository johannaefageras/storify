import { describe, it, expect } from 'vitest';
import { uniqueSvgIds } from './uniqueSvgIds';

const suffixRe = /[a-z0-9]{1,8}/;

function extractSuffix(input: string, marker: string): string | null {
	const m = input.match(new RegExp(`${marker}_([a-z0-9]+)`));
	return m?.[1] ?? null;
}

describe('uniqueSvgIds', () => {
	it('rewrites id attributes with an instance suffix', () => {
		const result = uniqueSvgIds(
			'<svg><linearGradient id="grad"/><rect fill="url(#grad)"/></svg>'
		);
		expect(result).toMatch(/id="grad_[a-z0-9]+"/);
		expect(result).toMatch(/url\(#grad_[a-z0-9]+\)/);
		expect(result).not.toContain('id="grad"');
	});

	it('uses the same suffix within a single call', () => {
		const result = uniqueSvgIds('<svg><a id="x"/><b id="y"/></svg>');
		const sx = extractSuffix(result, 'x');
		const sy = extractSuffix(result, 'y');
		expect(sx).not.toBeNull();
		expect(sx).toBe(sy);
	});

	it('produces a different suffix on a second call', () => {
		const a = uniqueSvgIds('<svg><a id="x"/></svg>');
		const b = uniqueSvgIds('<svg><a id="x"/></svg>');
		expect(a).not.toBe(b);
	});

	it('rewrites href="#..." references', () => {
		const result = uniqueSvgIds('<svg><a id="ref"/><use href="#ref"/></svg>');
		const suffix = extractSuffix(result, 'ref');
		expect(suffix).toMatch(suffixRe);
		expect(result).toContain(`href="#ref_${suffix}"`);
	});

	it('rewrites legacy xlink:href references', () => {
		const result = uniqueSvgIds('<svg><a id="ref"/><use xlink:href="#ref"/></svg>');
		const suffix = extractSuffix(result, 'ref');
		expect(result).toContain(`xlink:href="#ref_${suffix}"`);
	});

	it('rewrites class definitions and usages in style blocks', () => {
		const svg = `<svg><style>.d { fill: red; } .e { stroke: blue; }</style><path class="d"/><path class="e"/></svg>`;
		const result = uniqueSvgIds(svg);
		const sd = extractSuffix(result, 'd');
		expect(sd).toMatch(suffixRe);
		expect(result).toContain(`.d_${sd} {`);
		expect(result).toContain(`.e_${sd} {`);
		expect(result).toContain(`class="d_${sd}"`);
		expect(result).toContain(`class="e_${sd}"`);
	});

	it('handles multi-class class attributes', () => {
		const svg = `<svg><style>.a { fill: 1; } .b { fill: 2; }</style><path class="a b"/></svg>`;
		const result = uniqueSvgIds(svg);
		const sa = extractSuffix(result, 'a');
		expect(result).toContain(`class="a_${sa} b_${sa}"`);
	});

	it('rewrites ids that contain regex special characters', () => {
		const result = uniqueSvgIds('<svg><a id="a.b+c"/><rect fill="url(#a.b+c)"/></svg>');
		expect(result).toMatch(/id="a\.b\+c_[a-z0-9]+"/);
		expect(result).toMatch(/url\(#a\.b\+c_[a-z0-9]+\)/);
	});

	it('returns the input unchanged when there are no ids or classes', () => {
		const input = '<svg><rect width="10" height="10"/></svg>';
		expect(uniqueSvgIds(input)).toBe(input);
	});

	it('leaves unknown class names in class attributes untouched', () => {
		const svg = `<svg><style>.known { fill: red; }</style><path class="known notdefined"/></svg>`;
		const result = uniqueSvgIds(svg);
		const sk = extractSuffix(result, 'known');
		expect(result).toContain(`class="known_${sk} notdefined"`);
	});
});

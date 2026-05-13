import { describe, it, expect, vi, beforeEach } from 'vitest';

const { messagesCreate, AnthropicMock } = vi.hoisted(() => {
	const messagesCreate = vi.fn();
	function AnthropicCtor(this: { messages: { create: typeof messagesCreate } }) {
		this.messages = { create: messagesCreate };
	}
	const AnthropicMock = vi.fn(AnthropicCtor as unknown as () => void);
	return { messagesCreate, AnthropicMock };
});

vi.mock('@anthropic-ai/sdk', () => ({ default: AnthropicMock }));
vi.mock('$env/static/private', () => ({ ANTHROPIC_API_KEY: 'test-key' }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));

import { generateTitleServer } from './generateTitleServer';

beforeEach(() => {
	messagesCreate.mockReset();
});

function textResponse(text: string) {
	return { content: [{ type: 'text', text }] };
}

describe('generateTitleServer', () => {
	it('returns the cleaned title from the model response', async () => {
		messagesCreate.mockResolvedValueOnce(textResponse('En lugn morgon i parken'));
		const title = await generateTitleServer('Jag gick en promenad i parken idag.');
		expect(title).toBe('En lugn morgon i parken');
	});

	it('returns null for empty/whitespace input without calling the model', async () => {
		expect(await generateTitleServer('')).toBeNull();
		expect(await generateTitleServer('   \n  ')).toBeNull();
		expect(messagesCreate).not.toHaveBeenCalled();
	});

	it('returns null when the model throws', async () => {
		messagesCreate.mockRejectedValueOnce(new Error('rate limited'));
		const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const title = await generateTitleServer('Något hände idag');
		expect(title).toBeNull();
		expect(errSpy).toHaveBeenCalled();
		errSpy.mockRestore();
	});

	it('returns null when response has no text block', async () => {
		messagesCreate.mockResolvedValueOnce({ content: [{ type: 'tool_use', input: {} }] });
		expect(await generateTitleServer('text')).toBeNull();
	});

	it('returns null when cleaned title is empty', async () => {
		messagesCreate.mockResolvedValueOnce(textResponse('   '));
		expect(await generateTitleServer('text')).toBeNull();
	});

	it('uses the English system prompt for britten tone', async () => {
		messagesCreate.mockResolvedValueOnce(textResponse('A grey Tuesday morning'));
		await generateTitleServer('Walked through Hyde Park.', 'britten');
		const args = messagesCreate.mock.calls[0][0];
		expect(args.system).toMatch(/Respond with only the title/);
	});

	it('uses the Swedish system prompt for other tones', async () => {
		messagesCreate.mockResolvedValueOnce(textResponse('En vanlig tisdag'));
		await generateTitleServer('Promenad i parken.', 'dagboksskribenten');
		const args = messagesCreate.mock.calls[0][0];
		expect(args.system).toMatch(/Svara endast med titeln/);
	});

	it('trims input before sending', async () => {
		messagesCreate.mockResolvedValueOnce(textResponse('Titel'));
		await generateTitleServer('   hej   ');
		const args = messagesCreate.mock.calls[0][0];
		const content = args.messages[0].content;
		expect(content).toContain('hej');
		expect(content).not.toContain('   hej');
	});
});

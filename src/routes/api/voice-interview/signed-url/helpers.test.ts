import { describe, it, expect } from 'vitest';
import { resolveAgentId, buildSignedUrlEndpoint } from './helpers';

const map = {
	friend: 'agent_friend_123',
	journalist: 'agent_journalist_456',
	therapist: 'agent_therapist_789'
};

describe('resolveAgentId', () => {
	it('returns the agent id for a known persona', () => {
		expect(resolveAgentId('friend', map)).toBe('agent_friend_123');
		expect(resolveAgentId('journalist', map)).toBe('agent_journalist_456');
		expect(resolveAgentId('therapist', map)).toBe('agent_therapist_789');
	});

	it('returns null for an unknown persona', () => {
		expect(resolveAgentId('hacker', map)).toBeNull();
	});

	it('returns null for non-string input', () => {
		expect(resolveAgentId(undefined, map)).toBeNull();
		expect(resolveAgentId(null, map)).toBeNull();
		expect(resolveAgentId(123, map)).toBeNull();
	});

	it('returns null when the agent id is unconfigured', () => {
		expect(resolveAgentId('friend', { friend: undefined, journalist: 'x', therapist: 'y' })).toBeNull();
		expect(resolveAgentId('friend', { friend: '', journalist: 'x', therapist: 'y' })).toBeNull();
	});
});

describe('buildSignedUrlEndpoint', () => {
	it('encodes the agent id as a query parameter', () => {
		expect(buildSignedUrlEndpoint('agent_abc')).toBe(
			'https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=agent_abc'
		);
	});
});

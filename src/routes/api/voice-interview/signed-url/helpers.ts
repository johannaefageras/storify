import { VALID_INTERVIEWER_IDS, type InterviewerId } from '$lib/data/chatbotPrompts';

export interface AgentIdMap {
	friend: string | undefined;
	journalist: string | undefined;
	therapist: string | undefined;
}

export function resolveAgentId(personaId: unknown, map: AgentIdMap): string | null {
	if (typeof personaId !== 'string') return null;
	if (!VALID_INTERVIEWER_IDS.includes(personaId as InterviewerId)) return null;
	const id = map[personaId as InterviewerId];
	return id && id.length > 0 ? id : null;
}

export function buildSignedUrlEndpoint(agentId: string): string {
	const params = new URLSearchParams({ agent_id: agentId });
	return `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?${params}`;
}

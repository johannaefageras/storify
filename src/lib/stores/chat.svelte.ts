import { browser } from '$app/environment';
import {
	DEFAULT_INTERVIEWER,
	VALID_INTERVIEWER_IDS,
	type InterviewerId
} from '$lib/data/chatbotPrompts';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
}

export type InterviewPhase =
	| 'interviewer-selection'
	| 'empty'
	| 'chatting'
	| 'tone-selection'
	| 'generating'
	| 'result';

const CHAT_DRAFT_KEY = 'storify-chat-draft';
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ChatDraft {
	messages: ChatMessage[];
	phase: InterviewPhase;
	selectedInterviewer: InterviewerId;
	selectedTone: string;
	includeHoroscope: boolean;
	includeOnThisDay: boolean;
	includeHomework: boolean;
	savedAt: number;
}

let messageIdCounter = 0;

function generateMessageId(): string {
	return `msg-${Date.now()}-${++messageIdCounter}`;
}

function createChatStore() {
	let messages = $state<ChatMessage[]>([]);
	let phase = $state<InterviewPhase>('interviewer-selection');
	let isStreaming = $state(false);
	let selectedInterviewer = $state<InterviewerId>(DEFAULT_INTERVIEWER);
	let selectedTone = $state('');
	let generatedEntry = $state('');
	let includeHoroscope = $state(false);
	let includeOnThisDay = $state(false);
	let includeHomework = $state(true);
	let error = $state('');

	let draftSaveTimer: ReturnType<typeof setTimeout> | null = null;

	function scheduleDraftSave() {
		if (!browser) return;
		if (draftSaveTimer) clearTimeout(draftSaveTimer);
		draftSaveTimer = setTimeout(() => saveDraftNow(), 500);
	}

	async function saveDraftNow() {
		if (!browser) return;
		try {
			const draft: ChatDraft = {
				messages: messages.map((m) => ({ ...m })),
				phase,
				selectedInterviewer,
				selectedTone,
				includeHoroscope,
				includeOnThisDay,
				includeHomework,
				savedAt: Date.now()
			};
			localStorage.setItem(CHAT_DRAFT_KEY, JSON.stringify(draft));
		} catch (e) {
			console.error('Failed to save chat draft:', e);
		}
	}

	return {
		get messages() {
			return messages;
		},
		get phase() {
			return phase;
		},
		get isStreaming() {
			return isStreaming;
		},
		get selectedInterviewer() {
			return selectedInterviewer;
		},
		get selectedTone() {
			return selectedTone;
		},
		get generatedEntry() {
			return generatedEntry;
		},
		get includeHoroscope() {
			return includeHoroscope;
		},
		get includeOnThisDay() {
			return includeOnThisDay;
		},
		get includeHomework() {
			return includeHomework;
		},
		get error() {
			return error;
		},
		get hasMessages() {
			return messages.some((m) => m.role === 'user');
		},
		get isEmpty() {
			return phase === 'empty';
		},
		get messageCount() {
			return messages.length;
		},
		get isNearLimit() {
			return messages.length >= 30;
		},
		get isAtLimit() {
			return messages.length >= 36;
		},
		get sendsRemaining() {
			return Math.max(0, Math.ceil((36 - messages.length) / 2));
		},

		// Conversation
		addUserMessage(content: string) {
			messages.push({
				id: generateMessageId(),
				role: 'user',
				content,
				timestamp: Date.now()
			});
			scheduleDraftSave();
		},
		addAssistantMessage(content: string) {
			messages.push({
				id: generateMessageId(),
				role: 'assistant',
				content,
				timestamp: Date.now()
			});
			scheduleDraftSave();
		},
		appendToLastAssistantMessage(chunk: string) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage && lastMessage.role === 'assistant') {
				lastMessage.content += chunk;
			}
		},
		removeLastAssistantMessage() {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage && lastMessage.role === 'assistant') {
				messages.pop();
			}
		},
		setStreaming(value: boolean) {
			isStreaming = value;
			if (!value && messages.length > 0) {
				scheduleDraftSave();
			}
		},
		setError(value: string) {
			error = value;
		},

		// Interviewer selection
		setInterviewer(id: InterviewerId) {
			selectedInterviewer = id;
			scheduleDraftSave();
		},
		chooseInterviewerAndContinue(id: InterviewerId) {
			selectedInterviewer = id;
			phase = 'empty';
			scheduleDraftSave();
		},
		backToInterviewerSelection() {
			phase = 'interviewer-selection';
			scheduleDraftSave();
		},

		// Phase transitions
		startChatting() {
			phase = 'chatting';
		},
		finishInterview() {
			phase = 'tone-selection';
		},
		backToInterview() {
			phase = 'chatting';
		},
		startGenerating() {
			phase = 'generating';
		},
		showResult(entry: string) {
			generatedEntry = entry;
			phase = 'result';
		},

		// Tone selection
		setSelectedTone(toneId: string) {
			selectedTone = toneId;
			scheduleDraftSave();
		},
		setAddon(key: 'horoscope' | 'onThisDay' | 'homework', value: boolean) {
			switch (key) {
				case 'horoscope':
					includeHoroscope = value;
					break;
				case 'onThisDay':
					includeOnThisDay = value;
					break;
				case 'homework':
					includeHomework = value;
					break;
			}
			scheduleDraftSave();
		},

		// Draft persistence
		async loadDraft(): Promise<boolean> {
			if (!browser) return false;
			try {
				const value = localStorage.getItem(CHAT_DRAFT_KEY);
				if (!value) return false;
				const draft: ChatDraft = JSON.parse(value);
				if (Date.now() - draft.savedAt > DRAFT_EXPIRY_MS) {
					localStorage.removeItem(CHAT_DRAFT_KEY);
					return false;
				}
				messages = draft.messages;
				const rawInterviewer = draft.selectedInterviewer as InterviewerId | undefined;
				selectedInterviewer =
					rawInterviewer && VALID_INTERVIEWER_IDS.includes(rawInterviewer)
						? rawInterviewer
						: DEFAULT_INTERVIEWER;
				if (draft.messages.length === 0) {
					phase = 'interviewer-selection';
				} else if (draft.phase === 'interviewer-selection') {
					phase = 'chatting';
				} else {
					phase = draft.phase;
				}
				selectedTone = draft.selectedTone;
				includeHoroscope = draft.includeHoroscope;
				includeOnThisDay = draft.includeOnThisDay;
				includeHomework = draft.includeHomework;
				return true;
			} catch (e) {
				console.error('Failed to load chat draft:', e);
				return false;
			}
		},
		async clearDraft() {
			if (!browser) return;
			if (draftSaveTimer) clearTimeout(draftSaveTimer);
			try {
				localStorage.removeItem(CHAT_DRAFT_KEY);
			} catch (e) {
				console.error('Failed to clear chat draft:', e);
			}
		},

		// Lifecycle
		reset() {
			messages = [];
			phase = 'interviewer-selection';
			isStreaming = false;
			selectedInterviewer = DEFAULT_INTERVIEWER;
			selectedTone = '';
			generatedEntry = '';
			includeHoroscope = false;
			includeOnThisDay = false;
			includeHomework = true;
			error = '';
		}
	};
}

export const chatStore = createChatStore();

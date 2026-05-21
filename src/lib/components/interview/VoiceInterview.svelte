<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Conversation } from '@elevenlabs/client';
	import type { VoiceConversation } from '@elevenlabs/client';
	import { chatStore } from '$lib/stores/chat.svelte';
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { getApiUrl } from '$lib/config';
	import { Emoji } from '$lib/assets/emojis';

	const DEBUG = true;
	function log(...args: unknown[]) {
		if (DEBUG) console.log('[VoiceInterview]', ...args);
	}

	interface Props {
		onExitChat: () => void | Promise<void>;
		onBack?: () => void;
	}

	let { onExitChat, onBack }: Props = $props();

	type Status = 'idle' | 'connecting' | 'connected' | 'disconnecting';
	type Mode = 'speaking' | 'listening';

	let status = $state<Status>('idle');
	let mode = $state<Mode>('listening');
	let isMuted = $state(false);
	let error = $state('');
	let conversation: VoiceConversation | null = null;

	let canStart = $derived(status === 'idle' && !chatStore.isAtLimit);
	let canStop = $derived(status === 'connected' || status === 'connecting');
	let canFinish = $derived(chatStore.hasMessages && status === 'idle');
	let canExit = $derived(status === 'idle');

	function buildFirstMessage(): string | undefined {
		const name = wizardStore.data.profile.name.trim();
		if (!name) return undefined;
		return `Hej ${name}! Hur har din dag varit?`;
	}

	async function fetchSignedUrl(personaId: string): Promise<string> {
		const res = await fetch(getApiUrl('/api/voice-interview/signed-url'), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ personaId })
		});
		if (!res.ok) {
			const data = await res.json().catch(() => null);
			throw new Error(data?.error ?? `Kunde inte starta röstsamtalet (${res.status}).`);
		}
		const data = (await res.json()) as { signedUrl?: string };
		if (!data.signedUrl) throw new Error('Ogiltigt svar från servern.');
		return data.signedUrl;
	}

	async function start() {
		if (!canStart) return;
		error = '';
		status = 'connecting';

		try {
			const signedUrl = await fetchSignedUrl(chatStore.selectedInterviewer);
			const firstMessage = buildFirstMessage();

			conversation = await Conversation.startSession({
				signedUrl,
				connectionType: 'websocket',
				textOnly: false,
				...(firstMessage ? { overrides: { agent: { firstMessage } } } : {}),
				onStatusChange: ({ status: s }) => {
					log('status →', s);
					status = s as Status;
				},
				onModeChange: ({ mode: m }) => {
					log('mode →', m);
					mode = m;
				},
				onMessage: ({ message, role }) => {
					log('message', role, JSON.stringify(message).slice(0, 120));
					if (!message || !message.trim()) return;
					if (role === 'user') {
						chatStore.addUserMessage(message);
						if (chatStore.phase === 'empty') chatStore.startChatting();
					} else {
						chatStore.addAssistantMessage(message);
					}
				},
				onError: (msg, context) => {
					log('ERROR', msg, context);
					error = msg || 'Något gick fel i röstsamtalet.';
				},
				onDisconnect: (details) => {
					log('DISCONNECT', details);
					status = 'idle';
					mode = 'listening';
					conversation = null;
				}
			});

			isMuted = false;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Kunde inte ansluta. Försök igen.';
			status = 'idle';
			conversation = null;
		}
	}

	async function stop() {
		if (!conversation) {
			status = 'idle';
			return;
		}
		status = 'disconnecting';
		try {
			await conversation.endSession();
		} catch (e) {
			console.error('endSession failed:', e);
		} finally {
			conversation = null;
			status = 'idle';
			mode = 'listening';
		}
	}

	function toggleMute() {
		if (!conversation) return;
		isMuted = !isMuted;
		conversation.setMicMuted(isMuted);
	}

	function handleFinish() {
		if (!canFinish) return;
		chatStore.finishInterview();
	}

	async function handleExitChat() {
		if (conversation) await stop();
		onExitChat();
	}

	onDestroy(() => {
		if (conversation) {
			log('component destroyed while connected — ending session');
			conversation.endSession().catch((e) => console.error('endSession on unmount failed:', e));
			conversation = null;
		}
	});
</script>

<div class="voice-wrapper">
	<div
		class="voice-card"
		class:is-speaking={status === 'connected' && mode === 'speaking'}
		class:is-listening={status === 'connected' && mode === 'listening'}
	>
		<div class="orb" aria-hidden="true">
			<span class="orb-inner"></span>
		</div>
		<p class="status-text">
			{#if status === 'connecting'}
				Ansluter…
			{:else if status === 'disconnecting'}
				Avslutar…
			{:else if status === 'connected' && mode === 'speaking'}
				Pratar…
			{:else if status === 'connected'}
				Lyssnar…
			{:else}
				Tryck på mikrofonen för att börja prata
			{/if}
		</p>
	</div>

	{#if error}
		<div class="error-bar" role="alert">{error}</div>
	{/if}

	<div class="controls">
		{#if status === 'idle'}
			<button class="mic-btn" onclick={start} disabled={!canStart} aria-label="Starta röstsamtal">
				<Emoji name="studio-microphone" size={28} />
				<span>Börja prata</span>
			</button>
		{:else}
			<button class="mic-btn mic-btn-stop" onclick={stop} disabled={!canStop} aria-label="Avsluta röstsamtal">
				<Emoji name="cross-mark" size={20} />
				<span>Avsluta samtal</span>
			</button>
			<button class="mute-btn" onclick={toggleMute}>
				{isMuted ? 'Slå på mic' : 'Stäng av mic'}
			</button>
		{/if}
	</div>

	{#if chatStore.phase === 'empty' && onBack}
		<button type="button" class="back-link" onclick={onBack}>
			<span>Välj en annan intervjuare</span>
		</button>
	{/if}

	{#if chatStore.phase === 'chatting'}
		<div class="chat-actions">
			<button class="done-btn" onclick={handleFinish} disabled={!canFinish}>
				Jag är klar — skapa dagbok
			</button>
			<button class="exit-chat-btn" onclick={handleExitChat} disabled={!canExit}>
				Avsluta samtalet
			</button>
		</div>
	{/if}
</div>

<style>
	.voice-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.voice-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem 1rem;
		background: var(--color-bg-elevated);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: border-color 0.2s ease, background-color 0.2s ease;
	}

	.voice-card.is-listening {
		border-color: var(--color-accent);
	}

	.voice-card.is-speaking {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-elevated));
	}

	.orb {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-accent) 14%, transparent);
	}

	.orb-inner {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--color-accent);
		opacity: 0.85;
		transition: transform 0.2s ease, opacity 0.2s ease;
	}

	.voice-card.is-speaking .orb-inner {
		animation: pulse-orb 1.1s ease-in-out infinite;
	}

	@keyframes pulse-orb {
		0%, 100% { transform: scale(1); opacity: 0.85; }
		50% { transform: scale(1.18); opacity: 1; }
	}

	.status-text {
		margin: 0;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-wide);
		text-align: center;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mic-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1.25rem;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		cursor: pointer;
		transition: background-color 0.2s ease, transform 0.1s ease;
	}

	.mic-btn:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}

	.mic-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.mic-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.mic-btn-stop {
		background: transparent;
		color: var(--color-accent);
		border: 2px solid var(--color-accent);
	}

	.mic-btn-stop:hover:not(:disabled) {
		background: var(--color-accent);
		color: white;
	}

	.mute-btn {
		padding: 0.5rem 0.875rem;
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.mute-btn:hover {
		background: var(--color-neutral);
		color: var(--color-text);
	}

	.error-bar {
		padding: 0.625rem 0.875rem;
		background: var(--color-error-bg);
		border: 1px solid var(--color-error-border);
		border-radius: var(--radius-sm);
		color: var(--color-error);
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		text-align: center;
	}

	.back-link {
		align-self: flex-start;
		padding: 0.125rem 0;
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		text-decoration: underline;
		cursor: pointer;
	}

	.chat-actions {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.done-btn {
		width: 100%;
		padding: 1rem 1.25rem;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-elevated);
		color: var(--color-text);
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wider);
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
	}

	.done-btn:hover:not(:disabled) {
		background: var(--color-accent);
		color: white;
		border-color: var(--color-accent);
	}

	.done-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.exit-chat-btn {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-muted);
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		cursor: pointer;
	}

	.exit-chat-btn:hover:not(:disabled) {
		background: var(--color-neutral);
		color: var(--color-text);
	}

	.exit-chat-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>

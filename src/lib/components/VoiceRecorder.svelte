<script lang="ts">
	import { onDestroy } from 'svelte';
	import { getApiUrl } from '$lib/config';
	import { Emoji } from '$lib/assets/emojis';

	interface Props {
		text: string;
		onTextChange: (value: string) => void;
		disabled?: boolean;
	}

	let { text, onTextChange, disabled = false }: Props = $props();

	const MAX_SECONDS = 300; // 5 min hard cap
	const MAX_TRANSCRIPT_CHARS = 2000;

	type Status = 'idle' | 'requesting' | 'recording' | 'processing' | 'error';

	let status = $state<Status>('idle');
	let elapsed = $state(0);
	let errorMessage = $state('');

	let mediaRecorder: MediaRecorder | null = null;
	let mediaStream: MediaStream | null = null;
	let chunks: Blob[] = [];
	let timerId: ReturnType<typeof setInterval> | null = null;
	let mimeType = '';

	function pickMimeType(): string {
		if (typeof MediaRecorder === 'undefined') return '';
		const candidates = [
			'audio/webm;codecs=opus',
			'audio/webm',
			'audio/mp4',
			'audio/ogg;codecs=opus'
		];
		for (const c of candidates) {
			if (MediaRecorder.isTypeSupported(c)) return c;
		}
		return '';
	}

	function formatTime(s: number): string {
		const m = Math.floor(s / 60);
		const r = s % 60;
		return `${m}:${r.toString().padStart(2, '0')}`;
	}

	function clearTimer() {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		}
	}

	function releaseStream() {
		if (mediaStream) {
			mediaStream.getTracks().forEach((t) => t.stop());
			mediaStream = null;
		}
	}

	async function startRecording() {
		if (status === 'recording' || status === 'processing' || status === 'requesting') return;
		errorMessage = '';
		status = 'requesting';

		try {
			mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (err) {
			console.error('getUserMedia failed', err);
			status = 'error';
			const name = err instanceof Error ? err.name : '';
			if (name === 'NotAllowedError' || name === 'SecurityError') {
				errorMessage = 'Mikrofonåtkomst nekades. Tillåt mikrofon i webbläsaren och försök igen.';
			} else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
				errorMessage = 'Ingen mikrofon hittades.';
			} else {
				errorMessage = 'Kunde inte starta inspelningen.';
			}
			return;
		}

		mimeType = pickMimeType();
		try {
			mediaRecorder = mimeType
				? new MediaRecorder(mediaStream, { mimeType })
				: new MediaRecorder(mediaStream);
		} catch (err) {
			console.error('MediaRecorder init failed', err);
			releaseStream();
			status = 'error';
			errorMessage = 'Inspelning stöds inte i den här webbläsaren.';
			return;
		}

		chunks = [];
		mediaRecorder.ondataavailable = (e) => {
			if (e.data && e.data.size > 0) chunks.push(e.data);
		};
		mediaRecorder.onerror = (e) => {
			console.error('MediaRecorder error', e);
			status = 'error';
			errorMessage = 'Något gick fel under inspelningen.';
			clearTimer();
			releaseStream();
		};
		mediaRecorder.onstop = handleStop;

		mediaRecorder.start();
		status = 'recording';
		elapsed = 0;
		timerId = setInterval(() => {
			elapsed += 1;
			if (elapsed >= MAX_SECONDS) stopRecording();
		}, 1000);
	}

	function stopRecording() {
		if (status !== 'recording') return;
		clearTimer();
		try {
			mediaRecorder?.stop();
		} catch (err) {
			console.error('MediaRecorder stop failed', err);
		}
	}

	async function handleStop() {
		releaseStream();
		const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
		chunks = [];
		mediaRecorder = null;

		if (blob.size === 0) {
			status = 'error';
			errorMessage = 'Inspelningen är tom. Försök igen.';
			return;
		}

		status = 'processing';

		const form = new FormData();
		const ext = mimeType.includes('mp4')
			? 'm4a'
			: mimeType.includes('ogg')
				? 'ogg'
				: 'webm';
		form.append('file', blob, `recording.${ext}`);

		try {
			const res = await fetch(getApiUrl('/api/transcribe'), {
				method: 'POST',
				body: form
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				status = 'error';
				errorMessage = data?.error || 'Kunde inte transkribera. Försök igen.';
				return;
			}

			const data = (await res.json()) as { text?: string };
			const transcript = (data.text || '').trim();
			if (!transcript) {
				status = 'error';
				errorMessage = 'Vi kunde inte höra något. Prova att tala lite tydligare.';
				return;
			}

			const merged = text.trim() ? `${text.trim()}\n\n${transcript}` : transcript;
			onTextChange(merged);
			status = 'idle';
			elapsed = 0;
		} catch (err) {
			console.error('Transcribe fetch failed', err);
			status = 'error';
			errorMessage = 'Kunde inte ansluta till servern. Försök igen.';
		}
	}

	function dismissError() {
		errorMessage = '';
		status = 'idle';
	}

	onDestroy(() => {
		clearTimer();
		try {
			mediaRecorder?.stop();
		} catch {
			// already stopped or never started
		}
		releaseStream();
	});

	const isBusy = $derived(status === 'requesting' || status === 'processing');
</script>

<div class="recorder">
	{#if status === 'recording'}
		<div class="recording-state">
			<div class="pulse-ring">
				<div class="pulse-dot"></div>
			</div>
			<div class="timer" aria-live="polite">{formatTime(elapsed)}</div>
			<button type="button" class="stop-btn" onclick={stopRecording}>
				<span class="stop-square"></span>
				<span>Stoppa inspelning</span>
			</button>
			<p class="hint">Max 5 minuter. Inspelningen stannar automatiskt.</p>
		</div>
	{:else if status === 'processing'}
		<div class="processing-state">
			<span class="spinner"></span>
			<p class="hint">Transkriberar...</p>
		</div>
	{:else if status === 'requesting'}
		<div class="processing-state">
			<span class="spinner"></span>
			<p class="hint">Väntar på mikrofon...</p>
		</div>
	{:else}
		<button
			type="button"
			class="mic-btn"
			onclick={startRecording}
			disabled={disabled || isBusy}
			aria-label="Starta inspelning"
		>
			<Emoji name="studio-microphone" size={36} />
			<span>{text.trim() ? 'Spela in mer' : 'Tryck för att tala in'}</span>
		</button>
	{/if}

	{#if errorMessage}
		<div class="error" role="alert">
			<span>{errorMessage}</span>
			<button type="button" class="error-dismiss" onclick={dismissError}>OK</button>
		</div>
	{/if}

	{#if text.trim() && status !== 'recording' && status !== 'processing'}
		<div class="transcript-wrap">
			<label class="transcript-label" for="voice-transcript">
				Din transkribering – redigera fritt
			</label>
			<textarea
				id="voice-transcript"
				class="transcript"
				rows="5"
				value={text}
				oninput={(e) => onTextChange((e.currentTarget as HTMLTextAreaElement).value)}
				maxlength={MAX_TRANSCRIPT_CHARS}
			></textarea>
			<button
				type="button"
				class="clear-btn"
				onclick={() => onTextChange('')}
			>
				Rensa och spela in på nytt
			</button>
		</div>
	{/if}
</div>

<style>
	.recorder {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.mic-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 7.5rem;
		padding: 1.5rem 1rem;
		background: var(--color-bg-elevated);
		border: 1.5px dashed var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		cursor: pointer;
		transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
	}

	.mic-btn:hover:not(:disabled) {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 6%, var(--color-bg-elevated));
	}

	.mic-btn:active:not(:disabled) {
		transform: scale(0.99);
	}

	.mic-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.recording-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.875rem;
		padding: 1.5rem 1rem;
		background: color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-elevated));
		border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
		border-radius: var(--radius-md);
	}

	.pulse-ring {
		position: relative;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pulse-dot {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: var(--color-accent);
		box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 60%, transparent);
		animation: pulse 1.4s ease-out infinite;
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 60%, transparent);
		}
		70% {
			box-shadow: 0 0 0 18px color-mix(in srgb, var(--color-accent) 0%, transparent);
		}
		100% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 0%, transparent);
		}
	}

	.timer {
		font-family: var(--font-primary);
		font-size: var(--text-xl);
		font-weight: var(--weight-semibold);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
	}

	.stop-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.125rem;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.stop-btn:hover {
		background: var(--color-accent-hover);
	}

	.stop-square {
		display: inline-block;
		width: 0.6rem;
		height: 0.6rem;
		background: white;
		border-radius: 1px;
	}

	.hint {
		margin: 0;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-light);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-wide);
		text-align: center;
	}

	.processing-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		min-height: 7.5rem;
		padding: 1.5rem 1rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.spinner {
		width: 22px;
		height: 22px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.625rem 0.875rem;
		background-color: var(--color-error-bg);
		border: 1px solid var(--color-error-border);
		border-radius: var(--radius-sm);
		color: var(--color-error);
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
	}

	.error-dismiss {
		flex-shrink: 0;
		padding: 0.25rem 0.625rem;
		background: transparent;
		border: 1px solid currentColor;
		border-radius: var(--radius-sm);
		color: inherit;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		cursor: pointer;
	}

	.transcript-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.transcript-label {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		text-align: center;
	}

	.transcript {
		width: 100%;
		padding: 0.75rem 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		color: var(--color-text);
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		outline: none;
		resize: vertical;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.transcript:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
	}

	.clear-btn {
		align-self: center;
		padding: 0.375rem 0.75rem;
		background: transparent;
		border: none;
		color: var(--color-text-muted);
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		text-decoration: underline;
		cursor: pointer;
		transition: color 0.15s ease;
	}

	.clear-btn:hover {
		color: var(--color-accent);
	}
</style>

<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import { getApiUrl } from '$lib/config';
	import { EmojiUsersSilhouette, EmojiCrossMark } from '$lib/assets/emojis';

	interface Props {
		generatedText: string;
		toneId: string;
		entryDate: string;
		emojis?: string[];
		weekday?: string;
		alreadySaved?: boolean;
		onClose: () => void;
		onShared?: () => void;
	}

	let { generatedText, toneId, entryDate, emojis = [], weekday = '', alreadySaved = false, onClose, onShared }: Props = $props();

	let displayName = $state(authStore.isLoggedIn ? '' : '');
	let isSharing = $state(false);
	let shareError = $state('');
	let shareSuccess = $state(false);

	async function shareToCommunity() {
		if (isSharing || shareSuccess) return;
		isSharing = true;
		shareError = '';

		try {
			const res = await fetch(getApiUrl('/api/community'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					generated_text: generatedText,
					tone_id: toneId,
					entry_date: entryDate,
					display_name: displayName.trim() || 'Anonym',
					emojis,
					weekday
				})
			});

			const data = await res.json();

			if (!data.success) {
				shareError = data.error || 'Kunde inte dela inlägget.';
				return;
			}

			// Auto-save to journal if logged in and not already saved
			if (!alreadySaved && authStore.isLoggedIn && authStore.user) {
				try {
					const { supabase } = await import('$lib/supabase/client');
					await supabase.from('entries').insert({
						user_id: authStore.user.id,
						generated_text: generatedText,
						tone_id: toneId,
						entry_date: entryDate,
						weekday,
						emojis
					});
				} catch (err) {
					console.error('Auto-save to journal failed:', err);
				}
			}

			shareSuccess = true;
			onShared?.();
			setTimeout(() => {
				onClose();
			}, 1500);
		} catch {
			shareError = 'Kunde inte ansluta till servern. Försök igen.';
		} finally {
			isSharing = false;
		}
	}
</script>

<div class="share-overlay" onclick={onClose} role="button" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && onClose()}>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="share-modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="share-modal-title" tabindex="-1">
		<div class="share-icon"><EmojiUsersSilhouette size={36} /></div>
		<h2 id="share-modal-title" class="share-title">Dela till Gemenskapen</h2>
		<p class="share-description">
			Din dagboksanteckning delas publikt så att andra Storify-användare kan läsa den.
		</p>

		<div class="share-field">
			<label class="share-label" for="display-name">Visningsnamn</label>
			<input
				id="display-name"
				type="text"
				class="share-input"
				placeholder="Anonym"
				maxlength="50"
				bind:value={displayName}
				onkeydown={(e) => e.key === 'Enter' && shareToCommunity()}
				disabled={isSharing || shareSuccess}
			/>
			<span class="share-hint">Lämna tomt för att dela anonymt</span>
		</div>

		{#if shareError}
			<p class="share-error">{shareError}</p>
		{/if}

		<div class="share-actions">
			<button class="share-btn share-btn-cancel" onclick={onClose} disabled={isSharing}>
				<EmojiCrossMark size={16} />
				Avbryt
			</button>
			<button class="share-btn share-btn-confirm" onclick={shareToCommunity} disabled={isSharing || shareSuccess}>
				{#if shareSuccess}
					<svg class="action-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<polyline points="20 6 9 17 4 12"/>
					</svg>
					Delat!
				{:else if isSharing}
					<span class="spinner"></span>
					Delar...
				{:else}
					<EmojiUsersSilhouette size={18} />
					Dela
				{/if}
			</button>
		</div>
	</div>
</div>

<style>
	.share-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1100;
		padding: 1rem;
		animation: fadeIn 0.15s ease;
	}

	.share-modal {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		padding: 1.5rem;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		animation: slideUp 0.2s ease;
	}

	.share-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.75rem;
		opacity: 0.8;
	}

	.share-title {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
		text-align: center;
	}

	.share-description {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin: 0 0 1.25rem 0;
		text-align: center;
		line-height: var(--leading-relaxed);
	}

	.share-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		width: 100%;
		margin-bottom: 1.25rem;
	}

	.share-label {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.share-input {
		box-sizing: border-box;
		width: 100%;
		padding: 0.75rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		color: var(--color-text);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.share-input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px rgba(244, 63, 122, 0.1);
	}

	.share-input::placeholder {
		color: var(--color-text-muted);
		opacity: 0.6;
	}

	.share-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.share-hint {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.share-error {
		width: 100%;
		margin: 0 0 1rem 0;
		padding: 0.5rem 0.75rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
		border-radius: var(--radius-sm);
		text-align: center;
	}

	.share-actions {
		display: flex;
		gap: 0.75rem;
		width: 100%;
	}

	.share-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.share-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.share-btn-cancel {
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.share-btn-cancel:hover:not(:disabled) {
		background: var(--color-neutral);
		color: var(--color-text);
	}

	.share-btn-confirm {
		background: var(--color-accent);
		color: white;
		border: none;
	}

	.share-btn-confirm:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}

	.action-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	.action-icon.check {
		color: white;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		opacity: 0.8;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideUp {
		from { transform: translateY(8px); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}
</style>

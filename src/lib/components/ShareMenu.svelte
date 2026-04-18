<script lang="ts">
	import { Emoji } from '$lib/assets/emojis';

	interface Props {
		url: string;
		text: string;
		emailSubject?: string;
		emailBody?: string;
		triggerEmoji?: string;
		triggerSize?: number;
	}

	let {
		url,
		text,
		emailSubject = '',
		emailBody = '',
		triggerEmoji = 'link',
		triggerSize = 28
	}: Props = $props();

	let isOpen = $state(false);
	let copied = $state(false);

	function open() {
		isOpen = true;
	}

	function close() {
		isOpen = false;
		copied = false;
	}

	function handleOverlayClick(e: MouseEvent) {
		if ((e.target as HTMLElement).classList.contains('share-overlay')) {
			close();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	function shareTo(platform: string) {
		const encodedUrl = encodeURIComponent(url);
		const encodedText = encodeURIComponent(text);

		const urls: Record<string, string> = {
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
			whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
			telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
			email: `mailto:?subject=${encodeURIComponent(emailSubject || text)}&body=${encodeURIComponent(emailBody || `${text}\n\n${url}`)}`
		};

		const shareUrl = urls[platform];
		if (shareUrl) {
			if (platform === 'email') {
				window.location.href = shareUrl;
			} else {
				window.open(shareUrl, '_blank', 'noopener,noreferrer');
			}
		}
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			console.error('Could not copy link');
		}
	}

	const platforms = [
		{ id: 'facebook', label: 'Facebook', icon: 'social-facebook' },
		{ id: 'x', label: 'X', icon: 'social-x' },
		{ id: 'whatsapp', label: 'WhatsApp', icon: 'social-whatsapp' },
		{ id: 'linkedin', label: 'LinkedIn', icon: 'social-linkedin' },
		{ id: 'telegram', label: 'Telegram', icon: 'social-telegram' },
	] as const;
</script>

<!-- Trigger button -->
<button class="share-trigger" onclick={open} title="Dela" aria-label="Dela">
	<Emoji name={triggerEmoji} size={triggerSize} />
</button>

<!-- Modal -->
{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="share-overlay"
		onclick={handleOverlayClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-label="Delningsalternativ"
		tabindex="-1"
	>
		<div class="share-modal">
			<div class="share-header">
				<Emoji name="satellite" size={28} />
				<h2 class="share-title">Dela</h2>
				<button class="share-close" onclick={close} aria-label="Stäng">
					<Emoji name="cross-mark" size={18} />
				</button>
			</div>

			<div class="share-grid">
				{#each platforms as platform}
					<button
						class="share-platform-btn"
						onclick={() => shareTo(platform.id)}
						title={platform.label}
						aria-label={`Dela via ${platform.label}`}
					>
						<span class="platform-icon">
							<img
								src="/src/lib/assets/icons/{platform.icon}.svg"
								alt=""
								width="28"
								height="28"
								aria-hidden="true"
							/>
						</span>
						<span class="platform-label">{platform.label}</span>
					</button>
				{/each}

				<!-- Email -->
				<button
					class="share-platform-btn"
					onclick={() => shareTo('email')}
					title="E-post"
					aria-label="Dela via e-post"
				>
					<span class="platform-icon platform-icon--email">
						<Emoji name="envelope-email" size={28} />
					</span>
					<span class="platform-label">E-post</span>
				</button>

				<!-- Copy link -->
				<button
					class="share-platform-btn"
					onclick={copyLink}
					title={copied ? 'Kopierad!' : 'Kopiera länk'}
					aria-label="Kopiera länk"
				>
					<span class="platform-icon platform-icon--link">
						{#if copied}
							<Emoji name="check" size={28} />
						{:else}
							<img
								src="/src/lib/assets/icons/link.svg"
								alt=""
								width="28"
								height="28"
								aria-hidden="true"
								class="link-icon-img"
							/>
						{/if}
					</span>
					<span class="platform-label">{copied ? 'Kopierad!' : 'Kopiera'}</span>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ── Trigger ── */
	.share-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.375rem;
		border-radius: var(--radius-sm);
		transition: opacity 0.15s ease, transform 0.15s ease;
	}

	.share-trigger:hover {
		opacity: 0.8;
		transform: scale(1.08);
	}

	.share-trigger:active {
		transform: scale(0.95);
	}

	/* ── Overlay ── */
	.share-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		z-index: 1100;
		padding: 1rem;
		animation: fadeIn 0.15s ease;
	}

	@media (min-width: 600px) {
		.share-overlay {
			align-items: center;
		}
	}

	/* ── Modal ── */
	.share-modal {
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md) var(--radius-md) 0 0;
		padding: 1.25rem 1.5rem 1.5rem;
		width: 100%;
		max-width: 380px;
		box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.25);
		animation: slideUp 0.2s ease;
	}

	@media (min-width: 600px) {
		.share-modal {
			border-radius: var(--radius-md);
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
		}
	}

	/* ── Header ── */
	.share-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.share-title {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin: 0;
		flex: 1;
	}

	.share-close {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: var(--radius-sm);
		opacity: 0.6;
		transition: opacity 0.15s ease;
	}

	.share-close:hover {
		opacity: 1;
	}

	/* ── Grid ── */
	.share-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	@media (max-width: 360px) {
		.share-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* ── Platform button ── */
	.share-platform-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		padding: 0.75rem 0.5rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
	}

	.share-platform-btn:hover {
		background: var(--color-neutral);
		border-color: var(--color-accent);
	}

	.share-platform-btn:active {
		transform: scale(0.96);
	}

	/* ── Icon containers ── */
	.platform-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		overflow: hidden;
	}

	.platform-icon img {
		display: block;
		width: 28px;
		height: 28px;
		object-fit: contain;
	}

	.platform-icon--link .link-icon-img {
		opacity: 0.7;
		filter: var(--icon-filter, none);
	}

	/* ── Label ── */
	.platform-label {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	/* ── Animations ── */
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideUp {
		from { transform: translateY(16px); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}
</style>

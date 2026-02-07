<script lang="ts">
	import { processAvatarImage } from '$lib/utils/imageResize';
	import { EmojiCamera } from '$lib/assets/emojis';

	const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
	const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

	interface Props {
		avatarUrl: string | null;
		name: string;
		size?: number;
		editable?: boolean;
		uploading?: boolean;
		onUpload?: (file: File) => void;
		onRemove?: () => void;
	}

	let {
		avatarUrl,
		name,
		size = 120,
		editable = false,
		uploading = false,
		onUpload,
		onRemove
	}: Props = $props();

	let fileInput = $state<HTMLInputElement>();
	let error = $state('');

	let initials = $derived(getInitials(name));
	let bgColor = $derived(getAvatarColor(name));

	function getInitials(name: string): string {
		if (!name.trim()) return '?';
		const parts = name.trim().split(/\s+/);
		if (parts.length === 1) return parts[0][0].toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	function getAvatarColor(name: string): string {
		if (!name.trim()) return '#9ca3af';
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		const hue = Math.abs(hash) % 360;
		return `hsl(${hue}, 45%, 55%)`;
	}

	function handleClick() {
		if (editable && !uploading) {
			fileInput?.click();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}

	async function handleFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		error = '';

		if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
			error = 'Ogiltigt filformat. Använd JPG, PNG eller WebP.';
			input.value = '';
			return;
		}

		if (file.size > AVATAR_MAX_SIZE) {
			error = 'Bilden är för stor. Maximal storlek är 5 MB.';
			input.value = '';
			return;
		}

		try {
			const processed = await processAvatarImage(file);
			onUpload?.(processed);
		} catch {
			error = 'Kunde inte bearbeta bilden. Försök med en annan bild.';
		}

		input.value = '';
	}
</script>

<div class="avatar-wrapper" style:--avatar-size="{size}px">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="avatar"
		class:editable
		class:uploading
		onclick={editable ? handleClick : undefined}
		onkeydown={editable ? handleKeydown : undefined}
		tabindex={editable ? 0 : -1}
		role={editable ? 'button' : 'img'}
		aria-label={editable ? 'Ändra profilbild' : `Profilbild för ${name || 'användare'}`}
	>
		{#if avatarUrl}
			<img src={avatarUrl} alt="Profilbild" class="avatar-img" />
		{:else}
			<div class="avatar-initials" style:background-color={bgColor}>
				{initials}
			</div>
		{/if}

		{#if editable}
			<div class="avatar-overlay">
				{#if uploading}
					<div class="avatar-spinner"></div>
				{:else}
					<EmojiCamera size={size > 80 ? 28 : 20} />
				{/if}
			</div>
		{/if}
	</div>

	{#if editable}
		<input
			bind:this={fileInput}
			type="file"
			accept="image/jpeg,image/png,image/webp"
			onchange={handleFileChange}
			class="avatar-file-input"
			aria-hidden="true"
			tabindex={-1}
		/>
	{/if}

	{#if editable && avatarUrl && !uploading}
		<button class="avatar-remove" onclick={onRemove} type="button" aria-label="Ta bort profilbild">
			Ta bort bild
		</button>
	{/if}

	{#if error}
		<p class="avatar-error">{error}</p>
	{/if}
</div>

<style>
	.avatar-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.avatar {
		position: relative;
		width: var(--avatar-size);
		height: var(--avatar-size);
		border-radius: 50%;
		overflow: hidden;
		border: 3px solid var(--color-bg);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--color-border);
		flex-shrink: 0;
	}

	.avatar.editable {
		cursor: pointer;
	}

	.avatar.editable:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.avatar-initials {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-primary);
		font-size: calc(var(--avatar-size) * 0.36);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: white;
	}

	.avatar-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.45);
		opacity: 0;
		transition: opacity 0.2s ease;
		pointer-events: none;
	}

	.avatar.uploading .avatar-overlay {
		opacity: 1;
	}

	.avatar.editable:hover .avatar-overlay,
	.avatar.editable:focus-visible .avatar-overlay {
		opacity: 1;
	}

	.avatar-overlay :global(svg) {
		filter: brightness(0) invert(1);
	}

	.avatar-spinner {
		width: 24px;
		height: 24px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.avatar-file-input {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		opacity: 0;
	}

	.avatar-remove {
		background: none;
		border: none;
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
		transition: color 0.15s ease;
	}

	.avatar-remove:hover {
		color: var(--color-accent);
	}

	.avatar-error {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		color: var(--color-accent);
		text-align: center;
		margin: 0;
		max-width: 200px;
	}
</style>

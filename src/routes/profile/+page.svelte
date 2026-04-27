<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase/client';
	import { authStore } from '$lib/stores/auth.svelte';
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import AvatarUpload from '$lib/components/AvatarUpload.svelte';
	import ProfileBadgeStrip from '$lib/components/ProfileBadgeStrip.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import './profile.css';

	// Hub state
	let name = $state('');
	let avatarUrl = $state<string | null>(null);
	let loading = $state(true);

	// Writing-mode modal
	let showModeModal = $state(false);

	const writingModes = [
		{ id: 'wizard', title: 'Steg-för-steg', icon: 'compass', href: '/wizard' },
		{ id: 'quick', title: 'Snabbläge', icon: 'rocket', href: '/quick' },
		{ id: 'interview', title: 'AI-intervju', icon: 'speaking-head', href: '/interview' },
		{ id: 'editor', title: 'Skriv fritt', icon: 'pencil', href: '/editor' }
	];

	function closeModeModal() {
		showModeModal = false;
	}

	async function loadProfile() {
		if (!authStore.user) return;

		const { data } = await supabase
			.from('profiles')
			.select('name, avatar_url')
			.eq('id', authStore.user.id)
			.single();

		if (data) {
			name = data.name || '';
			avatarUrl = data.avatar_url || null;
		}

		loading = false;
	}

	onMount(() => {
		const checkAuth = () => {
			if (authStore.isLoading) {
				setTimeout(checkAuth, 50);
				return;
			}
			if (!authStore.isLoggedIn) {
				goto('/login');
				return;
			}
			loadProfile();
		};
		checkAuth();
	});
</script>

<main class="profile-page">
	{#if loading}
		<div class="loading-wrapper">
			<p class="loading-text">Laddar profil...</p>
		</div>
	{:else}
		<div class="profile-hero">
			<div class="hero-content">
				<AvatarUpload
					{avatarUrl}
					{name}
					size={130}
					editable={false}
				/>
				<div class="hero-info">
					<h1 class="hero-name">{name ? `${name}s Profil` : 'Min Profil'}</h1>
					<ProfileBadgeStrip />
				</div>
			</div>
		</div>

		<section class="hub-grid" aria-label="Profilmeny">
			<button type="button" class="hub-card" onclick={() => showModeModal = true}>
				<span class="hub-card-icon"><Emoji name="pencil" size={56} /></span>
				<span class="hub-card-title">Ny anteckning</span>
				<span class="hub-card-desc">Starta dagens minne</span>
			</button>
			<a href="/journal" class="hub-card">
				<span class="hub-card-icon"><Emoji name="archive" size={56} /></span>
				<span class="hub-card-title">Dagboksarkiv</span>
				<span class="hub-card-desc">Bläddra i tidigare anteckningar</span>
			</a>
			<a href="/calendar" class="hub-card">
				<span class="hub-card-icon"><Emoji name="calendar" size={56} /></span>
				<span class="hub-card-title">Kalender</span>
				<span class="hub-card-desc">Se dina anteckningar över tid</span>
			</a>
			<a href="/profile/edit" class="hub-card">
				<span class="hub-card-icon"><Emoji name="user-silhouette" size={56} /></span>
				<span class="hub-card-title">Redigera profil</span>
				<span class="hub-card-desc">Namn, födelsedag, intressen…</span>
			</a>
			<a href="/profile/settings" class="hub-card">
				<span class="hub-card-icon"><Emoji name="bell" size={56} /></span>
				<span class="hub-card-title">Aviseringar</span>
				<span class="hub-card-desc">Veckobrev, påminnelser, tidszon</span>
			</a>
			<a href="/profile/account" class="hub-card">
				<span class="hub-card-icon"><Emoji name="gear" size={56} /></span>
				<span class="hub-card-title">Kontoinställningar</span>
				<span class="hub-card-desc">E-post, lösenord, logga ut</span>
			</a>
		</section>
	{/if}
	<LegalFooter />
</main>

{#if showModeModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="modal-overlay" onclick={closeModeModal} role="button" tabindex="-1">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="mode-modal-title" tabindex="-1">
			<h2 id="mode-modal-title" class="modal-title">Skriv en dagbok</h2>
			<p class="modal-description">Välj hur du vill skriva dagens anteckning.</p>
			<div class="mode-grid">
				{#each writingModes as mode}
					<a href={mode.href} class="mode-card" onclick={closeModeModal}>
						<div class="mode-card-icon">
							<Emoji name={mode.icon} size={36} />
						</div>
						<span class="mode-card-title">{mode.title}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.hub-grid {
		max-width: var(--hub-width, 880px);
		width: 100%;
		padding: 1.25rem 1.25rem 0.5rem;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.875rem;
	}

	.hub-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.625rem;
		padding: 1.5rem 1rem 1.25rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-top: 3px solid var(--color-accent);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text);
		font-family: var(--font-primary);
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
	}

	button.hub-card {
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
	}

	.hub-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
		text-decoration: none;
	}

	.hub-card:active {
		transform: scale(0.99);
	}

	.hub-card-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
	}

	.hub-card-title {
		font-size: var(--text-md);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-snug);
		color: var(--color-text);
	}

	.hub-card-desc {
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
	}

	@media (max-width: 760px) {
		.hub-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 540px) {
		.hub-grid {
			grid-template-columns: 1fr;
			padding: 1rem 1rem 0.5rem;
			gap: 0.75rem;
		}

		.hub-card {
			padding: 1.25rem 1rem;
		}
	}

	/* Writing-mode modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.15s ease;
		padding: 1rem;
	}

	.modal-content {
		background: var(--color-bg);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		width: 100%;
		max-width: 400px;
		animation: slideUp 0.2s ease;
	}

	.modal-title {
		font-family: var(--font-primary);
		font-size: var(--text-xl);
		font-weight: var(--weight-medium);
		font-stretch: 110%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin: 0 0 0.375rem 0;
		text-align: center;
	}

	.modal-description {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		margin: 0 0 1.25rem 0;
		text-align: center;
	}

	.mode-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.mode-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.625rem;
		padding: 1.25rem 1rem;
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.mode-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		text-decoration: none;
	}

	.mode-card:active {
		transform: scale(0.98);
	}

	.mode-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mode-card-title {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>

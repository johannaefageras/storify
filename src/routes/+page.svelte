<script lang="ts">
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { accentStore } from '$lib/stores/accent.svelte';
	import { Emoji } from '$lib/assets/emojis';
	import { getGreeting, getSubtitle } from '$lib/data/greetings';
	import LegalFooter from '$lib/components/LegalFooter.svelte';

	const roseComponents = {
		pink: 'rose-pink',
		amber: 'rose-amber',
		blue: 'rose-blue',
		lime: 'rose-lime',
		red: 'rose-red'
	};

	let RoseIcon = $derived(roseComponents[accentStore.current]);

	let isReturningUser = $derived(authStore.isLoggedIn && !!wizardStore.data.profile.name);
	let firstName = $derived(wizardStore.data.profile.name.split(' ')[0]);
	let greeting = $derived(isReturningUser ? getGreeting(firstName) : '');
	let subtitle = $derived(isReturningUser ? getSubtitle() : '');

	interface ModeCard {
		id: string;
		title: string;
		description: string;
		href: string;
		icon: string;
		comingSoon: boolean;
	}

	const modeCards: ModeCard[] = [
		{
			id: 'interview',
			title: 'AI-intervju',
			description: 'Chatta med AI som ställer relevanta frågor om din dag.',
			href: '/interview',
			icon: 'speaking-head',
			comingSoon: false
		},
		{
			id: 'wizard',
			title: 'Steg-för-steg',
			description: 'Svara på frågor om din dag och få en detaljerad dagbokstext.',
			href: '/wizard',
			icon: 'compass',
			comingSoon: false
		},
		{
			id: 'quick',
			title: 'Snabbläge',
			description: 'Fånga dagens känsla på under en minut, utan krångel.',
			href: '/quick',
			icon: 'rocket',
			comingSoon: false
		},
		{
			id: 'editor',
			title: 'Skriv fritt',
			description: 'Skriv fritt med AI-stöd som förfinar din text, när du vill.',
			href: '/editor',
			icon: 'pencil',
			comingSoon: false
		}
	];

</script>

<main class="landing">
	<div class="container">
		<div class="landing-main">
			<header class="hero">
				<div class="logo">
					<Emoji name={RoseIcon} size={96} />
				</div>
				{#if isReturningUser}
					<h1 class="title">{greeting}</h1>
					<p class="subtitle">{subtitle}</p>
				{:else}
					<h1 class="title">Storify</h1>
					<p class="subtitle">Du har inte tid att skriva dagbok. Perfekt – det behöver du inte heller.</p>
				{/if}
			</header>

			<div class="mode-grid">
				{#each modeCards as card}
					<a href={card.href} class="mode-card" class:coming-soon={card.comingSoon}>
						<div class="mode-card-icon">
							<Emoji name={card.icon} size={36} />
						</div>
						<div class="mode-card-content">
							<h2 class="mode-card-title">{card.title}</h2>
							<p class="mode-card-description">{card.description}</p>
						</div>
						{#if card.comingSoon}
							<span class="mode-card-badge">Snart</span>
						{/if}
					</a>
				{/each}
			</div>
		</div>

		<div class="landing-footer">
			<LegalFooter />
		</div>
	</div>
</main>

<style>
	.landing {
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1.25rem;
		padding-bottom: 0;
		overflow-y: auto;
	}

	.container {
		flex: 1 1 auto;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		text-align: center;
		max-width: 520px;
		width: 100%;
	}

	.landing-main {
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(1rem, 2.25vh, 1.75rem);
		padding: clamp(0.25rem, 1.4vh, 0.75rem) 0 0;
		margin-top: 0;
	}

	.hero {
		margin: 0;
	}

	.logo {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 84px;
		margin-bottom: 1.25rem;
	}

	.title {
		font-family: 'Linzer';
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		margin-bottom: 0.75rem;
		color: var(--color-text);
	}

	.subtitle {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		font-stretch: 100%;
		letter-spacing: var(--tracking-wide);
	}

	.mode-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		width: 100%;
	}

	.mode-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.625rem;
		padding: clamp(0.8rem, 1.9vh, 1.25rem) 1rem;
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
		cursor: pointer;
	}

	.mode-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		text-decoration: none;
	}

	.mode-card:active {
		transform: scale(0.98);
	}

	.mode-card.coming-soon {
		opacity: 0.6;
	}

	.mode-card.coming-soon:hover {
		opacity: 0.75;
	}

	.mode-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mode-card-content {
		text-align: center;
	}

	.mode-card-title {
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
	}

	.mode-card-description {
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		color: var(--color-text-muted);
		margin: 0;
	}

	.mode-card-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		font-family: var(--font-primary);
		font-size: 0.7rem;
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 10%, var(--color-bg-elevated));
		padding: 0.15rem 0.4rem;
		border-radius: var(--radius-sm);
	}

	@media (max-width: 380px) {
		.mode-grid {
			grid-template-columns: 1fr;
		}
	}

	.landing-footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: max(0.35rem, env(safe-area-inset-bottom, 0px));
	}

	.landing-footer :global(.legal-footer) {
		margin-top: 1.5rem;
	}

	@media (min-width: 640px) {
		.title {
			font-size: 3rem;
			font-stretch: 120%;
		}

		.subtitle {
			font-size: var(--text-lg);
		}
	}

	@media (max-height: 860px) {
		.logo {
			margin-bottom: 1.25rem;
		}

		.title {
			margin-bottom: 0.55rem;
		}

		.mode-grid {
			gap: 0.55rem;
		}

		.mode-card-description {
			line-height: var(--leading-base);
		}

		.landing-footer :global(.legal-footer) {
			margin-top: 1rem;
		}
	}

	@media (max-height: 760px) {
		.landing {
			padding-top: 0.85rem;
		}

		.mode-card-icon :global(svg) {
			width: 28px;
			height: 28px;
		}

		.mode-card {
			gap: 0.45rem;
			padding: 0.8rem 0.8rem;
		}

		.mode-card-title {
			font-size: var(--text-xs);
		}

		.mode-card-description {
			font-size: 0.85rem;
		}
	}
</style>

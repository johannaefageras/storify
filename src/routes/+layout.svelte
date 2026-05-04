<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import '../app.css';
	import myStorifyWoff2 from '$lib/assets/fonts/MyStorify-VF.woff2';
	import Navbar from '$lib/components/Navbar.svelte';
	import BadgeUnlockToast from '$lib/components/BadgeUnlockToast.svelte';
	import { accentStore } from '$lib/stores/accent.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { fontStore } from '$lib/stores/font.svelte';
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { badgesStore } from '$lib/stores/badges.svelte';
	import { trackPageView } from '$lib/analytics';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';

	let { children } = $props();

	onMount(async () => {
		themeStore.init();
		accentStore.init();
		fontStore.init();
		await authStore.init();
		await accentStore.syncWithAuth();
		await wizardStore.initProfile();
		await badgesStore.init();
	});

	afterNavigate(async (nav) => {
		if (!nav?.to?.url) return;
		await tick(); // wait for child <svelte:head> to commit document.title
		trackPageView(nav.to.url, nav.from?.url ?? null);
	});
</script>

<svelte:head>
	<title>Privat AI-dagbok som ställer frågor | Storify</title>
	<meta name="description" content="Tom dagbokssida-panik är på riktigt, och &quot;börja bara skriva&quot; är ett värdelöst råd. Storify är en AI-dagbok som ställer frågor som faktiskt går att svara på. 28 röster. Helt privat. Inget flum." />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://mystorify.se/" />
	<meta property="og:title" content="Storify – Din intelligenta dagboksassistent" />
	<meta property="og:description" content="Skapa personliga dagboksinlägg med AI. Besvara frågor om din dag och få en unik dagboksanteckning i din valda berättarröst." />
	<meta property="og:image" content="https://mystorify.se/og-image.png" />
	<meta property="og:locale" content="sv_SE" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Storify – Din intelligenta dagboksassistent" />
	<meta name="twitter:description" content="Skapa personliga dagboksinlägg med AI. Besvara frågor om din dag och få en unik dagboksanteckning i din valda berättarröst." />
	<meta name="twitter:image" content="https://mystorify.se/og-image.png" />

	<link rel="canonical" href="https://mystorify.se/" />
	<link rel="preload" href={myStorifyWoff2} as="font" type="font/woff2" crossorigin="anonymous" />

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Storify',
		description: 'Skapa personliga dagboksinlägg med AI. Besvara frågor om din dag och få en unik dagboksanteckning i din valda berättarröst.',
		url: 'https://mystorify.se',
		applicationCategory: 'LifestyleApplication',
		operatingSystem: 'Web, Android',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'SEK'
		},
		inLanguage: 'sv'
	})}</script>`}
</svelte:head>

<Navbar />
{@render children()}
<BadgeUnlockToast />
<ConsentBanner />

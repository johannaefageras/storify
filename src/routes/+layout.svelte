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
	<link rel="preload" href={myStorifyWoff2} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<Navbar />
{@render children()}
<BadgeUnlockToast />
<ConsentBanner />

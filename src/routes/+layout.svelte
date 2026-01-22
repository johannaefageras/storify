<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon/favicon.svg';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { wizardStore } from '$lib/stores/wizard.svelte';

	let { children } = $props();

	onMount(() => {
		themeStore.init();
		wizardStore.initProfile();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Storify</title>
</svelte:head>

<ThemeToggle />
{@render children()}

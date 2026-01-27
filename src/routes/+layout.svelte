<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { wizardStore } from '$lib/stores/wizard.svelte';
	import { integrityStore } from '$lib/stores/integrity.svelte';

	let { children } = $props();

	onMount(() => {
		themeStore.init();
		wizardStore.initProfile();

		// Verify app integrity on Android (non-blocking)
		if (integrityStore.requiresVerification()) {
			integrityStore.init().then((verified) => {
				if (!verified) {
					console.warn('App integrity verification failed');
				}
			});
		}
	});
</script>

<svelte:head>
	<title>Storify</title>
</svelte:head>

<ThemeToggle />
{@render children()}

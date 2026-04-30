<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		const s = document.createElement('script');
		s.src = 'https://app.trysoro.com/api/embed/de613487-74e0-4cfd-b412-b86395753daf';
		s.defer = true;
		document.body.appendChild(s);

		return () => {
			s.remove();
		};
	});
</script>

<svelte:head>
	<title>Blogg – Storify</title>
	<meta
		name="description"
		content="Läs Storifys blogg om AI-dagbok, reflektion och att skriva sin egen historia."
	/>
	<link rel="canonical" href="https://mystorify.se/blog" />
</svelte:head>

<div class="blog-page">
	<div id="soro-blog"></div>
</div>

<style>
	.blog-page {
		max-width: 60rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
	}
</style>

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
		max-width: 44rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
	}

	.blog-page :global(.soro-blog) {
		font-family: var(--font-body);
		color: var(--color-text);
		max-width: 100%;
	}

	.blog-page :global(.soro-blog-card),
	.blog-page :global(.soro-blog-back) {
		background: transparent;
		border-color: var(--color-border);
		border-radius: var(--radius-lg, 12px);
	}
	.blog-page :global(.soro-blog-card:hover),
	.blog-page :global(.soro-blog-back:hover) {
		border-color: var(--color-accent);
		background: transparent;
	}

	.blog-page :global(.soro-blog-card-title),
	.blog-page :global(.soro-blog-article-title),
	.blog-page :global(.soro-blog-article-content h1),
	.blog-page :global(.soro-blog-article-content h2),
	.blog-page :global(.soro-blog-article-content h3) {
		font-family: var(--font-heading);
		color: var(--color-text);
	}

	.blog-page :global(.soro-blog-card-excerpt),
	.blog-page :global(.soro-blog-card-date),
	.blog-page :global(.soro-blog-article-date),
	.blog-page :global(.soro-blog-empty),
	.blog-page :global(.soro-blog-loading) {
		color: var(--color-text-muted);
	}

	.blog-page :global(.soro-blog-article-content) {
		color: var(--color-text);
		font-size: var(--text-base);
	}
	.blog-page :global(.soro-blog-article-content a) {
		color: var(--color-accent);
	}
	.blog-page :global(.soro-blog-article-content a:hover) {
		color: var(--color-accent-hover);
	}

	.blog-page :global(.soro-blog-card-image),
	.blog-page :global(.soro-blog-article-image) {
		border-radius: var(--radius-md, 8px);
	}

	.blog-page :global(.soro-blog-spinner) {
		border-color: var(--color-border);
		border-top-color: var(--color-accent);
	}
	.blog-page :global(.soro-blog-error) {
		color: var(--color-error);
	}
</style>

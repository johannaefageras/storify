<script lang="ts">
	import LegalFooter from '$lib/components/LegalFooter.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';

	let { data } = $props();

	const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	function formatDate(d: string) {
		if (!d) return '';
		const parsed = new Date(d);
		return Number.isNaN(parsed.getTime()) ? d : dateFormatter.format(parsed);
	}

	let post = $derived(data.post);
</script>

<SeoHead
	title={`${post.title} – Storify Blogg`}
	description={post.description}
	path={`/blog/${post.slug}`}
	ogType="article"
	ogImage={post.featured || undefined}
	publishedTime={post.date}
/>

<main class="blog-post">
	<a class="back" href="/blog">← Tillbaka till bloggen</a>

	<header class="post-header">
		<time datetime={post.date}>{formatDate(post.date)}</time>
		<h1>{post.title}</h1>
		{#if post.tags.length > 0}
			<ul class="tags">
				{#each post.tags as tag (tag)}
					<li>#{tag}</li>
				{/each}
			</ul>
		{/if}
	</header>

	{#if post.featured}
		<figure class="post-featured">
			<img src={post.featured} alt={post.featuredAlt || ''} />
		</figure>
	{/if}

	<article class="post-body">
		{@html post.html}
	</article>
</main>

<LegalFooter />

<style>
	.blog-post {
		max-width: 50rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
		color: var(--color-text);
		font-family: var(--font-body);
	}

	.back {
		display: inline-block;
		margin-bottom: 1.5rem;
		color: var(--color-accent);
		text-decoration: none;
		font-size: 0.9rem;
	}

	.back:hover,
	.back:focus-visible {
		text-decoration: underline;
	}

	.post-header {
		margin-bottom: 1.75rem;
	}

	.post-featured {
		margin: 0 0 2.5rem;
		border-radius: 14px;
		overflow: hidden;
		aspect-ratio: 16 / 9;
		background: var(--color-surface, rgba(0, 0, 0, 0.05));
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.04),
			0 12px 32px rgba(0, 0, 0, 0.12);
	}

	.post-featured img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	@media (min-width: 900px) {
		.post-featured {
			border-radius: 18px;
		}
	}

	.post-header time {
		font-size: 0.875rem;
		opacity: 0.7;
	}

	.post-header h1 {
		font-family: var(--font-heading, var(--font-body));
		font-size: clamp(1.75rem, 4.5vw, 2.5rem);
		margin: 0.25rem 0 0.75rem;
	}

	.tags {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tags li {
		font-size: 0.8rem;
		opacity: 0.7;
	}

	.post-body {
		line-height: 1.7;
	}

	.post-body :global(h2) {
		font-family: var(--font-heading, var(--font-body));
		font-size: 1.5rem;
		margin: 2rem 0 0.75rem;
	}

	.post-body :global(h3) {
		font-size: 1.2rem;
		margin: 1.5rem 0 0.5rem;
	}

	.post-body :global(p) {
		margin: 0 0 1rem;
	}

	.post-body :global(a) {
		color: var(--color-accent);
	}

	.post-body :global(ul),
	.post-body :global(ol) {
		padding-left: 1.5rem;
		margin: 0 0 1rem;
	}

	.post-body :global(li) {
		margin-bottom: 0.25rem;
	}

	.post-body :global(blockquote) {
		border-left: 3px solid var(--color-accent);
		margin: 1rem 0;
		padding: 0.25rem 1rem;
		opacity: 0.9;
		font-style: italic;
	}

	.post-body :global(code) {
		background: var(--color-surface, rgba(0, 0, 0, 0.05));
		padding: 0.1em 0.35em;
		border-radius: 4px;
		font-size: 0.9em;
	}

	.post-body :global(pre) {
		background: var(--color-surface, rgba(0, 0, 0, 0.05));
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
	}

	.post-body :global(pre code) {
		background: transparent;
		padding: 0;
	}

	.post-body :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
	}
</style>

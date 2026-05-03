<script lang="ts">
	import LegalFooter from '$lib/components/LegalFooter.svelte';

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
</script>

<svelte:head>
	<title>Blogg – Storify</title>
	<meta
		name="description"
		content="Läs Storifys blogg om AI-dagbok, reflektion och att skriva sin egen historia."
	/>
	<link rel="canonical" href="https://mystorify.se/blog" />
</svelte:head>

<main class="blog-page">
	<header class="page-header">
		<h1>Bloggen</h1>
		<p class="lede">Tankar om dagbok, reflektion och att skriva sin egen historia.</p>
	</header>

	{#if data.posts.length === 0}
		<p class="empty">Inga inlägg än.</p>
	{:else}
		<ul class="post-list">
			{#each data.posts as post (post.slug)}
				<li class="post-item">
					<a class="post-link" href="/blog/{post.slug}">
						<div class="thumb" class:thumb-placeholder={!post.featured}>
							{#if post.featured}
								<img src={post.featured} alt={post.featuredAlt || ''} loading="lazy" />
							{/if}
						</div>
						<div class="post-content">
							<time datetime={post.date}>{formatDate(post.date)}</time>
							<h2>{post.title}</h2>
							{#if post.description}
								<p class="description">{post.description}</p>
							{/if}
							{#if post.tags.length > 0}
								<ul class="tags">
									{#each post.tags as tag (tag)}
										<li>#{tag}</li>
									{/each}
								</ul>
							{/if}
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<LegalFooter />

<style>
	.blog-page {
		max-width: 56rem;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
		color: var(--color-text);
		font-family: var(--font-body);
	}

	.page-header {
		margin-bottom: 2.5rem;
	}

	.page-header h1 {
		font-family: var(--font-heading, var(--font-body));
		font-size: clamp(2rem, 5vw, 2.75rem);
		margin: 0 0 0.5rem;
	}

	.lede {
		color: var(--color-text-muted, var(--color-text));
		opacity: 0.8;
		margin: 0;
	}

	.post-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.post-item {
		border-top: 1px solid var(--color-border, rgba(0, 0, 0, 0.1));
		padding-top: 1.75rem;
	}

	.post-link {
		display: grid;
		grid-template-columns: 15rem 1fr;
		gap: 1.5rem;
		align-items: start;
		text-decoration: none;
		color: inherit;
	}

	.thumb {
		aspect-ratio: 4 / 3;
		width: 100%;
		border-radius: 10px;
		overflow: hidden;
		background: var(--color-surface, rgba(0, 0, 0, 0.05));
		transition: transform 0.25s ease, box-shadow 0.25s ease;
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.4s ease;
	}

	.thumb-placeholder {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-accent) 25%, transparent),
			color-mix(in srgb, var(--color-accent) 5%, transparent)
		);
	}

	.post-link:hover .thumb,
	.post-link:focus-visible .thumb {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		transform: translateY(-2px);
	}

	.post-link:hover .thumb img,
	.post-link:focus-visible .thumb img {
		transform: scale(1.04);
	}

	.post-link:hover h2,
	.post-link:focus-visible h2 {
		color: var(--color-accent);
	}

	.post-content {
		min-width: 0;
	}

	.post-link time {
		font-size: 0.875rem;
		opacity: 0.7;
	}

	.post-link h2 {
		margin: 0.25rem 0 0.5rem;
		font-size: 1.5rem;
		transition: color 0.15s ease;
	}

	.description {
		margin: 0 0 0.75rem;
		opacity: 0.85;
		font-weight: var(--weight-regular);
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

	.empty {
		opacity: 0.7;
	}

	@media (max-width: 600px) {
		.post-link {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.thumb {
			aspect-ratio: 16 / 9;
		}
	}
</style>

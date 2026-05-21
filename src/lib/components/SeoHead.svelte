<script lang="ts">
	const SITE_URL = 'https://mystorify.se';
	const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

	type Props = {
		title: string;
		description: string;
		path: string;
		ogImage?: string;
		ogType?: 'website' | 'article';
		noindex?: boolean;
		publishedTime?: string;
	};

	let {
		title,
		description,
		path,
		ogImage = DEFAULT_OG_IMAGE,
		ogType = 'website',
		noindex = false,
		publishedTime
	}: Props = $props();

	const canonicalUrl = $derived(`${SITE_URL}${path === '/' ? '/' : path}`);
	const imageUrl = $derived(
		ogImage.startsWith('http://') || ogImage.startsWith('https://')
			? ogImage
			: `${SITE_URL}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<link rel="canonical" href={canonicalUrl} />

	<meta property="og:type" content={ogType} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:locale" content="sv_SE" />
	<meta property="og:site_name" content="Storify" />
	{#if ogType === 'article' && publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>

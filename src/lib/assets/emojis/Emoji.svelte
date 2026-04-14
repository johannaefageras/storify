<script lang="ts">
	type Props = {
		name: string;
		size?: number | string;
		class?: string;
	};

	let { name, size = 24, class: className = '' }: Props = $props();

	const modules = import.meta.glob('./*.svg', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>;

	const html = $derived.by(() => {
		const raw = modules[`./${name}.svg`];
		if (!raw) return '';
		return raw.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
			const stripped = attrs.replace(/\s(width|height|class)="[^"]*"/g, '');
			const cls = className ? ` class="${className}"` : '';
			return `<svg${stripped} width="${size}" height="${size}"${cls} aria-hidden="true">`;
		});
	});
</script>

{#if html}
	{@html html}
{/if}

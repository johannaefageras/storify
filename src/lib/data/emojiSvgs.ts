const svgModules = import.meta.glob('$lib/assets/emojis/*.svg', {
  query: '?raw',
  eager: true,
  import: 'default'
}) as Record<string, string>;

export const emojiSvgMap = new Map<string, string>();

for (const [path, svg] of Object.entries(svgModules)) {
  const emojiId = path.split('/').pop()!.replace('.svg', '');
  emojiSvgMap.set(emojiId, svg as string);
}

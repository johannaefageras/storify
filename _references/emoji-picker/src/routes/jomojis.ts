import type { EmojiCategory } from '$lib/types.js';

const svgModules = import.meta.glob('/Jomojis/**/*.svg', {
  query: '?raw',
  eager: true,
  import: 'default'
}) as Record<string, string>;

const categoryOrder = ['Humör', 'Aktiviteter', 'Människor', 'Miljö', 'Mat', 'Symboler'];

const categoryIcons: Record<string, string> = {
  Humör: 'face-beaming',
  Människor: 'hand-waving',
  Aktiviteter: 'party-popper',
  Mat: 'apple',
  Platser: 'house',
  Symboler: 'light-bulb'
};

function toName(filename: string): string {
  return filename
    .replace('.svg', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const categoryMap = new Map<string, { emojis: { id: string; name: string; svg: string }[] }>();

for (const [path, svg] of Object.entries(svgModules)) {
  const parts = path.split('/');
  const categoryName = parts[2].normalize('NFC');
  const filename = parts[3];
  const emojiName = toName(filename);
  const emojiId = `${categoryName}-${filename.replace('.svg', '')}`;

  if (!categoryMap.has(categoryName)) {
    categoryMap.set(categoryName, { emojis: [] });
  }

  categoryMap.get(categoryName)!.emojis.push({ id: emojiId, name: emojiName, svg });
}

export const jomojiCategories: EmojiCategory[] = categoryOrder
  .filter((name) => categoryMap.has(name))
  .map((name) => {
    const { emojis } = categoryMap.get(name)!;
    return {
      name,
      icon: emojis.find((e) => e.id.endsWith(categoryIcons[name]))?.svg ?? emojis[0].svg,
      emojis
    };
  });

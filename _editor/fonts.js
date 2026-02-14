export const FONTS = {
  'GT Pressura': {
    family: "'GT Pressura', system-ui, sans-serif",
    weights: [
      { value: 300, label: 'Light' },
      { value: 375, label: 'Book' },
      { value: 415, label: 'Regular' },
      { value: 450, label: 'News' },
      { value: 480, label: 'Medium' },
      { value: 560, label: 'Semibold' },
      { value: 650, label: 'Bold' },
      { value: 750, label: 'Heavy' },
      { value: 900, label: 'Black' },
    ],
  },
  'GT Pressura Mono': {
    family: "'GT Pressura Mono', ui-monospace, monospace",
    weights: [
      { value: 300, label: 'Light' },
      { value: 415, label: 'Regular' },
      { value: 480, label: 'Medium' },
      { value: 650, label: 'Bold' },
      { value: 900, label: 'Black' },
    ],
  },
  'Lyric': {
    family: "'Lyric', serif",
    weights: [
      { value: 200, label: 'Thin' },
      { value: 283, label: 'Light' },
      { value: 400, label: 'Regular' },
      { value: 488, label: 'Medium' },
      { value: 592, label: 'Semibold' },
      { value: 700, label: 'Bold' },
    ],
  },
};

export const DEFAULT_FONT = 'GT Pressura';
export const DEFAULT_WEIGHT = 415;
export const DEFAULT_SIZE = 17;
export const MIN_SIZE = 8;
export const MAX_SIZE = 96;

/** Find the nearest available weight in a font's weight list */
export function nearestWeight(fontName, targetWeight) {
  const weights = FONTS[fontName]?.weights;
  if (!weights || weights.length === 0) return targetWeight;
  let closest = weights[0];
  for (const w of weights) {
    if (Math.abs(w.value - targetWeight) < Math.abs(closest.value - targetWeight)) {
      closest = w;
    }
  }
  return closest.value;
}

import { browser } from '$app/environment';

export type Font = 'storify' | 'storify-mono' | 'shantell' | 'recursive' | 'fraunces';

export const FONTS: { id: Font; label: string; family: string }[] = [
  { id: 'storify', label: 'Stilren', family: "'My Storify', system-ui, sans-serif" },
  { id: 'shantell', label: 'Handskriven', family: "'Shantell Sans', system-ui, sans-serif" },
  { id: 'fraunces', label: 'Klassisk', family: "'Fraunces', Georgia, serif" },
  { id: 'recursive', label: 'Modern', family: "'Recursive', system-ui, sans-serif" },
  {
    id: 'storify-mono',
    label: 'Strukturerad',
    family: "'My Storify Mono', ui-monospace, monospace"
  }
];

const FONT_STORAGE_KEY = 'font';

function createFontStore() {
  let font = $state<Font>('storify');

  async function init() {
    if (!browser) return;

    const value = localStorage.getItem(FONT_STORAGE_KEY);
    if (
      value === 'storify' ||
      value === 'storify-mono' ||
      value === 'shantell' ||
      value === 'recursive' ||
      value === 'fraunces'
    ) {
      font = value;
    }
    applyFont();
  }

  function applyFont() {
    if (!browser) return;
    if (font === 'storify') {
      document.documentElement.removeAttribute('data-font');
    } else {
      document.documentElement.setAttribute('data-font', font);
    }
  }

  async function saveFont() {
    if (!browser) return;
    localStorage.setItem(FONT_STORAGE_KEY, font);
  }

  function set(newFont: Font) {
    font = newFont;
    void saveFont();
    applyFont();
  }

  return {
    get current() {
      return font;
    },
    init,
    set
  };
}

export const fontStore = createFontStore();

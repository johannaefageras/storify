import { browser } from '$app/environment';
import { supabase } from '$lib/supabase/client';
import { authStore } from '$lib/stores/auth.svelte';

export type Accent = 'pink' | 'amber' | 'blue' | 'emerald' | 'purple' | 'rust';

export const ACCENTS: { id: Accent; color: string; label: string }[] = [
  { id: 'pink', color: '#f43f7a', label: 'Ros' },
  { id: 'amber', color: '#F0A83A', label: 'Bärnsten' },
  { id: 'blue', color: '#2B8DB8', label: 'Himmel' },
  { id: 'emerald', color: '#2e7d32', label: 'Mossa' },
  { id: 'purple', color: '#6a1b9a', label: 'Plommon' },
  { id: 'rust', color: '#b53d2a', label: 'Tegel' }
];

const ACCENT_STORAGE_KEY = 'accent';
const ACCENT_COLORS: Record<Accent, string> = {
  pink: '#f43f7a',
  amber: '#F0A83A',
  blue: '#2B8DB8',
  emerald: '#2e7d32',
  purple: '#6a1b9a',
  rust: '#b53d2a'
};

function normalizeAccent(value: string | null): Accent | null {
  if (value === 'lime') return 'emerald';
  if (value === 'red') return 'purple';
  if (
    value === 'pink' ||
    value === 'amber' ||
    value === 'blue' ||
    value === 'emerald' ||
    value === 'purple' ||
    value === 'rust'
  ) {
    return value;
  }
  return null;
}

function createAccentStore() {
  let accent = $state<Accent>('pink');

  async function init() {
    if (!browser) return;

    const value = normalizeAccent(localStorage.getItem(ACCENT_STORAGE_KEY));
    if (value) {
      accent = value;
      localStorage.setItem(ACCENT_STORAGE_KEY, value);
    }
    applyAccent();
  }

  async function syncWithAuth() {
    if (!browser || !authStore.isLoggedIn || !authStore.user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('accent')
        .eq('id', authStore.user.id)
        .single();

      const value = normalizeAccent(data?.accent ?? null);
      if (value) {
        accent = value;
        applyAccent();
      }
    } catch {
      // Keep local value
    }
  }

  function applyAccent() {
    if (!browser) return;
    if (accent === 'pink') {
      document.documentElement.removeAttribute('data-accent');
    } else {
      document.documentElement.setAttribute('data-accent', accent);
    }
    applyFavicons(accent);
  }

  async function saveAccent() {
    if (!browser) return;
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);

    if (authStore.isLoggedIn && authStore.user) {
      try {
        await supabase.from('profiles').update({ accent }).eq('id', authStore.user.id);
      } catch {
        // Local save already succeeded
      }
    }
  }

  function set(newAccent: Accent) {
    accent = newAccent;
    void saveAccent();
    applyAccent();
  }

  return {
    get current() {
      return accent;
    },
    init,
    syncWithAuth,
    set
  };
}

export const accentStore = createAccentStore();

function applyFavicons(accent: Accent) {
  setLink('link[rel="icon"][sizes="48x48"]', {
    rel: 'icon',
    sizes: '48x48',
    href: `/favicons/${accent}/favicon.ico`
  });
  setLink('link[rel="icon"][type="image/svg+xml"]', {
    rel: 'icon',
    type: 'image/svg+xml',
    href: `/favicons/${accent}/favicon.svg`
  });
  setLink('link[rel="apple-touch-icon"]', {
    rel: 'apple-touch-icon',
    href: `/favicons/${accent}/apple-touch-icon.png`
  });
  setLink('link[rel="manifest"]', {
    rel: 'manifest',
    href: `/favicons/${accent}/site.webmanifest`
  });

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute('content', ACCENT_COLORS[accent]);
}

function setLink(selector: string, attributes: Record<string, string>) {
  let link = document.querySelector<HTMLLinkElement>(selector);
  if (!link) {
    link = document.createElement('link');
    document.head.appendChild(link);
  }

  for (const [name, value] of Object.entries(attributes)) {
    link.setAttribute(name, value);
  }
}

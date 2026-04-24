import { browser } from '$app/environment';
import { supabase } from '$lib/supabase/client';
import { authStore } from '$lib/stores/auth.svelte';

export type Accent = 'pink' | 'amber' | 'blue' | 'emerald' | 'purple';

export const ACCENTS: { id: Accent; color: string }[] = [
  { id: 'pink', color: '#f43f7a' },
  { id: 'amber', color: '#F0A83A' },
  { id: 'blue', color: '#2B8DB8' },
  { id: 'emerald', color: '#2e7d32' },
  { id: 'purple', color: '#6a1b9a' }
];

const ACCENT_STORAGE_KEY = 'accent';

function normalizeAccent(value: string | null): Accent | null {
  if (value === 'lime') return 'emerald';
  if (value === 'red') return 'purple';
  if (
    value === 'pink' ||
    value === 'amber' ||
    value === 'blue' ||
    value === 'emerald' ||
    value === 'purple'
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

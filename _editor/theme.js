const STORAGE_KEY = 'storify-editor-theme';

export function initTheme() {
  let theme = localStorage.getItem(STORAGE_KEY);
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  apply(theme);

  const btn = document.querySelector('#theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      apply(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }
}

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

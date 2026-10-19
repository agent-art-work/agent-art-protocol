(() => {
  const key = 'aap-mvp-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try { const saved = localStorage.getItem(key); if (saved === 'light' || saved === 'dark') preference = saved; } catch {}

  function apply() {
    const theme = preference || (system.matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="color-scheme"]').content = theme;
    const toggle = document.querySelector('#theme-toggle');
    if (toggle) {
      const next = theme === 'dark' ? 'light' : 'dark';
      toggle.setAttribute('aria-label', `Switch to ${next} mode`);
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
      toggle.title = `Switch to ${next} mode`;
      document.querySelector('#theme-label').textContent = `${next[0].toUpperCase()}${next.slice(1)} mode`;
    }
  }

  apply();
  system.addEventListener('change', () => { if (!preference) apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
    apply();
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.querySelector('#theme-toggle').addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch {}
      apply();
    });
  });
})();

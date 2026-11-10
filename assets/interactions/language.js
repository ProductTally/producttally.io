export function initLanguageSwitcher() {
  const select = document.querySelector('[data-locale]');
  if (!select) return;

  select.addEventListener('change', () => {
    if (!select.value) return;
    const target = new URL(select.value, window.location.href);
    target.search = window.location.search;
    target.hash = window.location.hash;
    window.location.assign(target);
  });

  select.parentElement.dataset.ready = 'true';
}

export function initLanguageSwitcher() {
  const menu = document.querySelector('[data-locale]');
  if (!menu) return;

  menu.addEventListener('wa-show', () => {
    const { search, hash } = window.location;
    for (const item of menu.querySelectorAll('wa-dropdown-item[href]')) {
      const target = new URL(item.href, window.location.href);
      item.href = `${target.pathname}${search}${hash}`;
    }
  });

  menu.addEventListener('wa-after-show', () => {
    const items = [...menu.querySelectorAll('wa-dropdown-item')];
    const current = items.find(item => item.matches('[aria-current="page"]'));
    if (!current) return;

    // Keep Web Awesome's keyboard navigation in sync with the focused item.
    for (const item of items) item.active = item === current;
    current.focus({ preventScroll: true });
    current.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });

  menu.parentElement.dataset.ready = 'true';
}

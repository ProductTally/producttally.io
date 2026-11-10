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

  menu.parentElement.dataset.ready = 'true';
}

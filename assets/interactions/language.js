export function initLanguageSwitcher() {
  const select = document.querySelector('[data-locale]');
  if (!select) return;
  select.addEventListener('change', () => {
    const target = select.value;
    if (!target) return;
    window.location.assign(`${target}${window.location.search}${window.location.hash}`);
  });
}

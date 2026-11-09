export function initMobileNavigation() {
  const toggle = document.querySelector('.mobile-toggle');
  const navigation = document.querySelector('#mobile-nav');
  if (!toggle || !navigation) return;

  function setOpen(isOpen) {
    navigation.hidden = !isOpen;
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? toggle.dataset.closeLabel : toggle.dataset.openLabel);
  }

  toggle.addEventListener('click', () => setOpen(navigation.hidden));
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || navigation.hidden) return;
    setOpen(false);
    toggle.focus();
  });
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 761px)').matches) setOpen(false);
  });
}

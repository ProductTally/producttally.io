const storageKey = 'producttally:v1:saved';
const legacyKey = 'producttally-saved';

function readSavedProducts() {
  try {
    const current = localStorage.getItem(storageKey);
    const value = JSON.parse(current ?? localStorage.getItem(legacyKey) ?? '[]');
    return Array.isArray(value) ? value.filter(id => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

async function announce(message, variant) {
  try {
    await import('../vendor/webawesome/components/toast/toast.js');
    const toast = document.querySelector('[data-action-toast]');
    toast?.create(message, { variant, duration: 4500 });
  } catch {
    // The updated control still provides feedback if the toast cannot load.
  }
}

export function initSavedProducts() {
  const saved = new Set(readSavedProducts());
  const listeners = new Set();
  const copy = document.body.dataset;
  const controls = [...document.querySelectorAll('[data-save]')];
  const badges = [...document.querySelectorAll('[data-saved-count]')];
  const number = new Intl.NumberFormat(document.documentElement.lang);

  function render() {
    for (const control of controls) {
      const selected = saved.has(control.dataset.save);
      const label = selected ? copy.unsaveLabel : copy.saveLabel;
      control.setAttribute('aria-pressed', String(selected));
      control.querySelector('[data-save-text]').firstChild.nodeValue = label;
    }
    for (const badge of badges) badge.textContent = number.format(saved.size);
    listeners.forEach(listener => listener());
  }

  for (const control of controls) {
    control.addEventListener('click', () => {
      const id = control.dataset.save;
      const next = new Set(saved);
      const adding = !next.delete(id);
      if (adding) next.add(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        void announce(copy.storageError, 'danger');
        return;
      }
      if (adding) saved.add(id);
      else saved.delete(id);
      render();
      void announce(adding ? copy.saveToast : copy.unsaveToast, 'neutral');
    });
  }

  window.addEventListener('storage', event => {
    if (event.key !== null && event.key !== storageKey && event.key !== legacyKey) return;
    saved.clear();
    readSavedProducts().forEach(id => saved.add(id));
    render();
  });
  render();

  return {
    has: id => saved.has(id),
    onChange: listener => listeners.add(listener)
  };
}

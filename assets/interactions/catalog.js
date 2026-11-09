const savedKey = 'producttally:v1:saved';
const legacySavedKey = 'producttally-saved';

function readSavedProducts() {
  try {
    const current = localStorage.getItem(savedKey);
    const legacy = current === null ? localStorage.getItem(legacySavedKey) : null;
    const value = JSON.parse(current ?? legacy ?? '[]');
    const saved = Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    if (current === null && legacy !== null) localStorage.setItem(savedKey, JSON.stringify(saved));
    return saved;
  } catch {
    return [];
  }
}

function normalizeSearch(value) {
  return String(value).toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function updateUrlState(catalog, query, category) {
  const url = new URL(window.location.href);
  query ? url.searchParams.set('q', query) : url.searchParams.delete('q');
  category && category !== 'all' ? url.searchParams.set('category', category) : url.searchParams.delete('category');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  catalog.dataset.activeCategory = category;
}

export function initCatalog() {
  const body = document.body;
  const catalog = document.querySelector('[data-catalog]');
  const saved = new Set(readSavedProducts());
  if (!catalog) return;

  const input = catalog.querySelector('[data-search]');
  const count = catalog.querySelector('[data-result-count]');
  const resultWord = catalog.querySelector('[data-result-word]');
  const emptyState = catalog.querySelector('.empty-state');
  const toast = document.querySelector('[data-action-toast]');
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get('category');
  let activeCategory = requestedCategory && [...catalog.querySelectorAll('[data-filter]')].some(button => button.dataset.filter === requestedCategory)
    ? requestedCategory
    : 'all';

  if (input && params.has('q')) input.value = params.get('q');

  function render({ updateUrl = true } = {}) {
    const query = normalizeSearch(input?.value?.trim() ?? '');
    let visibleCount = 0;
    for (const card of catalog.querySelectorAll('[data-tool]')) {
      const matchesCategory = activeCategory === 'all'
        || (activeCategory === 'saved' ? saved.has(card.dataset.tool) : card.dataset.category === activeCategory);
      const matchesQuery = normalizeSearch(card.dataset.search).includes(query);
      card.hidden = !(matchesCategory && matchesQuery);
      if (!card.hidden) visibleCount += 1;
    }

    count.textContent = String(visibleCount);
    resultWord.textContent = visibleCount === 1 ? catalog.dataset.resultSingle : catalog.dataset.resultPlural;
    emptyState.hidden = visibleCount > 0;
    for (const button of catalog.querySelectorAll('[data-filter]')) {
      const selected = button.dataset.filter === activeCategory;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    }

    if (updateUrl) updateUrlState(catalog, input?.value?.trim() ?? '', activeCategory);
  }

  function syncSavedControls() {
    for (const control of document.querySelectorAll('[data-save]')) {
      const productId = control.dataset.save;
      const isSaved = saved.has(productId);
      const label = isSaved ? body.dataset.unsaveLabel : body.dataset.saveLabel;
      control.setAttribute('aria-pressed', String(isSaved));
      control.setAttribute('aria-label', `${label} ${control.dataset.saveName ?? productId}`);
      control.classList.toggle('is-saved', isSaved);
      const text = control.querySelector('[data-save-text]');
      if (text) text.textContent = label;
    }
    for (const badge of document.querySelectorAll('[data-saved-count]')) badge.textContent = String(saved.size);
    render();
  }

  async function announceSave(productId, isSaved) {
    if (!toast) return;
    await customElements.whenDefined('wa-toast');
    const message = body.dataset[isSaved ? 'saveToast' : 'unsaveToast']
      ?? `${isSaved ? body.dataset.saveLabel : body.dataset.unsaveLabel}: ${productId}`;
    toast.create(message, { variant: isSaved ? 'success' : 'neutral', duration: 5000 });
  }

  catalog.addEventListener('click', event => {
    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      activeCategory = filterButton.dataset.filter;
      render();
      return;
    }
    if (event.target.closest('[data-reset]')) {
      activeCategory = 'all';
      if (input) input.value = '';
      render();
      input?.focus();
    }
  });

  document.addEventListener('click', event => {
    const saveButton = event.target.closest('[data-save]');
    if (!saveButton) return;
    const productId = saveButton.dataset.save;
    if (saved.has(productId)) saved.delete(productId);
    else saved.add(productId);
    try { localStorage.setItem(savedKey, JSON.stringify([...saved])); } catch {}
    syncSavedControls();
    announceSave(productId, saved.has(productId));
  });

  input?.addEventListener('input', () => render());
  input?.addEventListener('wa-input', () => render());
  window.addEventListener('storage', event => {
    if (event.key !== savedKey && event.key !== legacySavedKey) return;
    saved.clear();
    readSavedProducts().forEach(productId => saved.add(productId));
    syncSavedControls();
  });

  syncSavedControls();
  render({ updateUrl: false });
}

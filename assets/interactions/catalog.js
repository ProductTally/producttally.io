function normalizeSearch(value, locale) {
  return value.toLocaleLowerCase(locale).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function initCatalog(catalog, saved) {
  const input = catalog.querySelector('[data-search]');
  const count = catalog.querySelector('[data-result-count]');
  const resultWord = catalog.querySelector('[data-result-word]');
  const emptyState = catalog.querySelector('.empty-state');
  const buttons = [...catalog.querySelectorAll('[data-filter]')];
  const locale = catalog.dataset.localeFormat;
  const number = new Intl.NumberFormat(locale);
  const cards = [...catalog.querySelectorAll('[data-catalog-item]')].map(element => ({
    element,
    id: element.dataset.catalogItem,
    category: element.dataset.category,
    search: normalizeSearch(element.dataset.search, locale)
  }));
  const categories = new Set(buttons.map(button => button.dataset.filter));
  let activeCategory = 'all';

  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    activeCategory = categories.has(category) ? category : 'all';
    input.value = params.get('q') ?? '';
  }

  function writeUrl() {
    const url = new URL(window.location.href);
    const query = input.value.trim();
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    if (activeCategory === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', activeCategory);
    window.history.replaceState(window.history.state, '', url);
  }

  function render() {
    const terms = normalizeSearch(input.value.trim(), locale).split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const matchesCategory = activeCategory === 'all' || card.category === activeCategory ||
        (activeCategory === 'saved' && saved?.has(card.id));
      const matches = matchesCategory && terms.every(term => card.search.includes(term));
      card.element.hidden = !matches;
      if (matches) visible += 1;
    }
    count.textContent = number.format(visible);
    resultWord.textContent = visible === 1 ? catalog.dataset.resultSingle : catalog.dataset.resultPlural;
    emptyState.hidden = visible > 0;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === activeCategory));
  }

  function apply() {
    render();
    writeUrl();
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.filter;
      apply();
    });
  }
  catalog.querySelector('[data-reset]').addEventListener('click', () => {
    activeCategory = 'all';
    input.value = '';
    input.focus();
    apply();
  });
  input.addEventListener('input', apply);
  window.addEventListener('popstate', () => {
    readUrl();
    render();
  });
  saved?.onChange(render);
  readUrl();
  render();
}

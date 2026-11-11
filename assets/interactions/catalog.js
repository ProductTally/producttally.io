function normalizeSearch(value, locale) {
  return value.toLocaleLowerCase(locale).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function initCatalog(catalog, saved) {
  const input = catalog.querySelector('[data-search]');
  const count = catalog.querySelector('[data-result-count]');
  const resultWord = catalog.querySelector('[data-result-word]');
  const emptyState = catalog.querySelector('.empty-state');
  const buttons = [...catalog.querySelectorAll('[data-filter]')];
  const menu = catalog.querySelector('[data-filter-menu]');
  const menuOptions = [...(menu?.querySelectorAll('wa-dropdown-item') ?? [])];
  const menuLabel = menu?.querySelector('[data-filter-label]');
  const pagination = catalog.querySelector('[data-pagination]');
  const pageSize = Number(pagination?.dataset.pagination) || Infinity;
  const pageStatus = pagination?.querySelector('[data-page-status]');
  const pageButtons = [...(pagination?.querySelectorAll('[data-page-step]') ?? [])];
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
  let page = 1;

  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    activeCategory = categories.has(category) ? category : 'all';
    input.value = params.get('q') ?? '';
    const requested = Number(params.get('page'));
    page = pagination && Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
  }

  function writeUrl(method = 'replaceState') {
    const url = new URL(window.location.href);
    const query = input.value.trim();
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    if (activeCategory === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', activeCategory);
    if (pagination) {
      if (page === 1) url.searchParams.delete('page');
      else url.searchParams.set('page', String(page));
    }
    if (url.href !== window.location.href) window.history[method](window.history.state, '', url);
  }

  function render() {
    const terms = normalizeSearch(input.value.trim(), locale).split(/\s+/).filter(Boolean);
    const matches = cards.filter(card => {
      const matchesCategory = activeCategory === 'all' || card.category === activeCategory ||
        (activeCategory === 'saved' && saved?.has(card.id));
      return matchesCategory && terms.every(term => card.search.includes(term));
    });
    const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
    page = Math.min(page, totalPages);
    const visible = pagination ? matches.slice((page - 1) * pageSize, page * pageSize) : matches;
    const visibleCards = new Set(visible);
    for (const card of cards) card.element.hidden = !visibleCards.has(card);
    count.textContent = number.format(matches.length);
    resultWord.textContent = matches.length === 1 ? catalog.dataset.resultSingle : catalog.dataset.resultPlural;
    emptyState.hidden = matches.length > 0;
    if (pagination) {
      pagination.hidden = totalPages <= 1;
      pageStatus.textContent = pageStatus.dataset.pageStatus
        .replace('{page}', number.format(page)).replace('{total}', number.format(totalPages));
      pageButtons[0].disabled = page === 1;
      pageButtons[1].disabled = page === totalPages;
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === activeCategory));
    for (const option of menuOptions) {
      const selected = option.getAttribute('value') === activeCategory;
      option.checked = selected;
      if (selected) menuLabel.textContent = option.textContent.trim();
    }
  }

  function apply() {
    page = 1;
    render();
    writeUrl();
  }

  for (const button of pageButtons) {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      page += Number(button.dataset.pageStep);
      render();
      writeUrl('pushState');
      count.parentElement.focus({ preventScroll: true });
      count.parentElement.scrollIntoView({ block: 'start' });
    });
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.filter;
      apply();
    });
  }
  menu?.addEventListener('wa-select', event => {
    activeCategory = event.detail.item.getAttribute('value');
    apply();
  });
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
  saved?.onChange(() => {
    render();
    if (pagination) writeUrl();
  });
  readUrl();
  render();
  if (pagination) writeUrl();
}

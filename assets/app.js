import { initLanguageSwitcher } from './interactions/language.js';

const components = './vendor/webawesome/components/';

async function register(...names) {
  await Promise.all(names.map(name => import(`${components}${name}/${name}.js`)));
}

async function setupLanguage() {
  try {
    await register('dropdown', 'button');
    initLanguageSwitcher();
  } catch {
    document.querySelector('.language-control')?.setAttribute('data-failed', 'true');
  }
}

async function setupCatalog() {
  const catalog = document.querySelector('[data-catalog]');
  const hasSaveControls = Boolean(document.querySelector('[data-save]'));
  if (!catalog && !hasSaveControls) return;

  const catalogComponents = catalog?.querySelector('[data-filter-menu]') ? ['input', 'dropdown'] : ['input'];
  await register('button', ...(catalog ? catalogComponents : []));
  const saved = hasSaveControls
    ? (await import('./interactions/saved.js')).initSavedProducts()
    : undefined;

  if (catalog) {
    const { initCatalog } = await import('./interactions/catalog.js');
    initCatalog(catalog, saved);
  }
}

async function setupProductMedia() {
  if (!document.querySelector('[data-product-video]')) return;
  await register('button');
  const { initProductMedia } = await import('./interactions/product-media.js');
  initProductMedia();
}

async function setupCardTooltips() {
  const links = document.querySelectorAll('[data-card-tooltip-link]');
  if (!links.length) return;
  const { initCardTooltips } = await import('./interactions/card-tooltips.js');
  initCardTooltips(links);
  await register('tooltip');
}

await Promise.allSettled([setupLanguage(), setupCatalog(), setupProductMedia(), setupCardTooltips()]);

import { initLanguageSwitcher } from './interactions/language.js';

const components = './vendor/webawesome/components/';

async function register(...names) {
  await Promise.all(names.map(name => import(`${components}${name}/${name}.js`)));
}

async function setupLanguage() {
  await register('select');
  initLanguageSwitcher();
}

async function setupProducts() {
  const catalog = document.querySelector('[data-catalog]');
  if (!catalog && !document.querySelector('[data-save]')) return;

  await register('button', ...(catalog ? ['input'] : []));
  const { initSavedProducts } = await import('./interactions/saved.js');
  const saved = initSavedProducts();

  if (catalog) {
    const { initCatalog } = await import('./interactions/catalog.js');
    initCatalog(catalog, saved);
  }
}

await Promise.allSettled([setupLanguage(), setupProducts()]);

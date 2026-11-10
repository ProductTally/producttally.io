import { initLanguageSwitcher } from './interactions/language.js';

const components = './vendor/webawesome/components/';

async function register(...names) {
  await Promise.all(names.map(name => import(`${components}${name}/${name}.js`)));
}

async function setupLanguage() {
  await register('dropdown', 'button');
  initLanguageSwitcher();
}

async function setupCatalog() {
  const catalog = document.querySelector('[data-catalog]');
  const hasSaveControls = Boolean(document.querySelector('[data-save]'));
  if (!catalog && !hasSaveControls) return;

  await register('button', ...(catalog ? ['input'] : []));
  const saved = hasSaveControls
    ? (await import('./interactions/saved.js')).initSavedProducts()
    : undefined;

  if (catalog) {
    const { initCatalog } = await import('./interactions/catalog.js');
    initCatalog(catalog, saved);
  }
}

await Promise.allSettled([setupLanguage(), setupCatalog()]);

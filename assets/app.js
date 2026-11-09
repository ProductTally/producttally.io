import { initCatalog } from './interactions/catalog.js';
import { initLanguageSwitcher } from './interactions/language.js';
import { initMobileNavigation } from './interactions/navigation.js';

await Promise.all(['wa-button', 'wa-input', 'wa-option', 'wa-select', 'wa-toast'].map(name => customElements.whenDefined(name)));

initCatalog();
initLanguageSwitcher();
initMobileNavigation();

import base from '../config/default';
import { merge } from '../config/lib/merge';
window.CONFIG = base;
window.CONFIG_PATCH = null;

const configPatchElement = document.querySelector('#config-patch');
if (configPatchElement) {
  try {
    window.CONFIG_PATCH = JSON.parse(configPatchElement.textContent);
    window.CONFIG = merge(window.CONFIG, window.CONFIG_PATCH);
  } catch {
    // pass
  }
}

// Dark/light themes
try {
  const colorScheme = localStorage.getItem(window.CONFIG.appearance.colorSchemeStorageKey);
  if (
    colorScheme === 'dark' ||
    (colorScheme !== 'light' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark-theme');
  }
} catch {
  // pass
}

// Google Analytics stub
{
  window['GoogleAnalyticsObject'] = 'ga';
  const ga = (window['ga'] =
    window['ga'] ||
    function (...args) {
      ga.q = ga.q || [];
      ga.q.push(args);
    });
  ga.l = 1 * new Date();
}

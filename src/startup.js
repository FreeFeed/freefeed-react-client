// This file is compiled separately. It is inserted directly into index.html.
import base from '../config/default';
import { merge } from '../config/lib/merge';
window.CONFIG = base;
window.CUSTOM_CONFIG = null;

const configPatchElement = document.querySelector('#custom-config');
if (configPatchElement) {
  try {
    window.CUSTOM_CONFIG = JSON.parse(configPatchElement.textContent);
    window.CONFIG = merge(window.CONFIG, window.CUSTOM_CONFIG);
  } catch {
    // pass
  }
}

/** @type {Storage | null}*/
let storage = localStorage;
try {
  localStorage.setItem('__test', '1');
  localStorage.removeItem('__test');
} catch {
  // localStorage is not supported (incognito mode?)
  storage = null;
}

// Dark/light themes
try {
  const colorScheme = storage?.getItem(window.CONFIG.appearance.colorSchemeStorageKey);
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

// Windows platform detection
{
  const platform = navigator.userAgentData?.platform;
  const isWindows = platform ? platform === 'Windows' : navigator.userAgent.includes('Win');
  document.documentElement.classList.toggle('windows-platform', isWindows);
}

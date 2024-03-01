/* eslint-disable no-console */

let firstOpen = true;
export function openLightbox(index, dataSource) {
  if (firstOpen && dataSource[index].src) {
    // Preload image
    new Image().src = dataSource[index].src;
  }
  firstOpen = false;
  import('./lightbox-actual')
    .then((m) => m.openLightbox(index, dataSource))
    .catch((e) => console.error('Could not load lightbox', e));
}

// Preload lightbox-actual after the main code loading
const preloadTimeout = 5000;
if (globalThis.requestIdleCallback) {
  globalThis.requestIdleCallback(
    () => import('./lightbox-actual').catch((e) => console.error('Could not load lightbox', e)),
    { timeout: preloadTimeout },
  );
} else {
  setTimeout(() => import('./lightbox-actual'), preloadTimeout);
}

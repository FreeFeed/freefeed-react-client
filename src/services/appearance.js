/* global CONFIG */
import storage from 'local-storage-fallback';

export const { colorSchemeStorageKey, nsfwVisibilityStorageKey } = CONFIG.appearance;

export const SCHEME_LIGHT = 'light';
export const SCHEME_DARK = 'dark';
export const SCHEME_NO_PREFERENCE = 'no-preference';
export const SCHEME_SYSTEM = 'system';

export function saveColorScheme(scheme) {
  if (scheme === SCHEME_LIGHT || scheme === SCHEME_DARK) {
    storage.setItem(colorSchemeStorageKey, scheme);
  } else {
    storage.removeItem(colorSchemeStorageKey);
  }
}

export function loadColorScheme() {
  const scheme = storage.getItem(colorSchemeStorageKey);
  return scheme === SCHEME_LIGHT || scheme === SCHEME_DARK ? scheme : SCHEME_SYSTEM;
}

export const systemColorSchemeSupported =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: light)').media === '(prefers-color-scheme: light)';

export function getSystemColorScheme() {
  for (const scheme of [SCHEME_LIGHT, SCHEME_DARK]) {
    const mq = window.matchMedia(`(prefers-color-scheme: ${scheme})`);
    if (mq.matches) {
      return scheme;
    }
  }
  return SCHEME_NO_PREFERENCE;
}

export function loadNSFWVisibility() {
  return !!storage.getItem(nsfwVisibilityStorageKey);
}

export function saveNSFWVisibility(visible) {
  if (visible) {
    storage.setItem(nsfwVisibilityStorageKey, '1');
  } else {
    // Default value
    storage.removeItem(nsfwVisibilityStorageKey);
  }
}

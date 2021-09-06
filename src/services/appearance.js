/* global CONFIG */
import storage from 'local-storage-fallback';

export const {
  colorSchemeStorageKey,
  nsfwVisibilityStorageKey,
  uiScaleStorageKey,
  submitModeStorageKey,
} = CONFIG.appearance;

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

export function loadUIScale() {
  // UI scale in percents
  const scale = parseInt(storage.getItem(uiScaleStorageKey), 10);
  return isFinite(scale) ? scale : 100;
}

export function saveUIScale(scale) {
  if (scale !== 100) {
    storage.setItem(uiScaleStorageKey, scale);
  } else {
    // Default value
    storage.removeItem(uiScaleStorageKey);
  }
}

export function loadSubmitMode() {
  const mode = storage.getItem(submitModeStorageKey);
  return ['enter', 'ctrl+enter', 'auto'].includes(mode) ? mode : 'auto';
}

export function saveSubmitMode(mode) {
  if (['enter', 'ctrl+enter'].includes(mode)) {
    storage.setItem(submitModeStorageKey, mode);
  } else {
    // Default value
    storage.removeItem(submitModeStorageKey);
  }
}

export function submittingByEnter(submitMode) {
  return submitMode === 'enter' || (submitMode === 'auto' && !isMobile);
}

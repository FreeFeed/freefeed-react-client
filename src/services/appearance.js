import { localStorage } from '../utils/';
import config from '../config';


export const { colorSchemeStorageKey } = config.appearance;

export const SCHEME_LIGHT = 'light';
export const SCHEME_DARK = 'dark';
export const SCHEME_NO_PREFERENCE = 'no-preference';
export const SCHEME_SYSTEM = 'system';

export function saveColorScheme(scheme) {
  if (scheme === SCHEME_LIGHT || scheme === SCHEME_DARK) {
    localStorage.setItem(colorSchemeStorageKey, scheme);
  } else {
    localStorage.removeItem(colorSchemeStorageKey);
  }
}

export function loadColorScheme() {
  const scheme = localStorage.getItem(colorSchemeStorageKey);
  return (scheme === SCHEME_LIGHT || scheme === SCHEME_DARK) ? scheme : SCHEME_SYSTEM;
}

export const systemColorSchemeSupported = (typeof window !== 'undefined')
  && window.matchMedia
  && window.matchMedia('(prefers-color-scheme: light)').media === '(prefers-color-scheme: light)';

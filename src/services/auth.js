/* global CONFIG */
import storage from 'local-storage-fallback';
import { authDebug } from '../utils/debug';

const { tokenPrefix } = CONFIG.auth;
const NAME = `${tokenPrefix}authToken`;

let token;

export function getToken() {
  if (token === undefined) {
    token = storage.getItem(NAME);
  }
  return token;
}

export function setToken(newToken = null, save = true) {
  if (save) {
    if (!newToken) {
      authDebug('cleaning token up');
      storage.removeItem(NAME);
    } else {
      authDebug('saving token to the storage');
      storage.setItem(NAME, newToken);
    }
  }
  authDebug('updating token in memory');
  token = newToken;
}

export function onStorageChange(callback) {
  window?.addEventListener('storage', (e) => e.key === NAME && callback(e.newValue));
}

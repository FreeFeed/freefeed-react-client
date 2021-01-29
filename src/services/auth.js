/* global CONFIG */
import storage from 'local-storage-fallback';

import { authDebug } from '../utils/debug';

const { tokenPrefix } = CONFIG.auth;
const NAME = `${tokenPrefix}authToken`;

export function getToken() {
  authDebug('loading token from the storage');
  return storage.getItem(NAME);
}

export function setToken(newToken = null) {
  if (!newToken) {
    authDebug('cleaning token up');
    storage.removeItem(NAME);
  } else {
    authDebug('saving token to the storage');
    storage.setItem(NAME, newToken);
  }
}

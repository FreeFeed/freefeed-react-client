/* global CONFIG */
import storage from 'local-storage-fallback';

const { tokenPrefix } = CONFIG.auth;
const NAME = `${tokenPrefix}authToken`;

let token = undefined;

export function getToken() {
  if (token === undefined) {
    token = storage.getItem(NAME);
  }
  return token;
}

export function setToken(newToken = null) {
  if (!newToken) {
    storage.removeItem(NAME);
  } else {
    storage.setItem(NAME, newToken);
  }
  token = newToken;
}

/* global CONFIG */
import storage from 'local-storage-fallback';
// import { getCookie, setCookie, deleteCookie } from '../utils/';

const { tokenPrefix } = CONFIG.auth;
const NAME = `${tokenPrefix}authToken`;

export function getToken() {
  return storage.getItem(NAME);
}

export function setToken(token) {
  if (!token) {
    storage.removeItem(NAME);
  } else {
    storage.setItem(NAME, token);
  }
}

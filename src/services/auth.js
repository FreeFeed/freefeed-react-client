import {getCookie, setCookie} from '../utils/';
import config from '../config';

const authConfig = config.auth;
const NAME = `${authConfig.tokenPrefix}authToken`;
const EXP_DAYS = 365;
const PATH = '/';

export function getToken() {
  return getCookie(NAME);
}

export function setToken(token) {
  return setCookie(NAME, token, EXP_DAYS, PATH);
}

export function getPersistedUser() {
  return JSON.parse(window.localStorage.getItem(authConfig.userStorageKey));
}

export function persistUser(user) {
  return user ? window.localStorage.setItem(authConfig.userStorageKey, JSON.stringify(user)) :
  window.localStorage.removeItem(authConfig.userStorageKey);
}

import { getCookie, setCookie, localStorage, userParser } from '../utils/';
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
  const userData = JSON.parse(localStorage.getItem(authConfig.userStorageKey)); // whoamiCache
  return userData && userParser(userData);
}

export function persistUser(user) {
  return user ? localStorage.setItem(authConfig.userStorageKey, JSON.stringify(user)) :
    localStorage.removeItem(authConfig.userStorageKey);
}

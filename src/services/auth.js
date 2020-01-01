/* global CONFIG */
import { getCookie, setCookie, localStorage, userParser } from '../utils/';

const { userStorageKey, tokenPrefix } = CONFIG.auth;
const NAME = `${tokenPrefix}authToken`;
const EXP_DAYS = 365;
const PATH = '/';

// based on https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js
let lsWorks = null;
function localStorageWorks() {
  if (lsWorks !== null) {
    return lsWorks;
  }
  const test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    lsWorks = true;
    return true;
  } catch {
    lsWorks = false;
    return false;
  }
}

export function getToken() {
  let token;

  if (localStorageWorks()) {
    token = localStorage.getItem(NAME);
  }

  if (!token) {
    token = getCookie(NAME);
  }

  return token;
}

export function setToken(token) {
  if (localStorageWorks()) {
    localStorage.setItem(NAME, token);
  } else {
    setCookie(NAME, token, EXP_DAYS, PATH);
  }
}

export function getPersistedUser() {
  const userData = JSON.parse(localStorage.getItem(userStorageKey)); // whoamiCache
  return userData && userParser(userData);
}

export function persistUser(user) {
  return user
    ? localStorage.setItem(userStorageKey, JSON.stringify(user))
    : localStorage.removeItem(userStorageKey);
}

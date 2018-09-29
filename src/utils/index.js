import _ from 'lodash';

import defaultUserpic50Path from '../../assets/images/default-userpic-50.png';
import defaultUserpic75Path from '../../assets/images/default-userpic-75.png';

import config from '../config';

const frontendPrefsConfig = config.frontendPreferences;

export function getCookie(name) {
  const begin = document.cookie.indexOf(name);
  if (begin === -1) {
    return '';
  }
  const fromBegin = document.cookie.substr(begin);
  const tokenWithName = fromBegin.split(';');
  const tokenWithNameSplit = tokenWithName[0].split('=');
  const [, token] = tokenWithNameSplit;
  return token.trim();
}

export function setCookie(name, value = '', expireDays, path) {
  const expiresDate = Date.now() + expireDays * 24 * 60 * 60 * 1000;
  const expiresTime = new Date(expiresDate).toUTCString();
  //http://stackoverflow.com/questions/1134290/cookies-on-localhost-with-explicit-domain
  const cookie = `${name}=${value}; expires=${expiresTime}; path=${path}`;
  return document.cookie = cookie;
}

const userDefaults = {
  profilePictureMediumUrl: defaultUserpic50Path,
  profilePictureLargeUrl: defaultUserpic75Path,
  frontendPreferences: frontendPrefsConfig.defaultValues
};

export function userParser(user) {
  const newUser = { ...user };

  // Profile pictures
  newUser.profilePictureMediumUrl = user.profilePictureMediumUrl || userDefaults.profilePictureMediumUrl;
  newUser.profilePictureLargeUrl = user.profilePictureLargeUrl || userDefaults.profilePictureLargeUrl;

  // Frontend preferences (only use this client's subtree)
  if (user.frontendPreferences) {
    const prefSubTree = user.frontendPreferences[frontendPrefsConfig.clientId];
    newUser.frontendPreferences = _.merge({}, userDefaults.frontendPreferences, prefSubTree);
  }

  return newUser;
}

export function postParser(post) {
  post.commentsDisabled = (post.commentsDisabled === '1');
  return { ...post };
}

export function preventDefault(realFunction) {
  return (event) => {
    event.preventDefault();
    return realFunction && realFunction();
  };
}

export function confirmFirst(realFunction) {
  return () => {
    if (confirm('Are you sure?')) {
      return realFunction && realFunction();
    }
  };
}

export function getCurrentRouteName(router) {
  return router && router.routes && router.routes[router.routes.length - 1].name;
}

export function pluralForm(n, singular, plural = null, format = 'n w') {
  let w;

  if (n == 1) {
    w = singular;
  } else if (plural) {
    w = plural;
  } else {
    w = `${singular}s`;
  }

  return format.replace('n', n).replace('w', w);
}

export function delay(timeout = 0) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}


// detect if localStorage is supported by attempting to set and delete an item
// if it throws, then no localStorage for us (and we are most probably a Safari
// in private browsing mode)
let localStorageSupported = true;
try {
  const lskey = `ff${new Date().getTime()}`;
  window.localStorage.setItem(lskey, 'test');
  window.localStorage.removeItem(lskey);
} catch (err) {
  localStorageSupported = false;
}

const localStorageShim = {
  _data: {},
  setItem(id, val) { return this._data[id] = String(val); },
  getItem(id) { return this._data.hasOwnProperty(id) ? this._data[id] : null; },
  removeItem(id) { return delete this._data[id]; },
  clear() { return this._data = {}; }
};

export const localStorage = localStorageSupported ? window.localStorage : localStorageShim;

export function getSummaryPeriod(days) {
  switch (+days) {
    case 1: return 'day';
    case 7: return 'week';
    case 30: return 'month';
    default: return `${days} days`;
  }
}

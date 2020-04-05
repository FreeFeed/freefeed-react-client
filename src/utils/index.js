/* global CONFIG */
import filesize from 'filesize';

import defaultUserpicPath from '../../assets/images/default-userpic.svg';

import { initialAsyncState } from '../redux/async-helpers';

const frontendPrefsConfig = CONFIG.frontendPreferences;

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
  return (document.cookie = cookie);
}

export function deleteCookie(name, path) {
  return setCookie(name, '', -1, path);
}

const userDefaults = {
  profilePictureMediumUrl: defaultUserpicPath,
  profilePictureLargeUrl: defaultUserpicPath,
  frontendPreferences: frontendPrefsConfig.defaultValues,
};

/**
 * Fill missing user fields with default values
 *
 * @param {object} user user data from API response or cache
 * @returns {object}
 */
export function userParser(user) {
  const newUser = { ...user };

  // Profile pictures
  newUser.profilePictureMediumUrl =
    user.profilePictureMediumUrl || userDefaults.profilePictureMediumUrl;
  newUser.profilePictureLargeUrl =
    user.profilePictureLargeUrl || userDefaults.profilePictureLargeUrl;

  // Frontend preferences (only use this client's subtree).
  // Do not fill them if no 'frontendPreferences' in 'user'.
  if (user.frontendPreferences) {
    const prefSubTree = user.frontendPreferences[frontendPrefsConfig.clientId] || {};
    newUser.frontendPreferences = { ...userDefaults.frontendPreferences, ...prefSubTree };
  }

  return newUser;
}

export function postParser(post) {
  return {
    ...post,
    commentsDisabled: post.commentsDisabled === '1',
    savePostStatus: initialAsyncState,
  };
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

export function getSummaryPeriod(days) {
  switch (+days) {
    case 1:
      return 'day';
    case 7:
      return 'week';
    case 30:
      return 'month';
    default:
      return `${days} days`;
  }
}

export function formatFileSize(fileSize) {
  return filesize(fileSize, { standard: 'iec', round: 1 });
}

export function htmlSafe(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

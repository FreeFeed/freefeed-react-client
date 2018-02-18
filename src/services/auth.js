import { isArray } from 'lodash';

import { getCookie, setCookie, localStorage } from '../utils/';
import config from '../config';

const authConfig = config.auth;
const apiConfig = config.api;
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
  return JSON.parse(localStorage.getItem(authConfig.userStorageKey)); // whoamiCache
}

export function persistUser(user) {
  return user ? localStorage.setItem(authConfig.userStorageKey, JSON.stringify(user)) :
    localStorage.removeItem(authConfig.userStorageKey);
}

export function openOauthPopup(uri) {
  return new Promise((resolve, reject) => {
    function oauthListener(event) {
      if (event.origin !== apiConfig.host) {
        // eslint-disable-next-line no-console
        console.warn('Message with unsupported origin', event);
      }

      window.removeEventListener('message', oauthListener, false);

      const { data } = event;

      if (data.error) {
        reject(new Error(data.error));
        return;
      }

      resolve(data);
    }

    window.addEventListener('message', oauthListener, false);

    const popup = window.open(
      uri,
      '_blank',
      // 'centerscreen,toolbar=0,scrollbars=1,status=1,resizable=1,location=0,menuBar=0,width=800,height=1000'
    );

    if (popup) {
      popup.focus();
    } else {
      reject(new Error('Could not open authentication window'));
      window.removeEventListener('message', oauthListener, false);
    }
  });
}

export function openOauthAuthPopup(provider) {
  checkOauthProvider(provider);

  const uri = `${apiConfig.host}/v2/oauth/${provider}`;
  return openOauthPopup(uri);
}

export function openOauthLinkPopup(provider) {
  checkOauthProvider(provider);

  const uri = `${apiConfig.host}/v2/oauth/${provider}/link?authToken=${getToken()}`;
  return openOauthPopup(uri);
}

function checkOauthProvider(provider) {
  if (!isArray(authConfig.oauth) || !authConfig.oauth.includes(provider)) {
    throw Error(`Unsupported OAuth provider "${provider}"`);
  }
}

/* global CONFIG */
import storage from 'local-storage-fallback';
import { nanoid } from 'nanoid';
import { reissueAuthSession } from '../redux/action-creators';

import { authDebug } from '../utils/debug';
import { Lock } from '../utils/storage-lock';

const { tokenPrefix } = CONFIG.auth;
const NAME = `${tokenPrefix}authToken`;

let token;

export function getToken(force = false) {
  if (token === undefined || force) {
    authDebug('loading token from the storage');
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

const lock = new Lock(
  storage,
  `${tokenPrefix}lock`,
  nanoid(),
  CONFIG.authSessions.lockIntervalSec * 1000,
);

let tokenReissueTimer = 0;

export function scheduleTokenReissue(store) {
  const interval = CONFIG.authSessions.reissueIntervalSec * 1000 * (1 + Math.random() / 3);
  authDebug(`scheduling token reissue at ${interval / 1000} seconds`);
  clearTimeout(tokenReissueTimer);
  tokenReissueTimer = setTimeout(() => {
    if (store.getState().authenticated) {
      authDebug('trying to reissue token');
      if (lock.try()) {
        authDebug('start token reissue');
        store.dispatch(reissueAuthSession());
      } else {
        authDebug('lock detecting, skipping reissue');
      }
    }
    scheduleTokenReissue(store);
  }, interval);
}

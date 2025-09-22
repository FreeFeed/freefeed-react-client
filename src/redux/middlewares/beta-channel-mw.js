import { deleteCookie, setCookie } from '../../utils';
import { SET_BETA_CHANNEL } from '../action-types';

const { CONFIG } = globalThis;

export const betaChannelMiddleware = (store) => {
  // Reinstalling cookie for Safari
  if (CONFIG.betaChannel.enabled && CONFIG.betaChannel.isBeta) {
    setCookie(CONFIG.betaChannel.cookieName, CONFIG.betaChannel.cookieValue, 365, '/');
  }

  return (next) => (action) => {
    if (action.type === SET_BETA_CHANNEL && action.payload !== store.getState().betaChannel) {
      if (action.payload) {
        setCookie(CONFIG.betaChannel.cookieName, CONFIG.betaChannel.cookieValue, 365, '/');
      } else {
        deleteCookie(CONFIG.betaChannel.cookieName, '/');
      }
      setTimeout(() => location.reload(true), 200);
    }
    return next(action);
  };
};

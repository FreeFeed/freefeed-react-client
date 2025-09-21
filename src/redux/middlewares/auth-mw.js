import { getToken, setToken } from '../../services/auth';
import { locationPush } from '../../services/nouter/redux';
import { authDebug } from '../../utils/debug';
import {
  authTokenUpdated,
  initialWhoAmI,
  requireAuthentication,
  unauthenticated,
  whoAmI,
} from '../action-creators';
import { fail, requiresAuth, response } from '../action-helpers';
import { REISSUE_AUTH_SESSION, SIGN_IN, SIGN_OUT, SIGN_UP, UNAUTHENTICATED } from '../action-types';

const paths = [
  '/friends',
  '/settings',
  '/filter/notifications',
  '/filter/direct',
  '/groups',
  '/groups/create',
  '/summary',
  '/memories',
];

function shouldGoToSignIn(pathname) {
  return pathname && paths.some((path) => pathname.startsWith(path));
}

export const authMiddleware = (store) => {
  setTimeout(() => {
    store.dispatch(getToken() ? initialWhoAmI() : unauthenticated({ initial: true }));
  }, 0);

  return (next) => (action) => {
    //stop action propagation if it should be authed and user is not authed
    if (requiresAuth(action) && !store.getState().authenticated) {
      return;
    }

    if (action.type === UNAUTHENTICATED) {
      setToken();
      next(action);
      if (action.payload.initial) {
        const { pathname } = window.location;
        if (shouldGoToSignIn(pathname)) {
          store.dispatch(requireAuthentication());
          store.dispatch(
            locationPush(
              `/signin?back=${encodeURIComponent(
                location.pathname + location.search + location.hash,
              )}`,
            ),
          );
          return;
        }
      } else {
        location.reload();
      }
      return;
    }

    if (action.type === response(SIGN_IN) || action.type === response(SIGN_UP)) {
      setToken(action.payload.authToken);
      next(action);
      store.dispatch(whoAmI());

      // Do not redirect to Home page if signed in at Bookmarklet
      const { pathname } = store.getState().routing.locationBeforeTransitions || {};
      if (pathname === '/bookmarklet') {
        return;
      }

      const backTo = store.getState().routing.locationBeforeTransitions.query.back || '/';
      store.dispatch(locationPush(`${backTo}`));
      return;
    }

    if (action.type === response(SIGN_OUT) || action.type === fail(SIGN_OUT)) {
      if (action.type === fail(SIGN_OUT)) {
        // Unauthorize even if error
        // eslint-disable-next-line no-console
        console.warn(`Error signing out: ${action.payload.err}`);
      }
      const res = next(action);
      store.dispatch(unauthenticated());
      return res;
    }

    if (action.type === response(REISSUE_AUTH_SESSION)) {
      authDebug('token successfully reissued');
      setToken(action.payload.authToken);
      store.dispatch(authTokenUpdated());
    }
    if (action.type === fail(REISSUE_AUTH_SESSION)) {
      authDebug(`cannot reissue token: ${action.payload.err}`);
    }

    return next(action);
  };
};

import { blockedByMe, initialWhoAmI } from '../action-creators';
import { response } from '../action-helpers';
import { INITIAL_WHO_AM_I, SIGN_IN, WHO_AM_I } from '../action-types';

export const initialWhoamiMiddleware = (store) => (next) => (action) => {
  if (action.type === response(SIGN_IN)) {
    store.dispatch(initialWhoAmI());
  }
  if (action.type === response(INITIAL_WHO_AM_I)) {
    // Fire the WHO_AM_I response first to properly fill state by current user data
    store.dispatch({ ...action, type: response(WHO_AM_I) });
    setTimeout(() => store.dispatch(blockedByMe()), 0);
  }
  next(action);
};

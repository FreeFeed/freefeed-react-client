import { subscribers } from '../action-creators';
import { response } from '../action-helpers';
import { ACCEPT_USER_REQUEST } from '../action-types';

export const requestsMiddleware = (store) => (next) => (action) => {
  if (action.type === response(ACCEPT_USER_REQUEST)) {
    next(action);

    if (store.getState().routing.locationBeforeTransitions.pathname == '/friends') {
      const { username } = store.getState().user;
      store.dispatch(subscribers(username));
    }

    return;
  }

  return next(action);
};

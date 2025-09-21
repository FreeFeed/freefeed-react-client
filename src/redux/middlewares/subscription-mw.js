import { getUserInfo } from '../action-creators';
import { response } from '../action-helpers';
import { SUBSCRIBE, UNSUBSCRIBE } from '../action-types';

export const subscriptionMiddleware = (store) => (next) => (action) => {
  if (action.type === response(SUBSCRIBE) || action.type === response(UNSUBSCRIBE)) {
    // Update user data after subscribing/unsubscribing (to update home feeds)
    store.dispatch(getUserInfo(action.request.username));
  }

  return next(action);
};

import { markAllDirectsAsRead } from '../action-creators';
import { request } from '../action-helpers';
import { DIRECT } from '../action-types';

export const markDirectsAsReadMiddleware = (store) => (next) => (action) => {
  if (action.type === request(DIRECT) && action.payload.offset == 0) {
    // needed to mark all directs as read
    store.dispatch(markAllDirectsAsRead());
  }
  next(action);
};

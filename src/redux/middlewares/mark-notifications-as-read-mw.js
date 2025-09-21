import { markAllNotificationsAsRead } from '../action-creators';
import { request } from '../action-helpers';
import { GET_NOTIFICATIONS } from '../action-types';

export const markNotificationsAsReadMiddleware = (store) => (next) => (action) => {
  if (action.type === request(GET_NOTIFICATIONS) && action.payload.offset == 0) {
    // needed to mark all notifications as read
    store.dispatch(markAllNotificationsAsRead());
  }
  next(action);
};

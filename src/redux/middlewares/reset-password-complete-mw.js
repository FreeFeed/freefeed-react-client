import { locationPush } from '../../services/nouter/redux';
import { response } from '../action-helpers';
import { RESET_PASSWORD } from '../action-types';

export const resetPasswordCompleteMiddleware = (store) => (next) => (action) => {
  if (action.type === response(RESET_PASSWORD)) {
    store.dispatch(locationPush('/signin'));
  }
  next(action);
};

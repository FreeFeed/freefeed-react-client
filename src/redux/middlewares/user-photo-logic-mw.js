import { whoAmI } from '../action-creators';
import { response } from '../action-helpers';
import { UPDATE_USER_PICTURE } from '../action-types';

export const userPhotoLogicMiddleware = (store) => (next) => (action) => {
  if (action.type === response(UPDATE_USER_PICTURE)) {
    // Update data after userpic is updated
    store.dispatch(whoAmI());
  }

  return next(action);
};

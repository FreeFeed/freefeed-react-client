import { getUserInfo } from '../action-creators';
import { response } from '../action-helpers';
import { UPDATE_GROUP_PICTURE } from '../action-types';

export const groupPictureLogicMiddleware = (store) => (next) => (action) => {
  if (action.type === response(UPDATE_GROUP_PICTURE)) {
    // Update data after group picture is updated
    store.dispatch(getUserInfo(action.request.groupName));
  }

  return next(action);
};

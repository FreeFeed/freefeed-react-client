import { locationPush } from '../../services/nouter/redux';
import { response } from '../action-helpers';
import { CREATE_POST, DELETE_POST, LEAVE_DIRECT, UNADMIN_GROUP_ADMIN } from '../action-types';

function isInvitation({ locationBeforeTransitions }) {
  const { pathname, query } = locationBeforeTransitions;
  return pathname === '/filter/direct' && !!query.invite;
}

export const redirectionMiddleware = (store) => (next) => (action) => {
  //go to home if single post has been removed
  if (
    (action.type === response(DELETE_POST) || action.type === response(LEAVE_DIRECT)) &&
    !action.payload.postStillAvailable &&
    store.getState().singlePostId
  ) {
    setTimeout(() => store.dispatch(locationPush('/')), 0);
  }

  if (
    action.type === response(UNADMIN_GROUP_ADMIN) &&
    store.getState().user.id === action.request.user.id
  ) {
    store.dispatch(locationPush(`/${action.request.groupName}/subscribers`));
  }

  if (action.type === response(CREATE_POST) && isInvitation(store.getState().routing)) {
    store.dispatch(locationPush('/filter/direct'));
  }

  return next(action);
};

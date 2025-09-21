import { getUserFeed } from '../action-creators';
import { response } from '../action-helpers';
import { BAN, DISABLE_BANS_IN_GROUP, ENABLE_BANS_IN_GROUP, UNBAN } from '../action-types';

function isResponseOf(action, ...baseTypes) {
  return baseTypes.map(response).includes(action.type);
}

export const reloadFeedMiddleware = (store) => (next) => (action) => {
  const res = next(action);
  const { resolvedRoutes } = store.getState();

  // If we on the 'Posts' 'page
  const userFeedRoute = resolvedRoutes.find((route) => route.name === 'userFeed');
  if (userFeedRoute) {
    const { userName } = userFeedRoute.params;
    if (
      // Enable/disable bans in group
      (isResponseOf(action, DISABLE_BANS_IN_GROUP, ENABLE_BANS_IN_GROUP) &&
        userName === action.request.groupName) ||
      // Ban/unban user
      (isResponseOf(action, BAN, UNBAN) && userName === action.request.username)
    ) {
      // Re-request this page
      store.dispatch(getUserFeed(userName));
    }
  }

  return res;
};

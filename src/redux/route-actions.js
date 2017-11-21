import { FRIENDFEED_POST } from '../utils/link-types';
import {
  // Private (content depends on current user)
  home,
  discussions,
  direct,
  getSummary,

  // Public (content depends on URL params)
  getUserInfo,
  getUserFeed,
  getUserComments,
  getUserLikes,
  getSinglePost,
  getSearch,
  getBestOf,
  getNotifications,
  getPostIdByOldName,
  getUserSummary,
} from './action-creators';

//query params are strings, so + hack to convert to number
const getOffset = (nextRoute) => +nextRoute.location.query.offset || 0;

const getSearchQueryParam = (nextRoute) => nextRoute.location.query.qs;

const getPostName = (url) => {
  const m = FRIENDFEED_POST.exec(url);
  return m ? m[1] : '';
};

const getUserName = (nextRoute) => {
  return nextRoute.params.userName;
};

export const routeActions = {
  home: (next) => home(getOffset(next)),
  discussions: (next) => discussions(getOffset(next)),
  direct: (next) => direct(getOffset(next)),
  summary: (next) => getSummary(next.params.days),
  search: (next) => getSearch(getSearchQueryParam(next), getOffset(next)),
  best_of: (next) => getBestOf(getOffset(next)),
  getUserInfo: (next) => getUserInfo(getUserName(next)),
  userFeed: (next) => getUserFeed(next.params.userName, getOffset(next)),
  userComments: (next) => getUserComments(next.params.userName, getOffset(next)),
  userLikes: (next) => getUserLikes(next.params.userName, getOffset(next)),
  userSummary: (next) => getUserSummary(next.params.userName, next.params.days),
  post: (next) => getSinglePost(next.params.postId),
  notifications: (next) => getNotifications(getOffset(next), next.location.query.filter),
  archivePost: (next) => getPostIdByOldName(getPostName(next.location.query.url)),
};

export const bindRouteActions = (dispatch) => (route) => (next) => {
  return dispatch(routeActions[route](next));
};

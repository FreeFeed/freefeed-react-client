import { FRIENDFEED_POST } from '../utils/link-types';
import {
  // Private (content depends on current user)
  home,
  discussions,
  saves,
  direct,
  getSummary,
  getMemories,
  getCalendarYearDays,
  getCalendarMonthDays,
  getCalendarDatePosts,

  // Public (content depends on URL params)
  getUserInfo,
  getUserFeed,
  getUserComments,
  getUserLikes,
  getUserMemories,
  getSinglePost,
  getSearch,
  getBestOf,
  getEverything,
  getNotifications,
  getPostIdByOldName,
  getUserSummary,
  getUserStats,
  getBacklinks,
} from './action-creators';

//query params are strings, so + hack to convert to number
const getOffset = (nextRoute) => +nextRoute.location.query.offset || 0;

const getSearchQueryParam = (nextRoute) =>
  nextRoute.location.query.q || nextRoute.location.query.qs || '';

const getPostName = (url) => {
  const m = FRIENDFEED_POST.exec(url);
  return m ? m[1] : '';
};

const getUserName = (nextRoute) => {
  return nextRoute.params.userName;
};

const getFrom = (nextRoute) => {
  return nextRoute.params.from;
};

export const routeActions = {
  home: (next) => home(getOffset(next)),
  memories: (next) => getMemories(getFrom(next), getOffset(next)),
  userMemories: (next) => getUserMemories(getUserName(next), getFrom(next), getOffset(next)),
  discussions: (next) => discussions(getOffset(next)),
  saves: (next) => saves(getOffset(next)),
  direct: (next) => direct(getOffset(next)),
  summary: (next) => getSummary(next.params.days),
  search: (next) => getSearch(getSearchQueryParam(next), getOffset(next)),
  best_of: (next) => getBestOf(getOffset(next)),
  everything: (next) => getEverything(getOffset(next)),
  getUserInfo: (next) => getUserInfo(getUserName(next)),
  userFeed: (next) => [
    getUserFeed(next.params.userName, getOffset(next)),
    getUserStats(next.params.userName),
  ],
  userComments: (next) => getUserComments(next.params.userName, getOffset(next)),
  userLikes: (next) => getUserLikes(next.params.userName, getOffset(next)),
  userSummary: (next) => getUserSummary(next.params.userName, next.params.days),
  post: (next) => getSinglePost(next.params.postId),
  notifications: (next) => getNotifications(getOffset(next), next.location.query.filter),
  archivePost: (next) => getPostIdByOldName(getPostName(next.location.query.url)),
  calendarYear: (next) => getCalendarYearDays(getUserName(next), next.params.year),
  calendarMonth: (next) =>
    getCalendarMonthDays(getUserName(next), next.params.year, next.params.month),
  calendarDate: (next) =>
    getCalendarDatePosts(
      getUserName(next),
      next.params.year,
      next.params.month,
      next.params.day,
      getOffset(next),
    ),
  backlinks: (next) => getBacklinks(next.params.postId, getOffset(next)),
};

export const bindRouteActions = (dispatch) => (route) => (next) => {
  const actions = routeActions[route](next);
  if (Array.isArray(actions)) {
    actions.map(dispatch);
  } else {
    dispatch(actions);
  }
};

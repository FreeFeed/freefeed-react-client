import {
  // Private (content depends on current user)
  home,
  discussions,
  direct,

  // Public (content depends on URL params)
  getUserInfo,
  getUserFeed,
  getUserComments,
  getUserLikes,
  subscribers,
  subscriptions,
  getSinglePost,
  getSearch,
  getBestOf,
} from './action-creators';

//query params are strings, so + hack to convert to number
const getOffset = nextRoute => +nextRoute.location.query.offset || 0;

const getSearchQueryParam = nextRoute => nextRoute.location.query.qs;

const getUserName = nextRoute => {
  return nextRoute.params.userName;
};

export const routeActions = {
  'home': next => home(getOffset(next)),
  'discussions': next => discussions(getOffset(next)),
  'direct': next => direct(getOffset(next)),
  'search': next => getSearch(getSearchQueryParam(next), getOffset(next)),
  'best_of': next => getBestOf(getOffset(next)),
  'getUserInfo': next => getUserInfo(getUserName(next)),
  'userFeed': next => getUserFeed(next.params.userName, getOffset(next)),
  'userComments': next => getUserComments(next.params.userName, getOffset(next)),
  'userLikes': next => getUserLikes(next.params.userName, getOffset(next)),
  'subscribers': next => subscribers(getUserName(next)),
  'subscriptions': next => subscriptions(getUserName(next)),
  'post': next => getSinglePost(next.params.postId)
};

export const bindRouteActions = dispatch => route => next => {
  return dispatch(routeActions[route](next));
};

import {
  HOME,
  HOME_AUX,
  DISCUSSIONS,
  DIRECT,
  GET_USER_FEED,
  GET_USER_COMMENTS,
  GET_USER_LIKES,
  GET_SEARCH,
  GET_BEST_OF,
  GET_EVERYTHING,
  SIGN_UP,
  WHO_AM_I,
  SUBSCRIBE,
  UNSUBSCRIBE,
  GET_SUMMARY,
  GET_USER_SUMMARY,
  UPDATE_USER,
  UPDATE_USER_PREFERENCES,
  MEMORIES,
  GET_USER_MEMORIES,
  SAVES,
  GET_SERVER_INFO,
  HIDE_BY_NAME,
  UNHIDE_NAMES,
  TOGGLE_PINNED_GROUP,
  UPDATE_ACTUAL_USER_PREFERENCES,
  UPDATE_USER_NOTIFICATION_PREFERENCES,
  GET_USER_INFO,
  UNSUBSCRIBE_FROM_ME,
  LIST_HOME_FEEDS,
  BLOCKED_BY_ME,
  GET_SINGLE_POST,
  GET_NOTIFICATIONS,
  LIST_AUTH_SESSIONS,
  GET_APP_TOKENS,
  GET_ALL_GROUPS,
  GET_APP_TOKENS_SCOPES,
} from './action-types';
import { request, response, fail, baseType } from './async-helpers';

// Async actions lifecycle
export { request, response, fail, reset } from './async-helpers';

export const feedGeneratingActions = [
  HOME,
  HOME_AUX,
  DISCUSSIONS,
  SAVES,
  GET_USER_FEED,
  GET_USER_COMMENTS,
  GET_USER_LIKES,
  DIRECT,
  GET_SEARCH,
  GET_BEST_OF,
  GET_EVERYTHING,
  GET_SUMMARY,
  GET_USER_SUMMARY,
  MEMORIES,
  GET_USER_MEMORIES,
];
const userFeedGeneratingActions = [
  GET_USER_FEED,
  GET_USER_COMMENTS,
  GET_USER_LIKES,
  GET_USER_SUMMARY,
  GET_USER_MEMORIES,
];

export const isFeedGeneratingAction = (action) => feedGeneratingActions.includes(action.type);
const isUserFeedGeneratingAction = (action) => userFeedGeneratingActions.includes(action.type);

export const feedRequests = feedGeneratingActions.map(request);
export const feedResponses = feedGeneratingActions.map(response);
export const feedFails = feedGeneratingActions.map(fail);
export const isFeedRequest = (action) => feedRequests.includes(action.type);
export const isFeedResponse = (action) => feedResponses.includes(action.type);
export const isFeedFail = (action) => feedFails.includes(action.type);
const isUserFeedRequest = (action) => userFeedGeneratingActions.map(request).includes(action.type);

export const userChangeActions = [
  SIGN_UP,
  WHO_AM_I,
  SUBSCRIBE,
  UNSUBSCRIBE,
  UPDATE_USER,
  UPDATE_USER_PREFERENCES,
  UPDATE_ACTUAL_USER_PREFERENCES,
  UPDATE_USER_NOTIFICATION_PREFERENCES,
  HIDE_BY_NAME,
  UNHIDE_NAMES,
  TOGGLE_PINNED_GROUP,
  UNSUBSCRIBE_FROM_ME,
];
export const userChangeResponses = userChangeActions.map(response);
export const isUserChangeResponse = (action) => userChangeResponses.includes(action.type);

export const refreshableActions = [
  ...feedGeneratingActions,
  GET_SINGLE_POST,
  GET_NOTIFICATIONS,
  LIST_AUTH_SESSIONS,
  GET_APP_TOKENS,
  GET_APP_TOKENS_SCOPES,
  GET_ALL_GROUPS,
];
export const refreshableRequests = refreshableActions.map(request);

export function getFeedName(action) {
  if (!isFeedGeneratingAction(action) && !isFeedRequest(action)) {
    return 'unknown';
  }

  if (isUserFeedGeneratingAction(action) || isUserFeedRequest(action)) {
    return `${baseType(action.type)}_${action.payload.username}`;
  }

  if (action.type === request(HOME_AUX) || action.type === HOME_AUX) {
    return `${baseType(action.type)}_${action.payload.feedId}`;
  }

  return baseType(action.type);
}

/**
 * Some async actions should not re-run simultaneously. This function returns
 * true if the request is already started and should not be started again.
 */
export function cancelConcurrentRequest(action, state) {
  if (action.type === GET_SERVER_INFO) {
    return state.serverInfo.loading;
  }
  if (action.type === GET_USER_INFO) {
    return state.getUserInfoStatuses[action.payload.username]?.loading;
  }
  if (action.type === LIST_HOME_FEEDS) {
    return state.homeFeedsStatus.loading;
  }
  if (action.type === BLOCKED_BY_ME) {
    return state.blockedByMeStatus.loading;
  }
  return false;
}

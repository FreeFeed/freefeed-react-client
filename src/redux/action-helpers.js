import {
  HOME,
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
} from './action-types';
import { request, response, fail, baseType } from './async-helpers';

// Async actions lifecycle
export { request, response, fail, reset } from './async-helpers';

export const feedGeneratingActions = [
  HOME,
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
  HIDE_BY_NAME,
];
export const userChangeResponses = userChangeActions.map(response);
export const isUserChangeResponse = (action) => userChangeResponses.includes(action.type);

export function requiresAuth(action) {
  return action.apiRequest && !action.nonAuthRequest;
}

export function getFeedName(action) {
  if (!isFeedGeneratingAction(action) && !isFeedRequest(action)) {
    return 'unknown';
  }

  if (isUserFeedGeneratingAction(action) || isUserFeedRequest(action)) {
    return `${baseType(action.type)}_${action.payload.username}`;
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
  return false;
}

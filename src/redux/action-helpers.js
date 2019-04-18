import {
  HOME, DISCUSSIONS, DIRECT, GET_USER_FEED, GET_USER_COMMENTS, GET_USER_LIKES, GET_SEARCH, GET_BEST_OF,
  SIGN_UP, WHO_AM_I, SUBSCRIBE, UNSUBSCRIBE, GET_SUMMARY, GET_USER_SUMMARY,
  UPDATE_USER, UPDATE_USER_PREFERENCES, MEMORIES, GET_USER_MEMORIES,
} from './action-types';


export const request = (type) => `${type}_REQUEST`;
export const response = (type) => `${type}_RESPONSE`;
export const fail = (type) => `${type}_FAIL`;

export const feedGeneratingActions = [HOME, DISCUSSIONS, GET_USER_FEED, GET_USER_COMMENTS, GET_USER_LIKES, DIRECT, GET_SEARCH, GET_BEST_OF, GET_SUMMARY, GET_USER_SUMMARY, MEMORIES, GET_USER_MEMORIES];
export const isFeedGeneratingAction = (action) => feedGeneratingActions.indexOf(action.type) != -1;
export const feedRequests = feedGeneratingActions.map(request);
export const feedResponses = feedGeneratingActions.map(response);
export const feedFails = feedGeneratingActions.map(fail);
export const isFeedRequest = (action) => feedRequests.indexOf(action.type) !== -1;
export const isFeedResponse = (action) => feedResponses.indexOf(action.type) !== -1;
export const isFeedFail = (action) => feedFails.indexOf(action.type) !== -1;

export const userChangeActions = [SIGN_UP, WHO_AM_I, SUBSCRIBE, UNSUBSCRIBE, UPDATE_USER, UPDATE_USER_PREFERENCES];
export const userChangeResponses = userChangeActions.map(response);
export const isUserChangeResponse = (action) => userChangeResponses.indexOf(action.type) !== -1;

export function requiresAuth(action) {
  return action.apiRequest && !action.nonAuthRequest;
}

export function getFeedName(action) {
  if (action.type === request(HOME) || action.type === HOME) {
    return HOME;
  }
  return `${GET_USER_FEED}_${action.payload.username}`;
}

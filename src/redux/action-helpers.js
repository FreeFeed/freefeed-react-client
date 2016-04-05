import {
  HOME, DISCUSSIONS, DIRECT, GET_USER_FEED, GET_USER_COMMENTS, GET_USER_LIKES,
  SIGN_UP, WHO_AM_I, SUBSCRIBE, UNSUBSCRIBE,
  UPDATE_USER, UPDATE_FRONTEND_PREFERENCES, UPDATE_FRONTEND_REALTIME_PREFERENCES
} from './action-types';

export const request = (type) =>`${type}_REQUEST`;
export const response = (type) => `${type}_RESPONSE`;
export const fail = (type) => `${type}_FAIL`;

export const feedGeneratingActions = [HOME, DISCUSSIONS, GET_USER_FEED, GET_USER_COMMENTS, GET_USER_LIKES, DIRECT];
export const feedRequests = feedGeneratingActions.map(request);
export const feedResponses = feedGeneratingActions.map(response);
export const feedFails = feedGeneratingActions.map(fail);
export const isFeedRequest = action => feedRequests.indexOf(action.type) !== -1;
export const isFeedResponse = action => feedResponses.indexOf(action.type) !== -1;
export const isFeedFail = action => feedFails.indexOf(action.type) !== -1;

export const userChangeActions = [SIGN_UP, WHO_AM_I, SUBSCRIBE, UNSUBSCRIBE, UPDATE_USER, UPDATE_FRONTEND_PREFERENCES, UPDATE_FRONTEND_REALTIME_PREFERENCES];
export const userChangeResponses = userChangeActions.map(response);
export const isUserChangeResponse = action => userChangeResponses.indexOf(action.type) !== -1;

export function requiresAuth(action) {
  return action.apiRequest && !action.nonAuthRequest;
}

import * as Sentry from '@sentry/react';

import { throttle } from 'lodash-es';
import { serverTimeAhead, unauthenticated } from '../action-creators';
import { cancelConcurrentRequest, fail, request, response } from '../action-helpers';
import { SIGN_IN } from '../action-types';

const adjustTime = throttle(
  (dispatch, delta) => dispatch(serverTimeAhead(delta)),
  30000, // 30 sec
);

//middleware for api requests
export const apiMiddleware = (store) => (next) => async (action) => {
  //ignore normal actions
  if (!action.apiRequest) {
    return next(action);
  }

  if (cancelConcurrentRequest(action, store.getState())) {
    // Ignore this action if already started
    return;
  }

  //dispatch request begin action
  //clean apiRequest to not get caught by this middleware
  store.dispatch({ ...action, type: request(action.type), apiRequest: null, fetchOptions: null });
  try {
    const apiResponse = await action.apiRequest(action.payload, action.fetchOptions);
    const obj = await apiResponse.json();

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      if (apiResponse.headers.has('Date')) {
        const serverTime = new Date(apiResponse.headers.get('Date'));
        if (!isNaN(serverTime)) {
          // valid date time
          adjustTime(store.dispatch, serverTime - Date.now());
        }
      }

      return store.dispatch({
        payload: obj,
        type: response(action.type),
        request: action.payload,
        extra: action.extra || {},
      });
    }

    if (apiResponse.status === 401 && action.type !== SIGN_IN) {
      return store.dispatch(unauthenticated(obj));
    }

    return store.dispatch({
      payload: obj,
      type: fail(action.type),
      request: action.payload,
      response: apiResponse,
      extra: action.extra || {},
    });
  } catch (e) {
    Sentry.captureException(e, {
      level: 'error',
      tags: { area: 'redux/apiMiddleware' },
      extra: { action },
    });

    return store.dispatch({
      payload: { err: 'Network error' },
      type: fail(action.type),
      request: action.payload,
      response: null,
      extra: action.extra || {},
    });
  }
};

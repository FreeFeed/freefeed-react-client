import { cancelConcurrentRequest, fail, request, response } from '../action-helpers';
import { progress } from '../async-helpers';

/**
 * Middleware for actions around async operations
 */
export const asyncMiddleware = (store) => (next) => async (action) => {
  // Ignore normal actions
  if (!action.asyncOperation) {
    return next(action);
  }

  if (cancelConcurrentRequest(action, store.getState())) {
    // Ignore this action if already started
    return;
  }

  store.dispatch({ ...action, type: request(action.type), asyncOperation: null });
  try {
    const result = await action.asyncOperation(action.payload, {
      onProgress: (p) =>
        store.dispatch({
          payload: p,
          type: progress(action.type),
          request: action.payload,
          extra: action.extra || {},
        }),
    });
    return store.dispatch({
      payload: result,
      type: response(action.type),
      request: action.payload,
      extra: action.extra || {},
    });
  } catch (error) {
    return store.dispatch({
      payload: error instanceof Error ? { err: error.message } : error,
      type: fail(action.type),
      request: action.payload,
      extra: action.extra || {},
    });
  }
};

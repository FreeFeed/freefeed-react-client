import { reset, request, fail, response, asyncTypeOf } from '../action-helpers';

export const initialAsyncState = {
  loading: false,
  success: false,
  error: false,
  errorText: '',
};

export function asyncStatus(actionType) {
  return (state = initialAsyncState, action) => {
    if (action.type === reset(actionType)) {
      return { ...state, ...initialAsyncState };
    }
    if (action.type === request(actionType)) {
      return { ...state, ...initialAsyncState, loading: true };
    }
    if (action.type === fail(actionType)) {
      return { ...state, ...initialAsyncState, error: true, errorText: action.payload.err };
    }
    if (action.type === response(actionType)) {
      return { ...state, ...initialAsyncState, success: true };
    }

    return state;
  };
}

export function fromResponse(asyncType, transformer, defValue = null, nextReducer = null) {
  return (state = defValue, action) => {
    if (asyncTypeOf(action.type, asyncType)) {
      return action.type === response(asyncType) ? transformer(action) : defValue;
    }

    return nextReducer ? nextReducer(state, action) : state;
  };
}

export function patchObjectByKey(object, key, patcher) {
  return key in object ? { ...object, [key]: patcher(object[key]) } : object;
}

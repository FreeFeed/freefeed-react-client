// Async action type have format 'BASE_TYPE/SUB_TYPE'. This function
// returns the BASE_TYPE part or the whole action type if it is not
// includes slash.
export const baseType = (type) => type.split('/', 2)[0];

// Async actions lifecycle

export const REQUEST_PHASE = 'request';
export const RESPONSE_PHASE = 'response';
export const FAIL_PHASE = 'fail';
export const RESET_PHASE = 'reset';

export const request = (type) => `${type}/async:${REQUEST_PHASE}`;
export const response = (type) => `${type}/async:${RESPONSE_PHASE}`;
export const fail = (type) => `${type}/async:${FAIL_PHASE}`;
export const reset = (type) => `${type}/async:${RESET_PHASE}`;

export const isAsync = (type) => /\/async:\w+$/.test(type);
export const asyncPhase = (type) => isAsync(type) && type.replace(/^.*?\/async:/, '');

// Reducers helpers

export const initialAsyncState = {
  initial: true,
  loading: false,
  success: false,
  error: false,
  errorText: '',
};

export const loadingAsyncState = { ...initialAsyncState, initial: false, loading: true };
export const successAsyncState = { ...initialAsyncState, initial: false, success: true };
export const errorAsyncState = (errorText = '') => ({
  ...initialAsyncState,
  initial: false,
  error: true,
  errorText,
});

/**
 * Reducers that represents an async status based on phases of the actionTypes.
 * If action is not one of actionTypes async actions then the nextReducer
 * is called if present.
 *
 * @param {string|string[]} actionTypes
 * @param {function|null} nextReducer
 */
export function asyncState(actionTypes, nextReducer = null) {
  if (!Array.isArray(actionTypes)) {
    actionTypes = [actionTypes];
  }

  return (state = initialAsyncState, action) => {
    if (!actionTypes.includes(baseType(action.type))) {
      return nextReducer ? nextReducer(state, action) : state;
    }

    switch (asyncPhase(action.type)) {
      case RESET_PHASE:
        return initialAsyncState;
      case REQUEST_PHASE:
        return loadingAsyncState;
      case RESPONSE_PHASE:
        return successAsyncState;
      case FAIL_PHASE:
        return errorAsyncState(action.payload && action.payload.err);
      default:
        return state;
    }
  };
}

/**
 * The simplest implementation of getKey function
 * that uses the keyName field of 'payload' (for
 * requests and resets) or 'request' (for responses
 * and fails).
 *
 * @param {string} keyName
 */
export function getKeyBy(keyName) {
  return (action) => {
    switch (asyncPhase(action.type)) {
      case RESET_PHASE:
      case REQUEST_PHASE:
        return action.payload[keyName];
      case RESPONSE_PHASE:
      case FAIL_PHASE:
        return action.request[keyName];
    }
  };
}

/**
 * Reducer that represents a map of asyncState's.
 *
 * The map keys are produses from actions via the *getKey* function.
 * The *applyState* function allows non-trivial modifications of the existing state.
 * The reducer will not touch the state if *keyMustExist* is true and the key does not exist.
 * If action is not one of actionTypes async actions then the *nextReducer*
 * is called if present.
 *
 * @param {string|string[]} actionTypes
 * @param {object} params
 * @param {function|null} nextReducer
 */
export function asyncStatesMap(
  actionTypes,
  { getKey = getKeyBy('id'), applyState = (prev, s) => s, keyMustExist = false } = {},
  nextReducer = null,
) {
  if (!Array.isArray(actionTypes)) {
    actionTypes = [actionTypes];
  }

  const subReducer = asyncState(actionTypes);

  return (state = {}, action) => {
    const subState = subReducer(42, action);
    if (subState === 42) {
      // State was not modified so it is not an async action of any needed type
      return nextReducer ? nextReducer(state, action) : state;
    }

    const key = getKey(action);
    if (keyMustExist && !state[key]) {
      return state;
    }

    return { ...state, [key]: applyState(state[key], subState) };
  };
}

/**
 * If action is a response of asyncType then return transformer(action);
 * If action is any other async phase of asyncType then return defaultValue;
 * Otherwise call nextReducer if present.
 *
 * @param {string} asyncType
 * @param {function} transformer
 * @param {any} defaultValue
 * @param {function|null} nextReducer
 */
export function fromResponse(asyncType, transformer, defaultValue = null, nextReducer = null) {
  return (state = defaultValue, action) => {
    if (action.type === response(asyncType)) {
      return transformer(action);
    }
    if (isAsync(action.type) && baseType(action.type) === asyncType) {
      return defaultValue;
    }
    if (nextReducer) {
      return nextReducer(state, action);
    }
    return state;
  };
}

export function combineAsyncStates(...states) {
  if (states.length === 0) {
    return initialAsyncState;
  }
  if (states.length === 1) {
    return states[0];
  }

  // If some states are loading then combined state is loading
  if (states.some((s) => s.loading)) {
    return loadingAsyncState;
  }

  // If some errors was happen then combined state is errored
  const errors = states.filter((s) => s.error).map((s) => s.errorText);
  if (errors.length > 0) {
    return errorAsyncState(errors.join('; '));
  }

  // If there are no unsuccessful states then state is successful
  if (!states.some((s) => !s.success)) {
    return successAsyncState;
  }

  // It should be possible only if all states are in initial state
  return initialAsyncState;
}

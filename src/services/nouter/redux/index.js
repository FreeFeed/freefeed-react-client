export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';
export const LOCATION_PUSH = '@@router/LOCATION_PUSH';

const initialState = { locationBeforeTransitions: null };

export function routerReducer(state = initialState, { type, payload } = {}) {
  if (type === LOCATION_CHANGE) {
    return { ...state, locationBeforeTransitions: payload };
  }

  return state;
}

// Action creator for LOCATION_PUSH
export function locationPush(to, replace = false) {
  return { type: LOCATION_PUSH, payload: { to, replace } };
}

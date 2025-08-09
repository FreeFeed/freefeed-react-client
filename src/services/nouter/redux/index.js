import { parse as qsParse } from 'querystring';

export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';
export const LOCATION_PUSH = '@@router/LOCATION_PUSH';

const initialState = { locationBeforeTransitions: null };

export function routerReducer(state = initialState, { type, payload } = {}) {
  if (type === LOCATION_CHANGE) {
    return { ...state, locationBeforeTransitions: payload };
  }

  return state;
}

export function syncHistoryWithStore(history, store) {
  function onLocationChange({ location }) {
    store.dispatch({
      type: LOCATION_CHANGE,
      payload: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        query: qsParse(location.search.slice(1)),
      },
    });
  }
  history.listen(onLocationChange);
  onLocationChange({ location: history.location });

  // A patch for calling history API via Redux actions. It is necessary for middlewares
  // to be able to manage history.
  const originalDispatch = store.dispatch;
  store.dispatch = (action) => {
    if (action.type === LOCATION_PUSH) {
      const { to, replace } = action.payload;
      history[replace ? 'replace' : 'push'](to);
    }
    return originalDispatch.call(store, action);
  };
}

// Action creator for LOCATION_PUSH
export function locationPush(to, replace = false) {
  return { type: LOCATION_PUSH, payload: { to, replace } };
}

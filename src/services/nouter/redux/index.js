import { parse as qsParse } from 'querystring';

export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

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
}

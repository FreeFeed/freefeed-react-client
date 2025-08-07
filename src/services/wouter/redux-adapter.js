import { parse as qsParse } from 'querystring';
import { historyEventSource } from './history-events';

// Inspired by react-router-redux

export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

const initialState = { locationBeforeTransitions: null };

export function routerReducer(state = initialState, { type, payload } = {}) {
  if (type === LOCATION_CHANGE) {
    return { ...state, locationBeforeTransitions: payload };
  }

  return state;
}

export const historyMiddleware = (store) => {
  const [getLocation, subscribeToLocationUpdates] = historyEventSource();

  // Subscribe to location changes
  const onLocationChange = () => {
    const location = getLocation();
    store.dispatch({
      type: LOCATION_CHANGE,
      payload: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        query: qsParse(location.search.slice(1)),
      },
    });
  };
  subscribeToLocationUpdates(onLocationChange);
  setTimeout(() => onLocationChange(), 0);

  return (next) => (action) => next(action);
};

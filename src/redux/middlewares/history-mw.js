import { LOCATION_PUSH, locationChange } from '../../services/nouter/redux';
import { createLocationSource, withoutQuery, withQuery } from '../../services/nouter/utils';

export function historyMiddlewareFactory({ history }) {
  return (store) => {
    const locationSource = createLocationSource(history);
    function onLocationChange() {
      const location = locationSource.get();
      store.dispatch(
        locationChange(
          withQuery({
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          }),
        ),
      );
    }
    locationSource.subscribe(onLocationChange);
    // Initial dispatch
    setTimeout(() => onLocationChange(), 0);

    return (next) => (action) => {
      // A patch for calling history API via Redux actions. It is necessary for
      // middlewares that want to manage history.
      if (action.type === LOCATION_PUSH) {
        const { to, replace } = action.payload;
        history[replace ? 'replace' : 'push'](withoutQuery(to));
      }
      return next(action);
    };
  };
}

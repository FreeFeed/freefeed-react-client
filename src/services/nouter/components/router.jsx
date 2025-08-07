import { parse as qsParse } from 'querystring';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import { NouterProvider } from '../hooks';

/**
 * @param {{
 *   history: import('history').History,
 *   children: React.ReactNode
 * }} props
 * @returns
 */
export function Router({ history = createBrowserHistory(), children }) {
  const [location, setLocation] = useState(() => history.location);
  useEffect(
    () =>
      history.listen(({ location }) =>
        setLocation((prev) => (isLocationEqual(prev, location) ? prev : location)),
      ),
    [history],
  );

  const ctx = useMemo(
    () => ({
      location: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        query: qsParse(location.search.slice(1)),
      },
      history,
      // Current route props
      name: undefined,
      pattern: '/',
      params: {},
      // All routes in the chain
      routes: [],
      // The rest of the path to parse
      path: location.pathname,
    }),
    [history, location],
  );

  return <NouterProvider value={ctx}>{children}</NouterProvider>;
}

function isLocationEqual(a, b) {
  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
}

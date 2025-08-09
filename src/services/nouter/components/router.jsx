import { parse as qsParse } from 'querystring';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserHistory } from 'history';
import { NouterProvider, RegisterResolvedRouteProvider } from '../hooks';

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
        setLocation((prev) => (isShallowEqual(prev, location) ? prev : location)),
      ),
    [history],
  );

  const [resolvedRoutes, setResolvedRoutes] = useState([]);

  const registerResolvedRoute = useCallback(({ id, name, params, pattern }) => {
    setResolvedRoutes((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx === -1) {
        return [...prev, { id, name, params, pattern }];
      }
      if (!isShallowEqual(prev[idx].params, params)) {
        return [...prev.slice(0, idx), { id, name, params, pattern }, ...prev.slice(idx + 1)];
      }
      return prev;
    });

    return () => setResolvedRoutes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const resolvedRoutesCtx = useMemo(
    () => ({ routes: resolvedRoutes, register: registerResolvedRoute }),
    [registerResolvedRoute, resolvedRoutes],
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

  return (
    <RegisterResolvedRouteProvider value={resolvedRoutesCtx}>
      <NouterProvider value={ctx}>{children}</NouterProvider>
    </RegisterResolvedRouteProvider>
  );
}

function isShallowEqual(obj1, obj2) {
  return Object.keys(obj1).every((key) => obj1[key] === obj2[key]);
}

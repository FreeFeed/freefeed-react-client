import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { createBrowserHistory } from 'history';
import { NouterProvider, RegisterResolvedRouteProvider } from '../hooks';
import { isShallowEqual, locationSource, withoutQuery, withQuery } from '../utils';

/**
 * @param {{
 *   history: import('history').History,
 *   children: React.ReactNode
 * }} props
 * @returns
 */
export function Router({ history = createBrowserHistory(), children }) {
  const location = useSyncExternalStore(...locationSource(history));

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

  const navigate = useCallback(
    (to, { replace = false } = {}) => history[replace ? 'replace' : 'push'](withoutQuery(to)),
    [history],
  );

  const ctx = useMemo(
    () => {
      return {
        location: withQuery({
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
        }),
        navigate,
        history,
        // Current route props
        name: undefined,
        pattern: '/',
        params: {},
        // All routes in the chain
        routes: [],
        // The rest of the path to parse
        path: location.pathname,
      };
    },
    // We MUST use 'location' (not the separate fields like 'location.pathname')
    // here because we want to update state even if href is the same
    [history, location, navigate],
  );

  return (
    <RegisterResolvedRouteProvider value={resolvedRoutesCtx}>
      <NouterProvider value={ctx}>{children}</NouterProvider>
    </RegisterResolvedRouteProvider>
  );
}

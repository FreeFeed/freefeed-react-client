import { useRoute, Route as WRoute } from 'wouter';
import { useContext, useEffect, useMemo, useState } from 'react';
import { routePropsContext } from './named-route-context';
import { routeStateContext } from './contexts';
import { useWouter } from './with-router';

/**
 * A wouter's Route with additional 'name', 'onEnter', 'onChange' props
 */

export function Route({ name, component: Component, onEnter, children, ...routeProps }) {
  const { path: parentPath } = useContext(routePropsContext);
  const path = joinPaths(parentPath, routeProps.path ?? '');
  console.log('Route', { name, path, location: location.pathname });

  const [m, p] = useRoute(routeProps.path ?? '');
  console.log({ m, p });

  const wrappedComponent = useMemo(() => {
    if (!Component) {
      return;
    }
    const wc = wrapComponent(onEnter, (routerState) => (
      <routeStateContext.Provider value={routeProps.nest ? null : routerState}>
        <routePropsContext.Provider value={{ name, path }}>
          <Component />
        </routePropsContext.Provider>
      </routeStateContext.Provider>
    ));
    wc.displayName = `NamedRoute(${Component.displayName || Component.name || 'unnamed'})`;
    return wc;
  }, [Component, name, onEnter, path, routeProps.nest]);

  return (
    <WRoute {...routeProps} component={wrappedComponent}>
      {Component ? null : (
        <routePropsContext.Provider value={{ name, path }}>{children}</routePropsContext.Provider>
      )}
    </WRoute>
  );
}

function joinPaths(...paths) {
  return paths.filter(Boolean).join('/').replace(/\/+/g, '/').replace(/\/$/, '');
}

function wrapComponent(onEnter, content) {
  return function () {
    const [routerState, setRouterState] = useState(null);
    const nextRouteState = useWouter();

    useEffect(() => {
      if (!routerState) {
        console.log('R: onEnter');
      } else if (routerState !== nextRouteState) {
        console.log('R: onChange');
      }
      if (onEnter && (!routerState || routerState !== nextRouteState)) {
        console.log('executing onEnter with', nextRouteState);
        onEnter(nextRouteState);
      }
      setRouterState(nextRouteState);
    }, [nextRouteState, routerState]);

    if (routerState) {
      console.log('rendering', routerState);
    } else {
      console.log('no props, skipping');
    }
    return routerState ? content(routerState) : null;
  };
}

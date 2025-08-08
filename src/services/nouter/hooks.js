import { createContext, createElement, useContext, useId, useLayoutEffect } from 'react';

// Keeps the router state up to the current route
const routerContext = createContext({});

export const registerResolvedRouteContext = createContext({ register: () => () => {}, routes: [] });

export const NouterProvider = routerContext.Provider;
export const RegisterResolvedRouteProvider = registerResolvedRouteContext.Provider;

// Registers the route in the resolved routes list
export function useRouteRegistration(name, params, pattern) {
  const id = useId();
  const { register } = useContext(registerResolvedRouteContext);
  useLayoutEffect(() => {
    if (!params) {
      return;
    }
    return register({ id, name, params, pattern });
  }, [id, name, params, pattern, register]);
}

export function useNouter() {
  return useContext(routerContext);
}

export function withNouter(Component) {
  function Wrapper(props) {
    const router = useNouter();
    return createElement(Component, { router, ...props });
  }
  Wrapper.displayName = `withNouter(${Component.displayName || Component.name || 'unnamed'})`;
  return Wrapper;
}

export function useResolvedRoutes() {
  return useContext(registerResolvedRouteContext).routes;
}

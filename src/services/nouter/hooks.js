import { createContext, createElement, useContext } from 'react';

const routerContext = createContext({});

export const NouterProvider = routerContext.Provider;

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

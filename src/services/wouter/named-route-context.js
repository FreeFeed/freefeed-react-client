import { createContext, useContext } from 'react';

export const routePropsContext = createContext({ name: undefined, path: '' });

export function useRouteName() {
  return useContext(routePropsContext).name;
}

export function useRoutePath() {
  return useContext(routePropsContext).path;
}

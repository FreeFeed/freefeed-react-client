import { createContext, useContext } from 'react';

export const tocContext = createContext({
  items: [],
  register: () => {},
});

export function useToc() {
  return useContext(tocContext);
}

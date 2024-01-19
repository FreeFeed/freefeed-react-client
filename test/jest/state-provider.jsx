import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

const dummyReducer = (state) => state;

// Creates react-redux provider with given state (required) and optional enhancer
export function StateProvider({ state, enhancer, children }) {
  const store = useMemo(() => createStore(dummyReducer, state, enhancer), [state, enhancer]);
  return <Provider store={store}>{children}</Provider>;
}

import { useSyncExternalStore } from 'react';
import { countDrafts, subscribeToDraftChanges } from '../../services/drafts';

const cutTimeout = 30 * 1000;
const pollInterval = 30 * 1000;

function subscribe(listener) {
  const timer = setInterval(listener, pollInterval);
  const unsubscribe = subscribeToDraftChanges(listener);
  return () => {
    unsubscribe();
    clearInterval(timer);
  };
}

export function WithDraftsCount({ children }) {
  const count = useSyncExternalStore(subscribe, () => countDrafts(cutTimeout));
  return children(count);
}

import { useEffect } from 'react';
import { useNouter } from '../services/nouter';

const warning = 'Do you want to leave this page? Changes you made may not be saved.';

// Prevents leaving this page if `prevent` is true
export function PreventPageLeaving({ prevent = false }) {
  const { history } = useNouter();

  useEffect(() => {
    if (!prevent) {
      return;
    }
    const unblock = history.block((tx) => {
      if (window.confirm(warning)) {
        // Unblock the navigation.
        unblock();
        // Retry the transition.
        tx.retry();
      }
    });
    return unblock;
  }, [history, prevent]);

  return null;
}

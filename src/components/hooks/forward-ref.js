import { useRef, useEffect } from 'react';

// Allows to reuse the forwarded ref in component
export function useForwardedRef(forwardedRef, initialValue = undefined) {
  const reusedRef = useRef(initialValue);

  useEffect(() => {
    if (!forwardedRef) {
      return;
    }
    if (typeof forwardedRef === 'function') {
      forwardedRef(reusedRef.current);
    } else {
      forwardedRef.current = reusedRef.current;
    }
  }); // /!\ No deps: update forwardedRef on each render

  return reusedRef;
}

import { Suspense, useState, useEffect, useMemo, forwardRef } from 'react';
import { lazyRetry } from '../utils/retry-promise';
import ErrorBoundary from './error-boundary';

export const lazyComponent = (loader, { fallback, errorMessage, delay }) =>
  forwardRef((props, ref) => {
    // No deps: loader can depends only on the initial props
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const Lazy = useMemo(() => lazyRetry(() => loader(props)), []);
    return (
      <ErrorBoundary message={errorMessage}>
        <Suspense fallback={<Delayed delay={delay}>{fallback}</Delayed>}>
          <Lazy {...props} ref={ref} />
        </Suspense>
      </ErrorBoundary>
    );
  });

export function Delayed({ delay = 500, children }) {
  const withDelay = children && delay > 0;
  const [show, setShow] = useState(!withDelay);
  useEffect(() => {
    if (!withDelay) {
      return;
    }
    const timeout = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timeout);
  }, [delay, withDelay]);

  return (show && children) || null;
}

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import ErrorBoundary from './error-boundary';

export function DelayedSuspense({ fallback, delay = 500, children }) {
  const withDelay = fallback && delay > 0;
  const [showFallback, setShowFallback] = useState(!withDelay);
  useEffect(() => {
    if (!withDelay) {
      return;
    }
    const timeout = setTimeout(() => setShowFallback(true), delay);
    return () => clearTimeout(timeout);
  }, [delay, withDelay]);

  return <Suspense fallback={showFallback && fallback}>{children}</Suspense>;
}

export const lazyComponent = (loader, { fallback, errorMessage, delay }) => (props) => {
  // No deps: loader can depends only on the initial props
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const Lazy = useMemo(() => React.lazy(() => loader(props)), []);
  return (
    <ErrorBoundary message={errorMessage}>
      <DelayedSuspense fallback={fallback} delay={delay}>
        <Lazy {...props} />
      </DelayedSuspense>
    </ErrorBoundary>
  );
};

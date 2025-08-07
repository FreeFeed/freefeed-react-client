import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { NouterProvider, useNouter } from '../hooks';
import { matchPattern } from '../match-pattern';

export function Route({
  path: pattern,
  name,
  nest,
  component: Component = Fragment,
  children,
  onEnter, // legacy handler name
  onChange, // legacy handler name
  beforeEnter = onEnter, // recommended handler name
  beforeChange = onChange, // recommended handler name
}) {
  const ctx = useNouter();
  const [params, tail] =
    useMemo(() => matchPattern(pattern, ctx.path, nest), [pattern, ctx.path, nest]) ?? [];

  const newContext = useMemo(
    () =>
      params
        ? {
            ...ctx,
            name,
            pattern,
            path: tail || '/',
            params: { ...ctx.params, ...params },
            routes: [...ctx.routes, { name, pattern, params }],
          }
        : null,
    [ctx, name, params, pattern, tail],
  );

  const [currentCtx, setCurrentCtx] = useState(null);
  const lastTrxRef = useRef(null);

  useEffect(() => {
    if (currentCtx === newContext) {
      return;
    }

    const promise =
      currentCtx === null
        ? Promise.resolve(beforeEnter?.(newContext))
        : newContext === null
          ? Promise.resolve() // No 'beforeLeave' transition for now
          : Promise.resolve(beforeChange?.(currentCtx, newContext));

    lastTrxRef.current = promise;

    // eslint-disable-next-line promise/catch-or-return
    promise.then(
      () => {
        if (lastTrxRef.current === promise) {
          setCurrentCtx(newContext);
          lastTrxRef.current = null;
        }
        return null;
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error('Route transition failed', err);
      },
    );

    return () => {
      lastTrxRef.current = null;
    };
  }, [beforeChange, beforeEnter, currentCtx, newContext]);

  if (!currentCtx) {
    return null;
  }

  return (
    <NouterProvider value={currentCtx}>
      <Component>{children}</Component>
    </NouterProvider>
  );
}

import { Fragment, useMemo, useRef, useState } from 'react';
import { NouterProvider, useNouter, useRouteRegistration } from '../hooks';
import { matchPattern } from '../match-pattern';
import { useIsomorphicLayoutEffect } from '../utils';

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
  const [params, tail] = useMemo(
    () => matchPattern(pattern, ctx.path, nest),
    [pattern, ctx.path, nest],
  ) ?? [null];

  // If pattern didn't match, don't render anything. Most of the following
  // computations will be skipped
  const matched = params !== null;

  const newContext = useMemo(
    () =>
      matched
        ? {
            ...ctx,
            name,
            pattern,
            path: tail || '/',
            params: { ...ctx.params, ...params },
            routes: [...ctx.routes, { name, pattern, params }],
          }
        : ctx,
    [ctx, matched, name, params, pattern, tail],
  );

  const prevCtxRef = useRef(null);
  const [, setUpdate] = useState(false);

  const prevCtx = prevCtxRef.current;
  const entering = matched && prevCtx === null;
  const changing = matched && prevCtx !== null && prevCtx !== newContext;
  const leaving = !matched && prevCtx !== null;

  let renderCtx = prevCtx;
  if (entering && !beforeEnter) {
    renderCtx = prevCtxRef.current = newContext;
  }

  if (changing && !beforeChange) {
    renderCtx = prevCtxRef.current = newContext;
  }

  if (leaving) {
    // No 'beforeLeave' transition for now
    renderCtx = prevCtxRef.current = null;
  }

  useRouteRegistration(name, renderCtx?.params, pattern);

  const lastTrxRef = useRef(null);
  useIsomorphicLayoutEffect(() => {
    if (!(entering && beforeEnter) && !(changing && beforeChange)) {
      return;
    }

    // Either 'entering' or 'changing' is true
    const promise = entering
      ? Promise.resolve(beforeEnter?.(newContext))
      : Promise.resolve(beforeChange?.(prevCtx, newContext));

    lastTrxRef.current = promise;

    // eslint-disable-next-line promise/catch-or-return
    promise.then(
      () => {
        if (lastTrxRef.current === promise) {
          prevCtxRef.current = newContext;
          lastTrxRef.current = null;
          // Force a re-render
          setUpdate((v) => !v);
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
  }, [beforeChange, beforeEnter, changing, entering, newContext, prevCtx]);

  if (!renderCtx) {
    // Not matched or waiting for beforeEnter transition
    return null;
  }

  return (
    <NouterProvider value={renderCtx}>
      <Component>{children}</Component>
    </NouterProvider>
  );
}

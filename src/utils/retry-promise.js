import { lazy } from 'react';

import { retryPromiseDebug as debug } from './debug';

/**
 * Returns function that retries the given function until it succeeds or throws
 * error after the maxAttempts attempts.
 *
 * @param {()=>Promise<T>} fn
 * @param {number} maxAttempts
 * @param {number} interval
 * @returns {()=>Promise<T>}
 */
export function retry(fn, maxAttempts = 5, interval = 1000) {
  return async function () {
    try {
      return await fn();
    } catch (err) {
      debug('error happened while retrying:', err);
      if (maxAttempts > 1) {
        await new Promise((resolve) => setTimeout(resolve, interval));
        return await retry(fn, maxAttempts - 1, interval)();
      }
      throw err;
    }
  };
}

/**
 * Use React.lazy with retry
 *
 * @param {()=>Promise} fn
 */
export function lazyRetry(fn) {
  return lazy(retry(fn));
}

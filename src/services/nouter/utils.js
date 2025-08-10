import { useEffect, useLayoutEffect } from 'react';

/**
 * Add query parameters to the location object
 */
export function withQuery({ search, ...rest }) {
  const query = {};
  for (const [key, value] of new URLSearchParams(search)) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return { ...rest, query };
}

/**
 * Convert query object to 'search' string
 */
export function withoutQuery(loc) {
  if (typeof loc !== 'object' || loc === null || !('query' in loc)) {
    return loc;
  }
  const { query, ...rest } = loc;
  if (Object.keys(query).length === 0) {
    return { ...rest, search: '' };
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        search.append(key, v);
      }
    } else {
      search.set(key, value);
    }
  }
  return { ...rest, search: `?${search.toString()}` };
}

export function isShallowEqual(obj1, obj2) {
  return Object.keys(obj1).every((key) => obj1[key] === obj2[key]);
}

/**
 * Event source for React's `useSyncExternalStore`. Returns a subscribe function
 * and a getter of the current value. Uses memoization to avoid updates if the
 * location 'key' hasn't changed.
 */
export function createLocationSource(history) {
  let cached = history.location;

  function refresh() {
    const next = history.location;
    if (cached.key !== next.key) {
      cached = next;
    }
    return cached;
  }

  return {
    get() {
      return refresh();
    },

    subscribe(handler) {
      return history.listen(() => {
        const before = cached;
        const after = refresh();
        if (after !== before) {
          handler();
        }
      });
    },
  };
}

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

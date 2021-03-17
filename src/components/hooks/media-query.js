import { useState, useMemo, useEffect, useRef } from 'react';

export function useMediaQuery(query) {
  const mqSupported = useMemo(() => !!window.matchMedia, []);
  const [matches, setMatches] = useState(() => mqSupported && window.matchMedia(query).matches);
  useEffect(() => {
    if (!mqSupported) {
      return;
    }
    const mq = window.matchMedia(query);
    const handler = ({ matches }) => setMatches(matches);

    handler(mq);
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, [mqSupported, query]);

  return matches;
}

/**
 * useMediaQueryRef returns a 'ref' that holds the current status of media query
 * matching. This is useful when you don't want to re-render your components on
 * media query status change.
 *
 * @param {string} query
 * @returns {{current: boolean}}
 */
export function useMediaQueryRef(query) {
  const matches = useRef(false);
  const mqSupported = useMemo(() => {
    const supported = !!window.matchMedia;
    matches.current = supported && window.matchMedia(query).matches;
    return supported;
  }, [query]);

  useEffect(() => {
    if (!mqSupported) {
      return;
    }
    const mq = window.matchMedia(query);
    const handler = (q) => (matches.current = q.matches);

    handler(mq);
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, [mqSupported, query]);

  return matches;
}

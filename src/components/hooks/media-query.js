import { useState, useMemo, useEffect } from 'react';

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

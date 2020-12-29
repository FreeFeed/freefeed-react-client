import { useEffect, useState } from 'react';

export function useWaiting(delay) {
  const [waiting, setWaiting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setWaiting(false), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return waiting;
}

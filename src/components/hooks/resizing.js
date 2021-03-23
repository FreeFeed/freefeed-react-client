import { useEffect, useState } from 'react';

/**
 * Returns true if the window is currently resizing.
 *
 * @param {number} timeout
 * @returns boolean
 */
export function useResizing(timeout = 500) {
  const [resizing, setResizing] = useState(false);
  useEffect(() => {
    let resizeTimer;
    const h = () => {
      clearTimeout(resizeTimer);
      setResizing(true);
      resizeTimer = setTimeout(() => setResizing(false), timeout);
    };
    window.addEventListener('resize', h);
    return () => {
      window.removeEventListener('resize', h);
      clearTimeout(resizeTimer);
    };
  }, [timeout]);
  return resizing;
}

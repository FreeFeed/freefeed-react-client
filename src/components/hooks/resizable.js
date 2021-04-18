import { useEffect, useState } from 'react';

export function useResizable(elRef, propName) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = elRef.current;
    const h = () => setValue(el?.[propName] || 0);
    if (window.ResizeObserver) {
      if (el) {
        const observer = new ResizeObserver(h);
        observer.observe(el);
        return () => observer.disconnect();
      }
    } else {
      window.addEventListener('resize', h);
      const t = setInterval(h, 1000);
      return () => {
        window.removeEventListener('resize', h);
        clearInterval(t);
      };
    }
  }, [propName, elRef]);

  return value;
}

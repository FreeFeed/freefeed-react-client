import { useEffect, useState, useRef } from 'react';

const handlers = new WeakMap();
const observerSupported = typeof window !== 'undefined' && !!window.IntersectionObserver;

let _observer = null;
function getObserver() {
  if (!_observer) {
    _observer = new IntersectionObserver((entries) => {
      let h;
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting && (h = handlers.get(target))) {
          h(true);
          handlers.delete(target);
        }
      }
    });
  }
  return _observer;
}

export function useInViewport() {
  const ref = useRef(null);
  const [inViewport, setInViewport] = useState(!observerSupported);
  useEffect(() => {
    if (!observerSupported) {
      return;
    }
    const el = ref.current;
    handlers.set(el, setInViewport);
    getObserver().observe(el);
    () => getObserver().unobserve(el);
  }, []);

  return [ref, inViewport];
}

import React, { useRef, useState, useEffect, memo, useCallback } from 'react';

const events = ['resize', 'scroll', 'touchstart', 'touchmove', 'touchend', 'pageshow', 'load'];

// The lightweight Sticky component that doesn't require a wrapper around the sticky area
export const Sticky = memo(function Sticky({
  // The Sticky element can be scrolled over the next stickUntil DOM siblings.
  // It will stick to the bottom of stickUntil-th element.
  stickUntil = 0,
  // Class that this element always has
  className = '',
  // Class to add when the element is in sticky mode
  stickyClassName = '',
  children,
}) {
  const ref = useRef(null);
  const rafHandle = useRef(0);
  const [top, setTop] = useState(0);

  const update = useCallback(() => {
    rafHandle.current = 0;
    const el = ref.current;
    const { top, bottom } = el.getBoundingClientRect();
    let newTop = top < 0 ? -top : 0;
    if (newTop > 0 && stickUntil > 0) {
      let sbl = el;
      for (let i = 0; i < stickUntil && sbl; i++) {
        sbl = sbl.nextElementSibling;
      }
      if (sbl) {
        const { bottom: sblBottom } = sbl.getBoundingClientRect();
        newTop = Math.min(newTop, sblBottom - bottom);
      }
    }
    setTop(newTop);
  }, [stickUntil]);

  useEffect(() => {
    const handler = () => {
      if (rafHandle.current === 0) {
        rafHandle.current = requestAnimationFrame(update);
      }
    };
    handler();
    events.forEach((e) => window.addEventListener(e, handler));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      cancelAnimationFrame(rafHandle.current);
    };
  }, [stickUntil, update]);

  return (
    <div ref={ref}>
      <div
        className={className + (top > 0 ? ` ${stickyClassName}` : '')}
        style={{ top, position: 'relative' }}
      >
        {children}
      </div>
    </div>
  );
});

import { useCallback, useRef } from 'react';

const longTapTimeout = 300;

export function useLongTapHandlers(onLongTap, { timeout = longTapTimeout } = {}) {
  const inTouch = useRef(false);
  const longTapHappened = useRef(false);
  const timer = useRef(0);

  const onTouchStart = useCallback(
    (e) => {
      if (!isValidEvent(e)) {
        return;
      }
      inTouch.current = true;
      longTapHappened.current = false;
      // Prevent text selection during the long tap
      document.body.classList.add('body--no-select');
      timer.current = window.setTimeout(() => {
        longTapHappened.current = true;
        onLongTap();
      }, timeout);
    },
    [onLongTap, timeout],
  );

  const onTouchEnd = useCallback((e) => {
    if (e.type === 'touchend' && !isValidEvent(e)) {
      return;
    }
    if (inTouch.current) {
      longTapHappened.current && e.cancelable && e.preventDefault();

      window.clearTimeout(timer.current);
      document.body.classList.remove('body--no-select');
      inTouch.current = false;
      longTapHappened.current = false;
    }
  }, []);

  return {
    // event handlers for the panel initiator
    onTouchStart,
    onTouchEnd,
    onTouchMove: onTouchEnd,
    onClick: onTouchEnd,
    onTouchCancel: onTouchEnd,
  };
}

// To prevent events delivered by React from portals
function isValidEvent(event) {
  return event.currentTarget.contains(event.target);
}

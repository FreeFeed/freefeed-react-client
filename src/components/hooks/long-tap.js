import { useCallback, useEffect, useRef } from 'react';
import { withEventListener } from './sub-unsub';

const longTapTimeout = 300;

export function useLongTapHandlers(onLongTap, { timeout = longTapTimeout } = {}) {
  const inTouch = useRef(false);
  const timer = useRef(0);

  const onTouchStart = useCallback(
    (e) => {
      if (!isValidEvent(e)) {
        return;
      }
      inTouch.current = true;
      timer.current = window.setTimeout(() => {
        onLongTap();
        inTouch.current = false;
      }, timeout);
    },
    [onLongTap, timeout],
  );

  const onTouchEnd = useCallback((e) => {
    if (!isValidEvent(e)) {
      return;
    }
    if (inTouch.current) {
      window.clearTimeout(timer.current);
      inTouch.current = false;
    } else {
      // After the long tap
      e.cancelable && e.preventDefault();
      // For iOS browsers that don't support the 'selectstart' event
      window.getSelection().removeAllRanges();
    }
  }, []);

  // Prevent text selection during the touch
  useEffect(
    () =>
      withEventListener(
        document.body,
        'selectstart',
        (e) => inTouch.current && e.cancelable && e.preventDefault(),
      ) || undefined,
    [],
  );

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

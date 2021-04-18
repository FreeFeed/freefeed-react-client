// Helper functions that converts some common sub/unsub patterns
// to useEffect model (i. e. make them return a unsubscripion function)

import { useEffect } from 'react';

export function withEventListener(element, event, handler, options = false) {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
}

export function withListener(emitter, event, handler) {
  emitter.addListener(event, handler);
  return () => emitter.removeListener(event, handler);
}

export function withTimeout(handler, timeout) {
  const timer = window.setTimeout(handler, timeout);
  return () => window.clearTimeout(timer);
}

export function withInterval(handler, timeout) {
  const timer = window.setInterval(handler, timeout);
  return () => window.clearInterval(timer);
}

export function useEventListener(ref, eventName, handler, options = false) {
  useEffect(() => {
    const el = ref.current;
    return el ? withEventListener(el, eventName, handler, options) : undefined;
  }, [ref, eventName, handler, options]);
}

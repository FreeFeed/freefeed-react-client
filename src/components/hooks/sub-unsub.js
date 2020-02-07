// Helper functions that converts some common sub/unsub patterns
// to useEffect model (i. e. make them return a unsubscripion function)

export function withEventListener(element, event, handler) {
  element.addEventListener(event, handler);
  return () => element.removeEventListener(event, handler);
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

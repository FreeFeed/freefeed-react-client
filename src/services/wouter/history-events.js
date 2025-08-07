const events = ['popstate', 'pushState', 'replaceState'];

/**
 * @returns {[
 *  () => {pathname: string, search: string, hash: string},
 *  (listener: () => void) => (() => void)
 * ]}
 */
export function historyEventSource() {
  if (!globalThis.history) {
    return [() => ({ pathname: '/', search: '', hash: '' }), () => () => {}];
  }

  return [
    () => globalThis.location,
    (listener) => {
      for (const event of events) {
        addEventListener(event, listener);
      }
      // Unsubscribe
      return () => {
        for (const event of events) {
          removeEventListener(event, listener);
        }
      };
    },
  ];
}

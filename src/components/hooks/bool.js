import { useState, useCallback } from 'react';

/**
 * Extend useState(boolean) with some useful functions:
 *    'setOrToggle' works like useState's setX but toggles value being invoked without arguments
 *                  or with argument having type of not boolean and not function
 *    'on'  sets value to true
 *    'off' sets value to false
 */
export function useBool(initial = false) {
  const [val, setVal] = useState(initial);
  const setOrToggle = useCallback(
    (v) =>
      setVal((prev) => (typeof v === 'function' ? v(prev) : typeof v === 'boolean' ? v : !prev)),
    [],
  );
  const on = useCallback(() => setVal(true), []);
  const off = useCallback(() => setVal(false), []);

  return [val, setOrToggle, on, off];
}

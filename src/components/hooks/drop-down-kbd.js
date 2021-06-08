import { KEY_DOWN, KEY_ESCAPE, KEY_TAB, KEY_UP } from 'keycode-js';
import { useCallback, useEffect, useRef } from 'react';
import { isFocusable, tabbable } from 'tabbable';

import { useDropDown } from './drop-down';

// useDropDown hook with keyboard navigation support
export function useDropDownKbd({
  autoFocus = true,
  upDownNavigation = true,
  closeOnEscKey = true,
  allowPivotClick = true,
  ...ddOptions
} = {}) {
  const { opened, setOpened, menuRef, pivotRef, ...ddRest } = useDropDown(ddOptions);

  const prevFocused = useRef(null);

  const close = useCallback(
    ({ returnFocus = true } = {}) => {
      setOpened(false);
      returnFocus && prevFocused.current?.focus();
      prevFocused.current = null;
    },
    [setOpened],
  );

  useEffect(() => {
    if (!opened) {
      return;
    }
    const menuEl = menuRef.current;

    prevFocused.current = document.activeElement;

    // Focus first tabbable element
    autoFocus && tabbable(menuEl)[0]?.focus();

    const disposers = [];
    const keyHandler = (e) => {
      if (e.keyCode === KEY_ESCAPE && closeOnEscKey) {
        close();
        e.preventDefault();
      }
      if ((upDownNavigation && e.keyCode === KEY_DOWN) || (e.keyCode === KEY_TAB && !e.shiftKey)) {
        const candidates = tabbable(menuEl);
        const p = candidates.indexOf(e.target);
        if (p >= 0 && p < candidates.length - 1) {
          candidates[p + 1].focus();
        } else {
          candidates[0].focus();
        }
        e.preventDefault();
      }
      if ((upDownNavigation && e.keyCode === KEY_UP) || (e.keyCode === KEY_TAB && e.shiftKey)) {
        const candidates = tabbable(menuEl);
        const p = candidates.indexOf(e.target);
        if (p > 0) {
          candidates[p - 1].focus();
        } else {
          candidates[candidates.length - 1].focus();
        }
        e.preventDefault();
      }
    };

    const focusHandler = (e) => {
      if (
        !menuEl.contains(e.target) &&
        !(allowPivotClick && pivotRef.current?.contains(e.target))
      ) {
        // We loose the focus
        close({ returnFocus: false });
      }
    };

    menuEl.addEventListener('keydown', keyHandler);
    disposers.push(() => menuEl.removeEventListener('keydown', keyHandler));

    window.addEventListener('focusin', focusHandler);
    disposers.push(() => window.removeEventListener('focusin', focusHandler));

    const hoverFocusHandler = (e) => {
      let p = e.target;
      while (p && p !== menuEl) {
        if (isFocusable(p)) {
          p.focus();
          break;
        }
        p = p.parentNode;
      }
    };
    menuEl.addEventListener('mouseover', hoverFocusHandler);
    disposers.push(() => menuEl.removeEventListener('mouseover', hoverFocusHandler));

    return () => disposers.forEach((d) => d());
  }, [
    autoFocus,
    upDownNavigation,
    allowPivotClick,
    closeOnEscKey,
    opened,
    menuRef,
    pivotRef,
    close,
  ]);

  return { opened, setOpened, menuRef, pivotRef, ...ddRest, close };
}

import { KEY_RETURN } from 'keycode-js';
import { forwardRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Textarea from 'react-textarea-autosize';

import { submittingByEnter } from '../services/appearance';
import { useForwardedRef } from './hooks/forward-ref';

/**
 * SubmittableTextarea
 *
 * Allows to submit text by Enter of Ctrl/Cmd+Enter
 */
export const SubmittableTextarea = forwardRef(function SubmittableTextarea(
  { onSubmit, component: Component = Textarea, ...props },
  fwdRef,
) {
  const ref = useForwardedRef(fwdRef, null);
  const submitMode = useSelector((state) => state.submitMode);

  useEffect(() => {
    const el = ref.current;
    const h = (event) => {
      if (event.keyCode !== KEY_RETURN) {
        return;
      }

      if (submittingByEnter(submitMode)) {
        /**
         * The Enter press acts as submit unless the Shift or Alt key is
         * pressed.
         */

        if (event.shiftKey) {
          return;
        }

        if (event.altKey) {
          // Insert new line
          const { target } = event;
          const { value, selectionStart, selectionEnd } = target;
          target.value = `${value.slice(0, selectionStart)}\n${value.slice(selectionEnd)}`;
          target.selectionStart = selectionStart + 1;
          target.selectionEnd = selectionStart + 1;
          event.preventDefault();
          return;
        }
      } else if (!(event.ctrlKey || event.metaKey)) {
        /**
         * The Ctrl/Cmd+Enter press acts as submit
         */
        return;
      }

      event.preventDefault();
      onSubmit();
    };

    el.addEventListener('keydown', h);
    return () => el.removeEventListener('keydown', h);
  }, [submitMode, ref, onSubmit]);

  return <Component ref={ref} {...props} />;
});

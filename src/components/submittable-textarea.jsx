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
         * The Enter press acts as submit unless the Shift key is pressed or the
         * text cursor is right after the space(s). The space(s)+Enter pattern
         * allows mobile users (that cannot use Shift) to insert soft returns to
         * text.
         */

        if (event.shiftKey) {
          return;
        }

        const { target } = event;

        if (event.altKey) {
          // Insert new line
          const { value, selectionStart, selectionEnd } = target;
          target.value = `${value.slice(0, selectionStart)}\n${value.slice(selectionEnd)}`;
          target.selectionStart = selectionStart + 1;
          target.selectionEnd = selectionStart + 1;
          event.preventDefault();
          return;
        }

        if (
          // One space at the end of the text
          (target.selectionStart === target.value.length && target.value.endsWith('\x20')) ||
          // Or two spaces in any other position
          target.value.slice(0, target.selectionStart).endsWith('\x20\x20')
        ) {
          // Trim the extra spaces before new line
          while (target.selectionStart > 0 && / /.test(target.value[target.selectionStart - 1])) {
            target.selectionStart--;
          }
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

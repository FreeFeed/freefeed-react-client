import cn from 'classnames';
import { CODE_ENTER } from 'keycode-js';
import { forwardRef, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';

import { captureException } from '@sentry/react';
import { submittingByEnter } from '../services/appearance';
import { makeJpegIfNeeded } from '../utils/jpeg-if-needed';
import { insertText } from '../utils/insert-text';
import { useForwardedRef } from './hooks/forward-ref';
import { useEventListener } from './hooks/sub-unsub';

/**
 * SmartTextarea
 *
 * Allows to:
 * - submit text by Enter of Ctrl/Cmd+Enter
 * - handle files paste and drag-n-drop
 * - insert text to the cursor position using .insertText() instance method
 * - use onText attribute to handle updated text (it is necessary for insertText
 *   updates, which doesn't trigger onChange)
 */
export const SmartTextarea = forwardRef(function SmartTextarea(
  {
    // Triggers on submit by Enter of Ctrl/Cmd+Enter (no args)
    onSubmit,
    // Triggers on new file dropped or pasted (one arg, the passed File), can be
    // triggered multiple times synchronously
    onFile,
    // Triggers on text change (one arg, new text)
    onText,
    // Regular onChange handler
    onChange,
    component: Component = TextareaAutosize,
    className,
    dragOverClassName,
    ...props
  },
  fwdRef,
) {
  const ref = useForwardedRef(fwdRef, {});
  useSubmit(onSubmit, ref);
  const draggingOver = useFile(onFile, ref);

  ref.current.insertText = useCallback(
    (insertion) => {
      const input = ref.current;
      const [text, selStart, selEnd] = insertText(
        insertion,
        input.value,
        input.selectionStart,
        input.selectionEnd,
      );
      // Pre-fill the input value to keep the cursor/selection
      // position after React update cycle
      input.value = text;
      input.setSelectionRange(selStart, selEnd);
      input.focus();
      onText?.(input.value);
    },
    [onText, ref],
  );

  const handleChange = useCallback(
    (e) => {
      onChange?.(e);
      onText?.(e.target.value);
    },
    [onChange, onText],
  );

  return (
    <Component
      ref={ref}
      className={cn(className, draggingOver && dragOverClassName)}
      onChange={handleChange}
      {...props}
    />
  );
});

function useSubmit(onSubmit, ref) {
  const submitMode = useSelector((state) => state.submitMode);

  const onKeyDown = useCallback(
    (event) => {
      if (!onSubmit || event.key !== CODE_ENTER) {
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
    },
    [onSubmit, submitMode],
  );

  useEventListener(ref, 'keydown', onKeyDown);
}

function useFile(onFile, ref) {
  const enabled = !!onFile;
  const [draggingOver, setDraggingOver] = useState(false);
  const onDragEnter = useCallback(
    (e) => enabled && containsFiles(e) && setDraggingOver(true),
    [enabled],
  );
  const onDragLeave = useCallback(() => enabled && setDraggingOver(false), [enabled]);
  const onDragOver = useCallback(
    (e) => enabled && containsFiles(e) && e.preventDefault(),
    [enabled],
  );
  const onDrop = useCallback(
    (e) => {
      if (!enabled) {
        return;
      }
      setDraggingOver(false);
      if (containsFiles(e)) {
        e.preventDefault();
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          onFile(e.dataTransfer.files[i]);
        }
      }
    },
    [enabled, onFile],
  );

  const onPaste = useCallback(
    (e) => {
      if (!enabled || !e.clipboardData?.items) {
        return;
      }

      const items = [...e.clipboardData.items];

      // If there is some plain text in clipboard, use it and don't try to find image
      if (items.some((it) => it.type.startsWith('text/plain'))) {
        return;
      }

      const imagePromises = [];
      for (const it of items) {
        if (!it.type.startsWith('image/')) {
          continue;
        }
        const blob = it.getAsFile();
        // Is it a screenshot paste?
        if (!blob.name || (blob.name === 'image.png' && blob.lastModified === Date.now())) {
          if (!blob.name) {
            blob.name = 'image.png';
          }
          imagePromises.push(
            makeJpegIfNeeded(blob).catch((error) => {
              captureException(error, {
                level: 'error',
                tags: { area: 'upload' },
              });
              return null;
            }),
          );
        } else {
          // Probably a regular file copy/paste
          imagePromises.push(Promise.resolve(blob));
        }
      }
      if (imagePromises.length > 0) {
        e.preventDefault();
      }

      // Call 'onFile' in order of imagePromises
      imagePromises.reduce(async (prev, it) => {
        await prev;
        const f = await it;
        f && onFile(f);
      }, Promise.resolve(null));
    },
    [enabled, onFile],
  );

  useEventListener(ref, 'dragenter', onDragEnter);
  useEventListener(ref, 'dragleave', onDragLeave);
  useEventListener(ref, 'dragover', onDragOver);
  useEventListener(ref, 'drop', onDrop);
  useEventListener(ref, 'paste', onPaste);

  return draggingOver;
}

function containsFiles(dndEvent) {
  if (dndEvent.dataTransfer && dndEvent.dataTransfer.types) {
    // Event.dataTransfer.types is DOMStringList (not Array) in Firefox,
    // so we can't just use indexOf().
    for (let i = 0; i < dndEvent.dataTransfer.types.length; i++) {
      if (dndEvent.dataTransfer.types[i] === 'Files') {
        return true;
      }
    }
  }
  return false;
}

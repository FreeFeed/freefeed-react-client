import React, { useMemo, useCallback, useState, useRef, useEffect, forwardRef } from 'react';
import Textarea from 'react-textarea-autosize';
import { KEY_RETURN } from 'keycode-js';

import { initialAsyncState } from '../redux/async-helpers';
import { insertText } from '../utils/insert-text';
import { Throbber } from './throbber';
import { useForwardedRef } from './hooks/forward-ref';
import { PreventPageLeaving } from './prevent-page-leaving';
import { ButtonLink } from './button-link';

export const CommentEditForm = forwardRef(function CommentEditForm(
  {
    initialText = '',
    // Persistent form is always on page so we don't need to show Cancel button
    isPersistent = false,
    onSubmit = () => undefined,
    onCancel = () => undefined,
    submitStatus = initialAsyncState,
  },
  fwdRef,
) {
  const input = useRef(null);
  const [text, setText] = useState(initialText);
  const onChange = useCallback((e) => setText(e.target.value), []);
  const canSubmit = useMemo(() => !submitStatus.loading && text.trim() !== '', [
    submitStatus.loading,
    text,
  ]);

  const doSubmit = useCallback(() => canSubmit && onSubmit(text), [canSubmit, onSubmit, text]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.keyCode === KEY_RETURN && !e.shiftKey) {
        e.preventDefault();
        // Need this line to update text that doSubmit can access
        setText(text);
        doSubmit();
      }
    },
    [doSubmit, text],
  );

  // On first focus move cursor to the end of text
  const wasFocused = useRef(false);
  const onFocus = useCallback(() => {
    if (!wasFocused.current) {
      wasFocused.current = true;
      input.current.setSelectionRange(input.current.value.length, input.current.value.length);
    }
  }, []);

  // Auto-focus dynamically added form
  useEffect(() => void (isPersistent || input.current.focus()), [isPersistent]);

  // Clean text after the persistent form submit
  useEffect(() => {
    if (submitStatus.initial && isPersistent) {
      setText('');
      input.current.blur();
    }
  }, [isPersistent, submitStatus.initial]);

  // Expose the insertText method for the parent components
  useForwardedRef(fwdRef, {
    insertText(insertion) {
      const [text, selStart, selEnd] = insertText(
        insertion,
        input.current.value,
        input.current.selectionStart,
        input.current.selectionEnd,
      );
      // Pre-fill the input value to keep the cursor/selection
      // position after React update cycle
      input.current.value = text;
      input.current.setSelectionRange(selStart, selEnd);
      input.current.focus();
      setText(input.current.value);
    },
  });

  return (
    <div className="comment-body">
      <PreventPageLeaving prevent={canSubmit || submitStatus.loading} />
      <div>
        <Textarea
          inputRef={input}
          className="comment-textarea"
          value={text}
          onFocus={onFocus}
          onChange={onChange}
          onKeyDown={onKeyDown}
          minRows={2}
          maxRows={10}
          maxLength={1500}
          disabled={submitStatus.loading}
        />
      </div>
      <div>
        <button
          className="btn btn-default btn-xs comment-post"
          disabled={!canSubmit || submitStatus.loading}
          onClick={doSubmit}
        >
          Comment
        </button>
        {!isPersistent && (
          <ButtonLink className="comment-cancel" onClick={onCancel} disabled={submitStatus.loading}>
            Cancel
          </ButtonLink>
        )}
        {submitStatus.loading && <Throbber className="comment-throbber" />}
        {submitStatus.error && <span className="comment-error">{submitStatus.errorText}</span>}
      </div>
    </div>
  );
});
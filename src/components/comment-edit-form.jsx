/* global CONFIG */
import { useMemo, useCallback, useState, useRef, useEffect, forwardRef } from 'react';
import cn from 'classnames';

import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { initialAsyncState } from '../redux/async-helpers';
import { insertText } from '../utils/insert-text';
import { Throbber } from './throbber';
import { useForwardedRef } from './hooks/forward-ref';
import { PreventPageLeaving } from './prevent-page-leaving';
import { ButtonLink } from './button-link';
import { useUploader, useFileChooser } from './hooks/uploads';
import { Icon } from './fontawesome-icons';
import { SubmitModeHint } from './submit-mode-hint';
import { SubmittableTextarea } from './mention-textarea';

export const CommentEditForm = forwardRef(function CommentEditForm(
  {
    initialText = '',
    // Persistent form is always on page so we don't need to show Cancel button
    isPersistent = false,
    onSubmit = () => {},
    onCancel = () => {},
    submitStatus = initialAsyncState,
  },
  fwdRef,
) {
  const input = useRef(null);
  const [text, setText] = useState(initialText);
  const onChange = useCallback((e) => setText(e), []);
  const canSubmit = useMemo(
    () => !submitStatus.loading && text.trim() !== '',
    [submitStatus.loading, text],
  );

  const doSubmit = useCallback(() => canSubmit && onSubmit(text), [canSubmit, onSubmit, text]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSubmit = useCallback(
    // Need to setText to update text that doSubmit can access
    () => (setText(text), doSubmit()),
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

  const insText = (insertion) => {
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
  };

  // Expose the insertText method for the parent components
  useForwardedRef(fwdRef, { insertText: insText });

  // Uploading files
  const {
    draggingOver,
    loading: filesLoading,
    uploadProgressUI,
    uploadFile,
  } = useUploader({
    dropTargetRef: input,
    pasteTargetRef: input,
    onSuccess: useCallback((att) => insText(att.url), []),
  });
  const chooseFiles = useFileChooser({ onChoose: uploadFile, multiple: true });

  const disabled = !canSubmit || submitStatus.loading || filesLoading;

  return (
    <div className="comment-body" role="form">
      <PreventPageLeaving prevent={canSubmit || submitStatus.loading} />
      <div>
        <SubmittableTextarea
          ref={input}
          className={cn('comment-textarea', draggingOver && 'comment-textarea__dragged')}
          value={text}
          onFocus={onFocus}
          onChange={onChange}
          onSubmit={handleSubmit}
          minRows={2}
          maxRows={10}
          maxLength={CONFIG.maxLength.comment}
          readOnly={submitStatus.loading}
          dir={'auto'}
        />
      </div>
      <div>
        <button
          className={cn('btn btn-default btn-xs comment-post', {
            disabled,
          })}
          aria-disabled={disabled}
          aria-label={
            !canSubmit
              ? 'Submit disabled (textarea is empty)'
              : submitStatus.loading
              ? 'Submitting comment'
              : null
          }
          onClick={doSubmit}
        >
          Comment
        </button>

        {!isPersistent && (
          <ButtonLink
            className="comment-cancel"
            onClick={onCancel}
            aria-disabled={submitStatus.loading}
            aria-label={submitStatus.loading ? 'Cancel disabled (submitting)' : null}
          >
            Cancel
          </ButtonLink>
        )}

        <SubmitModeHint input={input} />

        <ButtonLink
          className="comment-file-button iconic-button"
          title="Add photo or file"
          onClick={chooseFiles}
        >
          <Icon icon={faPaperclip} />
        </ButtonLink>

        {submitStatus.loading && <Throbber className="comment-throbber" />}
        {submitStatus.error && <span className="comment-error">{submitStatus.errorText}</span>}
      </div>
      {uploadProgressUI}
    </div>
  );
});

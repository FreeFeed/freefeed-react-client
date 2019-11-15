import React, { useState, useCallback, useRef } from 'react';
import cn from 'classnames';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import { Icon } from '../fontawesome-icons';
import styles from './text-copier.module.scss';

export function TextCopier({ text }) {
  const input = useRef();
  const [copied, setCopied] = useState(false);
  const doCopy = useCallback(({ target }) => {
    target.blur();
    input.current.focus();
    input.current.selectionStart = 0;
    input.current.selectionEnd = input.current.value.length;
    document.execCommand('copy');
    input.current.selectionEnd = input.current.selectionStart;
    input.current.blur();

    setCopied(true);
    setTimeout(() => setCopied(false), 0);
  }, []);
  const doSelect = useCallback(({ target }) => {
    target.selectionStart = 0;
    target.selectionEnd = input.current.value.length;
  }, []);

  return (
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        readOnly
        ref={input}
        value={text}
        onClick={doSelect}
      />
      <span className="input-group-btn">
        <button
          className={cn('btn btn-default', styles.button)}
          type="button"
          title="Copy to clipboard"
          onClick={doCopy}
        >
          <Icon icon={faCopy} className={cn(styles.copyIcon, copied && styles.copied)} />
          <Icon icon={faCheck} className={cn(styles.checkIcon, copied && styles.copied)} />
        </button>
      </span>
    </div>
  );
}

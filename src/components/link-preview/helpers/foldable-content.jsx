/* global globalThis */
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import classnames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../../fontawesome-icons';

const resizeHandlers = new Map();

let _observer = null;
function getResizeObserver() {
  if (!_observer) {
    if (globalThis.ResizeObserver) {
      _observer = new globalThis.ResizeObserver((entries) => {
        for (const entry of entries) {
          resizeHandlers.get(entry.target)?.(entry.contentRect.height);
        }
      });
    } else {
      _observer = {
        observe() {},
        unobserve() {},
      };
    }
  }
  return _observer;
}

export default function FoldableContent({ maxUnfoldedHeight = 550, foldedHeight = 400, children }) {
  const contentRef = useRef(null);

  const [contentHeight, setContentHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded((x) => !x), []);

  useEffect(() => {
    const content = contentRef.current;
    resizeHandlers.set(content, setContentHeight);
    const observer = getResizeObserver();
    observer.observe(content);
    return () => {
      resizeHandlers.delete(content);
      observer.unobserve(content);
    };
  }, []);

  const foldNeeded = contentHeight > maxUnfoldedHeight;
  const wrapperHeight = foldNeeded && !expanded ? foldedHeight : contentHeight;

  return (
    <div className="folder-container">
      <div
        className={classnames('content-wrapper', foldNeeded && !expanded && 'folded')}
        style={{ height: `${wrapperHeight + 1}px` }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
      {foldNeeded && (
        <div className="preview-expand">
          <Icon
            icon={expanded ? faMinusSquare : faPlusSquare}
            className="preview-expand-icon"
            onClick={toggleExpanded}
          />{' '}
          <a onClick={toggleExpanded}>{expanded ? 'Fold' : 'Expand'} preview</a>
        </div>
      )}
    </div>
  );
}

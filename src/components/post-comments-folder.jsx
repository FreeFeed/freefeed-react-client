import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { Icon } from './fontawesome-icons';

const observersSupported =
  typeof IntersectionObserver !== 'undefined' && typeof MutationObserver !== 'undefined';

export function PostCommentsFolder({ doFold }) {
  const thisEl = useRef(null);
  const [stuck, setStuck] = useState(false);
  const [marginBottom, setMarginBottom] = useState(0);

  useEffect(() => {
    if (!observersSupported || !thisEl.current) {
      return;
    }
    const commentsContainer = thisEl.current.parentElement;

    // If the first comment is above the screen edge, we are stuck
    const iObserver = new IntersectionObserver(([r]) => setStuck(r.boundingClientRect.bottom < 0));
    iObserver.observe(commentsContainer.firstElementChild);

    // Measure the distance from the bottom of third commentsContainer's child
    // from the end and the bottom of commentsContainer itself
    const mObserver = new MutationObserver(() => {
      const thirdChild =
        commentsContainer.lastElementChild.previousElementSibling.previousElementSibling;
      const { bottom: cBottom } = commentsContainer.getBoundingClientRect();
      const { bottom: tBottom } = thirdChild.getBoundingClientRect();
      setMarginBottom(cBottom - tBottom);
    });
    mObserver.observe(commentsContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => [iObserver, mObserver].forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <div
        className={cn('comments-folder', stuck && 'comments-folder__stuck')}
        style={{ marginBottom: `${marginBottom}px` }}
        ref={thisEl}
      >
        <Icon icon={faChevronUp} className="chevron" />
        <a onClick={doFold}>Fold comments</a>
      </div>
      {/* Compensate the margin-bottom of comments-folder */}
      <div className="comments-folder--after" style={{ marginTop: `${-marginBottom}px` }} />
    </>
  );
}

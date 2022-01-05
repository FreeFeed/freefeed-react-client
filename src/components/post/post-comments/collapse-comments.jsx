import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { Icon } from '../../fontawesome-icons';
import { ButtonLink } from '../../button-link';

const observersSupported =
  typeof IntersectionObserver !== 'undefined' && typeof MutationObserver !== 'undefined';

export function CollapseComments({ onCollapse, commentsAfterFold }) {
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
      let btmChild = commentsContainer.lastElementChild;
      for (let i = 0; i < commentsAfterFold + 1; i++) {
        btmChild = btmChild.previousElementSibling;
      }
      const { bottom: cBottom } = commentsContainer.getBoundingClientRect();
      const { bottom: tBottom } = btmChild.getBoundingClientRect();
      setMarginBottom(cBottom - tBottom);
    });
    mObserver.observe(commentsContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => [iObserver, mObserver].forEach((o) => o.disconnect());
  }, [commentsAfterFold]);

  return (
    <>
      <div
        className={cn('comments-folder', stuck && 'comments-folder__stuck')}
        style={{ marginBottom: `${marginBottom}px` }}
        ref={thisEl}
      >
        <Icon icon={faChevronUp} className="chevron" />
        <ButtonLink onClick={onCollapse}>Fold comments</ButtonLink>
      </div>
      {/* Compensate the margin-bottom of comments-folder */}
      <div className="comments-folder--after" style={{ marginTop: `${-marginBottom}px` }} />
    </>
  );
}

import cn from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useResizable } from './hooks/resizable';
import { useEventListener } from './hooks/sub-unsub';
import styles from './hor-scrollable.module.scss';

/**
 * Horizontally scrollable area that shades content near the left/right edges to
 * indicate the possible scrolling.
 */
export function HorScrollable({ children, className }) {
  const container = useRef();
  const content = useRef();

  const outerWidth = useResizable(container, 'clientWidth');
  const innerWidth = useResizable(content, 'scrollWidth');

  const [scrollOffset, setScrollOffset] = useState(0);
  useEventListener(
    content,
    'scroll',
    useCallback((e) => setScrollOffset(e.target.scrollLeft), []),
  );

  const [shadeStart, shadeEnd] = useMemo(() => {
    const shadeStart = innerWidth > outerWidth && scrollOffset > 0;
    const shadeEnd = innerWidth > outerWidth && innerWidth - scrollOffset > outerWidth;
    return [shadeStart, shadeEnd];
  }, [innerWidth, outerWidth, scrollOffset]);

  useEffect(() => {
    const activeEl = content.current.querySelector('[data-hscroll-into-view]');
    if (activeEl) {
      content.current.scrollLeft = activeEl.offsetLeft;
    }
  }, []);

  return (
    <div
      className={cn(
        className,
        styles.container,
        shadeStart && styles.shadeStart,
        shadeEnd && styles.shadeEnd,
      )}
      ref={container}
    >
      <div className={styles.content} ref={content}>
        {children}
      </div>
    </div>
  );
}

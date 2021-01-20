import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';

import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './pull-to-refresh.module.scss';
import { Icon } from './fontawesome-icons';

const pullThreshold = 50; // pix

export function PullToRefresh() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.routeLoadingState);
  const pageRefreshAction = useSelector((state) => state.pageRefreshAction);
  const enabled = useMemo(() => !isLoading && pageRefreshAction, [isLoading, pageRefreshAction]);

  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const startY = useRef(0);

  const touchStart = useCallback((e) => (startY.current = e.touches[0].pageY), []);

  const touchMove = useCallback(
    (e) =>
      enabled &&
      setIndicatorVisible(
        e.changedTouches[0].pageY - startY.current > pullThreshold &&
          document.scrollingElement.scrollTop <= 0, // The negative values are for Safari
      ),
    [enabled],
  );

  const touchEnd = useCallback(() => {
    if (indicatorVisible) {
      setIndicatorVisible(false);
      dispatch(pageRefreshAction);
    }
  }, [indicatorVisible, pageRefreshAction, dispatch]);

  useEffect(() => {
    document.addEventListener('touchstart', touchStart, { passive: true });
    document.addEventListener('touchmove', touchMove, { passive: true });
    document.addEventListener('touchend', touchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', touchStart, { passive: true });
      document.removeEventListener('touchmove', touchMove, { passive: true });
      document.removeEventListener('touchend', touchEnd, { passive: true });
    };
  }, [touchStart, touchMove, touchEnd]);

  return (
    <div className={cn(styles.indicator, indicatorVisible && styles.visible)}>
      <Icon icon={faSyncAlt} />
    </div>
  );
}

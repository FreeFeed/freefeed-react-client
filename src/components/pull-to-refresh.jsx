import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';

import { faSync } from '@fortawesome/free-solid-svg-icons';
import { getServerInfo, whoAmI } from '../redux/action-creators';
import styles from './pull-to-refresh.module.scss';
import { Icon } from './fontawesome-icons';

const pullThreshold = 50; // pix

const HIDDEN = 0;
const VISIBLE = 1;
const RUNNING = 2;

export function PullToRefresh() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.routeLoadingState);
  const pageRefreshAction = useSelector((state) => state.pageRefreshAction);

  const [status, setStatus] = useState(HIDDEN);
  const startY = useRef(0);

  const touchStart = useCallback((e) => {
    startY.current = e.touches[0].pageY;
    setStatus(HIDDEN);
  }, []);

  const touchMove = useCallback(
    (e) =>
      !isLoading &&
      setStatus(
        e.changedTouches[0].pageY - startY.current > pullThreshold &&
          document.scrollingElement.scrollTop <= 0 // The negative values are for Safari
          ? VISIBLE
          : HIDDEN,
      ),
    [isLoading],
  );

  const touchEnd = useCallback(() => {
    if (status) {
      setStatus(RUNNING);
      dispatch(whoAmI());
      dispatch(getServerInfo());
      pageRefreshAction && dispatch(pageRefreshAction);
    } else {
      setStatus(HIDDEN);
    }
  }, [status, pageRefreshAction, dispatch]);

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
    <div
      className={cn({
        [styles.indicator]: true,
        [styles.visible]: status === VISIBLE,
        [styles.running]: status === RUNNING,
      })}
    >
      <Icon icon={faSync} />
    </div>
  );
}

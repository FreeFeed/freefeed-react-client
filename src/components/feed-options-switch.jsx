import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { browserHistory } from 'react-router';
import cn from 'classnames';
import {
  faCheckSquare,
  faSquare,
  faDotCircle,
  faCircle,
} from '@fortawesome/free-regular-svg-icons';
import { Portal } from 'react-portal';
import * as FeedOptions from '../utils/feed-options';
import {
  toggleRealtime,
  updateUserPreferences,
  home,
  toggleFeedSort,
} from '../redux/action-creators';
import { Icon } from './fontawesome-icons';
import { faEllipsis } from './fontawesome-custom-icons';
import menuStyles from './dropdown-menu.module.scss';
import styles from './feed-options-switch.module.scss';
import { useDropDown, BOTTOM_LEFT } from './hooks/drop-down';

export default function FeedOptionsSwitch() {
  const { pivotRef, menuRef, opened, toggle } = useDropDown({ position: BOTTOM_LEFT });

  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.id);
  const frontendPreferences = useSelector((state) => state.user.frontendPreferences);
  const feedViewOptions = useSelector((state) => state.feedViewOptions);
  const route = useSelector((state) => state.routing.locationBeforeTransitions.pathname);
  const onFirstPage = useSelector((state) => !state.routing.locationBeforeTransitions.query.offset);

  const switchSort = useCallback(
    (sort) => {
      if (feedViewOptions.sort !== sort) {
        dispatch(toggleFeedSort());
        browserHistory.push(route || '/');
      }
    },
    [dispatch, feedViewOptions.sort, route],
  );

  const toggleRealtimeFlag = useCallback(() => {
    const { realtimeActive } = frontendPreferences;
    //send a request to change flag
    dispatch(
      updateUserPreferences(
        userId,
        { ...frontendPreferences, realtimeActive: !realtimeActive },
        {},
        true,
      ),
    );
    //set a flag to show
    dispatch(toggleRealtime());
    if (!realtimeActive) {
      dispatch(home());
    }
  }, [dispatch, frontendPreferences, userId]);

  return (
    <div className={styles.switchIcon}>
      <Icon icon={faEllipsis} className="dots-icon" onClick={toggle} ref={pivotRef} />
      {opened && (
        <Portal>
          <ul className={menuStyles.list} ref={menuRef}>
            <DropOption
              value={FeedOptions.ACTIVITY}
              current={feedViewOptions.sort}
              clickHandler={switchSort}
            >
              Order by recent comments/likes
            </DropOption>
            <DropOption
              value={FeedOptions.CHRONOLOGIC}
              current={feedViewOptions.sort}
              clickHandler={switchSort}
            >
              Order by post date
            </DropOption>
            {onFirstPage && feedViewOptions.currentFeedType !== null && (
              <>
                <li className={menuStyles.item}>
                  <div className={menuStyles.spacer} />
                </li>
                <DropOption
                  value={true}
                  current={frontendPreferences.realtimeActive}
                  clickHandler={toggleRealtimeFlag}
                  checkbox
                >
                  Show new posts in real-time
                </DropOption>
              </>
            )}
          </ul>
        </Portal>
      )}
    </div>
  );
}

function DropOption({ children, value, current, clickHandler, checkbox = false }) {
  const onClick = useCallback(() => clickHandler(value), [clickHandler, value]);

  const className = cn(menuStyles.link, { [styles.active]: value === current });

  const iconOn = checkbox ? faCheckSquare : faDotCircle;
  const iconOff = checkbox ? faSquare : faCircle;

  return (
    <li className={menuStyles.item}>
      <a className={className} onClick={onClick}>
        <Icon className={styles.icon} icon={value === current ? iconOn : iconOff} />
        {children}
      </a>
    </li>
  );
}

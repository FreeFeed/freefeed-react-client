import { useCallback } from 'react';
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
import { faEdit } from '@fortawesome/free-solid-svg-icons';
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
import { ButtonLink } from './button-link';

export default function FeedOptionsSwitch({ editHomeList }) {
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
    <>
      <ButtonLink className={styles.switchIcon} aria-label="Feed ordering options" onClick={toggle}>
        <Icon icon={faEllipsis} className="dots-icon" ref={pivotRef} />
      </ButtonLink>
      {opened && (
        <Portal>
          <ul className={menuStyles.list} ref={menuRef}>
            {editHomeList && (
              <>
                <DropOption value={'x'} current={''} clickHandler={editHomeList} icon={faEdit}>
                  Edit list
                </DropOption>
                <li className={menuStyles.item}>
                  <div className={menuStyles.spacer} />
                </li>
              </>
            )}
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
    </>
  );
}

function DropOption({ children, value, current, clickHandler, checkbox = false, icon = null }) {
  const onClick = useCallback(() => clickHandler(value), [clickHandler, value]);

  const className = cn(menuStyles.link, { [styles.active]: value === current });

  const iconOn = icon ?? (checkbox ? faCheckSquare : faDotCircle);
  const iconOff = icon ?? (checkbox ? faSquare : faCircle);

  return (
    <li className={menuStyles.item}>
      <ButtonLink className={className} onClick={onClick}>
        <Icon className={styles.icon} icon={value === current ? iconOn : iconOff} />
        {children}
      </ButtonLink>
    </li>
  );
}

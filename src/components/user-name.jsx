import { useCallback, useEffect, useRef } from 'react';
import { Portal } from 'react-portal';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';

import ErrorBoundary from './error-boundary';
import { useDropDown, CLOSE_ON_CLICK_OUTSIDE } from './hooks/drop-down';
import { UserDisplayName } from './user-displayname';
import UserCard from './user-card';
import { useMediaQueryRef } from './hooks/media-query';

export default function UserName({
  user: { username, screenName, isGone },
  userHover, // { hover, leave },
  children,
  className,
  noUserCard = false,
}) {
  const myUsername = useSelector((state) => state.user.username);
  const prefs = useSelector((state) => state.user.frontendPreferences.displayNames);

  const { opened, toggle, setOpened, pivotRef, menuRef } = useDropDown({
    closeOn: CLOSE_ON_CLICK_OUTSIDE,
  });

  const isTouched = useRef(false);
  const touchTimeout = useRef(0);
  const onTouchEnd = useCallback(() => {
    isTouched.current = true;
    clearTimeout(touchTimeout.current);
    // We need a minimum of 300ms for mobile Safari
    touchTimeout.current = setTimeout(() => (isTouched.current = false), 500);
  }, []);

  // Some browsers may not support the 'hover' query
  const hoverSupported = useMediaQueryRef('(hover: hover), (hover: none)');
  const mouseDevice = useMediaQueryRef('(hover: hover)');

  const onClick = useCallback(
    (e) => {
      if (noUserCard) {
        return;
      }
      // Using double check here: media query 'hover' support and the isTouched status
      const touch = hoverSupported.current && !mouseDevice.current;
      if (touch || isTouched.current) {
        e.preventDefault();
        // Use setTimeout here because click handlers should be able to close
        // the existing popup before the new popup is opened.
        setTimeout(() => toggle(), 0);
      }
    },
    [toggle, noUserCard, mouseDevice, hoverSupported],
  );

  const { onEnter, onLeave } = useHover(
    500,
    useCallback((v) => noUserCard || setOpened(v), [noUserCard, setOpened]),
  );

  useEffect(() => {
    if (opened) {
      userHover?.hover(username);
    } else {
      userHover?.leave(username);
    }
  }, [opened, userHover, username]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    const menuEl = menuRef.current;
    menuEl.addEventListener('mouseenter', onEnter);
    menuEl.addEventListener('mouseleave', onLeave);

    return () => {
      menuEl.removeEventListener('mouseenter', onEnter);
      menuEl.removeEventListener('mouseleave', onLeave);
    };
  }, [opened, onEnter, onLeave, menuRef]);

  const linkCn = classNames(className, isGone ? 'user-is-gone' : false);

  return (
    <ErrorBoundary>
      <span
        className="user-name-wrapper"
        ref={pivotRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <Link to={`/${username}`} className={linkCn} onClick={onClick} onTouchEnd={onTouchEnd}>
          {children ? (
            <span dir="ltr">{children}</span>
          ) : (
            <UserDisplayName
              username={username}
              screenName={screenName}
              myUsername={myUsername}
              prefs={prefs}
            />
          )}
        </Link>
      </span>
      {opened && (
        <Portal>
          <UserCard username={username} forwardedRef={menuRef} pivotRef={pivotRef} />
        </Portal>
      )}
    </ErrorBoundary>
  );
}

function useHover(timeout, setHovered) {
  const enterTimeout = useRef(0);
  const leaveTimeout = useRef(0);

  const clearTimeouts = useCallback(() => {
    clearTimeout(enterTimeout.current);
    clearTimeout(leaveTimeout.current);
  }, []);

  const onEnter = useCallback(() => {
    clearTimeouts();
    enterTimeout.current = setTimeout(() => setHovered(true), 500);
  }, [clearTimeouts, setHovered]);
  const onLeave = useCallback(() => {
    clearTimeouts();
    leaveTimeout.current = setTimeout(() => setHovered(false), 500);
  }, [clearTimeouts, setHovered]);

  useEffect(() => {
    // do nothing. just return cleanup-function
    return () => {
      clearTimeout(enterTimeout.current);
      clearTimeout(leaveTimeout.current);
    };
  }, []);

  return { onEnter, onLeave };
}

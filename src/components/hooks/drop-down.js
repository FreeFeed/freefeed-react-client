import { useCallback, useState, useEffect, useRef, useLayoutEffect } from 'react';

export const BOTTOM_LEFT = 'BOTTOM_LEFT';
export const BOTTOM_RIGHT = 'BOTTOM_RIGHT';

export const CLOSE_ON_ANY_CLICK = 'CLOSE_ON_ANY_CLICK';
export const CLOSE_ON_CLICK_OUTSIDE = 'CLOSE_ON_CLICK_OUTSIDE';
export const CLOSE_ON_CLICK_DISABLED = 'CLOSE_ON_CLICK_DISABLED';

export function useDropDown({
  screenEdgeGap = 8,
  position = BOTTOM_RIGHT,
  closeOn = CLOSE_ON_ANY_CLICK,
} = {}) {
  const pivotRef = useRef(null);
  const menuRef = useRef(null);

  const [opened, setOpened] = useState(false);
  const toggle = useCallback(() => setOpened((x) => !x), []);

  // Close menu on any click on page
  useEffect(() => {
    if (opened) {
      const h = ({ target }) => {
        if (closeOn === CLOSE_ON_ANY_CLICK) {
          setTimeout(() => setOpened(false), 0);
        } else if (closeOn === CLOSE_ON_CLICK_OUTSIDE) {
          if (!menuRef.current.contains(target)) {
            setTimeout(() => setOpened(false), 0);
          }
        }
      };
      // Using captured event here to prevent conflict with pivot onClick
      // handler as recommended in
      // https://reactjs.org/blog/2020/08/10/react-v17-rc.html#fixing-potential-issues
      document.body.addEventListener('click', h, { capture: true });
      return () => document.body.removeEventListener('click', h, { capture: true });
    }
  }, [opened, closeOn]);

  const updPosition = useCallback(
    () =>
      void (
        updatePosition(pivotRef.current, menuRef.current, { screenEdgeGap, position }) &&
        requestAnimationFrame(updPosition)
      ),
    [position, screenEdgeGap],
  );

  useLayoutEffect(updPosition);

  return { pivotRef, menuRef, opened, setOpened, toggle };
}

function updatePosition(leader, follower, { screenEdgeGap, position }) {
  if (!leader || !follower) {
    return false;
  }
  const leaderBounds = leader.getBoundingClientRect();
  const followerBounds = follower.getBoundingClientRect();

  let menuX, menuY;

  if (position === BOTTOM_RIGHT) {
    menuX = window.pageXOffset + leaderBounds.left;
    menuY = window.pageYOffset + leaderBounds.bottom;

    const rightOverflow =
      menuX + followerBounds.width - (document.documentElement.clientWidth - screenEdgeGap);

    if (rightOverflow > 0) {
      menuX -= rightOverflow;
    }

    const leftOverflow = screenEdgeGap - menuX;
    if (leftOverflow > 0) {
      menuX += leftOverflow;
    }
  }

  if (position === BOTTOM_LEFT) {
    menuX = window.pageXOffset + leaderBounds.right - followerBounds.width;
    menuY = window.pageYOffset + leaderBounds.bottom;

    const leftOverflow = screenEdgeGap - menuX;
    if (leftOverflow > 0) {
      menuX += leftOverflow;
    }
  }

  follower.style.transform = `translate(${menuX}px, ${menuY}px)`;

  return true;
}

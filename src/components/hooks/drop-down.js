import { useCallback, useState, useEffect, useRef, useLayoutEffect } from 'react';

export const BOTTOM_LEFT = 'BOTTOM_LEFT';
export const BOTTOM_RIGHT = 'BOTTOM_RIGHT';

export function useDropDown({ screenEdgeGap = 8, position = BOTTOM_RIGHT } = {}) {
  const pivotRef = useRef(null);
  const menuRef = useRef(null);

  const [opened, setOpened] = useState(false);
  const toggle = useCallback((v = undefined) => setOpened((x) => (v !== undefined ? v : !x)), []);

  // Close menu on any click on page
  useEffect(() => {
    if (opened) {
      const h = () => setTimeout(() => setOpened(false), 0);
      document.body.addEventListener('click', h);
      return () => document.body.removeEventListener('click', h);
    }
  }, [opened]);

  const updPosition = useCallback(
    () =>
      void (
        updatePosition(pivotRef.current, menuRef.current, { screenEdgeGap, position }) &&
        requestAnimationFrame(updPosition)
      ),
    [position, screenEdgeGap],
  );

  useLayoutEffect(updPosition);

  return { pivotRef, menuRef, opened, toggle };
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

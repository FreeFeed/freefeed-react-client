import { memo, useCallback, useEffect } from 'react';
import { Portal } from 'react-portal';
import { intentToScroll } from '../services/unscroll';

import { ButtonLink } from './button-link';
import { useBool } from './hooks/bool';
import { CLOSE_ON_CLICK_OUTSIDE } from './hooks/drop-down';
import { useDropDownKbd } from './hooks/drop-down-kbd';
import { useMediaQuery } from './hooks/media-query';
import { PostCommentLikes } from './post-comment-likes';
import { PostCommentMoreMenu } from './post-comment-more-menu';

export const PostCommentMore = memo(function PostCommentMore({
  className,
  id,
  setMenuOpener,
  ...menuProps
}) {
  const fixedMenu = useMediaQuery('(max-width: 450px)');

  const { opened, toggle, pivotRef, menuRef, close, setOpened } = useDropDownKbd({
    closeOn: CLOSE_ON_CLICK_OUTSIDE,
    fixed: fixedMenu,
  });

  const [likesOpened, , openLikes, closeLikes] = useBool(false);

  const doAndClose = (h) => h && ((...args) => (h(...args), close()));

  const menuPropsWithClose = { doAndClose, doShowLikes: doAndClose(openLikes) };
  Object.keys(menuProps).forEach((key) => {
    if (/^do[A-Z]/.test(key)) {
      menuPropsWithClose[key] = doAndClose(menuProps[key]);
    } else {
      menuPropsWithClose[key] = menuProps[key];
    }
  });

  useEffect(() => {
    setMenuOpener(() => setOpened(true));
    return () => setMenuOpener(null);
  }, [setMenuOpener, setOpened]);

  useEffect(() => {
    if (fixedMenu && opened) {
      // Fix scroll position
      const menuTop = document.documentElement.clientHeight - menuRef.current.scrollHeight;
      const linkBottom = pivotRef.current.getBoundingClientRect().bottom;
      if (linkBottom > menuTop) {
        intentToScroll();
        window.scrollBy({
          top: linkBottom - menuTop + 4,
          behavior: 'smooth',
        });
      }
    }
  }, [fixedMenu, opened, menuRef, pivotRef]);

  const doCloseLikes = useCallback(() => (closeLikes(), setOpened(true)), [closeLikes, setOpened]);

  return (
    <>
      <ButtonLink
        className={className}
        ref={pivotRef}
        onClick={toggle}
        aria-haspopup
        aria-expanded={opened}
      >
        actions
      </ButtonLink>
      {opened && (
        <Portal>
          <PostCommentMoreMenu {...menuPropsWithClose} id={id} ref={menuRef} fixed={fixedMenu} />
        </Portal>
      )}
      {likesOpened && <PostCommentLikes id={id} close={doCloseLikes} />}
    </>
  );
});

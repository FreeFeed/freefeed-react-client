import { memo } from 'react';
import { Portal } from 'react-portal';

import { ButtonLink } from './button-link';
import { useBool } from './hooks/bool';
import { CLOSE_ON_CLICK_OUTSIDE } from './hooks/drop-down';
import { useDropDownKbd } from './hooks/drop-down-kbd';
import { useMediaQuery } from './hooks/media-query';
import { PostCommentLikes } from './post-comment-likes';
import { PostCommentMoreMenu } from './post-comment-more-menu';

export const PostCommentMore = memo(function PostCommentMore({ className, id, ...menuProps }) {
  const fixedMenu = useMediaQuery('(max-width: 450px)');

  const { opened, toggle, pivotRef, menuRef, close } = useDropDownKbd({
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

  return (
    <>
      <ButtonLink
        className={className}
        ref={pivotRef}
        onClick={toggle}
        aria-haspopup
        aria-expanded={opened}
      >
        more&hellip;
      </ButtonLink>
      {opened && (
        <Portal>
          <PostCommentMoreMenu {...menuPropsWithClose} ref={menuRef} fixed={fixedMenu} />
        </Portal>
      )}
      {likesOpened && <PostCommentLikes id={id} close={closeLikes} />}
    </>
  );
});

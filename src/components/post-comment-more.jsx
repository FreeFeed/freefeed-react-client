import { memo } from 'react';
import { Portal } from 'react-portal';

import { ButtonLink } from './button-link';
import { CLOSE_ON_CLICK_OUTSIDE, useDropDown } from './hooks/drop-down';
import { useMediaQuery } from './hooks/media-query';
import { PostCommentMoreMenu } from './post-comment-more-menu';

export const PostCommentMore = memo(function PostCommentMore({ className, ...menuProps }) {
  const fixedMenu = useMediaQuery('(max-width: 450px)');

  const { opened, toggle, pivotRef, menuRef, setOpened } = useDropDown({
    closeOn: CLOSE_ON_CLICK_OUTSIDE,
    fixed: fixedMenu,
  });

  const doAndClose = (h) => h && (() => (h && h(), setOpened(false)));

  const menuPropsWithClose = { doAndClose };
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
    </>
  );
});

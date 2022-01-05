import { useCallback, useEffect } from 'react';
import { Portal } from 'react-portal';

import { intentToScroll } from '../../services/unscroll';
import { confirmFirst } from '../../utils';
import { canonicalURI } from '../../utils/canonical-uri';
import { CLOSE_ON_CLICK_OUTSIDE } from '../hooks/drop-down';
import { useDropDownKbd } from '../hooks/drop-down-kbd';
import { useMediaQuery } from '../hooks/media-query';
import { useServerInfo } from '../hooks/server-info';
import { MoreWithTriangle } from '../more-with-triangle';
import { TimedMessage } from '../timed-message';
import { ButtonLink } from '../button-link';

import { PostMoreMenu } from './post-more-menu';

export default function PostMoreLink({ post, user, ...props }) {
  const fixedMenu = useMediaQuery('(max-width: 450px)');

  const { pivotRef, menuRef, opened, toggle } = useDropDownKbd({
    closeOn: CLOSE_ON_CLICK_OUTSIDE,
    fixed: fixedMenu,
  });
  const [serverInfo, serverInfoStatus] = useServerInfo();

  const doAndClose = useCallback((h) => h && ((...args) => (h(...args), toggle())), [toggle]);

  const deletePost = useCallback(
    (...feedNames) => confirmFirst(props.deletePost(...feedNames)),
    [props],
  );

  const perGroupDeleteEnabled = serverInfoStatus.success && serverInfo.features.perGroupsPostDelete;

  const canonicalPostURI = canonicalURI(post);

  const { isSaved, savePostStatus } = post;

  let label = 'More';
  if (savePostStatus.loading) {
    label = isSaved ? 'Un-saving...' : 'Saving...';
  }
  if (savePostStatus.success) {
    label = <TimedMessage message={isSaved ? 'Saved!' : 'Un-saved!'}>More</TimedMessage>;
  }
  if (savePostStatus.error) {
    label = <TimedMessage message="Error!">More</TimedMessage>;
  }

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

  return (
    <>
      <ButtonLink
        className="post-action"
        ref={pivotRef}
        onClick={toggle}
        aria-haspopup
        aria-expanded={opened}
      >
        <MoreWithTriangle>{label}</MoreWithTriangle>
      </ButtonLink>
      {opened && (
        <Portal>
          <PostMoreMenu
            ref={menuRef}
            post={post}
            user={user}
            toggleEditingPost={props.toggleEditingPost}
            toggleModeratingComments={props.toggleModeratingComments}
            enableComments={props.enableComments}
            disableComments={props.disableComments}
            deletePost={deletePost}
            perGroupDeleteEnabled={perGroupDeleteEnabled}
            doAndClose={doAndClose}
            permalink={canonicalPostURI}
            toggleSave={props.toggleSave}
            fixed={fixedMenu}
          />
        </Portal>
      )}
    </>
  );
}

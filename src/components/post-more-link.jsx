import { useCallback } from 'react';
import { Portal } from 'react-portal';

import { confirmFirst } from '../utils';
import { canonicalURI } from '../utils/canonical-uri';
import { useDropDown } from './hooks/drop-down';
import { useServerInfo } from './hooks/server-info';
import { PostMoreMenu } from './post-more-menu';
import { MoreWithTriangle } from './more-with-triangle';

export default function PostMoreLink({ post, user, ...props }) {
  const { pivotRef, menuRef, opened, toggle } = useDropDown();
  const [serverInfo, serverInfoStatus] = useServerInfo();

  const doAndClose = useCallback((h) => h && ((...args) => (h(...args), toggle())), [toggle]);

  const deletePost = useCallback(
    (...feedNames) => confirmFirst(props.deletePost(...feedNames)),
    [props],
  );

  const perGroupDeleteEnabled = serverInfoStatus.success && serverInfo.features.perGroupsPostDelete;

  const canonicalPostURI = canonicalURI(post);

  return (
    <>
      <a className="post-action" ref={pivotRef} onClick={toggle} role="button">
        <MoreWithTriangle />
      </a>
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
          />
        </Portal>
      )}
    </>
  );
}

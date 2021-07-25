import { useCallback } from 'react';
import { Portal } from 'react-portal';

import { confirmFirst } from '../utils';
import { useDropDown } from './hooks/drop-down';
import { useServerInfo } from './hooks/server-info';
import { PostMoreMenu } from './post-more-menu';

export default function PostMoreLink({ post, ...props }) {
  const { pivotRef, menuRef, opened, toggle } = useDropDown();
  const [serverInfo, serverInfoStatus] = useServerInfo();

  const deletePost = useCallback(
    (...feedNames) => confirmFirst(props.deletePost(...feedNames)),
    [props],
  );

  const perGroupDeleteEnabled = serverInfoStatus.success && serverInfo.features.perGroupsPostDelete;

  return (
    <>
      <a className="post-action" ref={pivotRef} onClick={toggle} role="button">
        More&#x200a;&#x25be;
      </a>
      {opened && (
        <Portal>
          <PostMoreMenu
            ref={menuRef}
            post={post}
            toggleEditingPost={props.toggleEditingPost}
            toggleModeratingComments={props.toggleModeratingComments}
            enableComments={props.enableComments}
            disableComments={props.disableComments}
            deletePost={deletePost}
            perGroupDeleteEnabled={perGroupDeleteEnabled}
          />
        </Portal>
      )}
    </>
  );
}

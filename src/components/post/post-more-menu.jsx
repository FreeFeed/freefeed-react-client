import { forwardRef, useLayoutEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import cn from 'classnames';
import {
  faExclamationTriangle,
  faLink,
  faEdit,
  faBookmark as faBookmarkSolid,
  faSignOutAlt,
  faAt,
} from '@fortawesome/free-solid-svg-icons';
import {
  faClock,
  faCommentDots,
  faTrashAlt,
  faBookmark,
} from '@fortawesome/free-regular-svg-icons';
import { noop } from 'lodash-es';
import { useDispatch } from 'react-redux';

import { copyURL } from '../../utils/copy-url';
import { leaveDirect } from '../../redux/action-creators';
import { ButtonLink } from '../button-link';
import { Throbber } from '../throbber';
import { Icon } from '../fontawesome-icons';
import TimeDisplay from '../time-display';

import styles from '../dropdown-menu.module.scss';
import { format } from '../../utils/date-format';
import { MenuItemIconic as Iconic } from './menu-item-iconic';
import { MenuItemTranslate } from './menu-item-translate';
import { MenuItemNotifyOfAllComments } from './menu-item-notify-on-all-comments';

// eslint-disable-next-line complexity
export const PostMoreMenu = forwardRef(function PostMoreMenu(
  {
    user,
    post: {
      id: postId,
      isEditable = false,
      canBeRemovedFrom = [],
      isModeratable = false,
      isDeletable = false,
      isModeratingComments = false,
      commentsDisabled = false,
      createdAt,
      updatedAt,
      isSaved = false,
      savePostStatus = {},
      createdBy: postCreatedBy,
      isDirect = false,
    },
    toggleEditingPost,
    toggleModeratingComments,
    enableComments,
    disableComments,
    deletePost,
    doAndClose,
    doAndForceClose,
    permalink,
    toggleSave,
    fixed = false,
    doMention,
  },
  ref,
) {
  const dispatch = useDispatch();
  const doLeaveDirect = useCallback(
    () =>
      confirm(
        "Are you sure you want to leave this conversation? You won't be able to read it unless the author invites you back again.",
      ) && dispatch(leaveDirect(postId)),
    [dispatch, postId],
  );

  const amIAuthenticated = !!user.id;
  const isOwnPost = amIAuthenticated && postCreatedBy?.id === user.id;

  const deleteLines = useMemo(() => {
    const result = [];
    // Not owned post
    if (!isEditable && (!isDeletable || canBeRemovedFrom.length > 1)) {
      for (const group of canBeRemovedFrom) {
        result.push({ text: `Remove from @${group}`, onClick: deletePost(group) });
      }
    }
    if (isDeletable) {
      result.push({ text: 'Delete', onClick: deletePost() });
    }
    return result;
  }, [isEditable, isDeletable, canBeRemovedFrom, deletePost]);

  const menuGroups = [
    [
      amIAuthenticated && !isOwnPost && (!commentsDisabled || isModeratable) && (
        <div className={styles.item} key="mention-author">
          <ButtonLink onClick={doAndForceClose(doMention)} className={styles.link}>
            <Iconic icon={faAt}>Mention @{postCreatedBy?.username}</Iconic>
          </ButtonLink>
        </div>
      ),
    ],
    [
      isEditable && (
        <div className={styles.item} key="edit-post">
          <ButtonLink className={styles.link} onClick={doAndClose(toggleEditingPost)}>
            <Iconic icon={faEdit}>Edit</Iconic>
          </ButtonLink>
        </div>
      ),
      isModeratable && (
        <div className={styles.item} key="moderate-comments">
          <ButtonLink className={styles.link} onClick={doAndClose(toggleModeratingComments)}>
            <Iconic icon={faCommentDots}>
              {isModeratingComments ? 'Stop moderating comments' : 'Moderate comments'}
            </Iconic>
          </ButtonLink>
        </div>
      ),
      (isEditable || isModeratable) && (
        <div className={styles.item} key="toggle-comments">
          {commentsDisabled ? (
            <ButtonLink className={styles.link} onClick={doAndClose(enableComments)}>
              <Iconic icon={faCommentDots}>Enable comments</Iconic>
            </ButtonLink>
          ) : (
            <ButtonLink className={styles.link} onClick={doAndClose(disableComments)}>
              <Iconic icon={faCommentDots}>Disable comments</Iconic>
            </ButtonLink>
          )}
        </div>
      ),
    ],
    deleteLines.map(({ text, onClick }) => (
      <div className={styles.item} key={`remove-from:${text}`}>
        <ButtonLink className={cn(styles.link, styles.danger)} onClick={doAndClose(onClick)}>
          <Iconic icon={faTrashAlt}>{text}</Iconic>
        </ButtonLink>
      </div>
    )),
    [
      amIAuthenticated && (
        <div className={styles.item} key="save-post">
          <ButtonLink className={styles.link} onClick={doAndClose(toggleSave)}>
            <Iconic icon={isSaved ? faBookmarkSolid : faBookmark}>
              {isSaved ? 'Un-save' : 'Save'} post
              {savePostStatus.loading && <Throbber />}
              {savePostStatus.error && (
                <Icon
                  icon={faExclamationTriangle}
                  className="post-like-fail"
                  title={savePostStatus.errorText}
                />
              )}
            </Iconic>
          </ButtonLink>
        </div>
      ),
      <MenuItemNotifyOfAllComments
        key="notify-of-all-comments"
        postId={postId}
        doAndClose={doAndClose}
      />,
      <MenuItemTranslate key="translate" type="post" id={postId} doAndClose={doAndClose} />,
    ],
    [
      isDirect && !isOwnPost && (
        <div className={styles.item} key="leave-direct">
          <ButtonLink
            className={cn(styles.link, styles.danger)}
            onClick={doAndClose(doLeaveDirect)}
          >
            <Iconic icon={faSignOutAlt}>Leave conversation</Iconic>
          </ButtonLink>
        </div>
      ),
    ],
    [
      <div key="created-on" className={cn(styles.item, styles.content)}>
        <Iconic icon={faClock}>
          Created on{' '}
          {isOwnPost ? (
            <Link
              to={`/${postCreatedBy?.username}/calendar/${format(
                new Date(+createdAt),
                'yyyy/MM/dd',
              )}`}
            >
              <TimeDisplay timeStamp={+createdAt} inline absolute />
            </Link>
          ) : (
            <TimeDisplay timeStamp={+createdAt} inline absolute />
          )}
        </Iconic>
      </div>,
      updatedAt - createdAt > 120000 && (
        <div key="updated-on" className={cn(styles.item, styles.content)}>
          <Iconic icon={faClock}>
            Updated on <TimeDisplay timeStamp={+updatedAt} inline absolute />
          </Iconic>
        </div>
      ),
      <div key="permalink" className={cn(styles.item, styles.content)}>
        <Iconic icon={faLink} centered>
          <Link to={permalink} style={{ marginRight: '1ex' }} onClick={doAndClose(noop)}>
            Link to post
          </Link>{' '}
          <button
            className="btn btn-default btn-sm"
            type="button"
            onClick={doAndClose(copyURL)}
            value={permalink}
            aria-label="Copy link"
          >
            Copy
          </button>
        </Iconic>
      </div>,
    ],
  ];

  const [initial, setInitial] = useState(true);
  useLayoutEffect(() => setInitial(false), []);

  return (
    <>
      {fixed && <div className={cn(styles.shadow, initial && styles.initial)} />}
      <div
        className={cn(
          styles.list,
          styles.focusList,
          initial && styles.initial,
          fixed && styles.fixedList,
        )}
        ref={ref}
        style={{ minWidth: '18em' }}
      >
        {menuGroups.map((group, i) => {
          const items = group.filter(Boolean);
          if (items.length === 0) {
            return null;
          }
          return (
            <div className={styles.group} key={`group-${i}`}>
              {items}
            </div>
          );
        })}
      </div>
    </>
  );
});

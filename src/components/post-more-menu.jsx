import { forwardRef, useMemo } from 'react';
import { Link } from 'react-router';
import cn from 'classnames';
import {
  faExclamationTriangle,
  faLink,
  faEdit,
  faBookmark as faBookmarkSolid,
} from '@fortawesome/free-solid-svg-icons';
import {
  faClock,
  faCommentDots,
  faTrashAlt,
  faBookmark,
} from '@fortawesome/free-regular-svg-icons';
import { noop } from 'lodash';

import { andJoin } from '../utils/and-join';
import { copyURL } from '../utils/copy-url';
import { ButtonLink } from './button-link';
import { Throbber } from './throbber';
import { Icon } from './fontawesome-icons';
import TimeDisplay from './time-display';

import styles from './dropdown-menu.module.scss';

export const PostMoreMenu = forwardRef(function PostMoreMenu(
  {
    user,
    post: {
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
    },
    toggleEditingPost,
    toggleModeratingComments,
    enableComments,
    disableComments,
    deletePost,
    perGroupDeleteEnabled = false,
    doAndClose,
    permalink,
    toggleSave,
  },
  ref,
) {
  const amIAuthenticated = !!user.id;

  const deleteLines = useMemo(() => {
    const result = [];
    // Not owned post
    if (!isEditable) {
      // Can we remove post from the single group?
      if (perGroupDeleteEnabled) {
        if (!isDeletable || canBeRemovedFrom.length > 1) {
          for (const group of canBeRemovedFrom) {
            result.push({ text: `Remove from @${group}`, onClick: deletePost(group) });
          }
        }
      } else if (!isDeletable) {
        result.push({
          text: `Remove from ${andJoin(canBeRemovedFrom.map((g) => `@${g}`))}`,
          onClick: deletePost(),
        });
      }
    }
    if (isDeletable) {
      result.push({ text: 'Delete', onClick: deletePost() });
    }
    return result;
  }, [isEditable, isDeletable, canBeRemovedFrom, perGroupDeleteEnabled, deletePost]);

  const menuGroups = [
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
          <ButtonLink
            className={styles.link}
            onClick={commentsDisabled ? doAndClose(enableComments) : doAndClose(disableComments)}
          >
            <Iconic icon={faCommentDots}>
              {commentsDisabled ? 'Enable comments' : 'Disable comments'}
            </Iconic>
          </ButtonLink>
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
    ],
    [
      <div key="created-on" className={cn(styles.item, styles.content)}>
        <Iconic icon={faClock}>
          Created on <TimeDisplay timeStamp={+createdAt} inline absolute />
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

  return (
    <div className={styles.list} ref={ref} style={{ minWidth: '18em' }}>
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
  );
});

function Iconic({ icon, centered = false, children }) {
  return (
    <span className={cn(styles.iconic, centered && styles.iconicCentered)}>
      <span className={styles.iconicIcon}>
        <Icon icon={icon} />
      </span>
      <span className={styles.iconicContent}>{children}</span>
    </span>
  );
}

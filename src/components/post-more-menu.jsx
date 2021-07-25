import { forwardRef, useMemo } from 'react';
import { andJoin } from '../utils/and-join';

import styles from './dropdown-menu.module.scss';

export const PostMoreMenu = forwardRef(function PostMoreMenu(
  {
    post: {
      isEditable = false,
      canBeRemovedFrom = [],
      isModeratable = false,
      isDeletable = false,
      isModeratingComments = false,
      commentsDisabled = false,
    },
    toggleEditingPost,
    toggleModeratingComments,
    enableComments,
    disableComments,
    deletePost,
    perGroupDeleteEnabled = false,
  },
  ref,
) {
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

  return (
    <ul className={styles.list} ref={ref}>
      {isEditable && (
        <li className={styles.item}>
          <a className={styles.link} onClick={toggleEditingPost} role="button">
            Edit
          </a>
        </li>
      )}

      {isModeratable && (
        <li className={styles.item}>
          <a className={styles.link} onClick={toggleModeratingComments} role="button">
            {isModeratingComments ? 'Stop moderating comments' : 'Moderate comments'}
          </a>
        </li>
      )}

      <li className={styles.item}>
        <a
          className={styles.link}
          onClick={commentsDisabled ? enableComments : disableComments}
          role="button"
        >
          {commentsDisabled ? 'Enable comments' : 'Disable comments'}
        </a>
      </li>

      {deleteLines.map(({ text, onClick }) => (
        <li className={styles.item} key={`remove-from:${text}`}>
          <a className={`${styles.link} ${styles.danger}`} onClick={onClick} role="button">
            {text}
          </a>
        </li>
      ))}
    </ul>
  );
});

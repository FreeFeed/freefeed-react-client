import { Portal } from 'react-portal';
import { confirmFirst } from '../utils';
import styles from './dropdown-menu.module.scss';
import { useDropDown } from './hooks/drop-down';

export default function PostMoreMenu({ post, ...props }) {
  const { pivotRef, menuRef, opened, toggle } = useDropDown();

  return (
    <>
      <a className="post-action" ref={pivotRef} onClick={toggle} role="button">
        More&#x200a;&#x25be;
      </a>
      {opened && (
        <Portal>
          <ul className={styles.list} ref={menuRef}>
            {post.isEditable && (
              <li className={styles.item}>
                <a className={styles.link} onClick={props.toggleEditingPost} role="button">
                  Edit
                </a>
              </li>
            )}

            {post.isModeratable && (
              <li className={styles.item}>
                <a className={styles.link} onClick={props.toggleModeratingComments} role="button">
                  {post.isModeratingComments ? 'Stop moderating comments' : 'Moderate comments'}
                </a>
              </li>
            )}

            {post.commentsDisabled ? (
              <li className={styles.item}>
                <a className={styles.link} onClick={props.enableComments} role="button">
                  Enable comments
                </a>
              </li>
            ) : (
              <li className={styles.item}>
                <a className={styles.link} onClick={props.disableComments} role="button">
                  Disable comments
                </a>
              </li>
            )}

            <li className={styles.item}>
              <a
                className={`${styles.link} ${styles.danger}`}
                onClick={confirmFirst(props.deletePost)}
                role="button"
              >
                {post.isFullyRemovable ? 'Delete' : 'Remove from group'}
              </a>
            </li>
          </ul>
        </Portal>
      )}
    </>
  );
}

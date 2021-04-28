import { forwardRef } from 'react';
import { Link } from 'react-router';
import cn from 'classnames';

import { noop } from 'lodash';
import { ButtonLink } from './button-link';
import styles from './dropdown-menu.module.scss';
import TimeDisplay from './time-display';

export const PostCommentMoreMenu = forwardRef(function PostCommentMore(
  {
    authorUsername,
    doEdit,
    doDelete,
    doReply,
    doMention,
    doLike,
    doUnlike,
    createdAt,
    updatedAt,
    permalink,
    doAndClose,
    fixed = false,
  },
  menuRef,
) {
  const menuGroups = [
    [
      doLike && (
        <div key="like" className={styles.item}>
          <ButtonLink onClick={doLike} className={styles.link}>
            Like comment
          </ButtonLink>
        </div>
      ),
      doUnlike && (
        <div key="unlike" className={styles.item}>
          <ButtonLink onClick={doUnlike} className={styles.link}>
            Unlike comment
          </ButtonLink>
        </div>
      ),
    ],
    [
      doEdit && (
        <div key="edit" className={styles.item}>
          <ButtonLink onClick={doEdit} className={styles.link}>
            Edit this comment
          </ButtonLink>
        </div>
      ),
      doDelete && (
        <div key="delete" className={styles.item}>
          <ButtonLink onClick={doDelete} className={styles.link}>
            Delete this comment
          </ButtonLink>
        </div>
      ),
    ],
    [
      doMention && (
        <div key="mention" className={styles.item}>
          <ButtonLink onClick={doMention} className={styles.link}>
            Reply to @{authorUsername}
          </ButtonLink>
        </div>
      ),
      doReply && (
        <div key="reply" className={styles.item}>
          <ButtonLink onClick={doReply} className={styles.link}>
            Reply with ^^^
          </ButtonLink>
        </div>
      ),
    ],
    [
      <div key="created-at" className={cn(styles.item, styles.content)}>
        Created at <TimeDisplay timeStamp={+createdAt} inline absolute />
      </div>,
      updatedAt - createdAt > 120000 && (
        <div key="updated-at" className={cn(styles.item, styles.content)}>
          Updated at <TimeDisplay timeStamp={+updatedAt} inline absolute />
        </div>
      ),
      <div key="permalink" className={cn(styles.item, styles.content)}>
        <Link to={permalink} style={{ marginRight: '1ex' }} onClick={doAndClose(noop)}>
          Permalink
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
      </div>,
    ],
  ];

  return (
    <div ref={menuRef} className={fixed ? styles.fixedList : styles.list}>
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

function copyURL({ target }) {
  target.blur();

  // Creating absolute URL
  const link = document.createElement('a');
  link.href = target.value;

  const textNode = document.body.appendChild(document.createTextNode(link.href));

  const range = new Range();
  const selection = document.getSelection();

  range.selectNode(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();

  textNode.parentNode.removeChild(textNode);
}

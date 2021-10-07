import { forwardRef, useLayoutEffect, useState } from 'react';
import { Link } from 'react-router';
import cn from 'classnames';

import { noop } from 'lodash';
import { useSelector } from 'react-redux';
import {
  faAngleUp,
  faAt,
  faEdit,
  faHeartBroken,
  faLink,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart, faClock, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { pluralForm } from '../utils';
import { copyURL } from '../utils/copy-url';
import { andJoin } from '../utils/and-join';
import { ButtonLink } from './button-link';
import styles from './dropdown-menu.module.scss';
import TimeDisplay from './time-display';
import { useCommentLikers } from './comment-likers';
import { Icon } from './fontawesome-icons';

export const PostCommentMoreMenu = forwardRef(function PostCommentMore(
  {
    id,
    authorUsername,
    doEdit,
    doDelete,
    doReply,
    doMention,
    doLike,
    doUnlike,
    doShowLikes,
    getBackwardIdx,
    createdAt,
    updatedAt,
    permalink,
    doAndClose,
    likesCount,
    fixed = false,
  },
  menuRef,
) {
  const { status, likers } = useCommentLikers(id);
  const myUsername = useSelector((state) => state.user.username);
  const bIdx = getBackwardIdx();
  const arrows = bIdx <= 3 ? '^'.repeat(bIdx) : `^^^\u2026`;
  const likersText = status.success
    ? likers.length > 0 && likersMenuText(likers, myUsername)
    : likesCount > 0 && `Show ${pluralForm(likesCount, 'like')}\u2026`;
  const menuGroups = [
    [
      doLike && (
        <div key="like" className={styles.item}>
          <ButtonLink onClick={doLike} className={styles.link}>
            <Iconic icon={faHeart}>Like comment</Iconic>
          </ButtonLink>
        </div>
      ),
      doUnlike && (
        <div key="unlike" className={styles.item}>
          <ButtonLink onClick={doUnlike} className={styles.link}>
            <Iconic icon={faHeartBroken}>Unlike comment</Iconic>
          </ButtonLink>
        </div>
      ),
      likersText && (
        <div key="likes" className={styles.item}>
          <ButtonLink className={styles.link} onClick={doShowLikes}>
            <Iconic icon={faUserFriends}>{likersText}</Iconic>
          </ButtonLink>
        </div>
      ),
    ],
    [
      doEdit && (
        <div key="edit" className={styles.item}>
          <ButtonLink onClick={doEdit} className={styles.link}>
            <Iconic icon={faEdit}>Edit this comment</Iconic>
          </ButtonLink>
        </div>
      ),
      doDelete && (
        <div key="delete" className={styles.item}>
          <ButtonLink onClick={doDelete} className={styles.link}>
            <Iconic icon={faTrashAlt}>Delete this comment</Iconic>
          </ButtonLink>
        </div>
      ),
    ],
    [
      doMention && (
        <div key="mention" className={styles.item}>
          <ButtonLink onClick={doMention} className={styles.link}>
            <Iconic icon={faAt}>Reply to @{authorUsername}</Iconic>
          </ButtonLink>
        </div>
      ),
      doReply && (
        <div key="reply" className={styles.item}>
          <ButtonLink onClick={doReply} className={styles.link}>
            <Iconic icon={faAngleUp}>Reply with {arrows}</Iconic>
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
            Link to comment
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
        ref={menuRef}
        className={cn(
          styles.list,
          styles.focusList,
          initial && styles.initial,
          fixed && styles.fixedList,
        )}
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

function likersMenuText(likers, myUsername) {
  if (likers.length === 0) {
    return `No likes`;
  } else if (likers.length === 1) {
    return `Liked by  ${usernames(likers, myUsername)[0]}`;
  } else if (likers.length <= 4) {
    return `Liked by  ${andJoin(usernames(likers, myUsername))}`;
  }
  const cutAfter = 2;
  return `Liked by ${andJoin([
    ...usernames(likers.slice(0, cutAfter), myUsername),
    `${likers.length - cutAfter} more\u2026`,
  ])}`;
}

function usernames(users, myUsername) {
  return users.map((u) => (u.username === myUsername ? 'you' : `@${u.username}`));
}

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

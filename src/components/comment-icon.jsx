import { useCallback, forwardRef, memo } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { pick } from 'lodash';
import cn from 'classnames';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartO, faComment } from '@fortawesome/free-regular-svg-icons';

import { Portal } from 'react-portal';
import { unlikeComment, likeComment } from '../redux/action-creators';
import TimeDisplay from './time-display';
import UserName from './user-name';
import { Icon } from './fontawesome-icons';
import { CLOSE_ON_CLICK_OUTSIDE, useDropDown } from './hooks/drop-down';
import { Throbber } from './throbber';
import ActionsPanel, { useActionsPanel } from './comment-actions-popup';
import { useWaiting } from './hooks/waiting';
import { useCommentLikers } from './comment-likers';

// Do not show clikes list for this interval if data is not available yet
const CLIKES_LIST_DELAY = 250;

// Assume that the comment always exists (i. e. it is not the icon near the "New comment" form)
export default memo(function CommentIcon({ id, omitBubble = false, reply, mention, postId }) {
  const dispatch = useDispatch();

  const { likes, hasOwnLike, createdAt, createdBy } = useSelector(
    (state) => pick(state.comments[id], ['likes', 'hasOwnLike', 'createdAt', 'createdBy']),
    shallowEqual,
  );
  const canLike = useSelector((state) => state.user.id !== createdBy);

  const {
    pivotRef: countRef,
    menuRef: likesListRef,
    opened: likesListOpened,
    toggle: likesListToggle,
  } = useDropDown({ closeOn: CLOSE_ON_CLICK_OUTSIDE });

  const {
    ref: panelRef,
    opened: actionsPanelOpened,
    hide: hideActionsPanel,
    handlers: touchHandlers,
  } = useActionsPanel();

  const heartClick = useCallback(
    () => void (canLike && dispatch((hasOwnLike ? unlikeComment : likeComment)(id))),
    [dispatch, hasOwnLike, id, canLike],
  );

  const bubbleClick = useCallback(
    (e) => {
      e.preventDefault();
      if (e.button === 0) {
        e.ctrlKey || e.metaKey ? reply() : mention();
      }
    },
    [mention, reply],
  );

  const heartClass = cn('comment-likes', {
    'has-my-like': hasOwnLike,
    'non-likable': !canLike,
    liked: likes > 0,
  });

  const bubbleProps = { id: `comment-${id}`, onClick: bubbleClick };

  return (
    <div className="comment-likes-container" {...touchHandlers}>
      {/* Heart & likes count */}
      <div className={heartClass}>
        <div className="comment-count" onClick={likesListToggle} ref={countRef} role="button">
          {likes || ''}
        </div>
        <div className="comment-heart" onClick={heartClick} role="button">
          <Icon
            icon={canLike ? faHeart : faHeartO}
            className={cn('icon', { liked: hasOwnLike })}
            title={!canLike ? 'Your own comment' : hasOwnLike ? 'Un-like' : 'Like'}
          />
        </div>
      </div>
      {/* Bubble icon */}
      <TimeDisplay className="comment-time" timeStamp={+createdAt} absolute>
        {omitBubble ? (
          <span className="comment-icon feed-comment-dot" {...bubbleProps} />
        ) : (
          <Icon icon={faComment} className="comment-icon" {...bubbleProps} />
        )}
      </TimeDisplay>
      {/* Likes list */}
      {likesListOpened && (
        <Portal>
          <LikesList id={id} ref={likesListRef} />
        </Portal>
      )}
      {/* Actions panel */}
      {actionsPanelOpened && (
        <Portal>
          <ActionsPanel
            ref={panelRef}
            id={id}
            postId={postId}
            hide={hideActionsPanel}
            reply={reply}
            mention={mention}
            toggleLike={heartClick}
          />
        </Portal>
      )}
    </div>
  );
});

export function JustCommentIcon() {
  return (
    <div className="comment-likes-container">
      <span className="comment-time">
        <Icon icon={faComment} className="comment-icon" />
      </span>
    </div>
  );
}

const LikesList = forwardRef(function LikesList({ id }, ref) {
  const waiting = useWaiting(CLIKES_LIST_DELAY);
  const { status, likers } = useCommentLikers(id);
  return (
    <div className="comment-likes-list" ref={ref} hidden={waiting && status.loading}>
      {status.loading && <Throbber />}
      {status.error && `Error: ${status.errorText}`}
      {status.success && likers.map((u) => <UserName user={u} key={u.id} />)}
    </div>
  );
});

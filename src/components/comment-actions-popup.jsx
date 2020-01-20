import React, { useCallback, useRef, useEffect, forwardRef } from 'react';
import { Link } from 'react-router';
import { faAt, faAngleUp, faHeart, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartO, faClock } from '@fortawesome/free-regular-svg-icons';
import { pick } from 'lodash';
import { useSelector, shallowEqual } from 'react-redux';

import UserName from './user-name';
import { Icon } from './fontawesome-icons';
import TimeDisplay from './time-display';
import { useCommentLikers } from './comment-icon';
import { useEntryUrl } from './hooks/entry-url';
import { useBool } from './hooks/bool';
import { withEventListener, withTimeout, withInterval } from './hooks/sub-unsub';

const longTapTimeout = 300;

export default forwardRef(function ActionsPanel(
  { id, hide, reply, mention, toggleLike, postId },
  ref,
) {
  const { likes, hasOwnLike, createdAt, createdBy } = useSelector(
    (state) => pick(state.comments[id], ['likes', 'hasOwnLike', 'createdAt', 'createdBy']),
    shallowEqual,
  );

  const entryUrl = useEntryUrl(postId);

  const canLike = useSelector((state) => state.user.id !== createdBy);

  return (
    <div className="actions-overlay" onClick={hide} ref={ref}>
      <div className="container">
        <div className="row">
          <div className="col-md-9">
            <div className="actions-panel">
              {/* Likes list */}
              <div className="likes-panel" onClick={cancelClick}>
                <div className="arrow" onClick={hide}>
                  <Icon icon={faChevronLeft} />
                </div>
                <div className="likes">
                  <LikesList id={id} nLikes={likes} hasOwnLike={hasOwnLike} canLike={canLike} />
                </div>
              </div>

              {/* Like / Unlike */}
              {canLike ? (
                <button
                  className={`mention-action ${hasOwnLike ? 'un' : ''}like`}
                  onClick={toggleLike}
                >
                  <Icon icon={faHeart} />
                  {`${hasOwnLike ? 'Un-like' : 'Like'} comment`}
                </button>
              ) : (
                <div className="mention-action non-likable">
                  <Icon icon={faHeartO} />
                  It&#x2019;s your own comment
                </div>
              )}

              {/* ^ - reply */}
              <button className="mention-action reply" onClick={reply}>
                <Icon icon={faAngleUp} />
                Reply to comment
              </button>

              {/* @ - mention */}
              <button className="mention-action mention" onClick={mention}>
                <Icon icon={faAt} />
                Mention username
              </button>

              {/* Timestamp and link */}
              <div className="mention-action">
                <Icon icon={faClock} />
                <Link to={`${entryUrl}#comment-${id}`}>
                  <TimeDisplay timeStamp={+createdAt} showAbsTime />
                </Link>{' '}
                <button
                  className="btn btn-default btn-sm"
                  type="button"
                  onClick={copyURL}
                  value={`${entryUrl}#comment-${id}`}
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function LikesList({ id, nLikes, hasOwnLike, canLike }) {
  if (nLikes === 0) {
    return (
      <i>
        No one has liked this comment yet.
        {canLike && ' You will be the first to like it!'}
      </i>
    );
  }

  if (nLikes - hasOwnLike === 0) {
    return 'You liked this comment';
  }

  return <LoadedLikesList id={id} nLikes={nLikes} hasOwnLike={hasOwnLike} />;
}

function LoadedLikesList({ id, nLikes, hasOwnLike }) {
  const wrapper = useRef();
  const { status, likers, ownId } = useCommentLikers(id);
  const [folded, , , unFold] = useBool(true);

  {
    // Fixing parent element's maxHeight to prevent it
    // from being clipped out on low screens or with large
    // likers list.
    const adjustHeight = useCallback(() => {
      if (!wrapper.current) {
        return;
      }
      const parent = wrapper.current.parentNode;
      const { bottom } = parent.getBoundingClientRect();
      parent.style.maxHeight = `${bottom}px`;
    }, []);

    useEffect(adjustHeight);
    useEffect(() => withInterval(adjustHeight, 250), [adjustHeight]);
  }

  if (status.success) {
    const otherLikers = likers.filter((u) => u.id !== ownId);
    hasOwnLike = otherLikers.length !== likers.length;

    const useFold = likers.length > 5;
    const head = useFold && folded ? otherLikers.slice(0, 4 - hasOwnLike) : otherLikers;
    const tail = otherLikers.slice(head.length);

    const items = [
      hasOwnLike && <span key="you">You</span>,
      ...head.map((u) => <UserName user={u} key={u.id} />),
      tail.length && (
        <a key={`others${tail.length}`} onClick={unFold} className="likes-list-toggle">
          {tail.length} more {usersPluralize(tail.length)}
        </a>
      ),
    ].filter(Boolean);

    return (
      <div ref={wrapper}>
        {items.map((it, i) => (
          <span key={it.key}>
            {i === 0 ? '' : i === items.length - 1 ? ' and ' : ', '}
            {it}
          </span>
        ))}{' '}
        liked this comment
      </div>
    );
  }

  if (status.error) {
    return <>Cannot load likes: {status.errorText}</>;
  }

  return (
    <>
      {hasOwnLike && 'You and '}
      {nLikes - hasOwnLike} {usersPluralize(nLikes - hasOwnLike)} liked this comment
    </>
  );
}

export function useActionsPanel() {
  // Long tap is in propgress
  const [inTouch, , inTouchOn, inTouchOff] = useBool(false);
  // Panel is opned
  const [opened, , show, hide] = useBool(false);
  // Panel reference
  const ref = useRef(null);

  const onTouchStart = useCallback(() => !opened && inTouchOn(), [inTouchOn, opened]);

  const onTouchEnd = useCallback(
    (e) => {
      inTouchOff();
      // If just opened
      if (inTouch && opened) {
        e.cancelable && e.preventDefault();
        // For iOS browsers that don't support the 'selectstart' event
        window.getSelection().removeAllRanges();
      }
    },
    [inTouch, inTouchOff, opened],
  );

  useEffect(() => (inTouch && withTimeout(show, longTapTimeout)) || undefined, [inTouch, show]);

  // Prevent text selection immediately after the panel is opened.
  useEffect(
    () =>
      (ref.current &&
        inTouch &&
        opened &&
        withEventListener(ref.current, 'selectstart', (e) => e.cancelable && e.preventDefault())) ||
      undefined,
    [inTouch, opened],
  );

  return {
    opened, // panel is opened
    hide, // hide panel
    ref, // ref to panel component
    handlers: {
      // event handlers for the panel initiator
      onTouchStart,
      onTouchEnd,
      onTouchMove: inTouchOff,
      onClick: inTouchOff,
      onTouchCancel: inTouchOff,
    },
  };
}

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

const cancelClick = (e) => e.stopPropagation();

const usersPluralize = (count) => `user${count > 1 ? 's' : ''}`;

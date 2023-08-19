import cn from 'classnames';
import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';

import { getCommentByNumber } from '../../redux/action-creators';
import { initialAsyncState } from '../../redux/async-helpers';
import { intentToScroll } from '../../services/unscroll';
import {
  COMMENT_HIDDEN_BANNED,
  READMORE_STYLE_COMPACT,
} from '../../utils/frontend-preferences-options';

import { commentReadmoreConfig } from '../../utils/readmore-config';
import Expandable from '../expandable';
import PieceOfText from '../piece-of-text';
import { Separated } from '../separated';
import TimeDisplay from '../time-display';
import UserName from '../user-name';

import styles from './post-comment-preview.module.scss';
import { CommentProvider } from './post-comment-provider';

export function PostCommentPreview({
  postId,
  seqNumber: initialSeqNumber,
  postUrl,
  close,
  onCommentLinkClick,
  arrowsHighlightHandlers,
  arrowsLeft = 0,
  arrowsTop = 0,
  showMedia,
}) {
  const dispatch = useDispatch();
  const allComments = useSelector((state) => state.comments);
  const allUsers = useSelector((state) => state.users);
  const getCommentStatuses = useSelector((state) => state.getCommentStatuses);
  const frontPreferences = useSelector((state) => state.user.frontendPreferences);
  const [seqNumber, setSeqNumber] = useState(initialSeqNumber);
  const [isDeepPreview, setIsDeepPreview] = useState(false);

  const boxRef = useRef();

  const comment = useMemo(
    () =>
      Object.values(allComments).find((c) => c?.postId === postId && c?.seqNumber === seqNumber),
    [allComments, postId, seqNumber],
  );
  const author = allUsers[comment?.createdBy];

  const arrowHoverHandlers = useMemo(
    () => ({
      hover: (e) => {
        const arrows = parseInt(e.target.dataset['arrows'] || '');
        arrowsHighlightHandlers.hover(comment?.id, arrows);
      },
      leave: () => arrowsHighlightHandlers.leave(),
    }),
    [arrowsHighlightHandlers, comment?.id],
  );

  const onArrowClick = useCallback(
    (e) => {
      const arrowsEl = e.currentTarget;

      const arrows = parseInt(arrowsEl.dataset['arrows'] || '');
      const previewSeqNumber = seqNumber - arrows;
      if (previewSeqNumber > 0) {
        setSeqNumber(previewSeqNumber);
        setIsDeepPreview(true);
      }
    },
    [seqNumber],
  );

  const commentBody = useMemo(() => {
    if (comment?.hideType === COMMENT_HIDDEN_BANNED) {
      return 'Comment from blocked user';
    }
    return comment?.body;
  }, [comment]);

  // Request a comment if it is not available
  const getCommentStatus = getCommentStatuses[`${postId}#${seqNumber}`] || initialAsyncState;
  useEffect(() => {
    if (!comment && getCommentStatus.initial) {
      dispatch(getCommentByNumber(postId, seqNumber));
    }
  }, [comment, dispatch, getCommentStatus.initial, postId, seqNumber]);

  // Close on click outside
  useEffect(() => {
    const box = boxRef.current;
    const h = (e) => e.target.isConnected && !box.contains(e.target) && close();
    // Use setTimeout to skip the click opens the preview
    setTimeout(() => document.body.addEventListener('click', h), 0);
    return () => document.body.removeEventListener('click', h);
  }, [close]);

  const onClick = useCallback(
    (e) => {
      comment && onCommentLinkClick(e, comment.id);
      close();
    },
    [close, comment, onCommentLinkClick],
  );

  useEffect(() => {
    const minBottom = 100;
    const { bottom } = boxRef.current.getBoundingClientRect();
    if (bottom < minBottom) {
      intentToScroll();
      window.scrollBy({
        top: bottom - minBottom,
        behavior: 'smooth',
      });
    }
  }, []);

  const style = useMemo(
    () => ({
      '--arr-left': `${arrowsLeft}px`,
      '--arr-top': `${arrowsTop}px`,
    }),
    [arrowsLeft, arrowsTop],
  );

  const commentTail = (
    <span className="comment-tail">
      <Separated separator=" - ">
        <></>
        {author && <UserName user={author} />}
        {comment && frontPreferences.comments.showTimestamps && (
          <span className="comment-tail__item">
            <Link
              to={`${postUrl}#${comment.shortId}`}
              className="comment-tail__timestamp"
              onClick={onClick}
            >
              <TimeDisplay timeStamp={+comment.createdAt} inline />
            </Link>
          </span>
        )}
      </Separated>
    </span>
  );

  return (
    <div
      ref={boxRef}
      className={cn(styles['box'], isDeepPreview && styles['box--deep'])}
      style={style}
    >
      {comment ? (
        <CommentProvider id={comment.id}>
          {comment.hideType ? (
            <span className={styles['hidden-text']}>{commentBody}</span>
          ) : (
            <Expandable
              expanded={frontPreferences.readMoreStyle === READMORE_STYLE_COMPACT}
              config={commentReadmoreConfig}
              bonusInfo={commentTail}
            >
              <PieceOfText
                text={commentBody}
                showMedia={showMedia}
                arrowHover={arrowHoverHandlers}
                arrowClick={onArrowClick}
              />
              {commentTail}
            </Expandable>
          )}
          <div className={styles['actions']}>
            <Link to={`${postUrl}#${comment?.shortId}`} onClick={onClick}>
              Go to comment
            </Link>
          </div>
        </CommentProvider>
      ) : getCommentStatus.error ? (
        <div className={styles['error']}>Error: {getCommentStatus.errorText}</div>
      ) : (
        <div className={styles['loading']}>Loading...</div>
      )}
    </div>
  );
}

import { useCallback, useMemo, useEffect, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { getCommentByNumber } from '../../redux/action-creators';
import { initialAsyncState } from '../../redux/async-helpers';
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

export function PostCommentPreview({ postId, seqNumber, postUrl, close, onCommentLinkClick }) {
  const dispatch = useDispatch();
  const allComments = useSelector((state) => state.comments);
  const allUsers = useSelector((state) => state.users);
  const getCommentStatuses = useSelector((state) => state.getCommentStatuses);
  const frontPreferences = useSelector((state) => state.user.frontendPreferences);

  const comment = useMemo(
    () => Object.values(allComments).find((c) => c.postId === postId && c.seqNumber === seqNumber),
    [allComments, postId, seqNumber],
  );
  const author = allUsers[comment?.createdBy];

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
  const boxRef = useRef();
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

  const commentTail = (
    <span className="comment-tail">
      <Separated separator=" - ">
        <></>
        {author && <UserName user={author} />}
        {comment && frontPreferences.comments.showTimestamps && (
          <span className="comment-tail__item">
            <Link
              to={`${postUrl}#comment-${comment.id}`}
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
    <div ref={boxRef} className={styles['box']}>
      {comment ? (
        <>
          <Expandable
            expanded={frontPreferences.readMoreStyle === READMORE_STYLE_COMPACT}
            config={commentReadmoreConfig}
            bonusInfo={commentTail}
          >
            <PieceOfText text={commentBody} />
            {commentTail}
          </Expandable>
          <div className={styles['actions']}>
            <Link to={`${postUrl}#comment-${comment?.id}`} onClick={onClick}>
              Go to comment
            </Link>
          </div>
        </>
      ) : getCommentStatus.error ? (
        <div className={styles['error']}>Error: {getCommentStatus.errorText}</div>
      ) : (
        <div className={styles['loading']}>Loading...</div>
      )}
    </div>
  );
}

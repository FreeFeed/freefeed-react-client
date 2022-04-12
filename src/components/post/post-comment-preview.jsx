import { useMemo, useEffect, useRef } from 'react';

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
import UserName from '../user-name';

import styles from './post-comment-preview.module.scss';

export function PostCommentPreview({ postId, seqNumber, postUrl, close }) {
  const dispatch = useDispatch();
  const allComments = useSelector((state) => state.comments);
  const allUsers = useSelector((state) => state.users);
  const getCommentStatuses = useSelector((state) => state.getCommentStatuses);
  const readMoreStyle = useSelector((state) => state.user.frontendPreferences.readMoreStyle);

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

  const getCommentStatus = getCommentStatuses[`${postId}#${seqNumber}`] || initialAsyncState;
  useEffect(() => {
    if (!comment && getCommentStatus.initial) {
      dispatch(getCommentByNumber(postId, seqNumber));
    }
  }, [comment, dispatch, getCommentStatus.initial, postId, seqNumber]);

  const boxRef = useRef();
  useEffect(() => {
    const box = boxRef.current;
    const h = (e) => e.target.isConnected && !box.contains(e.target) && close();
    // Use setTimeout to skip the click opens the preview
    setTimeout(() => document.body.addEventListener('click', h), 0);
    return () => document.body.removeEventListener('click', h);
  }, [close]);

  const commentTail = (
    <span className="comment-tail">
      {' '}
      - <UserName user={author} />
    </span>
  );

  return (
    <div ref={boxRef} className={styles['box']}>
      {comment ? (
        <>
          <Expandable
            expanded={readMoreStyle === READMORE_STYLE_COMPACT}
            config={commentReadmoreConfig}
            bonusInfo={commentTail}
          >
            <PieceOfText text={commentBody} />
            {commentTail}
          </Expandable>
          <div className={styles['actions']}>
            <Link to={`${postUrl}#comment-${comment?.id}`} onClick={close}>
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

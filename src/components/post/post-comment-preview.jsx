import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { READMORE_STYLE_COMPACT } from '../../utils/frontend-preferences-options';

import { commentReadmoreConfig } from '../../utils/readmore-config';
import Expandable from '../expandable';
import PieceOfText from '../piece-of-text';
import UserName from '../user-name';

import styles from './post-comment-preview.module.scss';

export function PostCommentPreview({ postId, seqNumber, postUrl, close }) {
  const readMoreStyle = useSelector((state) => state.user.frontendPreferences.readMoreStyle);
  const comment = useSelector((state) =>
    Object.values(state.comments).find((c) => c.postId === postId && c.seqNumber === seqNumber),
  );
  const author = useSelector((state) => state.users[comment?.createdBy]);

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
      <Expandable
        expanded={readMoreStyle === READMORE_STYLE_COMPACT}
        config={commentReadmoreConfig}
        bonusInfo={commentTail}
      >
        <PieceOfText text={comment?.body} />
        {commentTail}
      </Expandable>
      <div className={styles['actions']}>
        <Link to={`${postUrl}#comment-${comment.id}`} onClick={close}>
          Go to comment
        </Link>
      </div>
    </div>
  );
}

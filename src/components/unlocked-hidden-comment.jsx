import { useDispatch, useSelector } from 'react-redux';
import { faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import { COMMENT_VISIBLE, HIDDEN_AUTHOR_BANNED } from '../utils/frontend-preferences-options';
import { initialAsyncState } from '../redux/async-helpers';
import { unlockComment } from '../redux/action-creators';
import PieceOfText from './piece-of-text';
import { AlternativeText } from './alternative-text';
import UserName from './user-name';

export function UnlockedHiddenComment({ id, userHover, arrowHover, arrowClick, close }) {
  const dispatch = useDispatch();
  const comment = useSelector((state) => state.comments[id]);

  const status = useSelector((store) => store.unlockedCommentStates[id] ?? initialAsyncState);
  const unlockedComment = useSelector((store) => store.unlockedComments[id]);

  useEffect(() => {
    if (comment.hideType === HIDDEN_AUTHOR_BANNED && status.initial) {
      dispatch(unlockComment(id));
    }
  }, [comment.hideType, dispatch, id, status.initial]);

  let title;
  if (comment.hideType === COMMENT_VISIBLE) {
    title = `Comment with reply to blocked user:`;
  } else if (comment.hideType === HIDDEN_AUTHOR_BANNED) {
    if (status.loading) {
      title = `Loading comment from a blocked user...`;
    } else if (status.error) {
      title = `Error loading comment: ${status.errorText}`;
    } else {
      title = `Comment from a blocked user:`;
    }
  }

  let content = null;
  if (comment.hideType === COMMENT_VISIBLE) {
    content = (
      <CommentContent
        comment={comment}
        userHover={userHover}
        arrowHover={arrowHover}
        arrowClick={arrowClick}
      />
    );
  } else if (comment.hideType === HIDDEN_AUTHOR_BANNED) {
    content = (
      <CommentContent
        comment={unlockedComment}
        userHover={userHover}
        arrowHover={arrowHover}
        arrowClick={arrowClick}
      />
    );
  }

  return (
    <AlternativeText icon={faLockOpen} status={title} inComment close={close}>
      {content}
    </AlternativeText>
  );
}

function CommentContent({ comment, userHover, arrowHover, arrowClick }) {
  const allUsers = useSelector((state) => state.users);
  const author = allUsers[comment?.createdBy];
  return (
    comment && (
      <>
        <PieceOfText
          isExpanded
          text={comment.body}
          userHover={userHover}
          arrowHover={arrowHover}
          arrowClick={arrowClick}
        />
        {author && (
          <>
            {' '}
            - <UserName user={author} />
          </>
        )}
      </>
    )
  );
}

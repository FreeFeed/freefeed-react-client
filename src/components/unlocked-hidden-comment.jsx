import { useSelector } from 'react-redux';
import { faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { COMMENT_VISIBLE } from '../utils/frontend-preferences-options';
import PieceOfText from './piece-of-text';
import { AlternativeText } from './alternative-text';
import UserName from './user-name';

export function UnlockedHiddenComment({ id, userHover, arrowHover, arrowClick, close }) {
  const comment = useSelector((state) => state.comments[id]);
  const allUsers = useSelector((state) => state.users);
  const author = allUsers[comment?.createdBy];

  let status;
  if (comment.hideType === COMMENT_VISIBLE) {
    status = `Comment with reply to blocked user:`;
  } else {
    status = `Comment from a blocked user:`;
  }

  let content = 'TODO';
  if (comment.hideType === COMMENT_VISIBLE) {
    content = (
      <>
        <PieceOfText
          isExpanded
          text={comment.body}
          userHover={userHover}
          arrowHover={arrowHover}
          arrowClick={arrowClick}
        />{' '}
        - <UserName user={author} />
      </>
    );
  }

  return (
    <AlternativeText icon={faLockOpen} status={status} inComment close={close}>
      {content}
    </AlternativeText>
  );
}

import cn from 'classnames';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveEditingComment } from '../redux/action-creators';
import { initialAsyncState } from '../redux/async-helpers';
import { checkMark, isChecked, setCheckState } from '../utils/initial-checkbox';
import style from './initial-checkbox.module.scss';
import { Throbber } from './throbber';
import { useComment } from './post/post-comment-ctx';

export function InitialCheckbox({ checked }) {
  const comment = useComment();
  const myId = useSelector((state) => state.user.id);

  const isActive = myId && comment?.createdBy === myId;

  return (
    <>
      {isActive ? (
        <ActiveCheckbox comment={comment} checked={checked} />
      ) : (
        <span className={style.textBox}>
          [
          <span aria-hidden={!checked} className={cn(!checked && style.hidden)}>
            {checkMark}
          </span>
          ]
        </span>
      )}{' '}
    </>
  );
}

function ActiveCheckbox({ comment, checked }) {
  const updateStatus = useSelector(
    (state) => state.commentEditState[comment?.id]?.saveStatus ?? initialAsyncState,
  );
  const dispatch = useDispatch();
  const onClick = useCallback(
    (e) => {
      if (e.clientX !== 0) {
        // True mouse click (not keyboard)
        e.target.blur();
      }
      const newState = e.target.checked;
      if (isChecked(comment.body) === newState) {
        return;
      }
      const updatedBody = setCheckState(comment.body, newState);
      dispatch(saveEditingComment(comment?.id, updatedBody));
    },
    [comment?.body, comment?.id, dispatch],
  );

  return (
    <span className={style.box}>
      {updateStatus.loading && <Throbber className={style.throbber} delay={0} />}
      <input
        type="checkbox"
        readOnly
        checked={checked}
        className={cn(style.chk, updateStatus.loading && style.hidden)}
        onClick={onClick}
      />
    </span>
  );
}

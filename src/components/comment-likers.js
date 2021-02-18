import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getCommentLikes } from '../redux/action-creators';
import { initialAsyncState } from '../redux/async-helpers';

/**
 * Load and return all likers of the given comment
 *
 * @param {string} id
 */
export function useCommentLikers(id) {
  const dispatch = useDispatch();
  useEffect(() => void dispatch(getCommentLikes(id)), [dispatch, id]);
  return useSelector((state) => {
    const { status = initialAsyncState, likes = [] } = state.commentLikes[id] || {};
    return {
      status,
      likers: likes.map((like) => state.users[like.userId]),
      ownId: state.user.id,
    };
  });
}

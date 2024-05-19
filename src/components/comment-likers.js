import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getCommentLikes } from '../redux/action-creators';
import { initialAsyncState } from '../redux/async-helpers';

/**
 * Load and return all likers of the given comment
 *
 * @param {string} id
 * @param {boolean} suppress do not load likes (when we know they aren't available)
 */
export function useCommentLikers(id, suppress = false) {
  const dispatch = useDispatch();
  useEffect(() => void (!suppress && dispatch(getCommentLikes(id))), [suppress, dispatch, id]);
  return useSelector((state) => {
    const { status = initialAsyncState, likes = [] } = state.commentLikes[id] || {};
    return {
      status,
      likers: likes.map((like) => state.users[like.userId]),
      ownId: state.user.id,
    };
  });
}

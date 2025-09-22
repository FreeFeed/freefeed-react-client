import { showMoreLikesAsync, showMoreLikesSync } from '../action-creators';
import { REALTIME_LIKE_REMOVE, SHOW_MORE_LIKES } from '../action-types';

export const likesLogicMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case SHOW_MORE_LIKES: {
      const { postId } = action.payload;
      const post = store.getState().posts[postId];
      const isSync = post.omittedLikes === 0;

      const nextAction = isSync ? showMoreLikesSync(postId) : showMoreLikesAsync(postId);

      return store.dispatch(nextAction);
    }
    case REALTIME_LIKE_REMOVE: {
      const { postId, userId } = action;
      const post = store.getState().posts[postId];
      // it is necessary for proper update postsViewState
      action.isLikeVisible = post ? post.likes.includes(userId) : false;
      return next(action);
    }
  }

  return next(action);
};

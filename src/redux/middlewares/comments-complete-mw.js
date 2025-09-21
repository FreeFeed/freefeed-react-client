import { completePostComments } from '../action-creators';
import { response } from '../action-helpers';
import { DELETE_COMMENT, REALTIME_COMMENT_DESTROY } from '../action-types';

/**
 * Completes incomplete post comments states
 *
 * Requests comments from the server if there are no comments before or after
 * the omittedComments span.
 */
export const commentsCompleteMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type === response(DELETE_COMMENT) || action.type === REALTIME_COMMENT_DESTROY) {
    const postId = action.postId || action.request.postId;
    const post = store.getState().posts[postId];
    if (post && post.omittedComments > 0) {
      if (
        post.omittedCommentsOffset === 0 ||
        post.comments.length <= post.omittedCommentsOffset ||
        post.omittedComments === 1
      ) {
        store.dispatch(completePostComments(postId));
      }
    }
  }
  return result;
};

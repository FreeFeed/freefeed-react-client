import { refreshPosts } from '../../services/api';
import { REFRESH_VISIBLE_POSTS } from '../action-types';

export const refreshVisiblePostsMiddleware = (store) => (next) => (action) => {
  if (action.type === REFRESH_VISIBLE_POSTS) {
    const state = store.getState();
    const idsWithOmittedComments = [];
    const idsWithoutOmittedComments = [];
    if (state.feedViewState.entries.length === 0) {
      return null; // Skip this action if there are no posts to refresh
    }
    for (const id of state.feedViewState.entries) {
      if (state.posts[id].omittedComments > 0) {
        idsWithOmittedComments.push(id);
      } else {
        idsWithoutOmittedComments.push(id);
      }
    }
    return next({
      type: REFRESH_VISIBLE_POSTS,
      asyncOperation: refreshPosts,
      payload: {
        idsWithOmittedComments,
        idsWithoutOmittedComments,
      },
    });
  }
  return next(action);
};

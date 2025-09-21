import { cleanLikeError, likePostRequest, unlikePostRequest } from '../action-creators';
import { fail, response } from '../action-helpers';
import {
  LIKE_POST,
  LIKE_POST_OPTIMISTIC,
  REALTIME_LIKE_NEW,
  REALTIME_LIKE_REMOVE,
  UNLIKE_POST,
  UNLIKE_POST_OPTIMISTIC,
} from '../action-types';

class ActionsQueue {
  q = [];

  push(action, store) {
    this.q.push(action);
    if (this.q.length === 1) {
      store.dispatch(action);
    }
  }

  next(store) {
    this.q.shift();
    if (this.q.length > 0) {
      store.dispatch(this.q[0]);
    }
  }
}

const cleanLikeErrorTimeout = 10000;
const likeActionsQueue = new ActionsQueue();
const ignoreMyLikes = {};
const ignoreMyUnlikes = {};
const cleanLikeErrorTimers = {};

export const optimisticLikesMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case LIKE_POST_OPTIMISTIC: {
      next(action);

      const { postId, userId } = action.payload;
      ignoreMyLikes[postId] = (ignoreMyLikes[postId] || 0) + 1;
      likeActionsQueue.push(likePostRequest(postId, userId), store);
      return;
    }
    case UNLIKE_POST_OPTIMISTIC: {
      next(action);

      const { postId, userId } = action.payload;
      ignoreMyUnlikes[postId] = (ignoreMyUnlikes[postId] || 0) + 1;
      likeActionsQueue.push(unlikePostRequest(postId, userId), store);
      return;
    }

    case response(LIKE_POST):
    case response(UNLIKE_POST): {
      next(action);
      likeActionsQueue.next(store);
      return;
    }

    case fail(LIKE_POST):
    case fail(UNLIKE_POST): {
      next(action);

      const { postId } = action.request;
      if (cleanLikeErrorTimers[postId]) {
        clearTimeout(cleanLikeErrorTimers[postId]);
      }
      cleanLikeErrorTimers[postId] = setTimeout(() => {
        store.dispatch(cleanLikeError(postId));
        delete cleanLikeErrorTimers[postId];
      }, cleanLikeErrorTimeout);

      const ignore = action.type.startsWith(LIKE_POST) ? ignoreMyLikes : ignoreMyUnlikes;
      if (ignore[postId]) {
        ignore[postId]--;
      }

      likeActionsQueue.next(store);
      return;
    }

    case REALTIME_LIKE_NEW: {
      const myLike = action.users[0].id === store.getState().user.id;
      if (myLike && ignoreMyLikes[action.postId]) {
        ignoreMyLikes[action.postId]--;
        // skip for the own optimistic likes
        return;
      }
      return next(action);
    }
    case REALTIME_LIKE_REMOVE: {
      const myLike = action.userId === store.getState().user.id;
      if (myLike && ignoreMyUnlikes[action.postId]) {
        ignoreMyUnlikes[action.postId]--;
        // skip for the own optimistic unlikes
        return;
      }
      return next(action);
    }
  }

  return next(action);
};

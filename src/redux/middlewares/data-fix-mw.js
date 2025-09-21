import { response } from '../action-helpers';
import {
  DISCUSSIONS,
  GET_BEST_OF,
  GET_SEARCH,
  GET_SINGLE_POST,
  GET_USER_COMMENTS,
  GET_USER_FEED,
  GET_USER_LIKES,
  HOME,
  REALTIME_COMMENT_NEW,
  REALTIME_POST_NEW,
  REALTIME_POST_UPDATE,
  SAVES,
  SEND_SUBSCRIPTION_REQUEST,
} from '../action-types';

// Fixing data structures coming from server
export const dataFixMiddleware = (store) => (next) => (action) => {
  if (action.type === response(GET_SINGLE_POST)) {
    [action.payload, action.payload.posts].forEach(fixPostsData);
  }

  if (action.type === REALTIME_COMMENT_NEW && action.post) {
    [action.post, action.post.posts].forEach(fixPostsData);
  }
  if (action.type === REALTIME_POST_UPDATE || action.type === REALTIME_POST_NEW) {
    [action.post, action.posts].forEach(fixPostsData);
  }

  if (
    action.type === response(HOME) ||
    action.type === response(DISCUSSIONS) ||
    action.type === response(SAVES) ||
    action.type === response(GET_USER_FEED) ||
    action.type === response(GET_USER_COMMENTS) ||
    action.type === response(GET_USER_LIKES) ||
    action.type === response(GET_SEARCH) ||
    action.type === response(GET_BEST_OF)
  ) {
    action.payload.posts = action.payload.posts || [];
  }

  if (action.payload && action.payload.posts && Array.isArray(action.payload.posts)) {
    action.payload.posts.forEach(fixPostsData);
  }

  if (action.type === response(SEND_SUBSCRIPTION_REQUEST)) {
    // Server doesn't return any data in response to subscription request, so we
    // fill 'response' from the existiing state for use in reducers.
    action.payload = store.getState().users[action.request.id] || action.request;
  }

  return next(action);
};

function fixPostsData(post) {
  // there are some old posts without 'body' field
  post.body = post.body || '';
  // post may not have 'comments' field
  post.comments = post.comments || [];
  post.likes = post.likes || [];
  // some archived posts have no 'createdAt' field
  post.createdAt = post.createdAt || '0';
}

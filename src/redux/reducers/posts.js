/* eslint-disable complexity */
import { without } from 'lodash-es';
import { postParser } from '../../utils';
import { isFeedResponse } from '../action-helpers';
import {
  ADD_COMMENT,
  CLEAN_LIKE_ERROR,
  COMPLETE_POST_COMMENTS,
  CREATE_POST,
  DELETE_COMMENT,
  DISABLE_COMMENTS,
  ENABLE_COMMENTS,
  GET_SINGLE_POST,
  HIDE_POST,
  LIKE_POST,
  LIKE_POST_OPTIMISTIC,
  NOTIFY_OF_ALL_COMMENTS,
  REALTIME_COMMENT_DESTROY,
  REALTIME_COMMENT_NEW,
  REALTIME_COMMENT_UPDATE,
  REALTIME_LIKE_NEW,
  REALTIME_LIKE_REMOVE,
  REALTIME_POST_HIDE,
  REALTIME_POST_NEW,
  REALTIME_POST_SAVE,
  REALTIME_POST_UNHIDE,
  REALTIME_POST_UPDATE,
  SAVE_EDITING_POST,
  SAVE_POST,
  SHOW_MORE_COMMENTS,
  SHOW_MORE_LIKES_ASYNC,
  UNAUTHENTICATED,
  UNHIDE_POST,
  UNLIKE_POST,
  UNLIKE_POST_OPTIMISTIC,
} from '../action-types';
import { asyncStatesMap, fail, getKeyBy, response } from '../async-helpers';
import { mergeByIds, patchObjectByKey } from './helpers';

const savePostStatusesReducer = asyncStatesMap(SAVE_POST, {
  getKey: getKeyBy('postId'),
  keyMustExist: true,
  applyState: (post, savePostStatus) => ({ ...post, savePostStatus }),
});

export function posts(state = {}, action) {
  if (isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.posts || []).map(postParser), {
      insert: true,
      update: true,
    });
  }

  // Handle the savePostStatus changes
  state = savePostStatusesReducer(state, action);

  switch (action.type) {
    case response(SHOW_MORE_COMMENTS): {
      const post = state[action.payload.posts.id];
      if (!post) {
        return state;
      }
      const newPost = postParser(action.payload.posts);
      return {
        ...state,
        [post.id]: {
          ...post,
          omittedComments: newPost.omittedComments,
          omittedCommentsOffset: newPost.omittedCommentsOffset,
          comments: newPost.comments,
        },
      };
    }
    case response(SHOW_MORE_LIKES_ASYNC): {
      const post = state[action.payload.posts.id];
      return {
        ...state,
        [post.id]: {
          ...post,
          omittedLikes: 0,
          likes: action.payload.posts.likes,
        },
      };
    }
    case response(COMPLETE_POST_COMMENTS): {
      const post = state[action.payload.posts.id];
      if (!post || post.omittedComments === 0) {
        return state;
      }

      const newPost = postParser(action.payload.posts);

      if (newPost.omittedComments === 0) {
        // We got expanded comments, rewrite them all
        return {
          ...state,
          [post.id]: {
            ...post,
            omittedComments: newPost.omittedComments,
            omittedCommentsOffset: newPost.omittedCommentsOffset,
            comments: newPost.comments,
          },
        };
      }

      const { comments } = newPost;
      const newCommentsCount = comments.length + newPost.omittedComments;
      const oldTailComments = post.comments.slice(post.omittedCommentsOffset);
      if (oldTailComments.length > 0) {
        const newTailComments = comments.slice(1);
        const tailComments =
          longestWithCommonTail(oldTailComments, newTailComments) || newTailComments;
        comments.splice(1, comments.length - 1, ...tailComments);
      }

      return {
        ...state,
        [post.id]: {
          ...post,
          omittedComments: newCommentsCount - comments.length,
          omittedCommentsOffset: 1,
          comments,
        },
      };
    }
    case response(SAVE_EDITING_POST): {
      const post = state[action.payload.posts.id];
      return {
        ...state,
        [post.id]: {
          ...post,
          body: action.payload.posts.body,
          updatedAt: action.payload.posts.updatedAt,
          attachments: action.payload.posts.attachments || [],
          postedTo: action.payload.posts.postedTo,
        },
      };
    }
    case response(DELETE_COMMENT): {
      const { commentId, postId } = action.request;
      const post = state[postId];
      if (!post || !post.comments.includes(commentId)) {
        return state;
      }

      let { omittedCommentsOffset } = post;
      if (post.comments.indexOf(commentId) < post.omittedCommentsOffset) {
        // If the deletion is before the omittedComments span
        omittedCommentsOffset--;
      }

      return {
        ...state,
        [post.id]: {
          ...post,
          comments: post.comments.filter((c) => c !== commentId),
          omittedCommentsOffset,
        },
      };
    }
    case REALTIME_COMMENT_DESTROY: {
      const { postId, commentId } = action;
      const post = state[postId];
      if (!post || (!post.comments.includes(commentId) && post.omittedComments === 0)) {
        return state;
      }

      return patchObjectByKey(state, postId, (post) => {
        const p = { ...post };
        const idx = p.comments.indexOf(commentId);
        if (idx >= 0) {
          if (idx < p.omittedCommentsOffset) {
            p.omittedCommentsOffset--;
          }
          p.comments = p.comments.filter((c) => c !== commentId);
        } else {
          p.omittedComments = p.omittedComments - 1;
          if (p.omittedComments <= 0) {
            p.omittedComments = 0;
            p.omittedCommentsOffset = 0;
          }
        }
        return p;
      });
    }
    case response(ADD_COMMENT): {
      const post = state[action.request.postId];
      if (!post || post.comments?.includes(action.payload.comments.id)) {
        return state;
      }
      return patchObjectByKey(state, action.request.postId, (post) => ({
        ...post,
        comments: [...(post.comments || []), action.payload.comments.id],
      }));
    }

    // Likes

    case CLEAN_LIKE_ERROR: {
      const { postId } = action;
      const post = state[postId];
      if (!post || !post.likeError) {
        return state;
      }
      return {
        ...state,
        [postId]: {
          ...post,
          likeError: null,
        },
      };
    }

    case LIKE_POST_OPTIMISTIC: {
      const { postId, userId } = action.payload;
      const post = state[postId];
      if (post.likes.includes(userId)) {
        return state;
      }
      return {
        ...state,
        [postId]: {
          ...post,
          likeError: null,
          likes: [userId, ...post.likes],
        },
      };
    }
    case fail(LIKE_POST): {
      const { postId, userId } = action.request;
      const post = state[postId];
      if (!post.likes.includes(userId)) {
        return state;
      }
      return {
        ...state,
        [postId]: {
          ...post,
          likeError: `Cannot like post: ${action.payload.err}`,
          likes: without(post.likes, userId),
        },
      };
    }

    case UNLIKE_POST_OPTIMISTIC: {
      const { postId, userId } = action.payload;
      const post = state[postId];
      if (!post.likes.includes(userId)) {
        return state;
      }
      return {
        ...state,
        [postId]: {
          ...post,
          likeError: null,
          likes: without(post.likes, userId),
        },
      };
    }
    case fail(UNLIKE_POST): {
      const { postId, userId } = action.request;
      const post = state[postId];
      if (post.likes.includes(userId)) {
        return state;
      }
      return {
        ...state,
        [postId]: {
          ...post,
          likeError: `Cannot unlike post: ${action.payload.err}`,
          likes: [userId, ...post.likes],
        },
      };
    }

    case REALTIME_LIKE_NEW: {
      const {
        postId,
        users: [{ id: userId }],
      } = action;
      const post = state[postId];
      if (!post && !action.post) {
        return state;
      }

      const postToAct = post || postParser(action.post.posts);

      if (postToAct.likes && postToAct.likes.includes(userId)) {
        return {
          ...state,
          [postToAct.id]: postToAct,
        };
      }

      const likes = action.iLiked
        ? [postToAct.likes[0], userId, ...postToAct.likes.slice(1)]
        : [userId, ...(postToAct.likes || [])];

      return {
        ...state,
        [postToAct.id]: { ...postToAct, likes },
      };
    }

    case REALTIME_LIKE_REMOVE: {
      const { postId, userId, isLikeVisible } = action;
      const post = state[postId];
      if (!post) {
        return state;
      }

      const likes = without(post.likes, userId);
      const omittedLikes = isLikeVisible ? post.omittedLikes : Math.max(0, post.omittedLikes - 1);

      return {
        ...state,
        [post.id]: { ...post, likes, omittedLikes },
      };
    }

    case response(HIDE_POST): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isHidden: true,
        },
      };
    }
    case REALTIME_POST_HIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          isHidden: true,
        },
      };
    }
    case response(UNHIDE_POST): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isHidden: false,
        },
      };
    }
    case REALTIME_POST_UNHIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          isHidden: false,
        },
      };
    }

    case response(SAVE_POST): {
      return patchObjectByKey(state, action.request.postId, (post) => ({
        ...post,
        isSaved: action.request.save,
      }));
    }

    case REALTIME_POST_SAVE: {
      return patchObjectByKey(state, action.payload.postId, (post) => ({
        ...post,
        isSaved: action.payload.save,
      }));
    }

    case response(DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          commentsDisabled: true,
        },
      };
    }
    case response(ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          commentsDisabled: false,
        },
      };
    }
    case response(CREATE_POST):
    case response(GET_SINGLE_POST):
    case response(NOTIFY_OF_ALL_COMMENTS): {
      return updatePostData(state, action);
    }
    case REALTIME_POST_NEW: {
      return { ...state, [action.post.id]: postParser(action.post) };
    }
    case REALTIME_POST_UPDATE: {
      const post = state[action.post.id];
      if (!post) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          body: action.post.body,
          updatedAt: action.post.updatedAt,
          attachments: action.post.attachments || [],
          postedTo: action.post.postedTo,
          backlinksCount: action.post.backlinksCount,
        },
      };
    }
    case REALTIME_COMMENT_NEW: {
      const post = state[action.comment.postId];
      if (!post) {
        if (!action.post) {
          return state;
        }

        return {
          ...state,
          [action.post.posts.id]: postParser(action.post.posts),
        };
      }
      if (post.comments?.includes(action.comment.id)) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          comments: [...(post.comments || []), action.comment.id],
        },
      };
    }
    case REALTIME_COMMENT_UPDATE: {
      const post = state[action.comment.postId];
      if (post && !post.comments.includes(action.comment.id) && post.omittedComments > 0) {
        // Clikes count changed in omitted comments
        if (action.event === 'comment_like:new') {
          return {
            ...state,
            [post.id]: {
              ...post,
              omittedCommentLikes: post.omittedCommentLikes + 1,
            },
          };
        }
        if (action.event === 'comment_like:remove' && post.omittedCommentLikes > 0) {
          return {
            ...state,
            [post.id]: {
              ...post,
              omittedCommentLikes: post.omittedCommentLikes - 1,
            },
          };
        }
      }
      return state;
    }
    case UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}

function updatePostData(state, action) {
  const postId = action.payload.posts.id;
  return { ...state, [postId]: postParser(action.payload.posts) };
}

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @return {Array|null}
 */
function longestWithCommonTail(arr1, arr2) {
  let i = 0;
  while (i < arr1.length && i < arr2.length) {
    if (arr1[arr1.length - 1 - i] !== arr2[arr2.length - 1 - i]) {
      return null;
    }
    i++;
  }
  return arr1.length > arr2.length ? arr1 : arr2;
}

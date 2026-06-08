import { postParser } from '../../utils';
import { GET_POST_FOR_PREVIEW, GET_COMMENT_FOR_PREVIEW } from '../action-types';
import { asyncResultsMap, asyncStatesMap, getKeyBy } from '../async-helpers';

const getPostId = getKeyBy('postId');

// Async states for each post preview request
export const postPreviewStatuses = asyncStatesMap(GET_POST_FOR_PREVIEW, {
  getKey: getPostId,
});

// Post data for successful previews
export const postPreviewsData = asyncResultsMap(GET_POST_FOR_PREVIEW, {
  getKey: getPostId,
  transformer: ({ payload }) => {
    if (!payload.posts) {
      return null;
    }
    return postParser(payload.posts);
  },
});

// Key for comment previews: "postId#commentId"
const getCommentKey = getKeyBy(({ postId, commentId }) => `${postId}#${commentId}`);

// Async states for each comment preview request
export const commentPreviewStatuses = asyncStatesMap(GET_COMMENT_FOR_PREVIEW, {
  getKey: getCommentKey,
});

// Comment data for successful previews
export const commentPreviewsData = asyncResultsMap(GET_COMMENT_FOR_PREVIEW, {
  getKey: getCommentKey,
  transformer: ({ payload }) => {
    if (!payload.comments) {
      return null;
    }
    const comment = payload.comments;
    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      createdBy: comment.createdBy,
    };
  },
});

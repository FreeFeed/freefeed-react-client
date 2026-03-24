import { postParser } from '../../utils';
import { GET_POST_FOR_PREVIEW } from '../action-types';
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

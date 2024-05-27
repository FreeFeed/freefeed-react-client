import { UNLOCK_COMMENT } from '../action-types';
import { asyncResultsMap, asyncStatesMap } from '../async-helpers';
import { setOnLocationChange } from './helpers';

const resetOnLocationChange = setOnLocationChange({});

export const unlockedCommentStates = asyncStatesMap(UNLOCK_COMMENT, {}, resetOnLocationChange);
export const unlockedComments = asyncResultsMap(
  UNLOCK_COMMENT,
  {
    transformer: (action) => action.payload.comments,
  },
  resetOnLocationChange,
);

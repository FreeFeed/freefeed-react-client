import { LOCATION_CHANGE } from 'react-router-redux';
import { initialAsyncState, asyncStatesMap, getKeyBy } from '../async-helpers';
import {
  SAVE_EDITING_COMMENT,
  ADD_COMMENT,
  TOGGLE_COMMENTING,
  TOGGLE_EDITING_COMMENT,
  UNAUTHENTICATED,
} from '../action-types';

const defaultState = {};

export const defaultCommentState = {
  isEditing: false,
  saveStatus: initialAsyncState,
};

export const commentEditState = asyncStatesMap(
  [ADD_COMMENT, SAVE_EDITING_COMMENT],
  {
    getKey: getKeyBy({ [ADD_COMMENT]: 'postId', [SAVE_EDITING_COMMENT]: 'commentId' }),
    applyState: (entry = defaultCommentState, saveStatus) => ({ ...entry, saveStatus }),
    cleanOnSuccess: true,
  },
  (state = defaultState, action) => {
    switch (action.type) {
      case TOGGLE_EDITING_COMMENT: {
        const { commentId } = action;
        const subState = state[commentId] || defaultCommentState;
        return {
          ...state,
          [commentId]: {
            ...subState,
            isEditing: !subState.isEditing,
          },
        };
      }
      case TOGGLE_COMMENTING: {
        const { postId } = action.payload;
        const subState = state[postId] || defaultCommentState;
        return {
          ...state,
          [postId]: {
            ...subState,
            isEditing: !subState.isEditing,
          },
        };
      }
      case LOCATION_CHANGE:
      case UNAUTHENTICATED: {
        return defaultState;
      }
      default:
        return state;
    }
  },
);

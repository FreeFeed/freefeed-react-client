import { omit } from 'lodash-es';
import { TOGGLE_EDITING_POST, TRANSLATE_TEXT } from '../action-types';
import { asyncResultsMap, asyncStatesMap, keyFromRequestPayload } from '../async-helpers';
import { reducersChain, setOnLocationChange } from './helpers';

const emptyObj = {};

const keySelector = keyFromRequestPayload((p) => `${p.type}:${p.id}`);
const resetOnLocationChange = setOnLocationChange(emptyObj);

export const translationStates = asyncStatesMap(
  TRANSLATE_TEXT,
  { getKey: keySelector },
  reducersChain((state, action) => {
    if (action.type === TOGGLE_EDITING_POST) {
      return omit(state, `post:${action.payload.postId}`);
    }
    return state;
  }, resetOnLocationChange),
);

export const translationResults = asyncResultsMap(
  TRANSLATE_TEXT,
  { getKey: keySelector },
  resetOnLocationChange,
);

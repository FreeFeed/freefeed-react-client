import { pick } from 'lodash-es';
import { DELETE_UNDO_ENTRY, UNDO_ACTION, UNDO_CLEAN } from '../action-types';
import { asyncPhase, response, RESPONSE_PHASE } from '../async-helpers';

const initialState = [];

export function undoEntries(state = initialState, action) {
  if (asyncPhase(action.type) === RESPONSE_PHASE && 'undo' in action.payload) {
    const now = Math.floor(Date.now() / 1000);
    const entries = action.payload.undo.map((it) => ({
      ...pick(it, ['subject', 'token', 'message']),
      id: djb2(it.token),
      created: now,
      exp: now + it.expiresInSec,
    }));
    return [...entries, ...state];
  }

  switch (action.type) {
    case UNDO_CLEAN: {
      const now = Math.floor(Date.now() / 1000);
      if (state.some((it) => it.exp <= now)) {
        return state.filter((it) => it.exp > now);
      }
      return state;
    }
    case DELETE_UNDO_ENTRY:
      return state.filter((it) => it.id !== action.payload.id);
    case response(UNDO_ACTION): {
      return state.filter((it) => it.token !== action.request.token);
    }
    default:
      return state;
  }
}

/**
 * Fast and simple djb2 hash
 *
 * @param {string} data
 * @returns {string}
 */
function djb2(data) {
  let hash = 5381;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) + hash) ^ data.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}

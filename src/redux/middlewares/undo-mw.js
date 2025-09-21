import { pick } from 'lodash-es';
import { bindHandlers } from '.';
import { addUndoEntry, deleteUndoEntry } from '../action-creators';
import { response } from '../action-helpers';
import { UNDO_ACTION } from '../action-types';
import { asyncPhase, RESPONSE_PHASE } from '../async-helpers';

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

export function undoMiddleware(store) {
  const rtHandlers = bindHandlers(store);
  return (next) => (action) => {
    next(action);

    if (asyncPhase(action.type) === RESPONSE_PHASE && 'undo' in action.payload) {
      const now = Math.floor(Date.now() / 1000);
      for (const entry of action.payload.undo) {
        // Short ID of undo entry
        const id = djb2(entry.token);
        store.dispatch(
          addUndoEntry({
            ...pick(entry, ['subject', 'token', 'message']),
            id,
            created: now,
            exp: now + entry.expiresInSec,
          }),
        );

        setTimeout(() => store.dispatch(deleteUndoEntry(id)), entry.expiresInSec * 1000);
      }
    }

    if (action.type === response(UNDO_ACTION)) {
      // Emulate the realtime events
      if (action.request.subject === 'commentDelete') {
        rtHandlers['comment:restore'](action.payload);
      }
      if (action.request.subject === 'postDelete') {
        rtHandlers['post:restore'](action.payload);
      }
    }
  };
}

import { ADD_UNDO_ENTRY, DELETE_UNDO_ENTRY, UNDO_ACTION } from '../action-types';
import { response } from '../async-helpers';

const initialState = [];

export function undoEntries(state = initialState, action) {
  switch (action.type) {
    case ADD_UNDO_ENTRY:
      return [action.payload, ...state];
    case DELETE_UNDO_ENTRY:
      return state.filter((it) => it.id !== action.payload.id);
    case response(UNDO_ACTION): {
      return state.filter((it) => it.token !== action.request.token);
    }
    default:
      return state;
  }
}

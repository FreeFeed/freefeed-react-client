import { CLOSE_AUTH_SESSIONS, LIST_AUTH_SESSIONS, SIGN_OUT } from '../action-types';
import { response, asyncState, initialAsyncState } from '../async-helpers';
import { setOnLocationChange } from './helpers';

export const signOutStatus = asyncState(SIGN_OUT);

export const authSessionsStatus = asyncState(
  LIST_AUTH_SESSIONS,
  setOnLocationChange(initialAsyncState),
);

export const closeAuthSessionsStatus = asyncState(
  CLOSE_AUTH_SESSIONS,
  setOnLocationChange(initialAsyncState),
);

const resetAuthSessions = setOnLocationChange([]);

export function authSessions(state = [], action) {
  state = resetAuthSessions(state, action);
  switch (action.type) {
    case response(LIST_AUTH_SESSIONS):
    case response(CLOSE_AUTH_SESSIONS): {
      const { current: currentId, sessions } = action.payload;
      return sessions
        .filter((s) => s.status === 'ACTIVE' || s.status === 'BLOCKED')
        .map((s) => ({ ...s, isCurrent: s.id === currentId }))
        .sort((a, b) => {
          if (a.isCurrent !== b.isCurrent) {
            return a.isCurrent ? -1 : 1;
          }
          return b.lastUsedAt.localeCompare(a.lastUsedAt);
        });
    }
  }
  return state;
}

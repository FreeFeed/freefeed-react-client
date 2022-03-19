import { BAN, BLOCKED_BY_ME, UNBAN, REALTIME_INCOMING_EVENT } from '../action-types';
import { response } from '../async-helpers';

export function bannedUsernames(state = [], action) {
  if (action.type === response(BLOCKED_BY_ME)) {
    return action.payload.map((u) => u.username);
  }
  if (action.type === response(UNBAN)) {
    const { username } = action.request;
    if (state.includes(username)) {
      return state.filter((name) => name !== username);
    }
    return state;
  }
  if (action.type === response(BAN)) {
    const { username } = action.request;
    if (!state.includes(username)) {
      return [...state, username];
    }
    return state;
  }
  if (action.type === REALTIME_INCOMING_EVENT && action.payload.event === 'event:new') {
    const { Notifications, users } = action.payload.data;
    for (const note of Notifications) {
      if (note.event_type === 'banned_user') {
        const { username } = users.find((u) => u.id === note.affected_user_id);
        if (!state.includes(username)) {
          state = [...state, username];
        }
      }
      if (note.event_type === 'unbanned_user') {
        const { username } = users.find((u) => u.id === note.affected_user_id);
        if (state.includes(username)) {
          state = state.filter((name) => name !== username);
        }
      }
    }
    return state;
  }
  return state;
}

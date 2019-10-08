import { combineReducers } from 'redux';
import {
  fromResponse,
  response,
  initialAsyncState,
  asyncState,
  asyncStatesMap,
} from '../async-helpers';
import {
  GET_AUTH_PROFILES,
  CONNECT_TO_EXTERNAL_PROVIDER,
  UNLINK_EXTERNAL_PROFILE,
} from '../action-types';
import { setOnLocationChange } from './helpers';

export const extAuth = combineReducers({
  profiles: fromResponse(
    GET_AUTH_PROFILES,
    ({ payload: { profiles } }) => profiles,
    [],
    (state, action) => {
      switch (action.type) {
        case response(CONNECT_TO_EXTERNAL_PROVIDER): {
          const { profile } = action.payload;
          if (!state.some((p) => p.id === profile.id)) {
            return [action.payload.profile, ...state];
          }
          return state;
        }
        case response(UNLINK_EXTERNAL_PROFILE): {
          return state.filter((p) => p.id !== action.request.id);
        }
        default:
          return state;
      }
    },
  ),
  profilesStatus: asyncState(GET_AUTH_PROFILES, setOnLocationChange(initialAsyncState)),
  connectStatus: asyncState(CONNECT_TO_EXTERNAL_PROVIDER, setOnLocationChange(initialAsyncState)),
  disconnectStatuses: asyncStatesMap(UNLINK_EXTERNAL_PROFILE, {}, setOnLocationChange({})),
});

import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';
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
  SIGN_IN_VIA_EXTERNAL_PROVIDER,
  GET_SERVER_INFO,
} from '../action-types';
import { setOnLocationChange } from './helpers';

export const extAuth = combineReducers({
  providers: fromResponse(
    GET_SERVER_INFO,
    (action) => action.payload.externalAuthProvidersInfo,
    [],
  ),
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
  signInStatus: asyncState(SIGN_IN_VIA_EXTERNAL_PROVIDER, setOnLocationChange(initialAsyncState)),
  signInResult: fromResponse(
    SIGN_IN_VIA_EXTERNAL_PROVIDER,
    ({ payload }) => payload,
    {},
    ((targetState) => (state, action) => {
      // Drop the state on LOCATION_CHANGE but only if location is not changed to '/signup'!
      // In this case keep the state for use in signup form.
      if (action.type === LOCATION_CHANGE && action.payload.pathname !== '/signup') {
        return targetState;
      }
      return state;
    })({}),
  ),
});

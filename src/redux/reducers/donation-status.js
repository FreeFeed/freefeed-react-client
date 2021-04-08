import { pick } from 'lodash';
import { GET_USER_INFO, REALTIME_GLOBAL_USER_UPDATE } from '../action-types';
import {
  asyncPhase,
  baseType,
  REQUEST_PHASE,
  RESPONSE_PHASE,
  FAIL_PHASE,
  successAsyncState,
  errorAsyncState,
  initialAsyncState,
  loadingAsyncState,
  response,
} from '../async-helpers';

export function donationLoadingStatus(state = initialAsyncState, action) {
  if (baseType(action.type) === GET_USER_INFO && action.extra?.donationAccount) {
    switch (asyncPhase(action.type)) {
      case REQUEST_PHASE:
        return loadingAsyncState;
      case RESPONSE_PHASE:
        return successAsyncState;
      case FAIL_PHASE:
        return errorAsyncState(action.payload && action.payload.err);
    }
  }

  return state;
}

export function donationAccount(state = { username: '', screenName: '' }, action) {
  if (action.type === response(GET_USER_INFO) && action.extra?.donationAccount) {
    return pick(action.payload.users, ['username', 'screenName']);
  }

  if (action.type === REALTIME_GLOBAL_USER_UPDATE && action.user.username === state.username) {
    return pick(action.user, ['username', 'screenName']);
  }

  return state;
}

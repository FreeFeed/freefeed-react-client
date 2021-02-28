/* global CONFIG */
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
  getKeyBy,
} from '../async-helpers';

const getUsername = getKeyBy('username');

export function donationLoadingStatus(state = initialAsyncState, action) {
  if (
    baseType(action.type) === GET_USER_INFO &&
    getUsername(action) === CONFIG.donationStatusAccount
  ) {
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

export function donationStatus(state = '', action) {
  if (
    action.type === response(GET_USER_INFO) &&
    action.request.username === CONFIG.donationStatusAccount
  ) {
    return action.payload.users.screenName;
  }

  if (
    action.type === REALTIME_GLOBAL_USER_UPDATE &&
    action.user.username === CONFIG.donationStatusAccount
  ) {
    return action.user.screenName;
  }

  return state;
}

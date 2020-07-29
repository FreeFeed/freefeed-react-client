import { combineReducers } from 'redux';

import {
  UPDATE_USER_PICTURE,
  UPDATE_USER,
  UPDATE_PASSWORD,
  UPDATE_ACTUAL_USER_PREFERENCES,
  UPDATE_USER_NOTIFICATION_PREFERENCES,
  ACTIVATE_USER,
} from '../action-types';
import { initialAsyncState, asyncState } from '../async-helpers';
import { setOnLocationChange } from './helpers';

export const settingsForms = combineReducers({
  updatePictureStatus: asyncState(UPDATE_USER_PICTURE, setOnLocationChange(initialAsyncState)),
  updateProfileStatus: asyncState(UPDATE_USER, setOnLocationChange(initialAsyncState)),
  updatePasswordStatus: asyncState(UPDATE_PASSWORD, setOnLocationChange(initialAsyncState)),
  displayPrefsStatus: asyncState(
    UPDATE_ACTUAL_USER_PREFERENCES,
    setOnLocationChange(initialAsyncState),
  ),
  notificationsStatus: asyncState(
    UPDATE_USER_NOTIFICATION_PREFERENCES,
    setOnLocationChange(initialAsyncState),
  ),
  privacyStatus: asyncState(UPDATE_USER, setOnLocationChange(initialAsyncState)),
  activateStatus: asyncState(ACTIVATE_USER, setOnLocationChange(initialAsyncState)),
});

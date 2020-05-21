import { pick } from 'lodash';

import { LOCATION_CHANGE } from 'react-router-redux';
import {
  response,
  asyncState,
  asyncStatesMap,
  getKeyBy,
  initialAsyncState,
} from '../async-helpers';
import {
  UNAUTHENTICATED,
  REALTIME_USER_UPDATE,
  LIST_HOME_FEEDS,
  GET_USER_INFO,
  UPDATE_SUBSCRIPTION,
  SEND_SUBSCRIPTION_REQUEST,
  SUBSCRIBE,
} from '../action-types';
import { setOnLocationChange, setOnLogOut } from './helpers';

const defaultHomeFeeds = [{ id: 'unknown', title: 'Home', isInherent: true }];

function parseHomeFeedsList(list) {
  return list.map((t) => pick(t, ['id', 'title', 'isInherent']));
}

// All home feeds of the current user
export function homeFeeds(state = defaultHomeFeeds, action) {
  switch (action.type) {
    case response(LIST_HOME_FEEDS): {
      return parseHomeFeedsList(action.payload.timelines);
    }
    case UNAUTHENTICATED: {
      return defaultHomeFeeds;
    }
    case REALTIME_USER_UPDATE: {
      if (action.homeFeeds) {
        return parseHomeFeedsList(action.homeFeeds);
      }
      return state;
    }
  }

  return state;
}

export const homeFeedsStatus = asyncState(LIST_HOME_FEEDS, setOnLogOut(initialAsyncState));

export function usersInHomeFeeds(state = {}, action) {
  switch (action.type) {
    case response(GET_USER_INFO):
    case response(UPDATE_SUBSCRIPTION): {
      return {
        ...state,
        [action.payload.users.id]: action.payload.inHomeFeeds,
      };
    }
    case UNAUTHENTICATED:
    case LOCATION_CHANGE: {
      return {};
    }
  }

  return state;
}

export const usersInHomeFeedsStates = asyncStatesMap(
  GET_USER_INFO,
  {
    getKey: getKeyBy('username'),
  },
  setOnLocationChange({}),
);

export const updateUsersSubscriptionStates = asyncStatesMap(
  [SUBSCRIBE, SEND_SUBSCRIPTION_REQUEST, UPDATE_SUBSCRIPTION],
  { getKey: getKeyBy('username') },
  setOnLocationChange({}),
);

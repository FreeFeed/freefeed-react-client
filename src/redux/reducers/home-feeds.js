import { pick } from 'lodash';

import { LOCATION_CHANGE } from 'react-router-redux';
import { response, asyncState, asyncStatesMap, getKeyBy } from '../async-helpers';
import {
  UNAUTHENTICATED,
  REALTIME_USER_UPDATE,
  LIST_HOME_FEEDS,
  GET_USER_INFO,
} from '../action-types';
import { setOnLocationChange } from './helpers';

const defaultHomeFeeds = [{ id: 'unknown', title: 'Home Feed', isInherent: true }];

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

export const homeFeedsStatus = asyncState(LIST_HOME_FEEDS);

export function usersInHomeFeeds(state = {}, action) {
  switch (action.type) {
    case response(GET_USER_INFO): {
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

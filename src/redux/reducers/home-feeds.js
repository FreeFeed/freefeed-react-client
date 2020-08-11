import { pick, without } from 'lodash';

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
  GET_ALL_SUBSCRIPTIONS,
  CREATE_HOME_FEED,
  REORDER_HOME_FEEDS,
  UPDATE_HOME_FEED,
  DELETE_HOME_FEED,
} from '../action-types';
import { setOnLocationChange, setOnLogOut, reducersChain } from './helpers';

const defaultHomeFeeds = [{ id: 'unknown', title: 'Home', isInherent: true }];

function parseHomeFeed(t) {
  return pick(t, ['id', 'title', 'isInherent']);
}

function parseHomeFeedsList(list) {
  return list.map(parseHomeFeed);
}

const setIfNotFriendsPage = (state) => setOnLocationChange(state, ['/friends']);

// All home feeds of the current user
export function homeFeeds(state = defaultHomeFeeds, action) {
  switch (action.type) {
    case response(LIST_HOME_FEEDS):
    case response(GET_ALL_SUBSCRIPTIONS):
    case response(REORDER_HOME_FEEDS): {
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
    case response(CREATE_HOME_FEED): {
      const newFeed = parseHomeFeed(action.payload.timeline);
      if (state.every((h) => h.id !== newFeed.id)) {
        // This feed isn't here yet
        return [...state, newFeed];
      }
      return state;
    }
    case response(UPDATE_HOME_FEED): {
      const u = parseHomeFeed(action.payload.timeline);
      return state.map((f) => (f.id === u.id ? u : f));
    }
    case response(DELETE_HOME_FEED): {
      return state.filter((f) => f.id !== action.request.feedId);
    }
  }

  return state;
}

export const homeFeedsStatus = asyncState(LIST_HOME_FEEDS, setOnLogOut(initialAsyncState));

export function usersInHomeFeeds(state = {}, action) {
  state = setIfNotFriendsPage({})(state, action);
  switch (action.type) {
    case response(GET_USER_INFO):
    case response(UPDATE_SUBSCRIPTION): {
      return {
        ...state,
        [action.payload.users.id]: action.payload.inHomeFeeds,
      };
    }
    case UNAUTHENTICATED: {
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

export function allSubscriptions(state = [], action) {
  state = setIfNotFriendsPage([])(state, action);
  switch (action.type) {
    case response(GET_ALL_SUBSCRIPTIONS):
      return action.payload.usersInHomeFeeds;
    case response(CREATE_HOME_FEED):
    case response(UPDATE_HOME_FEED): {
      const {
        timeline: { id: feedId },
        subscribedTo,
      } = action.payload;
      return state.map((s) => {
        if (subscribedTo.includes(s.id) === s.homeFeeds.includes(feedId)) {
          return s;
        } else if (subscribedTo.includes(s.id)) {
          return { ...s, homeFeeds: [...s.homeFeeds, feedId] };
        }
        return { ...s, homeFeeds: without(s.homeFeeds, feedId) };
      });
    }
    case response(DELETE_HOME_FEED): {
      const oldId = action.request.feedId;
      const newId = action.payload.backupFeed;
      return state.map((s) => {
        if (!s.homeFeeds.includes(oldId)) {
          return s;
        }
        const homeFeeds = without(s.homeFeeds, oldId);
        homeFeeds.includes(newId) || homeFeeds.push(newId);
        return { ...s, homeFeeds };
      });
    }
    case UNAUTHENTICATED:
      return [];
  }
  return state;
}

export const allSubscriptionsStatus = asyncState(
  GET_ALL_SUBSCRIPTIONS,
  reducersChain(setIfNotFriendsPage(initialAsyncState), setOnLogOut(initialAsyncState)),
);

export const crudHomeFeedStatus = asyncState(
  [CREATE_HOME_FEED, UPDATE_HOME_FEED, DELETE_HOME_FEED],
  reducersChain(setIfNotFriendsPage(initialAsyncState), setOnLogOut(initialAsyncState)),
);

export function homeFeedsOrderVersion(state = 0, action) {
  switch (action.type) {
    case UNAUTHENTICATED: {
      return 0;
    }
    case REALTIME_USER_UPDATE: {
      if (action.homeFeeds) {
        return state + 1;
      }
      return state;
    }
    case response(CREATE_HOME_FEED):
    case response(DELETE_HOME_FEED): {
      return state + 1;
    }
  }

  return state;
}

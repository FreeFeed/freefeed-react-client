import { createStore } from 'redux'
import Immutable from 'immutable'
import _ from 'lodash'

import {userParser} from './helpers/user_parser'


export const WHO_AM_I = 'Who am I?';
export const HOME = 'Home timeline';
export const SERVER_ERROR = 'Server error';

export function whoAmIAction(authenticated, users) {
  return {
    type: WHO_AM_I,
    payload: {
      authenticated,
      users
    }
  }
}

export function serverErrorAction() {
  return {
    type: SERVER_ERROR
  }
}

export function homeAction(authenticated, posts, users) {
  return {
    type: HOME,
    payload: {
      authenticated,
      posts,
      users
    }
  }
}

let initialState = {
  got_response: false,
  server_error: false,
  authenticated: false,
  me: {
    user: {},
    subscribers: [],
    subscriptions: []
  },
  home: [],
  posts: {},
  users: {}
};

function theReducer(state, action) {
  switch (action.type) {
    case SERVER_ERROR: {
      state = state.set('server_error', true)
      break;
    }

    case WHO_AM_I: {
      let whoami = action.payload;

      state = state.set('got_response', true)
      state = state.set('authenticated', whoami.authenticated)

      if (whoami.authenticated) {
        state = state.mergeDeep({me: {user: userParser(whoami.users)}})
      }
      break;
    }

    case HOME: {
      let home_data = action.payload;

      state = state.set('got_response', true)
      state = state.set('authenticated', home_data.authenticated)

      if (home_data.authenticated) {
        let posts = home_data.posts

        if (_.isUndefined(posts)) {
          return
        }

        let ids = posts.map((post) => post.id)
        let indexed_posts = _.indexBy(posts, 'id')

        state = state.mergeDeep({
          posts: indexed_posts,
          users: _.indexBy(home_data.users.map(userParser), 'id')
        })
        state = state.set('home', ids)
      }
      break;
    }
  }

  return state;
}

let store;

export function initState(state=initialState) {
  let immutableState = Immutable.fromJS(state);
  store = createStore(theReducer, immutableState);
  return store;
}

export function getStore() {
  return store;
}

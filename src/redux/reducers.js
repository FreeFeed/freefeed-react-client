import {response, WHO_AM_I, SERVER_ERROR, UNAUTHENTICATED, HOME,
        SHOW_MORE_COMMENTS, SIGN_IN_CHANGE, SHOW_MORE_LIKES} from './action-creators'
import _ from 'lodash'
import {userParser} from '../utils'

export function signInForm(state={username:'', password:'', error:''}, action) {
  switch(action.type) {
    case SIGN_IN_CHANGE: {
      return {
        ...state,
        username: action.username || state.username,
        password: action.password || state.password,
      }
    }
    case UNAUTHENTICATED: {
      return {...state, error: (action.payload || {}).err}
    }
  }
  return state
}

export function gotResponse(state = false, action) {
  switch (action.type) {
    case response(WHO_AM_I): {
      return true
    }
    case response(HOME): {
      return true
    }
  }
  return state
}

export function serverError(state = false, action) {
  switch (action.type) {
    case SERVER_ERROR: {
      return true
    }
  }
  return state
}

export function home(state = [], action) {
  switch (action.type) {
    case response(HOME): {
      return action.payload.posts.map(post => post.id)
    }
  }
  return state
}

function updatePostData(state, action) {
  const postId = action.payload.posts.id
  let post = {}

  post[postId] = action.payload.posts

  return { ...state, ...post }
}

export function posts(state = {}, action) {
  switch (action.type) {
    case response(HOME): {
      return { ...state, ..._.indexBy(action.payload.posts, 'id') }
    }
    case response(SHOW_MORE_COMMENTS): {
      return updatePostData(state, action)
    }
    case response(SHOW_MORE_LIKES): {
      return updatePostData(state, action)
    }
  }
  return state
}

export function comments(state = {}, action) {
  switch (action.type) {
    case response(HOME): {
      return { ...state, ..._.indexBy(action.payload.comments, 'id') }
    }
    case response(SHOW_MORE_COMMENTS): {
      return { ...state, ..._.indexBy(action.payload.comments, 'id') }
    }
  }
  return state
}

function mergeWithNewUsers(state, action) {
  return { ...state, ..._.indexBy(action.payload.users, 'id') }
}

export function users(state = {}, action) {
  switch (action.type) {
    case response(HOME): {
      const userData = _.indexBy(action.payload.users.map(userParser), 'id')
      return { ...state, ...userData }
    }
    case response(SHOW_MORE_COMMENTS): {
      return mergeWithNewUsers(state, action)
    }
    case response(SHOW_MORE_LIKES): {
      return mergeWithNewUsers(state, action)
    }

  }
  return state
}

import {getToken, getPersistedUser} from '../services/auth'

export function authenticated(state = !!getToken(), action) {
   switch (action.type) {
    case response(WHO_AM_I): {
      return true
    }
    case UNAUTHENTICATED: {
      return false
    }
  }
  return state
}

//we're faking for now
import {user as defaultUserSettings} from '../config'

export function user(state = {settings: defaultUserSettings, ...getPersistedUser()}, action) {
  switch (action.type) {
    case response(WHO_AM_I): {
      return {...state, ...userParser(action.payload.users)}
    }
  }
  return state
}

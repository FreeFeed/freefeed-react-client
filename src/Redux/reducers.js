import {WHO_AM_I_RESPONSE, HOME_RESPONSE, SERVER_ERROR} from './action-creators'
import _ from 'lodash'
import {userParser} from '../Utils/user-parser'

export function gotResponse(state = false, action){
  switch (action.type) {
    case WHO_AM_I_RESPONSE: {
      return true
    }
    case HOME_RESPONSE: {
      return true
    }
  }
  return state
}

export function serverError(state = false, action){
  switch (action.type) {
    case SERVER_ERROR: {
      return true
    }
  }
  return state
}

export function home(state = [], action){
  switch (action.type) {
    case HOME_RESPONSE: {
      return action.posts.map(post => post.id)
    }
  }
  return state
}

export function posts(state = {}, action){
  switch (action.type) {
    case HOME_RESPONSE: {
      return { ...state, ..._.indexBy(action.posts, 'id') }
    }
  }
  return state
}

export function users(state = {}, action){
  switch (action.type) {
    case HOME_RESPONSE: {
      const userData = _.indexBy(action.users.map(userParser), 'id')
      return { ...state, ...userData }
    }
  }
  return state
}

export function authenticated (state = false, action){
   switch (action.type) {
    case WHO_AM_I_RESPONSE: {
      return action.authenticated
    }
  }
  return state
}

export function user (state = {}, action){
  switch (action.type) {
    case WHO_AM_I_RESPONSE: {
      if (action.authenticated) {
        return userParser(action.users)
      }
    }
  }
  return state
}

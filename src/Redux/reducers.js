import {response, WHO_AM_I, SERVER_ERROR, UNAUTHENTICATED, HOME} from './action-creators'
import _ from 'lodash'
import {userParser} from '../utils'

export function gotResponse(state = false, action){
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
    case response(HOME): {
      return action.posts.map(post => post.id)
    }
  }
  return state
}

export function posts(state = {}, action){
  switch (action.type) {
    case response(HOME): {
      return { ...state, ..._.indexBy(action.posts, 'id') }
    }
  }
  return state
}

export function users(state = {}, action){
  switch (action.type) {
    case response(HOME): {
      const userData = _.indexBy(action.users.map(userParser), 'id')
      return { ...state, ...userData }
    }
  }
  return state
}

export function authenticated (state = false, action){
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

export function user (state = {}, action){
  switch (action.type) {
    case response(WHO_AM_I): {
      return userParser(action.users)
    }
  }
  return state
}

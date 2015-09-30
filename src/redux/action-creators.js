export const SERVER_ERROR = 'SERVER_ERROR'

export function serverError(error) {
  return {
    type: SERVER_ERROR,
    error
  }
}

export const UNAUTHENTICATED = 'UNAUTHENTICATED'

export function unauthenticated(payload) {
  return {
    type: UNAUTHENTICATED,
    payload: {...payload, authToken: ''},
  }
}

export const request = (type) =>`${type}_REQUEST`
export const response = (type) => `${type}_RESPONSE`
export const fail = (type) => `${type}_FAIL`

import * as Api from '../services/api'

export const WHO_AM_I = 'WHO_AM_I'

export function whoAmI(){
  return {
    type: WHO_AM_I,
    apiRequest: Api.getWhoAmI,
  }
}

export const HOME = 'HOME'

export function home(offset = 0){
  return {
    type: HOME,
    apiRequest: Api.getHome,
    payload: {offset}
  }
}

export const SHOW_MORE_COMMENTS = 'SHOW_MORE_COMMENTS'

export function showMoreComments(postId, likesExpanded){
  return {
    type: SHOW_MORE_COMMENTS,
    apiRequest: Api.getMoreComments,
    payload: {postId, likesExpanded}
  }
}

export const SHOW_MORE_LIKES = 'SHOW_MORE_LIKES'

export function showMoreLikes(postId, commentsExpanded){
  return {
    type: SHOW_MORE_LIKES,
    apiRequest: Api.getMoreLikes,
    payload: {postId, commentsExpanded}
  }
}

export const SIGN_IN_CHANGE = 'SIGN_IN_CHANGE'

export function signInChange(username, password){
  return {
    type: SIGN_IN_CHANGE,
    username,
    password,
  }
}

export const SIGN_IN = 'SIGN_IN'

export function signIn(username, password){
  return {
    type: SIGN_IN,
    apiRequest: Api.signIn,
    payload: {
      username,
      password,
    },
  }
}

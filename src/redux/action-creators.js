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

export function requiresAuth(action) {
  return action.requireAuth
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
    requireAuth: true,
  }
}

export const HOME = 'HOME'

export function home(offset = 0){
  return {
    type: HOME,
    apiRequest: Api.getHome,
    payload: {offset},
    requireAuth: true,
  }
}

export const SHOW_MORE_COMMENTS = 'SHOW_MORE_COMMENTS'

export function showMoreComments(postId){
  return {
    type: SHOW_MORE_COMMENTS,
    apiRequest: Api.getPostWithAllCommentsAndLikes,
    payload: {postId},
    requireAuth: true,
  }
}

export const SHOW_MORE_LIKES = 'SHOW_MORE_LIKES'

export function showMoreLikes(postId){
  return {
    type: SHOW_MORE_LIKES,
    payload: {postId},
  }
}

export const SHOW_MORE_LIKES_ASYNC = 'SHOW_MORE_LIKES_ASYNC'

export function showMoreLikesAsync(postId){
  return {
    type: SHOW_MORE_LIKES_ASYNC,
    apiRequest: Api.getLikesOnly,
    payload: {postId},
    requireAuth: true,
  }
}

export const SHOW_MORE_LIKES_SYNC = 'SHOW_MORE_LIKES_SYNC'

export function showMoreLikesSync(postId){
  return {
    type: SHOW_MORE_LIKES_SYNC,
    payload: {postId},
  }
}

export const TOGGLE_EDITING_POST = 'TOGGLE_EDITING_POST'

export function toggleEditingPost(postId, newValue){
  return {
    type: TOGGLE_EDITING_POST,
    payload: {postId, newValue},
  }
}

export const CANCEL_EDITING_POST = 'CANCEL_EDITING_POST'

export function cancelEditingPost(postId, newValue){
  return {
    type: CANCEL_EDITING_POST,
    payload: {postId, newValue},
  }
}

export const SAVE_EDITING_POST = 'SAVE_EDITING_POST'

export function saveEditingPost(postId, newPost){
  return {
    type: SAVE_EDITING_POST,
    apiRequest: Api.updatePost,
    payload: {postId, newPost},
    requireAuth: true,
  }
}

export const DELETE_POST = 'DELETE_POST'

export function deletePost(postId){
  return {
    type: DELETE_POST,
    apiRequest: Api.deletePost,
    payload: {postId},
    requireAuth: true,
  }
}

export const TOGGLE_COMMENTING = 'TOGGLE_COMMENTING'

export function toggleCommenting(postId){
  return {
    type: TOGGLE_COMMENTING,
    postId,
  }
}

export const ADD_COMMENT = 'ADD_COMMENT'

export function addComment(postId, commentText){
  return {
    type: ADD_COMMENT,
    apiRequest: Api.addComment,
    payload: {
      postId,
      commentText,
    }
  }
}

export const LIKE_POST = 'LIKE_POST'

export function likePost(postId){
  return {
    type: LIKE_POST,
    postId,
  }
}

export const TOGGLE_EDITING_COMMENT = 'TOGGLE_EDITING_COMMENT'

export function toggleEditingComment(commentId){
  return {
    type: TOGGLE_EDITING_COMMENT,
    commentId,
  }
}

export const SAVE_EDITING_COMMENT = 'SAVE_EDITING_COMMENT'

export function saveEditingComment(commentId, newCommentBoby){
  return {
    type: SAVE_EDITING_COMMENT,
    apiRequest: Api.updateComment,
    payload: {commentId, newCommentBoby}
  }
}

export const DELETE_COMMENT = 'DELETE_COMMENT'

export function deleteComment(commentId){
  return {
    type: DELETE_COMMENT,
    payload: {commentId},
    apiRequest: Api.deleteComment,
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

export const UPDATE_USER = 'UPDATE_USER'

export function updateUser(id, screenName, email, isPrivate){
  return {
    type: UPDATE_USER,
    payload: {id, screenName, email, isPrivate},
    apiRequest: Api.updateUser,
  }
}

export const USER_SETTINGS_CHANGE = 'USER_SETTINGS_CHANGE'

export function userSettingsChange(payload){
  return {
    type: USER_SETTINGS_CHANGE,
    payload
  }
}
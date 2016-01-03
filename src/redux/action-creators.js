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
  return action.apiRequest && !action.nonAuthRequest
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
    payload: {offset},
  }
}

export const DISCUSSIONS = 'DISCUSSIONS'

export function discussions(offset = 0){
  return {
    type: DISCUSSIONS,
    apiRequest: Api.getDiscussions,
    payload: {offset},
  }
}

export const DIRECT = 'DIRECT'

export function direct(offset = 0){
  return {
    type: DIRECT,
    apiRequest: Api.getDirect,
    payload: {offset},
  }
}

export const GET_USER_FEED = 'GET_USER_FEED'

export function getUserFeed(username, offset = 0){
  return {
    type: GET_USER_FEED,
    apiRequest: Api.getUserFeed,
    payload: {username, offset},
  }
}

export const SHOW_MORE_COMMENTS = 'SHOW_MORE_COMMENTS'

export function showMoreComments(postId){
  return {
    type: SHOW_MORE_COMMENTS,
    apiRequest: Api.getPostWithAllCommentsAndLikes,
    payload: {postId},
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
  }
}

export const DELETE_POST = 'DELETE_POST'

export function deletePost(postId){
  return {
    type: DELETE_POST,
    apiRequest: Api.deletePost,
    payload: {postId},
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

export function likePost(postId, userId){
  return {
    type: LIKE_POST,
    apiRequest: Api.likePost,
    payload: {
      postId,
      userId
    }
  }
}

export const UNLIKE_POST = 'UNLIKE_POST'

export function unlikePost(postId, userId){
  return {
    type: UNLIKE_POST,
    apiRequest: Api.unlikePost,
    payload: {
      postId,
      userId
    }
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

export function saveEditingComment(commentId, newCommentBody){
  return {
    type: SAVE_EDITING_COMMENT,
    apiRequest: Api.updateComment,
    payload: {commentId, newCommentBody}
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

export const CREATE_POST = 'CREATE_POST'

export function createPost(postText, feeds, attachmentIds) {
  return {
    type: CREATE_POST,
    payload: {postText, feeds, attachmentIds},
    apiRequest: Api.createPost
  }
}

export const ADD_ATTACHMENT_RESPONSE = 'ADD_ATTACHMENT_RESPONSE'

export function addAttachmentResponse(postId, attachments) {
  return {
    type: ADD_ATTACHMENT_RESPONSE,
    payload: {postId, attachments}
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
    nonAuthRequest: true,
    payload: {
      username,
      password,
    },
  }
}

export const SIGN_IN_EMPTY = 'SIGN_IN_EMPTY'

export function signInEmpty(){
  return {
    type: SIGN_IN_EMPTY
  }
}

export const SIGN_UP_CHANGE = 'SIGN_UP_CHANGE'

export function signUpChange(signUpData){
  return {
    type: SIGN_UP_CHANGE,
    ...signUpData,
  }
}

export const SIGN_UP = 'SIGN_UP'

export function signUp(signUpData){
  return {
    type: SIGN_UP,
    apiRequest: Api.signUp,
    nonAuthRequest: true,
    payload: { ...signUpData },
  }
}

export const SIGN_UP_EMPTY = 'SIGN_UP_EMPTY'

export function signUpEmpty(errorMessage){
  return {
    type: SIGN_UP_EMPTY,
    message: errorMessage
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
    payload,
  }
}

export const UPDATE_PASSWORD = 'UPDATE_PASSWORD'

export function updatePassword(payload){
  return {
    type: UPDATE_PASSWORD,
    apiRequest: Api.updatePassword,
    payload,
  }
}

export const UPDATE_USER_PHOTO = 'UPDATE_USER_PHOTO'

export function updateUserPhoto(picture){
  return {
    type: UPDATE_USER_PHOTO,
    apiRequest: Api.updateProfilePicture,
    payload: {picture},
  }
}

export const GET_SINGLE_POST = 'GET_SINGLE_POST'

export function getSinglePost(postId){
  return {
    type: GET_SINGLE_POST,
    apiRequest: Api.getPostWithAllCommentsAndLikes,
    payload: {postId},
  }
}

const userChangeAction = (type, apiRequest) => (payload) => {
  return {
    payload,
    type,
    apiRequest,
  }
}

export const BAN = 'BAN'

export const ban = userChangeAction(BAN, Api.ban)

export const UNBAN = 'UNBAN'

export const unban = userChangeAction(UNBAN, Api.unban)

export const SUBSCRIBE = 'SUBSCRIBE'

export const subscribe = userChangeAction(SUBSCRIBE, Api.subscribe)

export const UNSUBSCRIBE = 'UNSUBSCRIBE'

export const unsubscribe = userChangeAction(UNSUBSCRIBE, Api.unsubscribe)

export const GET_USER_COMMENTS = 'GET_USER_COMMENTS'

export function getUserComments(username, offset = 0){
  return {
    type: GET_USER_COMMENTS,
    payload:{username, offset},
    apiRequest: Api.getUserComments,
  }
}

export const GET_USER_LIKES = 'GET_USER_LIKES'

export function getUserLikes(username, offset = 0){
  return {
    type: GET_USER_LIKES,
    payload:{username, offset},
    apiRequest: Api.getUserLikes,
  }
}

export const EXPAND_SEND_TO = 'EXPAND_SEND_TO'

export function expandSendTo(){
  return {
    type: EXPAND_SEND_TO
  }
}

export const feedGeneratingActions = [HOME, DISCUSSIONS, GET_USER_FEED, GET_USER_COMMENTS, GET_USER_LIKES, DIRECT]
export const feedRequests = feedGeneratingActions.map(request)
export const feedResponses = feedGeneratingActions.map(response)
export const feedFails = feedGeneratingActions.map(fail)
export const isFeedRequest = action => feedRequests.indexOf(action.type) !== -1
export const isFeedResponse = action => feedResponses.indexOf(action.type) !== -1
export const isFeedFail = action => feedFails.indexOf(action.type) !== -1

export const userChangeActions = [SUBSCRIBE, UNSUBSCRIBE]
export const userChangeResponses = userChangeActions.map(response)
export const isUserChangeResponse = action => userChangeResponses.indexOf(action.type) !== -1

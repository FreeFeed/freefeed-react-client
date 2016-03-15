import * as ActionTypes from './action-types'

export function serverError(error) {
  return {
    type: ActionTypes.SERVER_ERROR,
    error
  }
}

export function unauthenticated(payload) {
  return {
    type: ActionTypes.UNAUTHENTICATED,
    payload: {...payload, authToken: ''},
  }
}

import * as Api from '../services/api'

export function whoAmI() {
  return {
    type: ActionTypes.WHO_AM_I,
    apiRequest: Api.getWhoAmI,
  }
}

export function home(offset = 0) {
  return {
    type: ActionTypes.HOME,
    apiRequest: Api.getHome,
    payload: {offset},
  }
}

export function discussions(offset = 0) {
  return {
    type: ActionTypes.DISCUSSIONS,
    apiRequest: Api.getDiscussions,
    payload: {offset},
  }
}

export function direct(offset = 0) {
  return {
    type: ActionTypes.DIRECT,
    apiRequest: Api.getDirect,
    payload: {offset},
  }
}

export function getUserFeed(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_FEED,
    apiRequest: Api.getUserFeed,
    nonAuthRequest: true,
    payload: {username, offset},
  }
}

export function showMoreComments(postId) {
  return {
    type: ActionTypes.SHOW_MORE_COMMENTS,
    apiRequest: Api.getPostWithAllComments,
    nonAuthRequest: true,
    payload: {postId},
  }
}

export function showMoreLikes(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES,
    payload: {postId},
  }
}

export function showMoreLikesAsync(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES_ASYNC,
    apiRequest: Api.getLikesOnly,
    nonAuthRequest: true,
    payload: {postId},
  }
}

export function showMoreLikesSync(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES_SYNC,
    payload: {postId},
  }
}

export function toggleEditingPost(postId, newValue) {
  return {
    type: ActionTypes.TOGGLE_EDITING_POST,
    payload: {postId, newValue},
  }
}

export function cancelEditingPost(postId, newValue) {
  return {
    type: ActionTypes.CANCEL_EDITING_POST,
    payload: {postId, newValue},
  }
}

export function saveEditingPost(postId, newPost) {
  return {
    type: ActionTypes.SAVE_EDITING_POST,
    apiRequest: Api.updatePost,
    payload: {postId, newPost},
  }
}

export function deletePost(postId) {
  return {
    type: ActionTypes.DELETE_POST,
    apiRequest: Api.deletePost,
    payload: {postId},
  }
}

export function toggleCommenting(postId) {
  return {
    type: ActionTypes.TOGGLE_COMMENTING,
    postId,
  }
}

export function updateCommentingText(postId, commentText) {
  return {
    type: ActionTypes.UPDATE_COMMENTING_TEXT,
    postId,
    commentText
  }
}

export function addComment(postId, commentText) {
  return {
    type: ActionTypes.ADD_COMMENT,
    apiRequest: Api.addComment,
    payload: {
      postId,
      commentText,
    }
  }
}

export function likePost(postId, userId) {
  return {
    type: ActionTypes.LIKE_POST,
    apiRequest: Api.likePost,
    payload: {
      postId,
      userId
    }
  }
}

export function unlikePost(postId, userId) {
  return {
    type: ActionTypes.UNLIKE_POST,
    apiRequest: Api.unlikePost,
    payload: {
      postId,
      userId
    }
  }
}

export function hidePost(postId) {
  return {
    type: ActionTypes.HIDE_POST,
    apiRequest: Api.hidePost,
    payload: {
      postId
    }
  }
}

export function unhidePost(postId) {
  return {
    type: ActionTypes.UNHIDE_POST,
    apiRequest: Api.unhidePost,
    payload: {
      postId
    }
  }
}

export function toggleModeratingComments(postId) {
  return {
    type: ActionTypes.TOGGLE_MODERATING_COMMENTS,
    postId
  }
}

export function disableComments(postId) {
  return {
    type: ActionTypes.DISABLE_COMMENTS,
    apiRequest: Api.disableComments,
    payload: {
      postId
    }
  }
}

export function enableComments(postId) {
  return {
    type: ActionTypes.ENABLE_COMMENTS,
    apiRequest: Api.enableComments,
    payload: {
      postId
    }
  }
}

export function toggleEditingComment(commentId) {
  return {
    type: ActionTypes.TOGGLE_EDITING_COMMENT,
    commentId,
  }
}

export function saveEditingComment(commentId, newCommentBody) {
  return {
    type: ActionTypes.SAVE_EDITING_COMMENT,
    apiRequest: Api.updateComment,
    payload: {commentId, newCommentBody}
  }
}

export function deleteComment(commentId) {
  return {
    type: ActionTypes.DELETE_COMMENT,
    apiRequest: Api.deleteComment,
    payload: {commentId},
  }
}

export function createPost(feeds, postText, attachmentIds, more) {
  return {
    type: ActionTypes.CREATE_POST,
    apiRequest: Api.createPost,
    payload: {feeds, postText, attachmentIds, more},
  }
}

export function addAttachmentResponse(postId, attachments) {
  return {
    type: ActionTypes.ADD_ATTACHMENT_RESPONSE,
    payload: {postId, attachments}
  }
}

export function removeAttachment(postId, attachmentId) {
  return {
    type: ActionTypes.REMOVE_ATTACHMENT,
    payload: {postId, attachmentId}
  }
}

export function signInChange(username, password) {
  return {
    type: ActionTypes.SIGN_IN_CHANGE,
    username,
    password,
  }
}

export function signIn(username, password) {
  return {
    type: ActionTypes.SIGN_IN,
    apiRequest: Api.signIn,
    nonAuthRequest: true,
    payload: {
      username,
      password,
    },
  }
}

export function signInEmpty() {
  return {
    type: ActionTypes.SIGN_IN_EMPTY
  }
}

export function signUpChange(signUpData) {
  return {
    type: ActionTypes.SIGN_UP_CHANGE,
    ...signUpData,
  }
}

export function signUp(signUpData) {
  return {
    type: ActionTypes.SIGN_UP,
    apiRequest: Api.signUp,
    nonAuthRequest: true,
    payload: { ...signUpData },
  }
}

export function signUpEmpty(errorMessage) {
  return {
    type: ActionTypes.SIGN_UP_EMPTY,
    message: errorMessage
  }
}

export function updateUser(id, screenName, email, isPrivate, description) {
  return {
    type: ActionTypes.UPDATE_USER,
    apiRequest: Api.updateUser,
    payload: {id, screenName, email, isPrivate, description},
  }
}

export function userSettingsChange(payload) {
  return {
    type: ActionTypes.USER_SETTINGS_CHANGE,
    payload,
  }
}

export function updateFrontendPreferences(userId, prefs) {
  return {
    type: ActionTypes.UPDATE_FRONTEND_PREFERENCES,
    apiRequest: Api.updateFrontendPreferences,
    payload: {userId, prefs}
  }
}

export function updateFrontendRealtimePreferences(userId, realtimePrefs) {
  return {
    type: ActionTypes.UPDATE_FRONTEND_REALTIME_PREFERENCES,
    apiRequest: Api.updateFrontendPreferences,
    payload: {userId,
      prefs: realtimePrefs,
    }
  }
}

export function updatePassword(payload) {
  return {
    type: ActionTypes.UPDATE_PASSWORD,
    apiRequest: Api.updatePassword,
    payload,
  }
}

export function updateUserPhoto(picture) {
  return {
    type: ActionTypes.UPDATE_USER_PHOTO,
    apiRequest: Api.updateProfilePicture,
    payload: {picture},
  }
}

export function getSinglePost(postId) {
  return {
    type: ActionTypes.GET_SINGLE_POST,
    apiRequest: Api.getPostWithAllComments,
    nonAuthRequest: true,
    payload: {postId},
  }
}

const userChangeAction = (type, apiRequest) => (payload) => {
  return {
    type,
    apiRequest,
    payload,
  }
}

export const ban = userChangeAction(ActionTypes.BAN, Api.ban)
export const unban = userChangeAction(ActionTypes.UNBAN, Api.unban)
export const subscribe = userChangeAction(ActionTypes.SUBSCRIBE, Api.subscribe)
export const unsubscribe = userChangeAction(ActionTypes.UNSUBSCRIBE, Api.unsubscribe)
export const sendSubscriptionRequest = userChangeAction(ActionTypes.SEND_SUBSCRIPTION_REQUEST, Api.sendSubscriptionRequest)

export function getUserComments(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_COMMENTS,
    apiRequest: Api.getUserComments,
    nonAuthRequest: true,
    payload: {username, offset},
  }
}

export function getUserLikes(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_LIKES,
    apiRequest: Api.getUserLikes,
    nonAuthRequest: true,
    payload: {username, offset},
  }
}

export function expandSendTo() {
  return {
    type: ActionTypes.EXPAND_SEND_TO
  }
}

export function toggleHiddenPosts() {
  return {
    type: ActionTypes.TOGGLE_HIDDEN_POSTS
  }
}

export function subscribers(username) {
  return {
    type: ActionTypes.SUBSCRIBERS,
    apiRequest: Api.getSubscribers,
    payload: {username},
  }
}

export function subscriptions(username) {
  return {
    type: ActionTypes.SUBSCRIPTIONS,
    apiRequest: Api.getSubscriptions,
    payload: {username},
  }
}

export function getUserInfo(username) {
  return {
    type: ActionTypes.GET_USER_INFO,
    apiRequest: Api.getUserInfo,
    payload: {username},
  }
}

export function createGroup(username, screenName, description) {
  return {
    type: ActionTypes.CREATE_GROUP,
    payload: {username, screenName, description},
    apiRequest: Api.createGroup
  }
}

export function updateGroup(id, screenName, description) {
  return {
    type: ActionTypes.UPDATE_GROUP,
    payload: {id, screenName, description},
    apiRequest: Api.updateGroup
  }
}

export function resetGroupCreateForm() {
  return {
    type: ActionTypes.RESET_GROUP_CREATE_FORM
  }
}

export function toggleRealtime() {
  return {
    type: ActionTypes.TOGGLE_REALTIME,
  }
}

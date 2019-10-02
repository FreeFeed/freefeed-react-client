import * as Api from '../services/api';
import * as ActionTypes from './action-types';
import { reset } from './action-helpers';

export function unauthenticated(payload) {
  return {
    type: ActionTypes.UNAUTHENTICATED,
    payload: { ...payload, authToken: '' },
  };
}

export function staticPage(title) {
  return {
    type: ActionTypes.STATIC_PAGE,
    payload: { title },
  };
}

export function requireAuthentication() {
  return { type: ActionTypes.REQUIRE_AUTHENTICATION };
}

export function whoAmI() {
  return {
    type: ActionTypes.WHO_AM_I,
    apiRequest: Api.getWhoAmI,
  };
}

export function markAllDirectsAsRead() {
  return {
    type: ActionTypes.DIRECTS_ALL_READ,
    apiRequest: Api.markAllDirectsAsRead,
  };
}

export function markAllNotificationsAsRead() {
  return {
    type: ActionTypes.NOTIFICATIONS_ALL_READ,
    apiRequest: Api.markAllNotificationsAsRead,
  };
}

export function home(offset = 0) {
  return {
    type: ActionTypes.HOME,
    apiRequest: Api.getHome,
    payload: { offset },
  };
}

export function getMemories(_from, offset = 0) {
  return {
    type: ActionTypes.MEMORIES,
    apiRequest: Api.getMemories,
    payload: {
      from: _from,
      offset,
    },
  };
}

export function discussions(offset = 0) {
  return {
    type: ActionTypes.DISCUSSIONS,
    apiRequest: Api.getDiscussions,
    payload: { offset },
  };
}

export function saves(offset = 0) {
  return {
    type: ActionTypes.SAVES,
    apiRequest: Api.getSaves,
    payload: { offset },
  };
}

export function direct(offset = 0) {
  return {
    type: ActionTypes.DIRECT,
    apiRequest: Api.getDirect,
    payload: { offset },
  };
}

export function getUserFeed(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_FEED,
    apiRequest: Api.getUserFeed,
    nonAuthRequest: true,
    payload: { username, offset },
  };
}

export function getNotifications(offset = 0, filter = '') {
  return {
    type: ActionTypes.GET_NOTIFICATIONS,
    apiRequest: Api.getNotifications,
    payload: {
      offset,
      filter,
    },
  };
}

export function showMoreComments(postId) {
  return {
    type: ActionTypes.SHOW_MORE_COMMENTS,
    apiRequest: Api.getPost,
    nonAuthRequest: true,
    payload: { postId, maxComments: 'all' },
  };
}

export function showMoreLikes(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES,
    payload: { postId },
  };
}

export function showMoreLikesAsync(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES_ASYNC,
    apiRequest: Api.getLikesOnly,
    nonAuthRequest: true,
    payload: { postId },
  };
}

export function showMoreLikesSync(postId) {
  return {
    type: ActionTypes.SHOW_MORE_LIKES_SYNC,
    payload: { postId },
  };
}

export function toggleEditingPost(postId) {
  return {
    type: ActionTypes.TOGGLE_EDITING_POST,
    payload: { postId },
  };
}

export function cancelEditingPost(postId) {
  return {
    type: ActionTypes.CANCEL_EDITING_POST,
    payload: { postId },
  };
}

export function saveEditingPost(postId, newPost) {
  return {
    type: ActionTypes.SAVE_EDITING_POST,
    apiRequest: Api.updatePost,
    payload: { postId, newPost },
  };
}

export function deletePost(postId) {
  return {
    type: ActionTypes.DELETE_POST,
    apiRequest: Api.deletePost,
    payload: { postId },
  };
}

export function toggleCommenting(postId) {
  return {
    type: ActionTypes.TOGGLE_COMMENTING,
    postId,
  };
}

export function updateCommentingText(postId, commentText) {
  return {
    type: ActionTypes.UPDATE_COMMENTING_TEXT,
    postId,
    commentText,
  };
}

export function addComment(postId, commentText) {
  return {
    type: ActionTypes.ADD_COMMENT,
    apiRequest: Api.addComment,
    payload: {
      postId,
      commentText,
    },
  };
}

export function likePost(postId, userId) {
  return {
    type: ActionTypes.LIKE_POST_OPTIMISTIC,
    payload: {
      postId,
      userId,
    },
  };
}

export function likePostRequest(postId, userId) {
  return {
    type: ActionTypes.LIKE_POST,
    apiRequest: Api.likePost,
    payload: {
      postId,
      userId,
    },
  };
}

export function unlikePost(postId, userId) {
  return {
    type: ActionTypes.UNLIKE_POST_OPTIMISTIC,
    payload: {
      postId,
      userId,
    },
  };
}

export function unlikePostRequest(postId, userId) {
  return {
    type: ActionTypes.UNLIKE_POST,
    apiRequest: Api.unlikePost,
    payload: {
      postId,
      userId,
    },
  };
}

export function cleanLikeError(postId) {
  return {
    type: ActionTypes.CLEAN_LIKE_ERROR,
    postId,
  };
}

export function hidePost(postId) {
  return {
    type: ActionTypes.HIDE_POST,
    apiRequest: Api.hidePost,
    payload: { postId },
  };
}

export function unhidePost(postId) {
  return {
    type: ActionTypes.UNHIDE_POST,
    apiRequest: Api.unhidePost,
    payload: { postId },
  };
}

export function savePost(postId, save) {
  return {
    type: ActionTypes.SAVE_POST,
    apiRequest: save ? Api.savePost : Api.unsavePost,
    payload: { postId, save },
  };
}

export function toggleModeratingComments(postId) {
  return {
    type: ActionTypes.TOGGLE_MODERATING_COMMENTS,
    postId,
  };
}

export function disableComments(postId) {
  return {
    type: ActionTypes.DISABLE_COMMENTS,
    apiRequest: Api.disableComments,
    payload: { postId },
  };
}

export function enableComments(postId) {
  return {
    type: ActionTypes.ENABLE_COMMENTS,
    apiRequest: Api.enableComments,
    payload: { postId },
  };
}

export function toggleEditingComment(commentId) {
  return {
    type: ActionTypes.TOGGLE_EDITING_COMMENT,
    commentId,
  };
}

export function saveEditingComment(commentId, newCommentBody) {
  return {
    type: ActionTypes.SAVE_EDITING_COMMENT,
    apiRequest: Api.updateComment,
    payload: { commentId, newCommentBody },
  };
}

export function likeComment(commentId) {
  return {
    type: ActionTypes.LIKE_COMMENT,
    apiRequest: Api.likeComment,
    payload: { commentId },
  };
}

export function unlikeComment(commentId) {
  return {
    type: ActionTypes.UNLIKE_COMMENT,
    apiRequest: Api.unlikeComment,
    payload: { commentId },
  };
}

export function getCommentLikes(commentId) {
  return {
    type: ActionTypes.GET_COMMENT_LIKES,
    apiRequest: Api.getCommentLikes,
    nonAuthRequest: true,
    payload: { commentId },
  };
}

export function deleteComment(commentId) {
  return {
    type: ActionTypes.DELETE_COMMENT,
    apiRequest: Api.deleteComment,
    payload: { commentId },
  };
}

export function createPost(feeds, postText, attachmentIds, more) {
  return {
    type: ActionTypes.CREATE_POST,
    apiRequest: Api.createPost,
    payload: { feeds, postText, attachmentIds, more },
  };
}

export function createBookmarkletPost(feeds, postText, imageUrls, commentText) {
  return {
    type: ActionTypes.CREATE_POST,
    apiRequest: Api.createBookmarkletPost,
    payload: { feeds, postText, imageUrls, commentText },
  };
}

export function addAttachmentResponse(postId, attachments) {
  return {
    type: ActionTypes.ADD_ATTACHMENT_RESPONSE,
    payload: { postId, attachments },
  };
}

export function signInChange(username, password) {
  return {
    type: ActionTypes.SIGN_IN_CHANGE,
    username,
    password,
  };
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
  };
}

export function restorePassword(mail) {
  return {
    type: ActionTypes.RESTORE_PASSWORD,
    apiRequest: Api.restorePassword,
    nonAuthRequest: true,
    payload: { mail },
  };
}

export function resetPassword(password, token) {
  return {
    type: ActionTypes.RESET_PASSWORD,
    apiRequest: Api.resetPassword,
    nonAuthRequest: true,
    payload: {
      password,
      token,
    },
  };
}

export function resetPasswordValidationFail(error) {
  return {
    type: ActionTypes.RESET_PASSWORD_VALIDATION_FAIL,
    error,
  };
}

export function signInEmpty() {
  return { type: ActionTypes.SIGN_IN_EMPTY };
}

export function signUpChange(signUpData) {
  return {
    type: ActionTypes.SIGN_UP_CHANGE,
    ...signUpData,
  };
}

export function signUp(signUpData) {
  return {
    type: ActionTypes.SIGN_UP,
    apiRequest: Api.signUp,
    nonAuthRequest: true,
    payload: { ...signUpData },
  };
}

export function signUpEmpty(errorMessage) {
  return {
    type: ActionTypes.SIGN_UP_EMPTY,
    message: errorMessage,
  };
}

export function updateUser(
  id,
  screenName,
  email,
  isPrivate,
  isProtected,
  description,
  frontendPrefs = undefined,
  backendPrefs = undefined,
) {
  return {
    type: ActionTypes.UPDATE_USER,
    apiRequest: Api.updateUser,
    payload: {
      id,
      screenName,
      email,
      isPrivate,
      isProtected,
      description,
      frontendPrefs,
      backendPrefs,
    },
  };
}

export function userSettingsChange(payload) {
  return {
    type: ActionTypes.USER_SETTINGS_CHANGE,
    payload,
  };
}

export function updateUserPreferences(
  userId,
  frontendPrefs = {},
  backendPrefs = {},
  suppressStatus = false,
) {
  return {
    type: ActionTypes.UPDATE_USER_PREFERENCES,
    apiRequest: Api.updateUserPreferences,
    payload: { userId, frontendPrefs, backendPrefs },
    extra: { suppressStatus },
  };
}

export function updateUserNotificationPreferences(userId, backendPrefs) {
  return {
    type: ActionTypes.UPDATE_USER_NOTIFICATION_PREFERENCES,
    apiRequest: Api.updateUserPreferences,
    payload: { userId, backendPrefs },
  };
}

export function updatePassword(payload) {
  return {
    type: ActionTypes.UPDATE_PASSWORD,
    apiRequest: Api.updatePassword,
    payload,
  };
}

export function updateUserPicture(picture) {
  return {
    type: ActionTypes.UPDATE_USER_PICTURE,
    apiRequest: Api.updateUserPicture,
    payload: { picture },
  };
}

export function getSinglePost(postId) {
  return {
    type: ActionTypes.GET_SINGLE_POST,
    apiRequest: Api.getPost,
    nonAuthRequest: true,
    payload: { postId, maxComments: 'all' },
  };
}

export function getPostIdByOldName(oldName) {
  return {
    type: ActionTypes.GET_POST_ID_BY_OLD_NAME,
    apiRequest: Api.getPostIdByOldName,
    nonAuthRequest: true,
    payload: { oldName },
  };
}

const userChangeAction = (type, apiRequest) => (payload) => {
  return {
    type,
    apiRequest,
    payload,
  };
};

export const ban = userChangeAction(ActionTypes.BAN, Api.ban);
export const unban = userChangeAction(ActionTypes.UNBAN, Api.unban);
export const subscribe = userChangeAction(ActionTypes.SUBSCRIBE, Api.subscribe);
export const unsubscribe = userChangeAction(ActionTypes.UNSUBSCRIBE, Api.unsubscribe);
export const sendSubscriptionRequest = userChangeAction(
  ActionTypes.SEND_SUBSCRIPTION_REQUEST,
  Api.sendSubscriptionRequest,
);

export function getUserComments(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_COMMENTS,
    apiRequest: Api.getUserComments,
    nonAuthRequest: true,
    payload: { username, offset },
  };
}

export function getUserLikes(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_LIKES,
    apiRequest: Api.getUserLikes,
    nonAuthRequest: true,
    payload: { username, offset },
  };
}

export function getUserMemories(username, from, offset = 0) {
  return {
    type: ActionTypes.GET_USER_MEMORIES,
    apiRequest: Api.getUserMemories,
    nonAuthRequest: true,
    payload: { username, from, offset },
  };
}

export function expandSendTo() {
  return { type: ActionTypes.EXPAND_SEND_TO };
}

export function toggleHiddenPosts() {
  return { type: ActionTypes.TOGGLE_HIDDEN_POSTS };
}

export function subscribers(username) {
  return {
    type: ActionTypes.SUBSCRIBERS,
    apiRequest: Api.getSubscribers,
    payload: { username },
  };
}

export function subscriptions(username) {
  return {
    type: ActionTypes.SUBSCRIPTIONS,
    apiRequest: Api.getSubscriptions,
    payload: { username },
  };
}

export function getUserInfo(username) {
  return {
    type: ActionTypes.GET_USER_INFO,
    apiRequest: Api.getUserInfo,
    payload: { username },
  };
}

export function createGroup(groupSettings) {
  return {
    type: ActionTypes.CREATE_GROUP,
    payload: groupSettings,
    apiRequest: Api.createGroup,
  };
}

export function updateGroup(id, groupSettings) {
  return {
    type: ActionTypes.UPDATE_GROUP,
    payload: { id, groupSettings },
    apiRequest: Api.updateGroup,
  };
}

export function updateGroupPicture(groupName, file) {
  return {
    type: ActionTypes.UPDATE_GROUP_PICTURE,
    payload: { groupName, file },
    apiRequest: Api.updateGroupPicture,
  };
}

export function acceptGroupRequest(groupName, userName) {
  return {
    type: ActionTypes.ACCEPT_GROUP_REQUEST,
    payload: { groupName, userName },
    apiRequest: Api.acceptGroupRequest,
  };
}

export function rejectGroupRequest(groupName, userName) {
  return {
    type: ActionTypes.REJECT_GROUP_REQUEST,
    payload: { groupName, userName },
    apiRequest: Api.rejectGroupRequest,
  };
}

export function acceptUserRequest(userName) {
  return {
    type: ActionTypes.ACCEPT_USER_REQUEST,
    payload: { userName },
    apiRequest: Api.acceptUserRequest,
  };
}

export function rejectUserRequest(userName) {
  return {
    type: ActionTypes.REJECT_USER_REQUEST,
    payload: { userName },
    apiRequest: Api.rejectUserRequest,
  };
}

export function resetPostCreateForm() {
  return { type: ActionTypes.RESET_POST_CREATE_FORM };
}

export function resetGroupCreateForm() {
  return { type: ActionTypes.RESET_GROUP_CREATE_FORM };
}

export function resetGroupUpdateForm() {
  return { type: ActionTypes.RESET_GROUP_UPDATE_FORM };
}

export function toggleRealtime() {
  return { type: ActionTypes.TOGGLE_REALTIME };
}

export function unsubscribeFromGroup(groupName, userName) {
  return {
    type: ActionTypes.UNSUBSCRIBE_FROM_GROUP,
    payload: { groupName, userName },
    apiRequest: Api.unsubscribeFromGroup,
  };
}

export function makeGroupAdmin(groupName, user) {
  return {
    type: ActionTypes.MAKE_GROUP_ADMIN,
    payload: { groupName, user },
    apiRequest: Api.makeGroupAdmin,
  };
}

export function unadminGroupAdmin(groupName, user, isItMe) {
  return {
    type: ActionTypes.UNADMIN_GROUP_ADMIN,
    payload: { groupName, user, isItMe },
    apiRequest: Api.unadminGroupAdmin,
  };
}

export function revokeSentRequest(userName) {
  return {
    type: ActionTypes.REVOKE_USER_REQUEST,
    payload: { userName },
    apiRequest: Api.revokeSentRequest,
  };
}

export function archiveRestoreActivity() {
  return {
    type: ActionTypes.ARCHIVE_ACTIVITY_REQUEST,
    apiRequest: Api.archiveRestoreActivity,
  };
}

export function archiveStartRestoration(params) {
  return {
    type: ActionTypes.ARCHIVE_RESTORATION_REQUEST,
    apiRequest: Api.archiveStartRestoration,
    payload: params,
  };
}

export function highlightComment(postId, author, arrows, baseCommentId) {
  return {
    type: ActionTypes.HIGHLIGHT_COMMENT,
    postId,
    author,
    arrows,
    baseCommentId,
  };
}

export function clearHighlightComment() {
  return { type: ActionTypes.CLEAR_HIGHLIGHT_COMMENT };
}

export function blockedByMe() {
  return {
    type: ActionTypes.BLOCKED_BY_ME,
    apiRequest: Api.getBlockedByMe,
  };
}

export function getSummary(days = 7) {
  return {
    type: ActionTypes.GET_SUMMARY,
    apiRequest: Api.getSummary,
    payload: { days },
  };
}

export function getUserSummary(username, days = 7) {
  return {
    type: ActionTypes.GET_USER_SUMMARY,
    apiRequest: Api.getUserSummary,
    nonAuthRequest: true,
    payload: { username, days },
  };
}

export function getSearch(search, offset) {
  return {
    type: ActionTypes.GET_SEARCH,
    apiRequest: Api.getSearch,
    nonAuthRequest: true,
    payload: { search, offset },
  };
}

export function getBestOf(offset) {
  return {
    type: ActionTypes.GET_BEST_OF,
    apiRequest: Api.getBestOf,
    nonAuthRequest: true,
    payload: { offset },
  };
}

export function getEverything(offset) {
  return {
    type: ActionTypes.GET_EVERYTHING,
    apiRequest: Api.getEverything,
    nonAuthRequest: true,
    payload: { offset },
  };
}

export function resetSettingsForms() {
  return { type: ActionTypes.RESET_SETTINGS_FORMS };
}

export function resetArchiveForms() {
  return { type: ActionTypes.RESET_ARCHIVE_FORMS };
}

export function realtimeConnected() {
  return { type: ActionTypes.REALTIME_CONNECTED };
}

export function realtimeSubscribe(...rooms) {
  return {
    type: ActionTypes.REALTIME_SUBSCRIBE,
    payload: { rooms },
  };
}

export function realtimeUnsubscribe(...rooms) {
  return {
    type: ActionTypes.REALTIME_UNSUBSCRIBE,
    payload: { rooms },
  };
}

export function realtimeIncomingEvent(event, data) {
  return {
    type: ActionTypes.REALTIME_INCOMING_EVENT,
    payload: { event, data },
  };
}

export function sendInvite(groupId) {
  return {
    type: ActionTypes.SEND_INVITE,
    groupId,
  };
}

export function createFreefeedInvitation(message, lang, singleUse, users, groups) {
  return {
    type: ActionTypes.CREATE_FREEFEED_INVITATION,
    apiRequest: Api.createFreefeedInvitation,
    payload: {
      message,
      lang,
      singleUse,
      users,
      groups,
    },
  };
}

export function getInvitation(invitationId) {
  return {
    type: ActionTypes.GET_INVITATION,
    apiRequest: Api.getInvitation,
    nonAuthRequest: true,
    payload: { invitationId },
  };
}

export function serverTimeAhead(delta) {
  return {
    type: ActionTypes.SERVER_TIME_AHEAD,
    payload: delta,
  };
}

export function toggleFeedSort() {
  return { type: ActionTypes.TOGGLE_FEED_SORT };
}

/**
 * @param {'dark'|'light'|'no-preference'} scheme
 */
export function setSystemColorScheme(scheme) {
  return { type: ActionTypes.SET_SYSTEM_COLOR_SCHEME, payload: scheme };
}

/**
 * @param {'dark'|'light'|'system'} scheme
 */
export function setUserColorScheme(scheme) {
  return { type: ActionTypes.SET_USER_COLOR_SCHEME, payload: scheme };
}

export function getAppTokens() {
  return {
    type: ActionTypes.GET_APP_TOKENS,
    apiRequest: Api.getAppTokens,
  };
}

export function getAppTokensScopes() {
  return {
    type: ActionTypes.GET_APP_TOKENS_SCOPES,
    apiRequest: Api.getAppTokensScopes,
  };
}

export function createAppToken(params) {
  return {
    type: ActionTypes.CREATE_APP_TOKEN,
    apiRequest: Api.createAppToken,
    payload: params,
  };
}

export function createAppTokenReset() {
  return { type: reset(ActionTypes.CREATE_APP_TOKEN) };
}

export function reissueAppToken(tokenId) {
  return {
    type: ActionTypes.REISSUE_APP_TOKEN,
    apiRequest: Api.reissueAppToken,
    payload: tokenId,
  };
}

export function deleteAppToken(tokenId) {
  return {
    type: ActionTypes.DELETE_APP_TOKEN,
    apiRequest: Api.deleteAppToken,
    payload: tokenId,
  };
}

export function deleteAppTokenId(tokenId) {
  return {
    type: ActionTypes.DELETE_APP_TOKEN_ID,
    payload: tokenId,
  };
}

export function updateAppToken(tokenId, params) {
  return {
    type: ActionTypes.UPDATE_APP_TOKEN,
    apiRequest: Api.updateAppToken,
    payload: { tokenId, ...params },
  };
}

export function userCardClosing(userId) {
  return {
    type: ActionTypes.USER_CARD_CLOSING,
    payload: { userId },
  };
}

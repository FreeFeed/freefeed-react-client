import * as ActionTypes from './action-types';
import { reset } from './action-helpers';
import { response } from './async-helpers';

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
  return { type: ActionTypes.WHO_AM_I };
}

export function initialWhoAmI() {
  return { type: ActionTypes.INITIAL_WHO_AM_I };
}

export function markAllDirectsAsRead() {
  return { type: ActionTypes.DIRECTS_ALL_READ };
}

export function markAllNotificationsAsRead() {
  return { type: ActionTypes.NOTIFICATIONS_ALL_READ };
}

export function home(offset = 0) {
  return {
    type: ActionTypes.HOME,
    payload: { offset },
  };
}

export function homeAux(offset = 0, feedId = null) {
  return {
    type: ActionTypes.HOME_AUX,
    payload: { offset, feedId },
  };
}

export function getMemories(_from, offset = 0) {
  return {
    type: ActionTypes.MEMORIES,
    payload: {
      from: _from,
      offset,
    },
  };
}

export function discussions(offset = 0) {
  return {
    type: ActionTypes.DISCUSSIONS,
    payload: { offset },
  };
}

export function saves(offset = 0) {
  return {
    type: ActionTypes.SAVES,
    payload: { offset },
  };
}

export function direct(offset = 0) {
  return {
    type: ActionTypes.DIRECT,
    payload: { offset },
  };
}

export function getUserFeed(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_FEED,
    payload: { username, offset },
  };
}

export function getNotifications(offset = 0, filter = '') {
  return {
    type: ActionTypes.GET_NOTIFICATIONS,
    payload: {
      offset,
      filter,
    },
  };
}

export function showMoreComments(postId) {
  return {
    type: ActionTypes.SHOW_MORE_COMMENTS,
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
    payload: { postId, newPost },
  };
}

export function deletePost(postId) {
  return {
    type: ActionTypes.DELETE_POST,
    payload: { postId },
  };
}

export function toggleCommenting(postId, newCommentText = '') {
  return {
    type: ActionTypes.TOGGLE_COMMENTING,
    payload: { postId, newCommentText },
  };
}

export function addComment(postId, commentText) {
  return {
    type: ActionTypes.ADD_COMMENT,
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
    payload: { postId },
  };
}

export function unhidePost(postId) {
  return {
    type: ActionTypes.UNHIDE_POST,
    payload: { postId },
  };
}

export function savePost(postId, save) {
  return {
    type: ActionTypes.SAVE_POST,
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
    payload: { postId },
  };
}

export function enableComments(postId) {
  return {
    type: ActionTypes.ENABLE_COMMENTS,
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
    payload: { commentId, newCommentBody },
  };
}

export function likeComment(commentId) {
  return {
    type: ActionTypes.LIKE_COMMENT,
    payload: { commentId },
  };
}

export function unlikeComment(commentId) {
  return {
    type: ActionTypes.UNLIKE_COMMENT,
    payload: { commentId },
  };
}

export function getCommentLikes(commentId) {
  return {
    type: ActionTypes.GET_COMMENT_LIKES,
    payload: { commentId },
  };
}

export function deleteComment(commentId) {
  return {
    type: ActionTypes.DELETE_COMMENT,
    payload: { commentId },
  };
}

export function createPost(feeds, postText, attachmentIds, more) {
  return {
    type: ActionTypes.CREATE_POST,
    payload: { feeds, postText, attachmentIds, more },
  };
}

export function createBookmarkletPost(feeds, postText, imageUrls, commentText) {
  return {
    type: ActionTypes.CREATE_POST,
    payload: { feeds, postText, imageUrls, commentText },
  };
}

export function addAttachmentResponse(postId, attachments) {
  return {
    type: ActionTypes.ADD_ATTACHMENT_RESPONSE,
    payload: { postId, attachments },
  };
}

export function showMedia(payload) {
  return {
    type: ActionTypes.SHOW_MEDIA,
    payload,
  };
}

export function signIn(username, password) {
  return {
    type: ActionTypes.SIGN_IN,
    payload: {
      username,
      password,
    },
  };
}

/**
 * Emulate successful sign in response
 *
 * @param {string} authToken
 */
export function signedIn(authToken) {
  return {
    type: response(ActionTypes.SIGN_IN),
    payload: { authToken },
  };
}

export function restorePassword(mail) {
  return {
    type: ActionTypes.RESTORE_PASSWORD,
    payload: { mail },
  };
}

export function resetPassword(password, token) {
  return {
    type: ActionTypes.RESET_PASSWORD,
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

export function signUp(signUpData) {
  return {
    type: ActionTypes.SIGN_UP,
    payload: { ...signUpData },
  };
}

export function updateUser(
  id,
  screenName,
  email,
  isPrivate,
  isProtected,
  description,
  frontendPrefs,
  backendPrefs,
) {
  return {
    type: ActionTypes.UPDATE_USER,
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

export function updateUserPreferences(
  userId,
  frontendPrefs = {},
  backendPrefs = {},
  suppressStatus = false,
) {
  return {
    type: ActionTypes.UPDATE_USER_PREFERENCES,
    payload: { userId, frontendPrefs, backendPrefs },
    extra: { suppressStatus },
  };
}

export function updateActualUserPreferences({
  updateFrontendPrefs = () => null,
  updateBackendPrefs = () => null,
}) {
  return {
    type: ActionTypes.UPDATE_ACTUAL_USER_PREFERENCES,
    payload: { updateFrontendPrefs, updateBackendPrefs },
  };
}

export function updateUserNotificationPreferences(userId, backendPrefs) {
  return {
    type: ActionTypes.UPDATE_USER_NOTIFICATION_PREFERENCES,
    payload: { userId, backendPrefs },
  };
}

export function updatePassword(payload) {
  return {
    type: ActionTypes.UPDATE_PASSWORD,
    payload,
  };
}

export function updateUserPicture(picture) {
  return {
    type: ActionTypes.UPDATE_USER_PICTURE,
    payload: { picture },
  };
}

export function getSinglePost(postId) {
  return {
    type: ActionTypes.GET_SINGLE_POST,
    payload: { postId, maxComments: 'all' },
  };
}

export function getPostIdByOldName(oldName) {
  return {
    type: ActionTypes.GET_POST_ID_BY_OLD_NAME,
    payload: { oldName },
  };
}

const userChangeAction = (type) => (payload) => ({ type, payload });

export const ban = userChangeAction(ActionTypes.BAN);
export const unban = userChangeAction(ActionTypes.UNBAN);
export const unsubscribe = userChangeAction(ActionTypes.UNSUBSCRIBE);
export const unsubscribeFromMe = userChangeAction(ActionTypes.UNSUBSCRIBE_FROM_ME);

export function getUserComments(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_COMMENTS,
    payload: { username, offset },
  };
}

export function getUserLikes(username, offset = 0) {
  return {
    type: ActionTypes.GET_USER_LIKES,
    payload: { username, offset },
  };
}

export function getUserMemories(username, from, offset = 0) {
  return {
    type: ActionTypes.GET_USER_MEMORIES,
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
    payload: { username },
  };
}

export function subscriptions(username) {
  return {
    type: ActionTypes.SUBSCRIPTIONS,
    payload: { username },
  };
}

export function getUserInfo(username) {
  return {
    type: ActionTypes.GET_USER_INFO,
    payload: { username },
  };
}

export function createGroup(groupSettings) {
  return {
    type: ActionTypes.CREATE_GROUP,
    payload: groupSettings,
  };
}

export function updateGroup(id, groupSettings) {
  return {
    type: ActionTypes.UPDATE_GROUP,
    payload: { id, groupSettings },
  };
}

export function updateGroupPicture(groupName, file) {
  return {
    type: ActionTypes.UPDATE_GROUP_PICTURE,
    payload: { groupName, file },
  };
}

export function acceptGroupRequest(groupName, userName) {
  return {
    type: ActionTypes.ACCEPT_GROUP_REQUEST,
    payload: { groupName, userName },
  };
}

export function rejectGroupRequest(groupName, userName) {
  return {
    type: ActionTypes.REJECT_GROUP_REQUEST,
    payload: { groupName, userName },
  };
}

export function togglePinnedGroup(id) {
  return {
    type: ActionTypes.TOGGLE_PINNED_GROUP,
    payload: { id },
  };
}

export function acceptUserRequest(username) {
  return {
    type: ActionTypes.ACCEPT_USER_REQUEST,
    payload: { username },
  };
}

export function rejectUserRequest(username) {
  return {
    type: ActionTypes.REJECT_USER_REQUEST,
    payload: { username },
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
  };
}

export function makeGroupAdmin(groupName, user) {
  return {
    type: ActionTypes.MAKE_GROUP_ADMIN,
    payload: { groupName, user },
  };
}

export function unadminGroupAdmin(groupName, user, isItMe) {
  return {
    type: ActionTypes.UNADMIN_GROUP_ADMIN,
    payload: { groupName, user, isItMe },
  };
}

export function revokeSentRequest(user) {
  return {
    type: ActionTypes.REVOKE_USER_REQUEST,
    payload: user,
  };
}

export function archiveRestoreActivity() {
  return {
    type: ActionTypes.ARCHIVE_ACTIVITY_REQUEST,
  };
}

export function archiveStartRestoration(params) {
  return {
    type: ActionTypes.ARCHIVE_RESTORATION_REQUEST,
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
  return { type: ActionTypes.BLOCKED_BY_ME };
}

export function getSummary(days = 7) {
  return {
    type: ActionTypes.GET_SUMMARY,
    payload: { days },
  };
}

export function getUserSummary(username, days = 7) {
  return {
    type: ActionTypes.GET_USER_SUMMARY,
    payload: { username, days },
  };
}

export function getSearch(search, offset) {
  return {
    type: ActionTypes.GET_SEARCH,
    payload: { search, offset },
  };
}

export function getBestOf(offset) {
  return {
    type: ActionTypes.GET_BEST_OF,
    payload: { offset },
  };
}

export function getEverything(offset) {
  return {
    type: ActionTypes.GET_EVERYTHING,
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

export function setNSFWVisibility(visible) {
  return { type: ActionTypes.SET_NSFW_VISIBILITY, payload: visible };
}

export function getAppTokens() {
  return { type: ActionTypes.GET_APP_TOKENS };
}

export function getAppTokensScopes() {
  return { type: ActionTypes.GET_APP_TOKENS_SCOPES };
}

export function createAppToken(params) {
  return { type: ActionTypes.CREATE_APP_TOKEN, payload: params };
}

export function createAppTokenReset() {
  return { type: reset(ActionTypes.CREATE_APP_TOKEN) };
}

export function reissueAppToken(tokenId) {
  return { type: ActionTypes.REISSUE_APP_TOKEN, payload: tokenId };
}

export function deleteAppToken(tokenId) {
  return { type: ActionTypes.DELETE_APP_TOKEN, payload: tokenId };
}

export function deleteAppTokenId(tokenId) {
  return { type: ActionTypes.DELETE_APP_TOKEN_ID, payload: tokenId };
}

export function updateAppToken(tokenId, params) {
  return {
    type: ActionTypes.UPDATE_APP_TOKEN,
    payload: { tokenId, ...params },
  };
}

export function userCardClosing(userId) {
  return {
    type: ActionTypes.USER_CARD_CLOSING,
    payload: { userId },
  };
}

export function getServerInfo() {
  return { type: ActionTypes.GET_SERVER_INFO };
}

export function getExtAuthProfiles() {
  return { type: ActionTypes.GET_AUTH_PROFILES };
}

export function connectToExtProvider(provider, popup) {
  return {
    type: ActionTypes.CONNECT_TO_EXTERNAL_PROVIDER,
    payload: { provider, popup, mode: 'connect' },
  };
}

export function unlinkExternalProfile(profileId) {
  return {
    type: ActionTypes.UNLINK_EXTERNAL_PROFILE,
    payload: { id: profileId },
  };
}

export function signInViaExternalProvider(provider, popup) {
  return {
    type: ActionTypes.SIGN_IN_VIA_EXTERNAL_PROVIDER,
    payload: { provider, popup, mode: 'sign-in' },
  };
}

export function hideByName(username, postId, hide) {
  return {
    type: ActionTypes.HIDE_BY_NAME,
    payload: { username, postId, hide },
  };
}

export function unhideNames(usernames, postId) {
  return {
    type: ActionTypes.UNHIDE_NAMES,
    payload: { usernames, postId },
  };
}

export function removeRecentlyHiddenPost(postId) {
  return {
    type: ActionTypes.REMOVE_RECENTLY_HIDDEN_POST,
    payload: { postId },
  };
}

export function getAllGroups() {
  return { type: ActionTypes.GET_ALL_GROUPS };
}

export function listHomeFeeds() {
  return { type: ActionTypes.LIST_HOME_FEEDS };
}

export function createHomeFeed({ title, subscribedTo }) {
  return {
    type: ActionTypes.CREATE_HOME_FEED,
    payload: { title, subscribedTo },
  };
}

export function updateHomeFeed(feedId, { title, subscribedTo }) {
  return {
    type: ActionTypes.UPDATE_HOME_FEED,
    payload: { feedId, title, subscribedTo },
  };
}

export function deleteHomeFeed(feedId) {
  return {
    type: ActionTypes.DELETE_HOME_FEED,
    payload: { feedId },
  };
}

export function subscribeWithHomeFeeds(type, user, homeFeeds = []) {
  return {
    type,
    payload: { type, id: user.id, username: user.username, homeFeeds },
  };
}

export function updateSubscriptionReset(username) {
  return { type: reset(ActionTypes.UPDATE_SUBSCRIPTION), payload: { username } };
}

export function getAllSubscriptions() {
  return { type: ActionTypes.GET_ALL_SUBSCRIPTIONS };
}

export function updateHomeFeedReset() {
  return { type: reset(ActionTypes.UPDATE_HOME_FEED), payload: {} };
}

export function reorderHomeFeeds(feedIds) {
  return {
    type: ActionTypes.REORDER_HOME_FEEDS,
    payload: { feedIds },
  };
}

export function suspendMe(password) {
  return {
    type: ActionTypes.DEACTIVATE_USER,
    payload: { password },
  };
}

export function resumeMe(resumeToken) {
  return {
    type: ActionTypes.ACTIVATE_USER,
    payload: { resumeToken },
  };
}

export function createAttachment(uploadId, file) {
  return {
    type: ActionTypes.CREATE_ATTACHMENT,
    payload: { uploadId, file, name: file.name },
  };
}

export function resetAttachmentUpload(uploadId) {
  return {
    type: reset(ActionTypes.CREATE_ATTACHMENT),
    payload: { uploadId },
  };
}

export function signOut() {
  return { type: ActionTypes.SIGN_OUT };
}

export function reissueAuthSession() {
  return { type: ActionTypes.REISSUE_AUTH_SESSION };
}

export function authTokenUpdated() {
  return { type: ActionTypes.AUTH_TOKEN_UPDATED };
}

export function listAuthSessions() {
  return { type: ActionTypes.LIST_AUTH_SESSIONS };
}

export function closeAuthSessions(ids) {
  return {
    type: ActionTypes.CLOSE_AUTH_SESSIONS,
    payload: ids,
  };
}

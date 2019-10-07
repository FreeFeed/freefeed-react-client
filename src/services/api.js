import fetch from 'isomorphic-fetch';
import _ from 'lodash';

import config from '../config';
import { getDateForMemoriesRequest } from '../utils/get-date-from-short-string';
import { getToken } from './auth';

const apiConfig = config.api;
const frontendPrefsConfig = config.frontendPreferences;

const getRequestOptions = () => ({
  headers: {
    Accept: 'application/json',
    'X-Authentication-Token': getToken(),
  },
});

const postRequestOptions = (method = 'POST', body = {}) => ({
  method,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Authentication-Token': getToken(),
  },
  body: JSON.stringify(body),
});

const feedQueryString = ({ offset, sortChronologically, homeFeedMode, from }) =>
  [
    offset && `offset=${offset}`,
    sortChronologically && `sort=created`,
    homeFeedMode && `homefeed-mode=${encodeURIComponent(homeFeedMode)}`,
    from && `created-before=${getDateForMemoriesRequest(from).toISOString()}`,
  ]
    .filter(Boolean)
    .join('&');

export function getWhoAmI() {
  return fetch(`${apiConfig.host}/v2/users/whoami`, getRequestOptions());
}

export function getHome(params) {
  return fetch(
    `${apiConfig.host}/v2/timelines/home?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getMemories(params) {
  return fetch(
    `${apiConfig.host}/v2/timelines/home?${feedQueryString(params)}&sort=created`,
    getRequestOptions(),
  );
}

export function getDiscussions(params) {
  return fetch(
    `${apiConfig.host}/v2/timelines/filter/discussions?with-my-posts=yes&${feedQueryString(
      params,
    )}`,
    getRequestOptions(),
  );
}

export function getSaves(params) {
  return fetch(
    `${apiConfig.host}/v2/timelines/filter/saves?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getDirect(params) {
  return fetch(
    `${apiConfig.host}/v2/timelines/filter/directs?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getUserFeed({ username, ...params }) {
  return fetch(
    `${apiConfig.host}/v2/timelines/${username}?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getNotifications({ offset, filter }) {
  return fetch(
    `${apiConfig.host}/v2/notifications?offset=${offset}&filter=${filter}`,
    getRequestOptions(),
  );
}

export function getLikesOnly({ postId, commentsExpanded }) {
  return getPost({
    postId,
    maxComments: commentsExpanded ? 'all' : '',
    maxLikes: 'all',
  });
}

export function getPost({ postId, maxComments = '', maxLikes = '' }) {
  return fetch(
    `${apiConfig.host}/v2/posts/${postId}?maxComments=${maxComments}&maxLikes=${maxLikes}`,
    getRequestOptions(),
  );
}

export function getPostIdByOldName({ oldName }) {
  return fetch(
    `${apiConfig.host}/v2/archives/post-by-old-name/${encodeURIComponent(oldName)}`,
    getRequestOptions(),
  );
}

export function createPost({ feeds, postText, attachmentIds, more }) {
  return fetch(
    `${apiConfig.host}/v1/posts`,
    postRequestOptions('POST', {
      post: {
        body: postText,
        attachments: attachmentIds,
      },
      meta: {
        feeds,
        commentsDisabled: !!more.commentsDisabled,
      },
    }),
  );
}

export function createBookmarkletPost({ feeds, postText, imageUrls, commentText }) {
  return fetch(
    `${apiConfig.host}/v1/bookmarklet`,
    postRequestOptions('POST', {
      title: postText,
      images: imageUrls,
      comment: commentText,
      meta: { feeds },
    }),
  );
}

export function updatePost({ postId, newPost }) {
  return fetch(
    `${apiConfig.host}/v1/posts/${postId}`,
    postRequestOptions('PUT', { post: newPost }),
  );
}

export function deletePost({ postId }) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}`, postRequestOptions('DELETE'));
}

export function addComment({ postId, commentText }) {
  return fetch(
    `${apiConfig.host}/v1/comments`,
    postRequestOptions('POST', { comment: { body: commentText, postId } }),
  );
}

export function updateComment({ commentId, newCommentBody }) {
  return fetch(
    `${apiConfig.host}/v1/comments/${commentId}`,
    postRequestOptions('PUT', { comment: { body: newCommentBody } }),
  );
}

export function likeComment({ commentId }) {
  return fetch(`${apiConfig.host}/v2/comments/${commentId}/like`, postRequestOptions());
}

export function unlikeComment({ commentId }) {
  return fetch(`${apiConfig.host}/v2/comments/${commentId}/unlike`, postRequestOptions());
}

export function getCommentLikes({ commentId }) {
  return fetch(`${apiConfig.host}/v2/comments/${commentId}/likes`, getRequestOptions());
}

export function deleteComment({ commentId }) {
  return fetch(`${apiConfig.host}/v1/comments/${commentId}`, postRequestOptions('DELETE'));
}

export function likePost({ postId }) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/like`, postRequestOptions());
}

export function unlikePost({ postId }) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/unlike`, postRequestOptions());
}

export function hidePost({ postId }) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/hide`, postRequestOptions());
}

export function unhidePost({ postId }) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/unhide`, postRequestOptions());
}

export function disableComments({ postId }) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/disableComments`, postRequestOptions());
}

export function enableComments({ postId }) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/enableComments`, postRequestOptions());
}

const encodeBody = (body) =>
  _.map(body, (value, key) => `${key}=${encodeURIComponent(value)}`).join('&');

export function signIn({ username, password }) {
  const encodedBody = encodeBody({ username, password });

  return fetch(`${apiConfig.host}/v1/session`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: encodedBody,
  });
}

export function restorePassword({ mail }) {
  const encodedBody = encodeBody({ email: mail });
  return fetch(`${apiConfig.host}/v1/passwords`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: encodedBody,
  });
}

export function resetPassword({ password, token }) {
  const params = {
    newPassword: password,
    passwordConfirmation: password,
  };

  const encodedBody = encodeBody(params);
  return fetch(`${apiConfig.host}/v1/passwords/${token}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'PUT',
    body: encodedBody,
  });
}

export function signUp({ username, password, email, captcha, invitationId, subscribe }) {
  const body = { username, password, email, captcha };
  if (invitationId) {
    body.invitation = invitationId;
    if (!subscribe) {
      body.cancel_subscription = !subscribe;
    }
  }
  const encodedBody = encodeBody(body);

  return fetch(`${apiConfig.host}/v1/users`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: encodedBody,
  });
}

export function markAllDirectsAsRead() {
  return fetch(`${apiConfig.host}/v2/users/markAllDirectsAsRead`, getRequestOptions());
}

export function markAllNotificationsAsRead() {
  return fetch(`${apiConfig.host}/v2/users/markAllNotificationsAsRead`, postRequestOptions());
}

export function updateUser({
  id,
  screenName,
  email,
  isPrivate,
  isProtected,
  description,
  frontendPrefs = undefined,
  backendPrefs = undefined,
}) {
  const user = { screenName, email, isPrivate, isProtected, description };
  if (frontendPrefs) {
    user.frontendPreferences = { [frontendPrefsConfig.clientId]: frontendPrefs };
  }
  if (backendPrefs) {
    user.preferences = backendPrefs;
  }
  return fetch(`${apiConfig.host}/v1/users/${id}`, postRequestOptions('PUT', { user }));
}

export function updateUserPreferences({ userId, frontendPrefs, backendPrefs }) {
  const user = {};
  if (frontendPrefs) {
    user.frontendPreferences = { [frontendPrefsConfig.clientId]: frontendPrefs };
  }
  if (backendPrefs) {
    user.preferences = backendPrefs;
  }
  return fetch(`${apiConfig.host}/v1/users/${userId}`, postRequestOptions('PUT', { user }));
}

export function updatePassword({ currentPassword, password, passwordConfirmation }) {
  const encodedBody = encodeBody({ currentPassword, password, passwordConfirmation });

  return fetch(`${apiConfig.host}/v1/users/updatePassword`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Authentication-Token': getToken(),
    },
    body: encodedBody,
  });
}

export function updateUserPicture({ picture }) {
  const data = new FormData();
  data.append('file', picture);

  return fetch(`${apiConfig.host}/v1/users/updateProfilePicture`, {
    method: 'POST',
    headers: { 'X-Authentication-Token': getToken() },
    body: data,
  });
}

const userAction = (action) => ({ username }) => {
  return fetch(`${apiConfig.host}/v1/users/${username}/${action}`, postRequestOptions());
};

export const ban = userAction('ban');
export const unban = userAction('unban');
export const subscribe = userAction('subscribe');
export const unsubscribe = userAction('unsubscribe');
export const sendSubscriptionRequest = userAction('sendRequest');

export function getUserComments({ username, ...params }) {
  return fetch(
    `${apiConfig.host}/v2/timelines/${username}/comments?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getUserLikes({ username, ...params }) {
  return fetch(
    `${apiConfig.host}/v2/timelines/${username}/likes?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getUserMemories({ username, ...params }) {
  return fetch(
    `${apiConfig.host}/v2/timelines/${username}?${feedQueryString(params)}&sort=created`,
    getRequestOptions(),
  );
}

export function getSubscribers({ username }) {
  return fetch(`${apiConfig.host}/v1/users/${username}/subscribers`, getRequestOptions());
}

export function getSubscriptions({ username }) {
  return fetch(`${apiConfig.host}/v1/users/${username}/subscriptions`, getRequestOptions());
}

export function getUserInfo({ username }) {
  return fetch(`${apiConfig.host}/v1/users/${username}`, getRequestOptions());
}

export function createGroup(groupSettings) {
  return fetch(`${apiConfig.host}/v1/groups`, postRequestOptions('POST', { group: groupSettings }));
}

export function updateGroup({ id, groupSettings }) {
  return fetch(
    `${apiConfig.host}/v1/users/${id}`,
    postRequestOptions('PUT', { user: groupSettings }),
  );
}

export function updateGroupPicture({ groupName, file }) {
  const data = new FormData();
  data.append('file', file);

  return fetch(`${apiConfig.host}/v1/groups/${groupName}/updateProfilePicture`, {
    method: 'POST',
    headers: { 'X-Authentication-Token': getToken() },
    body: data,
  });
}

export function acceptGroupRequest({ groupName, userName }) {
  return fetch(
    `${apiConfig.host}/v1/groups/${groupName}/acceptRequest/${userName}`,
    postRequestOptions(),
  );
}

export function rejectGroupRequest({ groupName, userName }) {
  return fetch(
    `${apiConfig.host}/v1/groups/${groupName}/rejectRequest/${userName}`,
    postRequestOptions(),
  );
}

export function acceptUserRequest({ userName }) {
  return fetch(`${apiConfig.host}/v1/users/acceptRequest/${userName}`, postRequestOptions());
}

export function rejectUserRequest({ userName }) {
  return fetch(`${apiConfig.host}/v1/users/rejectRequest/${userName}`, postRequestOptions());
}

export function unsubscribeFromGroup({ groupName, userName }) {
  return fetch(
    `${apiConfig.host}/v1/groups/${groupName}/unsubscribeFromGroup/${userName}`,
    postRequestOptions(),
  );
}

export function makeGroupAdmin({ groupName, user }) {
  return fetch(
    `${apiConfig.host}/v1/groups/${groupName}/subscribers/${user.username}/admin`,
    postRequestOptions(),
  );
}

export function unadminGroupAdmin({ groupName, user }) {
  return fetch(
    `${apiConfig.host}/v1/groups/${groupName}/subscribers/${user.username}/unadmin`,
    postRequestOptions(),
  );
}

export function revokeSentRequest({ userName }) {
  return fetch(`${apiConfig.host}/v2/requests/${userName}/revoke`, postRequestOptions());
}

export function getBlockedByMe() {
  return fetch(`${apiConfig.host}/v2/users/blockedByMe`, getRequestOptions());
}

export function getSummary({ days }) {
  return fetch(`${apiConfig.host}/v2/summary/${days}`, getRequestOptions());
}

export function getUserSummary({ username, days }) {
  return fetch(`${apiConfig.host}/v2/summary/${username}/${days}`, getRequestOptions());
}

export function getSearch({ search = '', offset = 0 }) {
  return fetch(
    `${apiConfig.host}/v2/search?qs=${encodeURIComponent(search)}&offset=${offset}`,
    getRequestOptions(),
  );
}

export function getBestOf({ offset = 0 }) {
  return fetch(`${apiConfig.host}/v2/bestof?offset=${offset}`, getRequestOptions());
}

export function getEverything(params) {
  return fetch(`${apiConfig.host}/v2/everything?${feedQueryString(params)}`, getRequestOptions());
}

export function archiveRestoreActivity() {
  return fetch(
    `${apiConfig.host}/v2/archives/activities`,
    postRequestOptions('PUT', { restore: true }),
  );
}

export function archiveStartRestoration(params) {
  return fetch(`${apiConfig.host}/v2/archives/restoration`, postRequestOptions('POST', params));
}

export function createFreefeedInvitation(params) {
  return fetch(`${apiConfig.host}/v2/invitations`, postRequestOptions('POST', params));
}

export function getInvitation({ invitationId }) {
  return fetch(`${apiConfig.host}/v2/invitations/${invitationId}`, getRequestOptions());
}

export function getAppTokens() {
  return fetch(`${apiConfig.host}/v2/app-tokens`, getRequestOptions());
}

export function getAppTokensScopes() {
  return fetch(`${apiConfig.host}/v2/app-tokens/scopes`, getRequestOptions());
}

export function createAppToken(params) {
  return fetch(`${apiConfig.host}/v2/app-tokens`, postRequestOptions('POST', params));
}

export function reissueAppToken(tokenId) {
  return fetch(`${apiConfig.host}/v2/app-tokens/${tokenId}/reissue`, postRequestOptions());
}

export function deleteAppToken(tokenId) {
  return fetch(`${apiConfig.host}/v2/app-tokens/${tokenId}`, postRequestOptions('DELETE'));
}

export function updateAppToken({ tokenId, ...params }) {
  return fetch(`${apiConfig.host}/v2/app-tokens/${tokenId}`, postRequestOptions('PUT', params));
}

export function savePost({ postId }) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/save`, postRequestOptions());
}

export function unsavePost({ postId }) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/save`, postRequestOptions('DELETE'));
}

export function getServerInfo() {
  return fetch(`${apiConfig.host}/v2/server-info`, getRequestOptions());
}

export function getExtAuthProfiles() {
  return fetch(`${apiConfig.host}/v2/ext-auth/profiles`, getRequestOptions());
}

/* global CONFIG */
import { parse as qsParse } from 'querystring';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';

import { getDateForMemoriesRequest } from '../utils/get-date-from-short-string';
import { userParser } from '../utils';
import { getToken } from './auth';
import { popupAsPromise } from './popup';

const apiRoot = CONFIG.api.root;
const frontendPrefsId = CONFIG.frontendPreferences.clientId;

const getRequestOptions = () => ({
  headers: {
    Accept: 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  },
});

const postRequestOptions = (method = 'POST', body = {}) => ({
  method,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
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
  return fetch(`${apiRoot}/v2/users/whoami`, getRequestOptions());
}

export function getHome(params) {
  return fetch(`${apiRoot}/v2/timelines/home?${feedQueryString(params)}`, getRequestOptions());
}

export function getMemories(params) {
  return fetch(
    `${apiRoot}/v2/timelines/home?${feedQueryString(params)}&sort=created`,
    getRequestOptions(),
  );
}

export function getDiscussions(params) {
  return fetch(
    `${apiRoot}/v2/timelines/filter/discussions?with-my-posts=yes&${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getSaves(params) {
  return fetch(
    `${apiRoot}/v2/timelines/filter/saves?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getDirect(params) {
  return fetch(
    `${apiRoot}/v2/timelines/filter/directs?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getUserFeed({ username, ...params }) {
  return fetch(
    `${apiRoot}/v2/timelines/${username}?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getNotifications({ offset, filter }) {
  return fetch(
    `${apiRoot}/v2/notifications?offset=${offset}&filter=${filter}`,
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
    `${apiRoot}/v2/posts/${postId}?maxComments=${maxComments}&maxLikes=${maxLikes}`,
    getRequestOptions(),
  );
}

export function getPostIdByOldName({ oldName }) {
  return fetch(
    `${apiRoot}/v2/archives/post-by-old-name/${encodeURIComponent(oldName)}`,
    getRequestOptions(),
  );
}

export function createPost({ feeds, postText, attachmentIds, more }) {
  return fetch(
    `${apiRoot}/v1/posts`,
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
    `${apiRoot}/v1/bookmarklet`,
    postRequestOptions('POST', {
      title: postText,
      images: imageUrls,
      comment: commentText,
      meta: { feeds },
    }),
  );
}

export function updatePost({ postId, newPost }) {
  return fetch(`${apiRoot}/v1/posts/${postId}`, postRequestOptions('PUT', { post: newPost }));
}

export function deletePost({ postId }) {
  return fetch(`${apiRoot}/v1/posts/${postId}`, postRequestOptions('DELETE'));
}

export function addComment({ postId, commentText }) {
  return fetch(
    `${apiRoot}/v1/comments`,
    postRequestOptions('POST', { comment: { body: commentText, postId } }),
  );
}

export function updateComment({ commentId, newCommentBody }) {
  return fetch(
    `${apiRoot}/v1/comments/${commentId}`,
    postRequestOptions('PUT', { comment: { body: newCommentBody } }),
  );
}

export function likeComment({ commentId }) {
  return fetch(`${apiRoot}/v2/comments/${commentId}/like`, postRequestOptions());
}

export function unlikeComment({ commentId }) {
  return fetch(`${apiRoot}/v2/comments/${commentId}/unlike`, postRequestOptions());
}

export function getCommentLikes({ commentId }) {
  return fetch(`${apiRoot}/v2/comments/${commentId}/likes`, getRequestOptions());
}

export function deleteComment({ commentId }) {
  return fetch(`${apiRoot}/v1/comments/${commentId}`, postRequestOptions('DELETE'));
}

export function likePost({ postId }) {
  return fetch(`${apiRoot}/v1/posts/${postId}/like`, postRequestOptions());
}

export function unlikePost({ postId }) {
  return fetch(`${apiRoot}/v1/posts/${postId}/unlike`, postRequestOptions());
}

export function hidePost({ postId }) {
  return fetch(`${apiRoot}/v1/posts/${postId}/hide`, postRequestOptions());
}

export function unhidePost({ postId }) {
  return fetch(`${apiRoot}/v1/posts/${postId}/unhide`, postRequestOptions());
}

export function disableComments({ postId }) {
  return fetch(`${apiRoot}/v1/posts/${postId}/disableComments`, postRequestOptions());
}

export function enableComments({ postId }) {
  return fetch(`${apiRoot}/v1/posts/${postId}/enableComments`, postRequestOptions());
}

const encodeBody = (body) =>
  _.map(body, (value, key) => `${key}=${encodeURIComponent(value)}`).join('&');

export function signIn({ username, password }) {
  const encodedBody = encodeBody({ username, password });

  return fetch(`${apiRoot}/v1/session`, {
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
  return fetch(`${apiRoot}/v1/passwords`, {
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
  return fetch(`${apiRoot}/v1/passwords/${token}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'PUT',
    body: encodedBody,
  });
}

export function signUp(postData) {
  return fetch(`${apiRoot}/v1/users`, postRequestOptions('POST', postData));
}

export function markAllDirectsAsRead() {
  return fetch(`${apiRoot}/v2/users/markAllDirectsAsRead`, getRequestOptions());
}

export function markAllNotificationsAsRead() {
  return fetch(`${apiRoot}/v2/users/markAllNotificationsAsRead`, postRequestOptions());
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
    user.frontendPreferences = { [frontendPrefsId]: frontendPrefs };
  }
  if (backendPrefs) {
    user.preferences = backendPrefs;
  }
  return fetch(`${apiRoot}/v1/users/${id}`, postRequestOptions('PUT', { user }));
}

export function updateUserPreferences({ userId, frontendPrefs, backendPrefs }) {
  const user = {};
  if (frontendPrefs) {
    user.frontendPreferences = { [frontendPrefsId]: frontendPrefs };
  }
  if (backendPrefs) {
    user.preferences = backendPrefs;
  }
  return fetch(`${apiRoot}/v1/users/${userId}`, postRequestOptions('PUT', { user }));
}

export function updatePassword({ currentPassword, password, passwordConfirmation }) {
  const encodedBody = encodeBody({ currentPassword, password, passwordConfirmation });

  return fetch(`${apiRoot}/v1/users/updatePassword`, {
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

  return fetch(`${apiRoot}/v1/users/updateProfilePicture`, {
    method: 'POST',
    headers: { 'X-Authentication-Token': getToken() },
    body: data,
  });
}

const userAction = (action) => ({ username }) => {
  return fetch(`${apiRoot}/v1/users/${username}/${action}`, postRequestOptions());
};

export const ban = userAction('ban');
export const unban = userAction('unban');
export const subscribe = userAction('subscribe');
export const unsubscribe = userAction('unsubscribe');
export const sendSubscriptionRequest = userAction('sendRequest');

export function getUserComments({ username, ...params }) {
  return fetch(
    `${apiRoot}/v2/timelines/${username}/comments?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getUserLikes({ username, ...params }) {
  return fetch(
    `${apiRoot}/v2/timelines/${username}/likes?${feedQueryString(params)}`,
    getRequestOptions(),
  );
}

export function getUserMemories({ username, ...params }) {
  return fetch(
    `${apiRoot}/v2/timelines/${username}?${feedQueryString(params)}&sort=created`,
    getRequestOptions(),
  );
}

export function getSubscribers({ username }) {
  return fetch(`${apiRoot}/v1/users/${username}/subscribers`, getRequestOptions());
}

export function getSubscriptions({ username }) {
  return fetch(`${apiRoot}/v1/users/${username}/subscriptions`, getRequestOptions());
}

export function getUserInfo({ username }) {
  return fetch(`${apiRoot}/v1/users/${username}`, getRequestOptions());
}

export function createGroup(groupSettings) {
  return fetch(`${apiRoot}/v1/groups`, postRequestOptions('POST', { group: groupSettings }));
}

export function updateGroup({ id, groupSettings }) {
  return fetch(`${apiRoot}/v1/users/${id}`, postRequestOptions('PUT', { user: groupSettings }));
}

export function updateGroupPicture({ groupName, file }) {
  const data = new FormData();
  data.append('file', file);

  return fetch(`${apiRoot}/v1/groups/${groupName}/updateProfilePicture`, {
    method: 'POST',
    headers: { 'X-Authentication-Token': getToken() },
    body: data,
  });
}

export function acceptGroupRequest({ groupName, userName }) {
  return fetch(`${apiRoot}/v1/groups/${groupName}/acceptRequest/${userName}`, postRequestOptions());
}

export function rejectGroupRequest({ groupName, userName }) {
  return fetch(`${apiRoot}/v1/groups/${groupName}/rejectRequest/${userName}`, postRequestOptions());
}

export function acceptUserRequest({ userName }) {
  return fetch(`${apiRoot}/v1/users/acceptRequest/${userName}`, postRequestOptions());
}

export function rejectUserRequest({ userName }) {
  return fetch(`${apiRoot}/v1/users/rejectRequest/${userName}`, postRequestOptions());
}

export function unsubscribeFromGroup({ groupName, userName }) {
  return fetch(
    `${apiRoot}/v1/groups/${groupName}/unsubscribeFromGroup/${userName}`,
    postRequestOptions(),
  );
}

export function makeGroupAdmin({ groupName, user }) {
  return fetch(
    `${apiRoot}/v1/groups/${groupName}/subscribers/${user.username}/admin`,
    postRequestOptions(),
  );
}

export function unadminGroupAdmin({ groupName, user }) {
  return fetch(
    `${apiRoot}/v1/groups/${groupName}/subscribers/${user.username}/unadmin`,
    postRequestOptions(),
  );
}

export function revokeSentRequest({ userName }) {
  return fetch(`${apiRoot}/v2/requests/${userName}/revoke`, postRequestOptions());
}

export function getBlockedByMe() {
  return fetch(`${apiRoot}/v2/users/blockedByMe`, getRequestOptions());
}

export function getSummary({ days }) {
  return fetch(`${apiRoot}/v2/summary/${days}`, getRequestOptions());
}

export function getUserSummary({ username, days }) {
  return fetch(`${apiRoot}/v2/summary/${username}/${days}`, getRequestOptions());
}

export function getSearch({ search = '', offset = 0 }) {
  return fetch(
    `${apiRoot}/v2/search?qs=${encodeURIComponent(search)}&offset=${offset}`,
    getRequestOptions(),
  );
}

export function getBestOf({ offset = 0 }) {
  return fetch(`${apiRoot}/v2/bestof?offset=${offset}`, getRequestOptions());
}

export function getEverything(params) {
  return fetch(`${apiRoot}/v2/everything?${feedQueryString(params)}`, getRequestOptions());
}

export function archiveRestoreActivity() {
  return fetch(`${apiRoot}/v2/archives/activities`, postRequestOptions('PUT', { restore: true }));
}

export function archiveStartRestoration(params) {
  return fetch(`${apiRoot}/v2/archives/restoration`, postRequestOptions('POST', params));
}

export function createFreefeedInvitation(params) {
  return fetch(`${apiRoot}/v2/invitations`, postRequestOptions('POST', params));
}

export function getInvitation({ invitationId }) {
  return fetch(`${apiRoot}/v2/invitations/${invitationId}`, getRequestOptions());
}

export function getAppTokens() {
  return fetch(`${apiRoot}/v2/app-tokens`, getRequestOptions());
}

export function getAppTokensScopes() {
  return fetch(`${apiRoot}/v2/app-tokens/scopes`, getRequestOptions());
}

export function createAppToken(params) {
  return fetch(`${apiRoot}/v2/app-tokens`, postRequestOptions('POST', params));
}

export function reissueAppToken(tokenId) {
  return fetch(`${apiRoot}/v2/app-tokens/${tokenId}/reissue`, postRequestOptions());
}

export function deleteAppToken(tokenId) {
  return fetch(`${apiRoot}/v2/app-tokens/${tokenId}`, postRequestOptions('DELETE'));
}

export function updateAppToken({ tokenId, ...params }) {
  return fetch(`${apiRoot}/v2/app-tokens/${tokenId}`, postRequestOptions('PUT', params));
}

export function savePost({ postId }) {
  return fetch(`${apiRoot}/v1/posts/${postId}/save`, postRequestOptions());
}

export function unsavePost({ postId }) {
  return fetch(`${apiRoot}/v1/posts/${postId}/save`, postRequestOptions('DELETE'));
}

export function getServerInfo() {
  return fetch(`${apiRoot}/v2/server-info`, getRequestOptions());
}

export function getExtAuthProfiles() {
  return fetch(`${apiRoot}/v2/ext-auth/profiles`, getRequestOptions());
}

export function unlinkExternalProfile({ id }) {
  return fetch(`${apiRoot}/v2/ext-auth/profiles/${id}`, postRequestOptions('DELETE'));
}

export async function performExtAuth({ provider, popup, mode }) {
  const [{ search }] = await Promise.all([
    popupAsPromise(popup),
    (async () => {
      const startResp = await fetch(
        `${apiRoot}/v2/ext-auth/auth-start`,
        postRequestOptions('POST', {
          provider,
          mode,
          redirectURL: `${location.origin}/auth-return.html`,
        }),
      ).then((r) => r.json());

      if (startResp.err) {
        popup.closed || popup.close();
        throw new Error(startResp.err);
      }

      if (!popup.closed) {
        popup.location = startResp.redirectTo;
      }
    })(),
  ]);

  const query = qsParse(search.substr(1));

  const finishResp = await fetch(
    `${apiRoot}/v2/ext-auth/auth-finish`,
    postRequestOptions('POST', { provider, query }),
  ).then((r) => r.json());

  if (finishResp.err) {
    throw new Error(finishResp.err);
  }

  return finishResp;
}

export async function hideByName({
  username, // username to hide/unhide
  hide, // 'true' to hide or 'false' to unhide
}) {
  // Need to actualize user's hide list
  const whoAmIResp = await getWhoAmI();
  if (whoAmIResp.status !== 200) {
    return whoAmIResp;
  }

  const whoAmIData = await whoAmIResp.json();
  const { id: userId, frontendPreferences: frontendPrefs } = userParser(whoAmIData.users);

  const hiddenNames = _.get(frontendPrefs, 'homefeed.hideUsers', []);

  if (hide === hiddenNames.includes(username)) {
    // User is already hidden/unhidden
    return whoAmIResp;
  }

  _.set(
    frontendPrefs,
    'homefeed.hideUsers',
    hide ? [...hiddenNames, username] : _.without(hiddenNames, username),
  );

  return await updateUserPreferences({ userId, frontendPrefs });
}

export async function unHideNames({
  usernames, // usernames to unhide
}) {
  // Need to actualize user's hide list
  const whoAmIResp = await getWhoAmI();
  if (whoAmIResp.status !== 200) {
    return whoAmIResp;
  }

  const whoAmIData = await whoAmIResp.json();
  const { id: userId, frontendPreferences: frontendPrefs } = userParser(whoAmIData.users);

  const hiddenNames = _.get(frontendPrefs, 'homefeed.hideUsers', []);
  if (_.intersection(hiddenNames, usernames).length === 0) {
    // Nothing to unhide
    return whoAmIResp;
  }

  _.set(frontendPrefs, 'homefeed.hideUsers', _.difference(hiddenNames, usernames));
  return await updateUserPreferences({ userId, frontendPrefs });
}

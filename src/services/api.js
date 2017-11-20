import fetch from 'isomorphic-fetch';
import _ from 'lodash';

import config from '../config';
import {getToken} from './auth';


const apiConfig = config.api;
const frontendPrefsConfig = config.frontendPreferences;

const getRequestOptions = () => ({
  headers:{
    'Accept': 'application/json',
    'X-Authentication-Token': getToken()
  }
});

export function getWhoAmI() {
  return fetch(`${apiConfig.host}/v2/users/whoami`, getRequestOptions());
}

export function getHome({offset}) {
  return fetch(
    `${apiConfig.host}/v2/timelines/home?offset=${offset}`, getRequestOptions());
}

export function getDiscussions({offset}) {
  return fetch(
    `${apiConfig.host}/v2/timelines/filter/discussions?with-my-posts=yes&offset=${offset}`, getRequestOptions());
}

export function getDirect({offset}) {
  return fetch(
    `${apiConfig.host}/v2/timelines/filter/directs?offset=${offset}`, getRequestOptions());
}

export function getUserFeed({username, offset}) {
  return fetch(
    `${apiConfig.host}/v2/timelines/${username}?offset=${offset}`, getRequestOptions());
}

export function getNotifications({offset, filter}) {
  return fetch(
    `${apiConfig.host}/v2/notifications?offset=${offset}&filter=${filter}`, getRequestOptions());
}

export function getLikesOnly({postId, commentsExpanded}) {
  return getPost({
    postId,
    maxComments: commentsExpanded ? 'all' : '',
    maxLikes: 'all'
  });
}

export function getPost({postId, maxComments = '', maxLikes = ''}) {
  return fetch(
    `${apiConfig.host}/v2/posts/${postId}?maxComments=${maxComments}&maxLikes=${maxLikes}`, getRequestOptions());
}

export function getPostIdByOldName({ oldName }) {
  return fetch(
    `${apiConfig.host}/v2/archives/post-by-old-name/${encodeURIComponent(oldName)}`, getRequestOptions());
}

export function createPost({feeds, postText, attachmentIds, more}) {
  return fetch(`${apiConfig.host}/v1/posts`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({
      post: {
        body: postText,
        attachments: attachmentIds
      },
      meta: {
        feeds,
        commentsDisabled: !!more.commentsDisabled
      }
    })
  });
}

export function createBookmarkletPost({feeds, postText, imageUrls, commentText}) {
  return fetch(`${apiConfig.host}/v1/bookmarklet`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({
      title: postText,
      images: imageUrls,
      comment: commentText,
      meta: {
        feeds
      }
    })
  });
}

export function updatePost({postId, newPost}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({post: newPost})
  });
}

export function deletePost({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}`, {
    'method': 'DELETE',
    'headers': {
      'Accept': 'application/json',
      'X-Authentication-Token': getToken()
    }
  });
}

export function addComment({postId, commentText}) {
  return fetch(`${apiConfig.host}/v1/comments`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({comment: {body:commentText, postId}})
  });
}

export function updateComment({commentId, newCommentBody}) {
  return fetch(`${apiConfig.host}/v1/comments/${commentId}`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({comment: {body: newCommentBody}})
  });
}

export function likeComment({commentId}) {
  return fetch(`${apiConfig.host}/v2/comments/${commentId}/like`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
  });
}

export function unlikeComment({commentId}) {
  return fetch(`${apiConfig.host}/v2/comments/${commentId}/unlike`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
  });
}

export function getCommentLikes({commentId}) {
  return fetch(`${apiConfig.host}/v2/comments/${commentId}/likes`, getRequestOptions());
}

export function deleteComment({commentId}) {
  return fetch(`${apiConfig.host}/v1/comments/${commentId}`, {
    'method': 'DELETE',
    'headers': {
      'Accept': 'application/json',
      'X-Authentication-Token': getToken()
    }
  });
}

export function likePost({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/like`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': '{}'
  });
}

export function unlikePost({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/unlike`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': '{}'
  });
}

export function hidePost({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/hide`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': '{}'
  });
}

export function unhidePost({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/unhide`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': '{}'
  });
}

export function disableComments({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/disableComments`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': '{}'
  });
}

export function enableComments({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}/enableComments`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': '{}'
  });
}

const encodeBody = (body) => _.map(body, (value, key) => `${key}=${encodeURIComponent(value)}`, ).join('&');

export function signIn({username, password}) {
  const encodedBody = encodeBody({username, password});

  return fetch(`${apiConfig.host}/v1/session`, {
    headers:{
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: encodedBody
  });
}

export function restorePassword({mail}) {
  const encodedBody = encodeBody({email: mail});
  return fetch(`${apiConfig.host}/v1/passwords`, {
    headers:{
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: encodedBody
  });
}

export function resetPassword({password, token}) {
  const params = {
    newPassword: password,
    passwordConfirmation: password,
  };

  const encodedBody = encodeBody(params);
  return fetch(`${apiConfig.host}/v1/passwords/${token}`, {
    headers:{
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
    },
    method: 'PUT',
    body: encodedBody
  });
}

export function signUp({username, password, email, captcha}) {
  const encodedBody = encodeBody({username, password, email, captcha});

  return fetch(`${apiConfig.host}/v1/users`, {
    headers:{
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: encodedBody
  });
}

export function markAllDirectsAsRead() {
  return fetch(`${apiConfig.host}/v2/users/markAllDirectsAsRead`, getRequestOptions());
}

export function markAllNotificationsAsRead() {
  return fetch(`${apiConfig.host}/v2/users/markAllNotificationsAsRead`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken(),
    }
  });
}

export function updateUser({id, screenName, email, isPrivate, isProtected, description}) {
  return fetch(`${apiConfig.host}/v1/users/${id}`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({user: {screenName, email, isPrivate, isProtected, description}})
  });
}

export function updateUserPreferences({userId, frontendPrefs, backendPrefs}) {
  const user = {};
  if (frontendPrefs) {
    user.frontendPreferences = { [frontendPrefsConfig.clientId]: frontendPrefs };
  }
  if (backendPrefs) {
    user.preferences = backendPrefs;
  }
  return fetch(`${apiConfig.host}/v1/users/${userId}`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({ user })
  });
}

export function updatePassword({currentPassword, password, passwordConfirmation}) {
  const encodedBody = encodeBody({currentPassword, password, passwordConfirmation});

  return fetch(`${apiConfig.host}/v1/users/updatePassword`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
      'X-Authentication-Token': getToken()
    },
    'body': encodedBody
  });
}

export function updateUserPicture({picture}) {
  const data = new FormData();
  data.append('file', picture);

  return fetch(`${apiConfig.host}/v1/users/updateProfilePicture`, {
    'method': 'POST',
    'headers': {
      'X-Authentication-Token': getToken()
    },
    'body': data
  });
}

const userAction = (action) => ({username}) => {
  return fetch(`${apiConfig.host}/v1/users/${username}/${action}`, {
    method: 'POST',
    'headers': {
      'X-Authentication-Token': getToken(),
    },
  });
};

export const ban = userAction('ban');
export const unban = userAction('unban');
export const subscribe = userAction('subscribe');
export const unsubscribe = userAction('unsubscribe');
export const sendSubscriptionRequest = userAction('sendRequest');


export function getUserComments({username, offset}) {
  return fetch(`${apiConfig.host}/v2/timelines/${username}/comments?offset=${offset}`, getRequestOptions());
}

export function getUserLikes({username, offset}) {
  return fetch(`${apiConfig.host}/v2/timelines/${username}/likes?offset=${offset}`, getRequestOptions());
}

export function getSubscribers({username}) {
  return fetch(`${apiConfig.host}/v1/users/${username}/subscribers`, getRequestOptions());
}

export function getSubscriptions({username}) {
  return fetch(`${apiConfig.host}/v1/users/${username}/subscriptions`, getRequestOptions());
}

export function getUserInfo({username}) {
  return fetch(`${apiConfig.host}/v1/users/${username}`, getRequestOptions());
}

export function createGroup(groupSettings) {
  return fetch(`${apiConfig.host}/v1/groups`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({group: groupSettings})
  });
}

export function updateGroup({id, groupSettings}) {
  return fetch(`${apiConfig.host}/v1/users/${id}`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({user: groupSettings})
  });
}

export function updateGroupPicture({groupName, file}) {
  const data = new FormData();
  data.append('file', file);

  return fetch(`${apiConfig.host}/v1/groups/${groupName}/updateProfilePicture`, {
    'method': 'POST',
    'headers': {
      'X-Authentication-Token': getToken()
    },
    'body': data
  });
}

export function acceptGroupRequest({groupName, userName}) {
  return fetch(`${apiConfig.host}/v1/groups/${groupName}/acceptRequest/${userName}`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    }
  });
}

export function rejectGroupRequest({groupName, userName}) {
  return fetch(`${apiConfig.host}/v1/groups/${groupName}/rejectRequest/${userName}`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    }
  });
}

export function acceptUserRequest({userName}) {
  return fetch(`${apiConfig.host}/v1/users/acceptRequest/${userName}`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    }
  });
}

export function rejectUserRequest({userName}) {
  return fetch(`${apiConfig.host}/v1/users/rejectRequest/${userName}`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    }
  });
}

export function unsubscribeFromGroup({groupName, userName}) {
  return fetch(`${apiConfig.host}/v1/groups/${groupName}/unsubscribeFromGroup/${userName}`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    }
  });
}

export function makeGroupAdmin({groupName, user}) {
  return fetch(`${apiConfig.host}/v1/groups/${groupName}/subscribers/${user.username}/admin`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    }
  });
}

export function unadminGroupAdmin({groupName, user}) {
  return fetch(`${apiConfig.host}/v1/groups/${groupName}/subscribers/${user.username}/unadmin`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    }
  });
}

export function revokeSentRequest({userName}) {
  return fetch(`${apiConfig.host}/v2/requests/${userName}/revoke`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    }
  });
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

export function getSearch({search='', offset=0}) {
  return fetch(`${apiConfig.host}/v2/search?qs=${encodeURIComponent(search)}&offset=${offset}`, getRequestOptions());
}

export function getBestOf({offset=0}) {
  return fetch(`${apiConfig.host}/v2/bestof?offset=${offset}`, getRequestOptions());
}

export function archiveRestoreActivity() {
  return fetch(`${apiConfig.host}/v2/archives/activities`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({restore: true})
  });
}

export function archiveStartRestoration(params) {
  return fetch(`${apiConfig.host}/v2/archives/restoration`, {
    'method': 'POST',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify(params)
  });
}

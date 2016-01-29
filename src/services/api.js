import fetch from 'isomorphic-fetch'
import {getToken} from './auth'
import {api as apiConfig} from '../config'

const getRequestOptions = () => ({
  headers:{
    'Accept': 'application/json',
    'X-Authentication-Token': getToken()
  }
})

export function getWhoAmI() {
  return fetch(`${apiConfig.host}/v1/users/whoami`, getRequestOptions())
}

export function getHome({offset}) {
  return fetch(
    `${apiConfig.host}/v1/timelines/home?offset=${offset}`, getRequestOptions())
}

export function getDiscussions({offset}) {
  return fetch(
    `${apiConfig.host}/v1/timelines/filter/discussions?offset=${offset}`, getRequestOptions())
}

export function getDirect({offset}) {
  return fetch(
    `${apiConfig.host}/v1/timelines/filter/directs?offset=${offset}`, getRequestOptions())
}

export function getUserFeed({username, offset}) {
  return fetch(
    `${apiConfig.host}/v1/timelines/${username}?offset=${offset}`, getRequestOptions())
}

const MAX_COMMENTS = 2

export function getLikesOnly({postId, commentsExpanded}) {
  const maxComments = commentsExpanded ? 'all' : `${MAX_COMMENTS}`
  return fetch(
    `${apiConfig.host}/v1/posts/${postId}?maxComments=${maxComments}&maxLikes=all`, getRequestOptions())
}

export function getPostWithAllCommentsAndLikes({postId}) {
  return fetch(
    `${apiConfig.host}/v1/posts/${postId}?maxComments=all&maxLikes=all`, getRequestOptions())
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
        feeds: feeds,
        commentsDisabled: !!more.commentsDisabled
      }
    })
  })
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
  })
}

export function deletePost({postId}) {
  return fetch(`${apiConfig.host}/v1/posts/${postId}`, {
    'method': 'DELETE',
    'headers': {
      'Accept': 'application/json',
      'X-Authentication-Token': getToken()
    }
  })
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
  })
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
  })
}

export function deleteComment({commentId}) {
  return fetch(`${apiConfig.host}/v1/comments/${commentId}`, {
    'method': 'DELETE',
    'headers': {
      'Accept': 'application/json',
      'X-Authentication-Token': getToken()
    }
  })
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
  })
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
  })
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
  })
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
  })
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
  })
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
  })
}

export function signIn({username, password}) {
  return fetch(`${apiConfig.host}/v1/session`, {
    headers:{
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: `username=${username}&password=${password}`,
  })
}

export function signUp({username, password, email, captcha}) {
  return fetch(`${apiConfig.host}/v1/users`, {
    headers:{
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: `username=${username}&password=${password}&email=${email}&captcha=${captcha}`,
  })
}

export function updateUser({id, screenName, email, isPrivate, description}) {
  return fetch(`${apiConfig.host}/v1/users/${id}`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({user: {screenName, email, isPrivate, description}})
  })
}

export function updatePassword({currentPassword, password, passwordConfirmation}) {
  return fetch(`${apiConfig.host}/v1/users/updatePassword`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
      'X-Authentication-Token': getToken()
    },
    'body': `password=${password}&passwordConfirmation=${passwordConfirmation}&currentPassword=${currentPassword}`
  })
}

export function updateProfilePicture({picture}) {
  let data = new FormData()
  data.append('file', picture)

  return fetch(`${apiConfig.host}/v1/users/updateProfilePicture`, {
    'method': 'POST',
    'headers': {
      'X-Authentication-Token': getToken()
    },
    'body': data
  })
}

const userAction = action => ({username}) => {
  return fetch(`${apiConfig.host}/v1/users/${username}/${action}`, {
    method: 'POST',
    'headers': {
      'X-Authentication-Token': getToken(),
    },
  })
}

export const ban = userAction('ban')
export const unban = userAction('unban')
export const subscribe = userAction('subscribe')
export const unsubscribe = userAction('unsubscribe')


export function getUserComments({username, offset}) {
  return fetch(`${apiConfig.host}/v1/timelines/${username}/comments?offset=${offset}`, getRequestOptions())
}

export function getUserLikes({username, offset}) {
  return fetch(`${apiConfig.host}/v1/timelines/${username}/likes?offset=${offset}`, getRequestOptions())
}

export function getSubscribers({username}) {
  return fetch(`${apiConfig.host}/v1/users/${username}/subscribers`, getRequestOptions())
}

export function getSubscriptions({username}) {
  return fetch(`${apiConfig.host}/v1/users/${username}/subscriptions`, getRequestOptions())
}

export function getUserInfo({username}) {
  return fetch(`${apiConfig.host}/v1/users/${username}`, getRequestOptions())
}

export function updateGroup({id, screenName, description}) {
  return fetch(`${apiConfig.host}/v1/users/${id}`, {
    'method': 'PUT',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication-Token': getToken()
    },
    'body': JSON.stringify({user: {screenName, description}})
  })
}

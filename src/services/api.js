import fetch from 'isomorphic-fetch'
import {getToken} from './auth'
import {api as apiConfig} from '../config'

const getRequestOptions = () => ({
  headers:{
    'Accept': 'application/json',
    'X-Authentication-Token': getToken()
  }
})

export function getWhoAmI(){
  return fetch(`${apiConfig.host}/v1/users/whoami`, getRequestOptions())
}

export function getHome({offset}) {
  return fetch(
    `${apiConfig.host}/v1/timelines/home?offset=${offset}`, getRequestOptions())
}

const MAX_LIKES = 4

export function getMoreComments({postId, likesExpanded}) {
  const maxLikes = likesExpanded ? 'all' : `${MAX_LIKES}`
  return fetch(
    `${apiConfig.host}/v1/posts/${postId}?maxComments=all&maxLikes=${maxLikes}`, getRequestOptions())
}

const MAX_COMMENTS = 2

export function getMoreLikes({postId, commentsExpanded}) {
  const maxComments = commentsExpanded ? 'all' : `${MAX_COMMENTS}`
  return fetch(
    `${apiConfig.host}/v1/posts/${postId}?maxComments=${maxComments}&maxLikes=all`, getRequestOptions())
}

export function signIn(credentials){
  return fetch(`${apiConfig.host}/v1/session`, {
    headers:{
      'Accept': 'application/json',
      'Content-Type':'application/x-www-form-urlencoded',
    },
    method: 'POST',
    body: `username=${credentials.username}&password=${credentials.password}`,
  })
}

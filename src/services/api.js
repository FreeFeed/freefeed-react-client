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

export function getPostDetails(postId) {
  return fetch(
    `${apiConfig.host}/v1/posts/${postId}?maxComments=all&maxLikes=${MAX_LIKES}`, getRequestOptions())
}

export function signIn(credentials){
  debugger
  return fetch(`${apiConfig.host}/v1/session`, {
    headers:{
      Accept: 'application/json'
    },
    method: 'POST',
    body: new FormData(credentials),
  })
}

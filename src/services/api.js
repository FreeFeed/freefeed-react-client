import fetch from 'isomorphic-fetch'
import {getToken} from './auth'

const API_HOST = 'http://localhost:3000'

const getRequestOptions = () => ({
  headers:{
      'Accept': 'application/json',
      'X-Authentication-Token': getToken()
    }
})

export function getWhoAmI(){
  return fetch(`${API_HOST}/v1/users/whoami`, getRequestOptions())
}

export function getHome({offset}) {
  return fetch(
    `${API_HOST}/v1/timelines/home?offset=${offset}`, getRequestOptions())
}

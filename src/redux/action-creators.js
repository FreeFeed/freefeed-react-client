export const SERVER_ERROR = 'SERVER_ERROR'

export function serverError(error) {
  return {
    type: SERVER_ERROR,
    error
  }
}

export const UNAUTHENTICATED = 'UNAUTHENTICATED'

export function unauthenticated() {
  return {
    type: UNAUTHENTICATED
  }
}

export const request = (type) =>`${type}_REQUEST`
export const response = (type) => `${type}_RESPONSE`
export const fail = (type) => `${type}_FAIL`

import {getWhoAmI, getHome} from '../services/api'

export const WHO_AM_I = 'WHO_AM_I'

export function whoAmI(){
  return {
    type: WHO_AM_I,
    apiRequest: getWhoAmI,
  }
}

export const HOME = 'HOME'

export function home(offset = 0){
  return {
    type: HOME,
    apiRequest: getHome,
    payload: {offset}
  }
}

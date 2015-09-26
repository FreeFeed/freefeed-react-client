export const HOME = 'HOME'
export const SERVER_ERROR = 'SERVER_ERROR'

export function serverError() {
  return {
    type: SERVER_ERROR
  }
}

export const WHO_AM_I_REQUEST = 'WHO_AM_I_REQUEST'
export const WHO_AM_I_RESPONSE = 'WHO_AM_I_RESPONSE'
export const WHO_AM_I_FAIL = 'WHO_AM_I_FAIL'

export function whoAmIRequest() {
  return {
    type: WHO_AM_I_REQUEST,
  }
}

export function whoAmIResponse(authenticated, users) {
  return {
    type: WHO_AM_I_RESPONSE,
    authenticated,
    users,
  }
}

export function whoAmIFail() {
  return {
    type: WHO_AM_I_FAIL,
  }
}

import {getWhoAmI, getHome} from '../Services/api'

export function whoAmI(){
  return async (dispatch) => {
    dispatch(whoAmIRequest())
    try
    {
      const response = await getWhoAmI()
      if (response.status === 200) {
        const obj = await response.json()
        dispatch(whoAmIResponse(true, obj.users))
      } else if (response.status === 401) {
        dispatch(whoAmIResponse(false))
      } else {
        dispatch(whoAmIFail())
      }
    }
    catch (e) {
      dispatch(serverError())
    }
  }
}

export const HOME_REQUEST = 'HOME_REQUEST'
export const HOME_RESPONSE = 'HOME_RESPONSE'
export const HOME_FAIL = 'HOME_FAIL'

export function homeRequest() {
  return {
    type: HOME_REQUEST,
  }
}

export function homeResponse(authenticated, users, posts) {
  return {
    type: HOME_RESPONSE,
    authenticated,
    users,
    posts,
  }
}

export function homeFail() {
  return {
    type: HOME_FAIL,
  }
}

export function home(offset){
  return async (dispatch) => {
    dispatch(homeRequest())
    try {
      const response = await getHome(offset)
      if (response.status === 200) {
        const obj = await response.json()
        dispatch(homeResponse(true, obj.users, obj.posts))
      } else if (response.status === 401) {
        dispatch(whoAmIResponse(false))
      } else {
        dispatch(homeFail())
      }
    } catch (e) {
      dispatch(serverError())
    }
  }
}

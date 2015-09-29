import {unauthenticated, serverError, request, response, fail, SIGN_IN, UNAUTHENTICATED} from './action-creators'

//middleware for api requests
export const apiMiddleware = store => next => async (action) => {
  //ignore normal actions
  if (!action.apiRequest){
    return next(action)
  }

  //dispatch request begin action
  //clean apiRequest to not get caught by this middleware
  next({...action, type: request(action.type), apiRequest: null})
  try {
    const apiResponse = await action.apiRequest(action.payload)
    const obj = await apiResponse.json()
    if (apiResponse.status === 200) {
      return next({payload: obj, type: response(action.type)})
    } else if (apiResponse.status === 401) {
      return next(unauthenticated(...obj))
    } else {
      return next({payload: obj, type: fail(action.type)})
    }
  } catch (e) {
    return next(serverError(e))
  }
}

import {setToken} from '../services/auth'

export const authMiddleware = store => next => action => {
  if ([response(SIGN_IN), UNAUTHENTICATED].indexOf(action.type) !== -1){
    setToken(action.payload.authToken)
    // if (!action.payload.authToken) {
    //   window.location.assign('../login')
    // }
  }

  return next(action)
}
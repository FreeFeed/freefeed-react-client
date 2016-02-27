import * as ActionCreators from './action-creators'
import * as ActionTypes from './action-types'
import {request, response, fail, requiresAuth, isFeedResponse} from './action-helpers'

//middleware for api requests
export const apiMiddleware = store => next => async (action) => {
  //ignore normal actions
  if (!action.apiRequest){
    return next(action)
  }

  //dispatch request begin action
  //clean apiRequest to not get caught by this middleware
  var t = store.dispatch({...action, type: request(action.type), apiRequest: null})
  try {
    const apiResponse = await action.apiRequest(action.payload)
    const obj = await apiResponse.json()
    if (apiResponse.status === 200) {
      return store.dispatch({payload: obj, type: response(action.type), request: action.payload})
    } else if (apiResponse.status === 401) {
      return store.dispatch(ActionCreators.unauthenticated(obj))
    } else {
      return store.dispatch({payload: obj, type: fail(action.type), request: action.payload})
    }
  } catch (e) {
    return store.dispatch(ActionCreators.serverError(e))
  }
}

import {setToken, persistUser} from '../services/auth'
import {userParser} from '../utils'
import {browserHistory} from 'react-router'

export const authMiddleware = store => next => action => {

  //stop action propagation if it should be authed and user is not authed
  if (requiresAuth(action) && !store.getState().authenticated) {
    return
  }

  if(action.type === ActionTypes.UNAUTHENTICATED) {
    setToken()
    persistUser()
    next(action)
    const pathname = (store.getState().routing.locationBeforeTransitions || {}).pathname
    if (!pathname || pathname.indexOf('signin') !== -1 || pathname.indexOf('signup') !== -1){
      return
    }
    return browserHistory.push('/signin')
  }

  if(action.type === response(ActionTypes.SIGN_IN) ||
     action.type === response(ActionTypes.SIGN_UP) ) {
    setToken(action.payload.authToken)
    next(action)
    store.dispatch(ActionCreators.whoAmI())
    return browserHistory.push('/')
  }

  if(action.type === response(ActionTypes.WHO_AM_I) ||
     action.type === response(ActionTypes.UPDATE_USER) ) {
    persistUser(userParser(action.payload.users))
    return next(action)
  }

  return next(action)
}

export const likesLogicMiddleware = store => next => action => {
  switch(action.type){
    case ActionTypes.SHOW_MORE_LIKES: {
      const postId = action.payload.postId
      const post = store.getState().posts[postId]
      const isSync = (post.omittedLikes === 0)
      if (isSync) {
        return store.dispatch(ActionCreators.showMoreLikesSync(postId))
      } else {
        return store.dispatch(ActionCreators.showMoreLikesAsync(postId))
      }
    }
  }

  return next(action)
}

export const userPhotoLogicMiddleware = store => next => action => {
  if (action.type === response(ActionTypes.UPDATE_USER_PHOTO)) {
    //update data after new photo posted
    store.dispatch(whoAmI())
  }

  return next(action)
}

export const redirectionMiddleware = store => next => action => {
  //go to home if single post has been removed
  if (action.type === response(ActionTypes.DELETE_POST) && store.getState().singlePostId) {
    return browserHistory.push('/')
  }

  return next(action)
}

export const scrollMiddleware = store => next => action => {
  if (isFeedResponse(action) || action.type === response(ActionTypes.GET_SINGLE_POST)){
    scrollTo(0, 0)
  }
  return next(action)
}

export const pendingRequestsMiddleware = store => next => action => {
  if (action.type === response(ActionTypes.WHO_AM_I)) {
    next(action)

    if (store.getState().user.pendingGroupRequests) {
      store.dispatch(ActionCreators.groupRequests())
    }

    return
  }

  return next(action)
}

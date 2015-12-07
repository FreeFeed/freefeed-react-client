import * as ActionCreators from './action-creators'
const {request, response, fail} = ActionCreators

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
import {pushState} from 'redux-router'

export const authMiddleware = store => next => action => {

  //stop action propagation if it should be authed and user is not authed
  if (ActionCreators.requiresAuth(action) && !store.getState().authenticated) {
    return
  }

  switch(action.type){
    case ActionCreators.UNAUTHENTICATED: {
      setToken()
      persistUser()
      next(action)
      return store.dispatch(pushState(null, '/login', {}))
    }
    case response(ActionCreators.SIGN_IN): {
      setToken(action.payload.authToken)
      next(action)
      store.dispatch(whoAmI())
      return store.dispatch(pushState(null, '/', {}))
    }
    case response(ActionCreators.WHO_AM_I): {
      persistUser(userParser(action.payload.users))
      break
    }
    case response(ActionCreators.UPDATE_USER): {
      persistUser(userParser(action.payload.users))
      break
    }
  }

  return next(action)
}

export const likesLogicMiddleware = store => next => action => {
  switch(action.type){
    case ActionCreators.SHOW_MORE_LIKES: {
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
  if (action.type === response(ActionCreators.UPDATE_USER_PHOTO)) {
    //update data after new photo posted
    store.dispatch(whoAmI())
  }

  return next(action)
}

export const redirectionMiddleware = store => next => action => {
  //go to home if single post has been removed
  if (action.type === response(ActionCreators.DELETE_POST) && store.getState().singlePostId) {
    return store.dispatch(pushState(null, '/', {}))
  }

  return next(action)
}

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
import {userParser, getCurrentRouteName} from '../utils'
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

import {init, scrollCompensator} from '../services/realtime'
import {frontendPreferences as frontendPrefsConfig} from '../config'

const bindHandlers = store => ({
  'post:new': scrollCompensator(data => {
    const state = store.getState()
    const isFirstPage = !state.routing.locationBeforeTransitions.query.offset
    if (isFirstPage){

      const isHomeFeed = state.routing.locationBeforeTransitions.pathname === '/'
      const useRealtimePreference = state.user.frontendPreferences.realtimeActive

      if (!isHomeFeed || (useRealtimePreference && isHomeFeed)){
        return store.dispatch({...data, type: ActionTypes.REALTIME_POST_NEW, post: data.posts})
      }
    }
    return false
  }),
  'post:update': scrollCompensator(data => store.dispatch({...data, type: ActionTypes.REALTIME_POST_UPDATE, post: data.posts})),
  'post:destroy': scrollCompensator(data => store.dispatch({type: ActionTypes.REALTIME_POST_DESTROY, postId: data.meta.postId})),
  'post:hide': scrollCompensator(data => store.dispatch({type: ActionTypes.REALTIME_POST_HIDE, postId: data.meta.postId})),
  'post:unhide': scrollCompensator(data => store.dispatch({type: ActionTypes.REALTIME_POST_UNHIDE, postId: data.meta.postId})),
  'comment:new': scrollCompensator(data => store.dispatch({...data, type: ActionTypes.REALTIME_COMMENT_NEW, comment: data.comments})),
  'comment:update': scrollCompensator(data => store.dispatch({...data, type: ActionTypes.REALTIME_COMMENT_UPDATE, comment: data.comments})),
  'comment:destroy': scrollCompensator(data => store.dispatch({type: ActionTypes.REALTIME_COMMENT_DESTROY, commentId: data.commentId, postId: data.postId})),
  'like:new': scrollCompensator(data => store.dispatch({type: ActionTypes.REALTIME_LIKE_NEW, postId: data.meta.postId, users:[data.users]})),
  'like:remove': scrollCompensator(data => store.dispatch({type: ActionTypes.REALTIME_LIKE_REMOVE, postId: data.meta.postId, userId: data.meta.userId})),
})

export const realtimeMiddleware = store => {
  const handlers = bindHandlers(store)
  let realtimeConnection
  return next => action => {

    if (action.type === ActionTypes.UNAUTHENTICATED) {
      if (realtimeConnection){
        realtimeConnection.disconnect()
        realtimeConnection = undefined
      }
    }

    if (isFeedResponse(action)){
      if (!realtimeConnection){
        realtimeConnection = init(handlers)
      }
      realtimeConnection.changeSubscription({timeline:[action.payload.timelines.id]})
    }

    if (action.type === response(ActionTypes.GET_SINGLE_POST)){
      if (!realtimeConnection){
        realtimeConnection = init(handlers)
      }
      realtimeConnection.changeSubscription({post:[action.payload.posts.id]})
    }

    return next(action)
  }
}

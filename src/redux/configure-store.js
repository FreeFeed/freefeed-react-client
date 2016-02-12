import {compose, createStore, applyMiddleware, combineReducers} from 'redux'
import loggerMiddleware from 'redux-logger'
import {createHistory, createHashHistory} from 'history'
import {reduxReactRouter, routerStateReducer} from 'redux-router'
import {apiMiddleware, authMiddleware, likesLogicMiddleware, userPhotoLogicMiddleware,
        redirectionMiddleware, scrollMiddleware, realtimeMiddleware,
        pendingGroupRequestsMiddleware} from './middlewares'
import * as reducers from './reducers'

//order matters — we need to stop unauthed async fetching before request, see authMiddleware
let middleware = [
  authMiddleware,
  apiMiddleware,
  likesLogicMiddleware,
  userPhotoLogicMiddleware,
  redirectionMiddleware,
  scrollMiddleware,
  realtimeMiddleware,
  pendingGroupRequestsMiddleware
]

const isDevelopment = process.env.NODE_ENV != 'production'

//tells webpack to include logging middleware in dev mode
if (isDevelopment) {
  middleware.push(loggerMiddleware())
}

let enhancers = [applyMiddleware(...middleware),
  reduxReactRouter({ createHistory }),]

//tells webpack to include devtool enhancer in dev mode
if (isDevelopment && window.devToolsExtension) {
  enhancers.push(window.devToolsExtension())
}

const storeEnhancer = compose(...enhancers)

const createStoreWithMiddleware = storeEnhancer(createStore)
const reducer = combineReducers({...reducers, router: routerStateReducer})

export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState)
}

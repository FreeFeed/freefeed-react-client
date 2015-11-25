import {compose, createStore, applyMiddleware, combineReducers} from 'redux'
import loggerMiddleware from 'redux-logger'
import {createHistory, createHashHistory} from 'history'
import {reduxReactRouter, routerStateReducer} from 'redux-router'
import {apiMiddleware, authMiddleware, likesLogicMiddleware, userPhotoLogicMiddleware, redirectionMiddleware} from './middlewares'
import * as reducers from './reducers'

//order matters — we need to stop unauthed async fetching before request, see authMiddleware
let middleware = [ authMiddleware, apiMiddleware, likesLogicMiddleware, userPhotoLogicMiddleware, redirectionMiddleware ]

const isDevelopment = process.env.NODE_ENV != 'production'

//tells webpack to include logging middleware in dev mode
if (isDevelopment) {
  middleware.push(loggerMiddleware())
}

const history = isDevelopment ? createHashHistory : createHistory

let enhancers = [applyMiddleware(...middleware),
  reduxReactRouter({ createHistory: history}),]

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

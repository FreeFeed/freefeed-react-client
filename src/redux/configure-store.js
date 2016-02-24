import {compose, createStore, applyMiddleware, combineReducers} from 'redux'
import {syncHistory, routeReducer} from 'react-router-redux'
import {browserHistory} from 'react-router'
import {reduxReactRouter, routerStateReducer} from 'redux-router'
import {apiMiddleware, authMiddleware, likesLogicMiddleware, userPhotoLogicMiddleware, redirectionMiddleware, scrollMiddleware, realtimeMiddleware} from './middlewares'
import * as reducers from './reducers'

//order matters — we need to stop unauthed async fetching before request, see authMiddleware
const middleware = [ authMiddleware, apiMiddleware, likesLogicMiddleware, userPhotoLogicMiddleware, redirectionMiddleware, scrollMiddleware, realtimeMiddleware, syncHistory(browserHistory) ]

const isDevelopment = process.env.NODE_ENV != 'production'

let enhancers = [applyMiddleware(...middleware),]

//tells webpack to include devtool enhancer in dev mode
if (isDevelopment && window.devToolsExtension) {
  enhancers.push(window.devToolsExtension())
}

const storeEnhancer = compose(...enhancers)

const createStoreWithMiddleware = storeEnhancer(createStore)
const reducer = combineReducers({...reducers, routing: routeReducer})

export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState)
}

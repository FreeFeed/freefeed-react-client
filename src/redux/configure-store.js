import {compose, createStore, applyMiddleware, combineReducers} from 'redux'
import loggerMiddleware from 'redux-logger'
import {createHashHistory} from 'history'
import {reduxReactRouter, routerStateReducer} from 'redux-router'
import {apiMiddleware, authMiddleware} from './middlewares'
import * as reducers from './reducers'

//order matters — we need to stop unauthed async fetching before request, see authMiddleware
let middleware = [ authMiddleware, apiMiddleware ]

//tells webpack to include logging middleware in dev mode
if (process.env.NODE_ENV != 'production') {
  middleware.push(loggerMiddleware())
}

const storeEnhancer = compose(
  applyMiddleware(...middleware),
  reduxReactRouter({ createHistory: createHashHistory })
)

const createStoreWithMiddleware = storeEnhancer(createStore)
const reducer = combineReducers({...reducers, router: routerStateReducer})

export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState)
}

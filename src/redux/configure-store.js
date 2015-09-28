import { createStore, applyMiddleware, combineReducers } from 'redux'
import loggerMiddleware from 'redux-logger'
import {apiMiddleware} from './middlewares'
import * as reducers from './reducers'

let middleware = [ apiMiddleware ]

if (process.env.NODE_ENV != 'production') {
  middleware.push(loggerMiddleware())
}

const storeEnhancer = applyMiddleware.apply(null, middleware)
const createStoreWithMiddleware = storeEnhancer(createStore)
const reducer = combineReducers(reducers)

export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState)
}

import {compose, createStore, applyMiddleware, combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

import {
  apiMiddleware,
  authMiddleware,
  likesLogicMiddleware,
  optimisticLikesMiddleware,
  userPhotoLogicMiddleware,
  groupPictureLogicMiddleware,
  redirectionMiddleware,
  requestsMiddleware,
  markDirectsAsReadMiddleware,
  realtimeMiddleware,
  dataFixMiddleware
} from './middlewares';

import * as reducers from './reducers';

//order matters — we need to stop unauthed async fetching before request, see authMiddleware
const middleware = [
  authMiddleware,
  apiMiddleware,
  dataFixMiddleware,
  likesLogicMiddleware,
  optimisticLikesMiddleware,
  userPhotoLogicMiddleware,
  groupPictureLogicMiddleware,
  redirectionMiddleware,
  requestsMiddleware,
  markDirectsAsReadMiddleware,
  realtimeMiddleware
];

const enhancers = [applyMiddleware(...middleware),];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const storeEnhancer = composeEnhancers(...enhancers);

const createStoreWithMiddleware = storeEnhancer(createStore);
const reducer = combineReducers({...reducers, routing: routerReducer});

export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState);
}

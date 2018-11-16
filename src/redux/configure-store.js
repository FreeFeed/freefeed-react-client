import { compose, createStore, applyMiddleware, combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

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
  markNotificationsAsReadMiddleware,
  realtimeMiddleware,
  dataFixMiddleware
} from './middlewares';

import * as reducers from './reducers';
import * as ActionCreators from "./action-creators";

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
  markNotificationsAsReadMiddleware,
  realtimeMiddleware
];

const enhancers = [applyMiddleware(...middleware)];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const storeEnhancer = composeEnhancers(...enhancers);

const createStoreWithMiddleware = storeEnhancer(createStore);
const reducer = combineReducers({ ...reducers, routing: routerReducer });

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(reducer, initialState);

  // Initial subscription
  store.dispatch(ActionCreators.realtimeSubscribe('global:users'));

  return store;
}

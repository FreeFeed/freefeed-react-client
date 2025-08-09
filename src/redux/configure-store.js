import { compose, createStore, applyMiddleware, combineReducers } from 'redux';

import { routerReducer } from '../services/nouter/redux';
import {
  feedViewOptionsMiddleware,
  apiMiddleware,
  asyncMiddleware,
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
  dataFixMiddleware,
  appearanceMiddleware,
  initialWhoamiMiddleware,
  unscrollMiddleware,
  subscriptionMiddleware,
  onResponseMiddleware,
  betaChannelMiddleware,
  commentsCompleteMiddleware,
  appVersionMiddleware,
  reloadFeedMiddleware,
  draftsMiddleware,
  resetPasswordCompleteMiddleware,
  abortableUploadMiddleware,
  undoMiddleware,
  historyMiddleware$Factory,
} from './middlewares';

import * as reducers from './reducers';
import * as ActionCreators from './action-creators';

//order matters — we need to stop unauthed async fetching before request, see authMiddleware
const middlewares = [
  unscrollMiddleware,
  feedViewOptionsMiddleware,
  authMiddleware,
  apiMiddleware,
  abortableUploadMiddleware,
  asyncMiddleware,
  dataFixMiddleware,
  likesLogicMiddleware,
  optimisticLikesMiddleware,
  userPhotoLogicMiddleware,
  groupPictureLogicMiddleware,
  redirectionMiddleware,
  requestsMiddleware,
  markDirectsAsReadMiddleware,
  markNotificationsAsReadMiddleware,
  realtimeMiddleware,
  appearanceMiddleware,
  initialWhoamiMiddleware,
  resetPasswordCompleteMiddleware,
  subscriptionMiddleware,
  onResponseMiddleware,
  betaChannelMiddleware,
  commentsCompleteMiddleware,
  appVersionMiddleware,
  reloadFeedMiddleware,
  draftsMiddleware,
  undoMiddleware,
  historyMiddleware$Factory,
];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const reducer = combineReducers({ ...reducers, routing: routerReducer });

export default function configureStore(initialState, deps) {
  const resolvedMiddlewares = middlewares.map((m) => (m.name.endsWith('$Factory') ? m(deps) : m));
  const storeEnhancer = composeEnhancers(applyMiddleware(...resolvedMiddlewares));
  const createStoreWithMiddleware = storeEnhancer(createStore);
  const store = createStoreWithMiddleware(reducer, initialState);

  // Initial subscription
  store.dispatch(ActionCreators.realtimeSubscribe('global:users'));

  return store;
}

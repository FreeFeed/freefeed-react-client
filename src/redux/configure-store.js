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
  reorderPinnedMiddleware,
  historyMiddlewareFactory,
} from './middlewares';

import * as reducers from './reducers';
import * as ActionCreators from './action-creators';

// Order matters — we need to stop unauthed async fetching before request, see authMiddleware
const middlewareFactories = [
  () => unscrollMiddleware,
  () => feedViewOptionsMiddleware,
  () => authMiddleware,
  () => apiMiddleware,
  () => abortableUploadMiddleware,
  () => asyncMiddleware,
  () => dataFixMiddleware,
  () => likesLogicMiddleware,
  () => optimisticLikesMiddleware,
  () => userPhotoLogicMiddleware,
  () => groupPictureLogicMiddleware,
  () => redirectionMiddleware,
  () => requestsMiddleware,
  () => markDirectsAsReadMiddleware,
  () => markNotificationsAsReadMiddleware,
  () => realtimeMiddleware,
  () => appearanceMiddleware,
  () => initialWhoamiMiddleware,
  () => resetPasswordCompleteMiddleware,
  () => subscriptionMiddleware,
  () => onResponseMiddleware,
  () => betaChannelMiddleware,
  () => commentsCompleteMiddleware,
  () => appVersionMiddleware,
  () => reloadFeedMiddleware,
  () => draftsMiddleware,
  () => undoMiddleware,
  historyMiddlewareFactory,
  // This middleware should be after other feed-modifiers
  () => reorderPinnedMiddleware,
];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const reducer = combineReducers({ ...reducers, routing: routerReducer });

export default function configureStore(initialState, deps) {
  const middlewares = middlewareFactories.map((m) => m(deps));
  const storeEnhancer = composeEnhancers(applyMiddleware(...middlewares));
  const createStoreWithMiddleware = storeEnhancer(createStore);
  const store = createStoreWithMiddleware(reducer, initialState);

  // Initial subscription
  store.dispatch(ActionCreators.realtimeSubscribe('global:users'));

  return store;
}

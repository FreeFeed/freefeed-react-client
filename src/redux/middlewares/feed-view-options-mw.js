import { CHRONOLOGIC } from '../../utils/feed-options';
import { home, updateUserPreferences } from '../action-creators';
import { getFeedName, isFeedGeneratingAction, isUserChangeResponse } from '../action-helpers';
import { HOME, TOGGLE_FEED_SORT } from '../action-types';

export const feedViewOptionsMiddleware = (store) => (next) => (action) => {
  if (isFeedGeneratingAction(action)) {
    //add sorting params to feed request if needed
    const state = store.getState();
    const { sort: currentFeedSort, currentFeed } = state.feedViewOptions;
    const { homeFeedSort, homeFeedMode } = state.user.frontendPreferences;
    if (currentFeed === getFeedName(action)) {
      action.payload.sortChronologically = currentFeedSort === CHRONOLOGIC;
    } else {
      //use home feed setting if we get back to home feed
      //this change isn't yet in reducer, and we don't get it there before real feed request fires
      action.payload.sortChronologically = action.type === HOME && homeFeedSort === CHRONOLOGIC;
    }
    if (action.type === HOME) {
      action.payload.homeFeedMode = homeFeedMode;
    }
  }
  if (action.type === TOGGLE_FEED_SORT) {
    //here we persist home sort preference change
    const { currentFeed } = store.getState().feedViewOptions;
    if (currentFeed === HOME) {
      //we get reducer process sort toggling and do our job updating setting after that
      next(action);
      //and request next state only after update is done
      const { user, feedViewOptions } = store.getState();
      const { id, frontendPreferences } = user;
      const { sort: homeFeedSort } = feedViewOptions;
      return store.dispatch(
        updateUserPreferences(id, { ...frontendPreferences, homeFeedSort }, {}, true),
      );
    }
  }
  if (isUserChangeResponse(action)) {
    //here we handle home sort settings changed on another machine
    const sortBefore = store.getState().user.frontendPreferences.homeFeedSort;
    next(action);
    const state = store.getState();
    const { homeFeedSort } = state.user.frontendPreferences;
    const isHomeFeed = state.routing.locationBeforeTransitions.pathname === '/';
    if (homeFeedSort !== sortBefore && isHomeFeed) {
      return store.dispatch(home());
    }
    return;
  }
  return next(action);
};

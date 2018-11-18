/*global Raven*/
import { browserHistory } from 'react-router';
import _ from 'lodash';

import { getPost } from '../services/api';
import { setToken, persistUser } from '../services/auth';
import { Connection, scrollCompensator } from '../services/realtime';
import { userParser, delay } from '../utils';
import * as FeedSortOptions from '../utils/feed-sort-options';

import * as ActionCreators from './action-creators';
import * as ActionTypes from './action-types';
import { request, response, fail, requiresAuth, isFeedRequest, isFeedResponse, isFeedGeneratingAction } from './action-helpers';

export const feedSortMiddleware = (store) => (next) => (action) => {
  if (isFeedGeneratingAction(action)) {
    //add sorting params to feed request if needed
    const state = store.getState();
    const { sort: currentFeedSort, currentFeedType } = state.feedSort;
    const { homeFeedSort } = state.user.frontendPreferences;
    if (currentFeedType === request(action.type)) {
      action.payload.sortChronologically = currentFeedSort === FeedSortOptions.CHRONOLOGIC;
    } else {
      //use home feed setting if we get back to home feed
      //this change isn't yet in reducer, and we don't get it there before real feed request fires
      action.payload.sortChronologically = action.type === ActionTypes.HOME && homeFeedSort === FeedSortOptions.CHRONOLOGIC;
    }
  }
  if (action.type === ActionTypes.TOGGLE_FEED_SORT) {
    //here we persist home sort preference change
    const { currentFeedType } = store.getState().feedSort;
    if (currentFeedType === request(ActionTypes.HOME)) {
      //we get reducer process sort toggling and do our job updating setting after that
      next(action);
      //and request next state only after update is done
      const { user, feedSort } = store.getState();
      const { id, frontendPreferences } = user;
      const { sort: homeFeedSort } = feedSort;
      return store.dispatch(ActionCreators.updateUserPreferences(id, { ...frontendPreferences, homeFeedSort }));
    }
  }
  if (action.type === response(ActionTypes.WHO_AM_I)) {
    //here we handle home sort settings changed on another machine
    const sortBefore = store.getState().user.frontendPreferences.homeFeedSort;
    next(action);
    const state = store.getState();
    const { homeFeedSort } = state.user.frontendPreferences;
    const isHomeFeed = state.routing.locationBeforeTransitions.pathname === '/';
    if (homeFeedSort !== sortBefore && isHomeFeed) {
      return store.dispatch(ActionCreators.home());
    }
    return;
  }
  return next(action);
};

//middleware for api requests
export const apiMiddleware = (store) => (next) => async (action) => {
  //ignore normal actions
  if (!action.apiRequest) {
    return next(action);
  }

  //dispatch request begin action
  //clean apiRequest to not get caught by this middleware
  store.dispatch({ ...action, type: request(action.type), apiRequest: null });
  try {
    const apiResponse = await action.apiRequest(action.payload);
    const obj = await apiResponse.json();

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      return store.dispatch({ payload: obj, type: response(action.type), request: action.payload });
    }

    if (apiResponse.status === 401) {
      return store.dispatch(ActionCreators.unauthenticated(obj));
    }

    return store.dispatch({ payload: obj, type: fail(action.type), request: action.payload, response: apiResponse });
  } catch (e) {
    if (typeof Raven !== 'undefined') {
      Raven.captureException(e, { level: 'error', tags: { area: 'redux/apiMiddleware' }, extra: { action } });
    }
    return store.dispatch({ payload: { err: 'Network error' }, type: fail(action.type), request: action.payload, response: null });
  }
};

const paths = ['friends',
  '/settings',
  '/filter/notifications',
  '/filter/direct',
  '/groups',
  '/groups/create',
  '/summary',
  '/memories',
];

function shouldGoToSignIn(pathname) {
  return pathname && paths.some((path) => pathname.indexOf(path) === 0);
}

export const authMiddleware = (store) => {
  let firstUnauthenticated = true;

  return (next) => (action) => {
    //stop action propagation if it should be authed and user is not authed
    if (requiresAuth(action) && !store.getState().authenticated) {
      return;
    }

    if (action.type === ActionTypes.UNAUTHENTICATED) {
      setToken();
      persistUser();
      next(action);
      if (firstUnauthenticated) {
        firstUnauthenticated = false;
        const { pathname } = window.location;
        if (shouldGoToSignIn(pathname)) {
          store.dispatch(ActionCreators.requireAuthentication());
          return browserHistory.push(`/signin?back=${pathname}`);
        }
      }
      return;
    }


    if (action.type === response(ActionTypes.SIGN_IN) ||
       action.type === response(ActionTypes.SIGN_UP)) {
      firstUnauthenticated = false;
      setToken(action.payload.authToken);
      next(action);
      store.dispatch(ActionCreators.whoAmI());

      // Do not redirect to Home page if signed in at Bookmarklet
      const { pathname } = (store.getState().routing.locationBeforeTransitions || {});
      if (pathname === '/bookmarklet') {
        return;
      }

      const backTo = store.getState().routing.locationBeforeTransitions.query.back || '/';
      return browserHistory.push(`${backTo}`);
    }

    if (action.type === response(ActionTypes.WHO_AM_I) ||
       action.type === response(ActionTypes.UPDATE_USER)) {
      persistUser(userParser(action.payload.users));
      return next(action);
    }

    return next(action);
  };
};

export const likesLogicMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case ActionTypes.SHOW_MORE_LIKES: {
      const { postId } = action.payload;
      const post = store.getState().posts[postId];
      const isSync = (post.omittedLikes === 0);

      const nextAction = isSync ? ActionCreators.showMoreLikesSync(postId) : ActionCreators.showMoreLikesAsync(postId);

      return store.dispatch(nextAction);
    }
    case ActionTypes.REALTIME_LIKE_REMOVE: {
      const { postId, userId } = action;
      const post = store.getState().posts[postId];
      // it is necessary for proper update postsViewState
      action.isLikeVisible = _.includes(post.likes, userId);
      return next(action);
    }
  }

  return next(action);
};

class ActionsQueue {
  q = [];

  push(action, store) {
    this.q.push(action);
    if (this.q.length === 1) {
      store.dispatch(action);
    }
  }

  next(store) {
    this.q.shift();
    if (this.q.length > 0) {
      store.dispatch(this.q[0]);
    }
  }
}

const cleanLikeErrorTimeout = 10000;
const likeActionsQueue = new ActionsQueue();
const ignoreMyLikes = {};
const ignoreMyUnlikes = {};
const cleanLikeErrorTimers = {};

export const optimisticLikesMiddleware = (store) => (next) => (action) => {
  switch (action.type) {
    case ActionTypes.LIKE_POST_OPTIMISTIC: {
      next(action);

      const { postId, userId } = action.payload;
      ignoreMyLikes[postId] = (ignoreMyLikes[postId] || 0) + 1;
      likeActionsQueue.push(ActionCreators.likePostRequest(postId, userId), store);
      return;
    }
    case ActionTypes.UNLIKE_POST_OPTIMISTIC: {
      next(action);

      const { postId, userId } = action.payload;
      ignoreMyUnlikes[postId] = (ignoreMyUnlikes[postId] || 0) + 1;
      likeActionsQueue.push(ActionCreators.unlikePostRequest(postId, userId), store);
      return;
    }

    case response(ActionTypes.LIKE_POST):
    case response(ActionTypes.UNLIKE_POST): {
      next(action);
      likeActionsQueue.next(store);
      return;
    }

    case fail(ActionTypes.LIKE_POST):
    case fail(ActionTypes.UNLIKE_POST): {
      next(action);

      const { postId } = action.request;
      if (cleanLikeErrorTimers[postId]) {
        clearTimeout(cleanLikeErrorTimers[postId]);
      }
      cleanLikeErrorTimers[postId] = setTimeout(() => {
        store.dispatch(ActionCreators.cleanLikeError(postId));
        delete cleanLikeErrorTimers[postId];
      }, cleanLikeErrorTimeout);

      const ignore = _.startsWith(action.type, ActionTypes.LIKE_POST) ? ignoreMyLikes : ignoreMyUnlikes;
      if (ignore[postId]) {
        ignore[postId]--;
      }

      likeActionsQueue.next(store);
      return;
    }

    case ActionTypes.REALTIME_LIKE_NEW: {
      const myLike = action.users[0].id === store.getState().user.id;
      if (myLike && ignoreMyLikes[action.postId]) {
        ignoreMyLikes[action.postId]--;
        // skip for the own optimistic likes
        return;
      }
      return next(action);
    }
    case ActionTypes.REALTIME_LIKE_REMOVE: {
      const myLike = action.userId === store.getState().user.id;
      if (myLike && ignoreMyUnlikes[action.postId]) {
        ignoreMyUnlikes[action.postId]--;
        // skip for the own optimistic unlikes
        return;
      }
      return next(action);
    }
  }

  return next(action);
};

export const userPhotoLogicMiddleware = (store) => (next) => (action) => {
  if (action.type === response(ActionTypes.UPDATE_USER_PICTURE)) {
    // Update data after userpic is updated
    store.dispatch(ActionCreators.whoAmI());
  }

  return next(action);
};

export const groupPictureLogicMiddleware = (store) => (next) => (action) => {
  if (action.type === response(ActionTypes.UPDATE_GROUP_PICTURE)) {
    // Update data after group picture is updated
    store.dispatch(ActionCreators.getUserInfo(action.request.groupName));
  }

  return next(action);
};

function isInvitation({ locationBeforeTransitions }) {
  const { pathname, query } = locationBeforeTransitions;
  return pathname === '/filter/direct' && !!query.invite;
}

export const redirectionMiddleware = (store) => (next) => (action) => {
  //go to home if single post has been removed
  if (
    action.type === response(ActionTypes.DELETE_POST)
    && !action.payload.postStillAvailable
    && store.getState().singlePostId
  ) {
    return browserHistory.push('/');
  }

  if (action.type === response(ActionTypes.UNADMIN_GROUP_ADMIN) &&
      store.getState().user.id === action.request.user.id) {
    browserHistory.push(`/${action.request.groupName}/subscribers`);
  }

  if (action.type === response(ActionTypes.CREATE_POST) && isInvitation(store.getState().routing)) {
    browserHistory.push('/filter/direct');
  }

  return next(action);
};

export const requestsMiddleware = (store) => (next) => (action) => {
  if (action.type === response(ActionTypes.ACCEPT_USER_REQUEST)) {
    next(action);

    if (store.getState().routing.locationBeforeTransitions.pathname == '/friends') {
      const { username } = store.getState().user;
      store.dispatch(ActionCreators.subscribers(username));
    }

    return;
  }

  return next(action);
};

export const markDirectsAsReadMiddleware = (store) => (next) => (action) => {
  if (action.type === request(ActionTypes.DIRECT) && action.payload.offset == 0) {
    // needed to mark all directs as read
    store.dispatch(ActionCreators.markAllDirectsAsRead());
  }
  if (action.type === response(ActionTypes.DIRECT)) {
    if (store.getState().routing.locationBeforeTransitions.query.to) {
      store.dispatch(ActionCreators.expandSendTo());
    }
  }
  next(action);
};

export const markNotificationsAsReadMiddleware = (store) => (next) => (action) => {
  if (action.type === request(ActionTypes.GET_NOTIFICATIONS) && action.payload.offset == 0) {
    // needed to mark all notifications as read
    store.dispatch(ActionCreators.markAllNotificationsAsRead());
  }
  next(action);
};

const isFirstPage = (state) => !state.routing.locationBeforeTransitions.query.offset;
const isMemories = (state) => state.routing.locationBeforeTransitions.pathname.indexOf('memories') !== -1;

const isPostLoaded = ({ posts }, postId) => posts[postId];
const iLikedPost = ({ user, posts }, postId) => {
  const post = posts[postId];
  if (!post) {
    return false;
  }
  const likes = post.likes || [];
  return likes.indexOf(user.id) !== -1;
};
const dispatchWithPost = async (store, postId, action, filter = () => true, maxDelay = 0) => {
  let state = store.getState();
  const shouldBump = isFirstPage(state) && !isMemories(state);

  if (isPostLoaded(state, postId)) {
    return store.dispatch({ ...action, shouldBump });
  }

  if (maxDelay > 0) {
    await delay(Math.random() * maxDelay);
    state = store.getState();
    // if subscription was changed during delay
    if (action.realtimeChannels && _.intersection(action.realtimeChannels, state.realtimeSubscriptions).length === 0) {
      return;
    }
    // if post was loaded during delay
    if (isPostLoaded(state, postId)) {
      return store.dispatch({ ...action, shouldBump });
    }
  }
  const postResponse = await getPost({ postId });
  const post = await postResponse.json();

  if (filter(post, action, store.getState())) {
    return store.dispatch({ ...action, post, shouldBump });
  }
};

const isFirstFriendInteraction = (post, { users }, { subscriptions, comments }) => {
  const [newLike] = users;
  const myFriends = Object.keys(subscriptions).map((key) => subscriptions[key]).map((sub) => sub.user);
  const likesWithoutCurrent = post.posts.likes.filter((like) => like !== newLike);
  const friendsInvolved = (list) => list.filter((element) => myFriends.indexOf(element) !== -1).length;
  const friendsLikedBefore = friendsInvolved(likesWithoutCurrent);
  const newPostCommentAuthors = (post.comments || []).map((comment) => comment.createdBy);
  const commentsAuthors = (post.posts.comments || []).map((cId) => (comments[cId] || {}).createdBy);
  const friendsCommented = friendsInvolved([...commentsAuthors, ...newPostCommentAuthors]);
  const wasFirstInteraction = !friendsCommented && !friendsLikedBefore;
  return wasFirstInteraction;
};

const postFetchDelay = 20000; // 20 sec
const bindHandlers = (store) => ({
  'user:update': (data) => store.dispatch({ ...data, type: ActionTypes.REALTIME_USER_UPDATE }),
  'post:new': (data) => {
    const state = store.getState();
    const isFeedFirstPage = isFirstPage(state);
    const isHomeFeed = state.routing.locationBeforeTransitions.pathname === '/';
    const isMemoriesFeed = isMemories(state);
    const useRealtimePreference = state.user.frontendPreferences.realtimeActive;
    const shouldBump = isFeedFirstPage && (!isHomeFeed || (useRealtimePreference && isHomeFeed)) && !isMemoriesFeed;

    return store.dispatch({ ...data, type: ActionTypes.REALTIME_POST_NEW, post: data.posts, shouldBump });
  },
  'post:update': (data) => store.dispatch({ ...data, type: ActionTypes.REALTIME_POST_UPDATE, post: data.posts }),
  'post:destroy': (data) => store.dispatch({ type: ActionTypes.REALTIME_POST_DESTROY, postId: data.meta.postId }),
  'post:hide': (data) => store.dispatch({ type: ActionTypes.REALTIME_POST_HIDE, postId: data.meta.postId }),
  'post:unhide': (data) => store.dispatch({ type: ActionTypes.REALTIME_POST_UNHIDE, postId: data.meta.postId }),
  'comment:new': async (data) => {
    const { postId } = data.comments;
    const action = { ...data, type: ActionTypes.REALTIME_COMMENT_NEW, comment: data.comments };
    return dispatchWithPost(store, postId, action, () => true, postFetchDelay);
  },
  'comment:update': (data) => store.dispatch({ ...data, type: ActionTypes.REALTIME_COMMENT_UPDATE, comment: data.comments }),
  'comment:destroy': (data) => store.dispatch({ type: ActionTypes.REALTIME_COMMENT_DESTROY, commentId: data.commentId, postId: data.postId }),
  'like:new': async (data) => {
    const { postId } = data.meta;
    const iLiked = iLikedPost(store.getState(), postId);
    const action = { type: ActionTypes.REALTIME_LIKE_NEW, postId, users: [data.users], iLiked };
    return dispatchWithPost(store, postId, action, isFirstFriendInteraction, postFetchDelay);
  },
  'like:remove': (data) => store.dispatch({ type: ActionTypes.REALTIME_LIKE_REMOVE, postId: data.meta.postId, userId: data.meta.userId }),
  'comment_like:new': (data) => store.dispatch({ type: ActionTypes.REALTIME_COMMENT_UPDATE, comment:data.comments }),
  'comment_like:remove': (data) => store.dispatch({ type: ActionTypes.REALTIME_COMMENT_UPDATE, comment:data.comments }),
  'global:user:update': (data) => store.dispatch({ type: ActionTypes.REALTIME_GLOBAL_USER_UPDATE, user: data.user }),
});

export const realtimeMiddleware = (store) => {
  const handlers = bindHandlers(store);

  for (const key of Object.keys(handlers)) {
    handlers[key] = scrollCompensator(handlers[key]);
  }

  return createRealtimeMiddleware(store, new Connection(), handlers);
};

export const createRealtimeMiddleware = (store, conn, eventHandlers) => {
  const unsubscribeByRegexp = (regex) => {
    store.getState()
      .realtimeSubscriptions
      .filter((r) => regex.test(r))
      .forEach((r) => store.dispatch(ActionCreators.realtimeUnsubscribe(r)));
  };

  conn.onConnect(() => store.dispatch(ActionCreators.realtimeConnected()));

  conn.onEvent((event, data) => store.dispatch(ActionCreators.realtimeIncomingEvent(event, data)));

  return (next) => (action) => {
    if (action.type === ActionTypes.REALTIME_INCOMING_EVENT) {
      const { payload: { event, data } } = action;
      if (data.realtimeChannels) {
        const { realtimeSubscriptions } = store.getState();
        if (_.intersection(data.realtimeChannels, realtimeSubscriptions).length === 0) {
          // Do not handle events if we are not subscribed to their channels
          return next(action);
        }
      }
      if (event in eventHandlers) {
        eventHandlers[event](data);
      }
    }

    if (action.type === ActionTypes.REALTIME_CONNECTED) {
      conn.reAuthorize().then(async () => {
        const { realtimeSubscriptions } = store.getState();
        await Promise.all(realtimeSubscriptions.map((room) => conn.subscribeTo(room)));
      });
    }

    if (action.type === ActionTypes.REALTIME_SUBSCRIBE) {
      conn.subscribeTo(action.payload.room);
    }

    if (action.type === ActionTypes.REALTIME_UNSUBSCRIBE) {
      conn.unsubscribeFrom(action.payload.room);
    }

    if (action.type === ActionTypes.UNAUTHENTICATED) {
      conn.reAuthorize().then(() => unsubscribeByRegexp(/^user:/));
    }

    if (action.type === response(ActionTypes.WHO_AM_I) || action.type === response(ActionTypes.SIGN_UP)) {
      conn.reAuthorize().then(() => {
        const state = store.getState();
        store.dispatch(ActionCreators.realtimeSubscribe(`user:${state.user.id}`));
      });
    }

    if (isFeedRequest(action) || action.type === request(ActionTypes.GET_SINGLE_POST)) {
      unsubscribeByRegexp(/^(post|timeline):/);
    }

    if (isFeedResponse(action) && action.payload.timelines) {
      store.dispatch(ActionCreators.realtimeSubscribe(`timeline:${action.payload.timelines.id}`));
    }

    if (action.type === response(ActionTypes.GET_SINGLE_POST)) {
      store.dispatch(ActionCreators.realtimeSubscribe(`post:${action.payload.posts.id}`));
    }

    return next(action);
  };
};

// Fixing data structures coming from server
export const dataFixMiddleware = (/*store*/) => (next) => (action) => {
  if (action.type === response(ActionTypes.GET_SINGLE_POST)) {
    [action.payload, action.payload.posts].forEach(fixPostsData);
  }

  if (action.type === ActionTypes.REALTIME_COMMENT_NEW && action.post) {
    [action.post, action.post.posts].forEach(fixPostsData);
  }
  if (
    action.type === ActionTypes.REALTIME_POST_UPDATE ||
    action.type === ActionTypes.REALTIME_POST_NEW
  ) {
    [action.post, action.posts].forEach(fixPostsData);
  }

  if (
    action.type === response(ActionTypes.HOME) ||
    action.type === response(ActionTypes.DISCUSSIONS) ||
    action.type === response(ActionTypes.GET_USER_FEED) ||
    action.type === response(ActionTypes.GET_USER_COMMENTS) ||
    action.type === response(ActionTypes.GET_USER_LIKES) ||
    action.type === response(ActionTypes.GET_SEARCH) ||
    action.type === response(ActionTypes.GET_BEST_OF)
  ) {
    action.payload.posts = action.payload.posts || [];
  }

  if (action.payload && action.payload.posts && _.isArray(action.payload.posts)) {
    action.payload.posts.forEach(fixPostsData);
  }

  return next(action);
};

function fixPostsData(post) {
  // there are some old posts without 'body' field
  post.body = post.body || '';
  // post may not have 'comments' field
  post.comments = post.comments || [];
  post.likes = post.likes || [];
}


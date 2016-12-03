/*global Raven*/
import {browserHistory} from 'react-router';

import {getPost} from '../services/api';
import {setToken, persistUser} from '../services/auth';
import {init} from '../services/realtime';
import {userParser, delay} from '../utils';

import * as ActionCreators from './action-creators';
import * as ActionTypes from './action-types';
import {request, response, fail, breakdown, requiresAuth, isFeedRequest, isFeedResponse} from './action-helpers';

//middleware for api requests
export const apiMiddleware = store => next => async (action) => {
  //ignore normal actions
  if (!action.apiRequest) {
    return next(action);
  }

  //dispatch request begin action
  //clean apiRequest to not get caught by this middleware
  store.dispatch({...action, type: request(action.type), apiRequest: null});
  try {
    const apiResponse = await action.apiRequest(action.payload);
    const obj = await apiResponse.json();

    if (apiResponse.status === 200) {
      return store.dispatch({payload: obj, type: response(action.type), request: action.payload});
    }

    if (apiResponse.status === 401) {
      return store.dispatch(ActionCreators.unauthenticated(obj));
    }

    return store.dispatch({payload: obj, type: fail(action.type), request: action.payload, response: apiResponse});
  } catch (e) {
    if (typeof Raven !== 'undefined') {
      Raven.captureException(e, { level: 'error', tags: { area: 'redux/apiMiddleware' }, extra: { action } });
    }
    return store.dispatch({...action, type: breakdown(action.type), apiRequest: null});
  }
};

export const authMiddleware = store => next => action => {

  //stop action propagation if it should be authed and user is not authed
  if (requiresAuth(action) && !store.getState().authenticated) {
    return;
  }

  if (action.type === ActionTypes.UNAUTHENTICATED) {
    setToken();
    persistUser();
    next(action);
    const pathname = (store.getState().routing.locationBeforeTransitions || {}).pathname;
    if (!pathname || pathname.indexOf('signin') !== -1 || pathname.indexOf('signup') !== -1) {
      return;
    }
    return browserHistory.push('/signin');
  }

  if (action.type === response(ActionTypes.SIGN_IN) ||
     action.type === response(ActionTypes.SIGN_UP) ) {
    setToken(action.payload.authToken);
    next(action);
    store.dispatch(ActionCreators.whoAmI());

    // Do not redirect to Home page if signed in at Bookmarklet
    const pathname = (store.getState().routing.locationBeforeTransitions || {}).pathname;
    if (pathname === '/bookmarklet') {
      return;
    }

    return browserHistory.push('/');
  }

  if (action.type === response(ActionTypes.WHO_AM_I) ||
     action.type === response(ActionTypes.UPDATE_USER) ) {
    persistUser(userParser(action.payload.users));
    return next(action);
  }

  return next(action);
};

export const likesLogicMiddleware = store => next => action => {
  switch (action.type) {
    case ActionTypes.SHOW_MORE_LIKES: {
      const postId = action.payload.postId;
      const post = store.getState().posts[postId];
      const isSync = (post.omittedLikes === 0);

      const nextAction = isSync ? ActionCreators.showMoreLikesSync(postId) : ActionCreators.showMoreLikesAsync(postId);

      return store.dispatch(nextAction);
    }
  }

  return next(action);
};

export const userPhotoLogicMiddleware = store => next => action => {
  if (action.type === response(ActionTypes.UPDATE_USER_PICTURE)) {
    // Update data after userpic is updated
    store.dispatch(ActionCreators.whoAmI());
  }

  return next(action);
};

export const groupPictureLogicMiddleware = store => next => action => {
  if (action.type === response(ActionTypes.UPDATE_GROUP_PICTURE)) {
    // Update data after group picture is updated
    store.dispatch(ActionCreators.getUserInfo(action.request.groupName));
  }

  return next(action);
};

export const redirectionMiddleware = store => next => action => {
  //go to home if single post has been removed
  if (action.type === response(ActionTypes.DELETE_POST) && store.getState().singlePostId) {
    return browserHistory.push('/');
  }

  if (action.type === response(ActionTypes.UNADMIN_GROUP_ADMIN) &&
      store.getState().user.id === action.request.user.id) {
    browserHistory.push(`/${action.request.groupName}/subscribers`);
  }

  return next(action);
};

export const requestsMiddleware = store => next => action => {
  if (action.type === response(ActionTypes.ACCEPT_USER_REQUEST)) {
    next(action);

    if (store.getState().routing.locationBeforeTransitions.pathname == '/friends') {
      const username = store.getState().user.username;
      store.dispatch(ActionCreators.subscribers(username));
    }

    return;
  }

  return next(action);
};

const isFirstPage = state => !state.routing.locationBeforeTransitions.query.offset;

const isPostLoaded = ({posts}, postId) => posts[postId];
const iLikedPost = ({user, posts}, postId) => {
  const post = posts[postId];
  if (!post) {
    return false;
  }
  const likes = post.likes || [];
  return likes.indexOf(user.id) !== -1;
};
const dispatchWithPost = async (store, postId, action, filter = () => true, maxDelay = 0) => {
  let state = store.getState();
  const shouldBump = isFirstPage(state);

  if (isPostLoaded(state, postId)) {
    return store.dispatch({...action, shouldBump});
  }

  if (maxDelay > 0) {
    const subscrId = state.realtimeSubscription.id;
    await delay(Math.random() * maxDelay);
    state = store.getState();
    // if subscription was changed during delay
    if (state.realtimeSubscription.id !== subscrId) {
      return;
    }
    // if post was loaded during delay
    if (isPostLoaded(state, postId)) {
      return store.dispatch({...action, shouldBump});
    }
  }
  const postResponse = await getPost({postId});
  const post = await postResponse.json();

  if (filter(post, action, store.getState())) {
    return store.dispatch({...action, post, shouldBump});
  }
};

const isFirstFriendInteraction = (post, {users}, {subscriptions, comments}) => {
  const newLike = users[0];
  const myFriends = Object.keys(subscriptions).map(key => subscriptions[key]).map(sub => sub.user);
  const likesWithoutCurrent = post.posts.likes.filter(like => like !== newLike);
  const friendsInvolved = list => list.filter(element => myFriends.indexOf(element) !== -1).length;
  const friendsLikedBefore = friendsInvolved(likesWithoutCurrent);
  const newPostCommentAuthors = (post.comments || []).map(comment => comment.createdBy);
  const commentsAuthors = (post.posts.comments || []).map(cId => (comments[cId] || {}).createdBy);
  const friendsCommented = friendsInvolved([...commentsAuthors, ...newPostCommentAuthors]);
  const wasFirstInteraction = !friendsCommented && !friendsLikedBefore;
  return wasFirstInteraction;
};

const postFetchDelay = 20000; // 20 sec
const bindHandlers = store => ({
  'post:new': data => {
    const state = store.getState();
    const isFeedFirstPage = isFirstPage(state);
    const isHomeFeed = state.routing.locationBeforeTransitions.pathname === '/';
    const useRealtimePreference = state.user.frontendPreferences.realtimeActive;

    const shouldBump = isFeedFirstPage && (!isHomeFeed || (useRealtimePreference && isHomeFeed));

    return store.dispatch({...data, type: ActionTypes.REALTIME_POST_NEW, post: data.posts, shouldBump});
  },
  'post:update': data => store.dispatch({...data, type: ActionTypes.REALTIME_POST_UPDATE, post: data.posts}),
  'post:destroy': data => store.dispatch({type: ActionTypes.REALTIME_POST_DESTROY, postId: data.meta.postId}),
  'post:hide': data => store.dispatch({type: ActionTypes.REALTIME_POST_HIDE, postId: data.meta.postId}),
  'post:unhide': data => store.dispatch({type: ActionTypes.REALTIME_POST_UNHIDE, postId: data.meta.postId}),
  'comment:new': async data => {
    const postId = data.comments.postId;
    const action = {...data, type: ActionTypes.REALTIME_COMMENT_NEW, comment: data.comments};
    return dispatchWithPost(store, postId, action, () => true, postFetchDelay);
  },
  'comment:update': data => store.dispatch({...data, type: ActionTypes.REALTIME_COMMENT_UPDATE, comment: data.comments}),
  'comment:destroy': data => store.dispatch({type: ActionTypes.REALTIME_COMMENT_DESTROY, commentId: data.commentId, postId: data.postId}),
  'like:new': async data => {
    const postId = data.meta.postId;
    const iLiked = iLikedPost(store.getState(), data.meta.postId);
    const action = {type: ActionTypes.REALTIME_LIKE_NEW, postId: data.meta.postId, users:[data.users], iLiked};
    return dispatchWithPost(store, postId, action, isFirstFriendInteraction, postFetchDelay);
  },
  'like:remove': data => store.dispatch({type: ActionTypes.REALTIME_LIKE_REMOVE, postId: data.meta.postId, userId: data.meta.userId}),
});

export const realtimeMiddleware = store => {
  const handlers = bindHandlers(store);
  let realtimeConnection;
  return next => action => {

    if (action.type === ActionTypes.UNAUTHENTICATED) {
      if (realtimeConnection) {
        realtimeConnection.disconnect();
        realtimeConnection = undefined;
        store.dispatch(ActionCreators.realtimeUnsubscribe());
      }
    }

    if (isFeedRequest(action) ||
      action.type === request(ActionTypes.GET_SINGLE_POST)) {
      if (realtimeConnection) {
        realtimeConnection.unsubscribe();
        store.dispatch(ActionCreators.realtimeUnsubscribe());
      }
    }

    if (isFeedResponse(action)) {
      if (!realtimeConnection) {
        realtimeConnection = init(handlers);
      }
      if (action.payload.timelines) {
        realtimeConnection.subscribe({timeline:[action.payload.timelines.id]});
        store.dispatch(ActionCreators.realtimeSubscribe('timeline', action.payload.timelines.id));
      }
    }

    if (action.type === response(ActionTypes.GET_SINGLE_POST)) {
      if (!realtimeConnection) {
        realtimeConnection = init(handlers);
      }
      realtimeConnection.subscribe({post:[action.payload.posts.id]});
      store.dispatch(ActionCreators.realtimeSubscribe('post', action.payload.posts.id));
    }

    return next(action);
  };
};

// Fixing data structures coming from server
export const dataFixMiddleware = (/*store*/) => next => action => {
  if (action.type === response(ActionTypes.GET_SINGLE_POST)) {
    [action.payload, action.payload.posts].forEach(fixPostsData);
  }

  if (
    action.type === response(ActionTypes.GET_USER_FEED) ||
    action.type === response(ActionTypes.GET_USER_COMMENTS) ||
    action.type === response(ActionTypes.GET_USER_LIKES)
  ) {
    action.payload.posts = action.payload.posts || [];
    action.payload.posts.forEach(fixPostsData);
  }

  return next(action);
};

function fixPostsData(post) {
  // there are some old posts without 'body' field
  post.body = post.body || '';
  // post may not have 'comments' field
  post.comments = post.comments || [];
}


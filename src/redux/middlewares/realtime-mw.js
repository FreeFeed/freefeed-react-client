import * as Sentry from '@sentry/react';

import { intersection } from 'lodash-es';
import { getPost } from '../../services/api';
import { Connection } from '../../services/realtime';
import { scrollingOrInteraction } from '../../services/unscroll';
import { delay } from '../../utils';
import { inactivityOf } from '../../utils/event-sequences';
import { ACTIVITY, CHRONOLOGIC } from '../../utils/feed-options';
import {
  getPostsByIds,
  realtimeConnected,
  realtimeIncomingEvent,
  realtimeSubscribe,
  realtimeUnsubscribe,
  whoAmI,
} from '../action-creators';
import { isFeedRequest, isFeedResponse, request, response } from '../action-helpers';
import {
  AUTH_TOKEN_UPDATED,
  GET_SINGLE_POST,
  HOME,
  REALTIME_ATTACHMENT_UPDATE,
  REALTIME_COMMENT_DESTROY,
  REALTIME_COMMENT_NEW,
  REALTIME_COMMENT_RESTORE,
  REALTIME_COMMENT_UPDATE,
  REALTIME_CONNECTED,
  REALTIME_GLOBAL_USER_UPDATE,
  REALTIME_INCOMING_EVENT,
  REALTIME_LIKE_NEW,
  REALTIME_LIKE_REMOVE,
  REALTIME_POST_DESTROY,
  REALTIME_POST_HIDE,
  REALTIME_POST_NEW,
  REALTIME_POST_SAVE,
  REALTIME_POST_UNHIDE,
  REALTIME_POST_UPDATE,
  REALTIME_SUBSCRIBE,
  REALTIME_UNSUBSCRIBE,
  REALTIME_USER_UPDATE,
  SIGN_UP,
  UNAUTHENTICATED,
  WHO_AM_I,
} from '../action-types';

const isFirstPage = (state) => !state.routing.locationBeforeTransitions.query.offset;
const isMemories = (state) => state.routing.locationBeforeTransitions.pathname.includes('memories');

const isPostLoaded = ({ posts }, postId) => posts[postId];
const iLikedPost = ({ user, posts }, postId) => {
  const post = posts[postId];
  if (!post) {
    return false;
  }
  const likes = post.likes || [];
  return likes.includes(user.id);
};
const dispatchWithPost = async (store, postId, action, filter = () => true, maxDelay = 0) => {
  let state = store.getState();
  const shouldBump =
    isFirstPage(state) && !isMemories(state) && state.feedViewOptions.sort === ACTIVITY;

  if (isPostLoaded(state, postId)) {
    return store.dispatch({ ...action, shouldBump });
  }

  if (maxDelay > 0) {
    await delay(Math.random() * maxDelay);
    state = store.getState();
    // if subscription was changed during delay
    if (
      action.realtimeChannels &&
      intersection(action.realtimeChannels, state.realtimeSubscriptions).length === 0
    ) {
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
  const myFriends = new Set(
    Object.keys(subscriptions)
      .map((key) => subscriptions[key])
      .map((sub) => sub.user),
  );
  const likesWithoutCurrent = post.posts.likes.filter((like) => like !== newLike);
  const friendsInvolved = (list) => list.filter((element) => myFriends.has(element)).length;
  const friendsLikedBefore = friendsInvolved(likesWithoutCurrent);
  const newPostCommentAuthors = (post.comments || []).map((comment) => comment.createdBy);
  const commentsAuthors = (post.posts.comments || []).map((cId) => (comments[cId] || {}).createdBy);
  const friendsCommented = friendsInvolved([...commentsAuthors, ...newPostCommentAuthors]);
  const wasFirstInteraction = !friendsCommented && !friendsLikedBefore;
  return wasFirstInteraction;
};

const postFetchDelay = 20000; // 20 sec
export const bindHandlers = (store) => {
  const handlers = {
    'user:update': (data) => store.dispatch({ ...data, type: REALTIME_USER_UPDATE }),
    'post:new': (data) => {
      const state = store.getState();
      const isFeedFirstPage = isFirstPage(state);
      const isHomeFeed = state.routing.locationBeforeTransitions.pathname === '/';
      const isMemoriesFeed = isMemories(state);
      const useRealtimePreference = state.user.frontendPreferences.realtimeActive;
      const shouldBump =
        isFeedFirstPage &&
        (!isHomeFeed || (useRealtimePreference && isHomeFeed)) &&
        !isMemoriesFeed;

      let insertBefore = null;
      if (shouldBump) {
        insertBefore = state.feedViewState.entries[0] || null;
        if (state.feedViewOptions.sort === CHRONOLOGIC) {
          for (const postId of state.feedViewState.entries) {
            if (data.posts.createdAt >= state.posts[postId].createdAt) {
              insertBefore = postId;
              break;
            }
          }
        }
      }

      return store.dispatch({
        ...data,
        type: REALTIME_POST_NEW,
        post: data.posts,
        shouldBump,
        insertBefore,
      });
    },
    'post:update': (data) =>
      store.dispatch({ ...data, type: REALTIME_POST_UPDATE, post: data.posts }),
    'post:destroy': (data) =>
      store.dispatch({ type: REALTIME_POST_DESTROY, postId: data.meta.postId }),
    'post:restore': (data) => handlers['post:new'](data),
    'post:hide': (data) => store.dispatch({ type: REALTIME_POST_HIDE, postId: data.meta.postId }),
    'post:unhide': (data) =>
      store.dispatch({ type: REALTIME_POST_UNHIDE, postId: data.meta.postId }),
    'post:save': (data) =>
      store.dispatch({
        type: REALTIME_POST_SAVE,
        payload: { postId: data.meta.postId, save: true },
      }),
    'post:unsave': (data) =>
      store.dispatch({
        type: REALTIME_POST_SAVE,
        payload: { postId: data.meta.postId, save: false },
      }),
    'comment:new': async (data) => {
      const { postId } = data.comments;
      const action = { ...data, type: REALTIME_COMMENT_NEW, comment: data.comments };
      return dispatchWithPost(store, postId, action, () => true, postFetchDelay);
    },
    'comment:update': (data) =>
      store.dispatch({
        ...data,
        type: REALTIME_COMMENT_UPDATE,
        comment: data.comments,
        event: 'comment:update',
      }),
    'comment:destroy': (data) =>
      store.dispatch({
        type: REALTIME_COMMENT_DESTROY,
        commentId: data.commentId,
        postId: data.postId,
      }),
    'comment:restore': ({ comments: comment }) => {
      const { postId, seqNumber } = comment;
      // We need to prepare data for the 'posts' reducer
      const state = store.getState();
      const comments = state.posts[postId]?.comments || [];

      let insertBefore = null;
      for (const id of comments) {
        if (state.comments[id].seqNumber > seqNumber) {
          insertBefore = id;
          break;
        }
      }

      store.dispatch({
        type: REALTIME_COMMENT_RESTORE,
        comment,
        insertBefore,
      });
    },
    'like:new': async (data) => {
      const { postId } = data.meta;
      const iLiked = iLikedPost(store.getState(), postId);
      const action = { type: REALTIME_LIKE_NEW, postId, users: [data.users], iLiked };
      return dispatchWithPost(store, postId, action, isFirstFriendInteraction, postFetchDelay);
    },
    'like:remove': (data) =>
      store.dispatch({
        type: REALTIME_LIKE_REMOVE,
        postId: data.meta.postId,
        userId: data.meta.userId,
      }),
    'comment_like:new': (data) =>
      store.dispatch({
        type: REALTIME_COMMENT_UPDATE,
        comment: data.comments,
        event: 'comment_like:new',
      }),
    'comment_like:remove': (data) =>
      store.dispatch({
        type: REALTIME_COMMENT_UPDATE,
        comment: data.comments,
        event: 'comment_like:remove',
      }),
    'global:user:update': (data) =>
      store.dispatch({ type: REALTIME_GLOBAL_USER_UPDATE, user: data.user }),
    'attachment:update': (data) => store.dispatch({ ...data, type: REALTIME_ATTACHMENT_UPDATE }),
  };
  return handlers;
};

export const realtimeMiddleware = (store) => {
  return createRealtimeMiddleware(
    store,
    new Connection(),
    bindHandlers(store),
    scrollingOrInteraction,
  );
};

export const createRealtimeMiddleware = (store, conn, eventHandlers, userActivity) => {
  const unsubscribeByRegexp = (regex) => {
    const rooms = store.getState().realtimeSubscriptions.filter((r) => regex.test(r));
    store.dispatch(realtimeUnsubscribe(...rooms));
  };

  let firstConnect = true;
  conn.onConnect(() => {
    store.dispatch(realtimeConnected(firstConnect));
    firstConnect = false;
  });

  conn.onEvent(async (event, data) => {
    await inactivityOf(userActivity);
    store.dispatch(realtimeIncomingEvent(event, data));
  });

  return (next) => (action) => {
    if (action.type === REALTIME_INCOMING_EVENT) {
      const {
        payload: { event, data },
      } = action;
      if (data.realtimeChannels) {
        const { realtimeSubscriptions } = store.getState();
        if (intersection(data.realtimeChannels, realtimeSubscriptions).length === 0) {
          // Do not handle events if we are not subscribed to their channels
          return next(action);
        }
      }
      next(action);
      eventHandlers[event] && eventHandlers[event](data);
      return;
    }

    if (action.type === REALTIME_CONNECTED) {
      conn
        .reAuthorize()
        .then(async () => {
          const { realtimeSubscriptions } = store.getState();
          await conn.subscribeTo(...realtimeSubscriptions);
          if (!action.payload.firstTime) {
            onReconnect(store);
          }
          return;
        })
        .catch((error) => {
          Sentry.captureException(error, {
            level: 'error',
            tags: { area: 'realtime' },
          });
        });
    }

    if (action.type === REALTIME_SUBSCRIBE) {
      conn.subscribeTo(...action.payload.rooms);
    }

    if (action.type === REALTIME_UNSUBSCRIBE) {
      conn.unsubscribeFrom(...action.payload.rooms);
    }

    if (action.type === UNAUTHENTICATED) {
      conn
        .reAuthorize()
        .then(() => unsubscribeByRegexp(/^user:/))
        .catch((error) => {
          Sentry.captureException(error, {
            level: 'error',
            tags: { area: 'realtime' },
          });
        });
    }

    if (action.type === AUTH_TOKEN_UPDATED) {
      conn.reAuthorize();
    }

    if (action.type === response(WHO_AM_I) || action.type === response(SIGN_UP)) {
      conn
        .reAuthorize()
        .then(() => {
          const state = store.getState();
          store.dispatch(realtimeSubscribe(`user:${state.user.id}`));
          return true;
        })
        .catch((error) => {
          Sentry.captureException(error, {
            level: 'error',
            tags: { area: 'realtime' },
          });
        });
    }

    if (isFeedRequest(action) || action.type === request(GET_SINGLE_POST)) {
      unsubscribeByRegexp(/^(post|timeline):/);
    }

    if (isFeedResponse(action)) {
      if (action.payload.timelines) {
        if (action.type === response(HOME)) {
          const state = store.getState();
          store.dispatch(
            realtimeSubscribe(
              `timeline:${action.payload.timelines.id}?homefeed-mode=${state.user.frontendPreferences.homeFeedMode}`,
            ),
          );
        } else {
          store.dispatch(realtimeSubscribe(`timeline:${action.payload.timelines.id}`));
        }
      }
      if (action.payload.posts) {
        store.dispatch(realtimeSubscribe(...action.payload.posts.map((p) => `post:${p.id}`)));
      }
    }

    if (action.type === response(GET_SINGLE_POST)) {
      store.dispatch(realtimeSubscribe(`post:${action.payload.posts.id}`));
    }

    return next(action);
  };
};

/**
 * Client reconnects to the server after a disconnection
 */
function onReconnect(store) {
  store.dispatch(whoAmI());
  const state = store.getState();
  const withOmittedComments = [];
  const withoutOmittedComments = [];
  for (const id of state.feedViewState.entries) {
    if (state.posts[id].omittedComments > 0) {
      withOmittedComments.push(id);
    } else {
      withoutOmittedComments.push(id);
    }
  }
  store.dispatch(getPostsByIds(withOmittedComments, { allComments: false }));
  store.dispatch(getPostsByIds(withoutOmittedComments, { allComments: true }));
}

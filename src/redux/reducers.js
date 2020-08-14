/* global CONFIG */
import _ from 'lodash';
import { LOCATION_CHANGE } from 'react-router-redux';
import { combineReducers } from 'redux';

import { userParser, postParser, getSummaryPeriod } from '../utils';
import { getToken } from '../services/auth';
import { parseQuery } from '../utils/search-highlighter';
import { formatDateFromShortString } from '../utils/get-date-from-short-string';
import * as FeedOptions from '../utils/feed-options';
import { loadColorScheme, getSystemColorScheme, loadNSFWVisibility } from '../services/appearance';
import * as ActionTypes from './action-types';
import * as ActionHelpers from './action-helpers';
import { patchObjectByKey, setOnLocationChange, setOnLogOut } from './reducers/helpers';
import {
  asyncStatesMap,
  getKeyBy,
  fromResponse,
  asyncState,
  initialAsyncState,
  successAsyncState,
  keyFromRequestPayload,
} from './async-helpers';

const frontendPrefsConfig = CONFIG.frontendPreferences;

const { request, response, fail } = ActionHelpers;

export const initialized = asyncState(ActionTypes.INITIAL_WHO_AM_I, (state, action) => {
  if (action.type === ActionTypes.UNAUTHENTICATED) {
    return successAsyncState;
  }
  return state;
});

export function title(state = '', action) {
  switch (action.type) {
    case response(ActionTypes.HOME): {
      return CONFIG.siteTitle;
    }
    case response(ActionTypes.DIRECT): {
      return `Direct messages - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.DISCUSSIONS): {
      return `My discussions - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.SAVES): {
      return `Saved posts - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_BEST_OF): {
      return `Best Of ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_EVERYTHING): {
      return `Everything On ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_NOTIFICATIONS): {
      return `Notifications - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_SEARCH): {
      return `Search - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_USER_FEED): {
      const user = action.payload.users.find((user) => user.id === action.payload.timelines.user);
      const author =
        user.screenName + (user.username !== user.screenName ? ` (${user.username})` : '');
      return `${author} - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const text = action.payload.posts.body.substr(0, 60);
      const [user] = action.payload.users || [];
      const author =
        user.screenName + (user.username !== user.screenName ? ` (${user.username})` : '');
      return `${text} - ${author} - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_SUMMARY): {
      const period = getSummaryPeriod(action.request.days);
      return `Best of ${period} - ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_USER_SUMMARY): {
      const period = getSummaryPeriod(action.request.days);
      const [user] = (action.payload.users || []).filter(
        (user) => user.username === action.request.username,
      );
      const author = user
        ? user.screenName + (user.username !== user.screenName ? ` (${user.username})` : '')
        : action.request.username;
      return `Best of ${period} - ${author} - ${CONFIG.siteTitle}`;
    }
    case fail(ActionTypes.HOME):
    case fail(ActionTypes.DIRECT):
    case fail(ActionTypes.DISCUSSIONS):
    case fail(ActionTypes.SAVES):
    case fail(ActionTypes.GET_USER_FEED):
    case fail(ActionTypes.GET_SINGLE_POST): {
      return `Error - ${CONFIG.siteTitle}`;
    }

    case ActionTypes.STATIC_PAGE: {
      return `${action.payload.title} - ${CONFIG.siteTitle}`;
    }
  }
  return state;
}

export const signInStatus = asyncState(ActionTypes.SIGN_IN, setOnLocationChange(initialAsyncState));

export const signUpStatus = asyncState(ActionTypes.SIGN_UP, setOnLocationChange(initialAsyncState));

export const restorePasswordStatus = asyncState(
  ActionTypes.RESTORE_PASSWORD,
  setOnLocationChange(initialAsyncState),
);

const defaultResetHeader = `Reset ${CONFIG.siteTitle} Password`;
const successResetHeader = 'Please log in with your new password';

export function resetPassForm(
  state = { error: '', loading: false, header: defaultResetHeader },
  action,
) {
  switch (action.type) {
    case request(ActionTypes.RESET_PASSWORD): {
      return { ...state, loading: true, header: defaultResetHeader };
    }
    case response(ActionTypes.RESET_PASSWORD): {
      return { ...state, loading: false, header: successResetHeader };
    }
    case ActionTypes.RESET_PASSWORD_VALIDATION_FAIL: {
      return { ...state, error: action.error, loading: false };
    }
    case fail(ActionTypes.RESET_PASSWORD): {
      return { ...state, error: (action.payload || {}).err, loading: false };
    }
  }
  return state;
}

export function currentInvitation(state = DEFAULT_FORM_STATE, action) {
  switch (action.type) {
    case request(ActionTypes.GET_INVITATION): {
      return { ...state, loading: true };
    }
    case response(ActionTypes.GET_INVITATION): {
      return { ...state, loading: false, success: true, invitation: action.payload.invitation };
    }
    case fail(ActionTypes.GET_INVITATION): {
      return { ...state, loading: false, error: true, errorText: action.payload.err };
    }
  }
  return state;
}

const CREATE_POST_ERROR = 'Something went wrong while creating the post...';

export function createPostViewState(state = {}, action) {
  switch (action.type) {
    case response(ActionTypes.CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: false,
        lastPostId: action.payload.posts.id,
      };
    }
    case request(ActionTypes.CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: true,
      };
    }
    case fail(ActionTypes.CREATE_POST): {
      return {
        isError: true,
        errorString: action.payload.err || CREATE_POST_ERROR,
        isPending: false,
      };
    }
    case ActionTypes.RESET_POST_CREATE_FORM: {
      return {};
    }
  }
  return state;
}

const initFeed = {
  entries: [],
  timeline: null,
  recentlyHiddenEntries: {},
  separateHiddenEntries: false,
  isHiddenRevealed: false,
  isLastPage: true,
  feedError: null,
};

export function feedViewState(state = initFeed, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return state;
  }
  if (ActionHelpers.isFeedResponse(action)) {
    // Separate hidden entries only in 'RiverOfNews' feed
    const separateHiddenEntries = action.type === response(ActionTypes.HOME);

    const entries = (action.payload.posts || []).map((post) => post.id);
    const recentlyHiddenEntries = {};
    const isHiddenRevealed = false;
    const { isLastPage } = action.payload;
    const timeline = action.payload.timelines
      ? _.pick(action.payload.timelines, ['id', 'name', 'user'])
      : null;
    return {
      ...initFeed,
      entries,
      recentlyHiddenEntries,
      timeline,
      separateHiddenEntries,
      isHiddenRevealed,
      isLastPage,
    };
  }
  if (ActionHelpers.isFeedFail(action)) {
    return { ...initFeed, feedError: action.payload.err };
  }

  switch (action.type) {
    case ActionTypes.UNAUTHENTICATED: {
      return initFeed;
    }
    case response(ActionTypes.GET_NOTIFICATIONS): {
      return { ...state, isLastPage: action.payload.isLastPage };
    }
    case response(ActionTypes.DELETE_POST): {
      const { postId } = action.request;
      if (action.payload.postStillAvailable || !state.entries.includes(postId)) {
        return state;
      }
      return {
        ...state,
        entries: _.without(state.entries, postId),
      };
    }
    case ActionTypes.REALTIME_POST_DESTROY: {
      if (!state.entries.includes(action.postId)) {
        return state;
      }
      return {
        ...state,
        entries: _.without(state.entries, action.postId),
      };
    }
    case response(ActionTypes.CREATE_POST): {
      const postId = action.payload.posts.id;
      if (state.entries.includes(postId)) {
        return state;
      }
      return {
        ...state,
        entries: [postId, ...state.entries],
      };
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const { postId } = action.request;
      return {
        ...initFeed,
        entries: [postId],
      };
    }
    case ActionTypes.REALTIME_POST_NEW: {
      if (state.entries.includes(action.post.id) || !action.shouldBump) {
        return state;
      }

      let { entries } = state;
      const p = entries.indexOf(action.insertBefore);
      if (p < 0) {
        entries = [...entries, action.post.id];
      } else {
        entries = [...entries.slice(0, p), action.post.id, ...entries.slice(p)];
      }

      return { ...state, entries };
    }
    case ActionTypes.REALTIME_LIKE_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW: {
      if (action.post && action.shouldBump && !state.entries.includes(action.post.posts.id)) {
        const postId = action.post.posts.id;
        return {
          ...state,
          entries: [postId, ...state.entries],
        };
      }
      return state;
    }
    case fail(ActionTypes.GET_SINGLE_POST): {
      return initFeed;
    }
    // Recently hidden entries updates only by local events, not by realtime
    case response(ActionTypes.HIDE_POST): {
      const { postId } = action.request;
      if (state.recentlyHiddenEntries[postId]) {
        return state;
      }
      return {
        ...state,
        recentlyHiddenEntries: {
          ...state.recentlyHiddenEntries,
          [postId]: true,
        },
      };
    }

    // Hide by username
    case response(ActionTypes.HIDE_BY_NAME): {
      const { postId, hide } = action.request;
      if (postId) {
        if (hide && !state.recentlyHiddenEntries[postId]) {
          return {
            ...state,
            recentlyHiddenEntries: {
              ...state.recentlyHiddenEntries,
              [postId]: true,
            },
          };
        }
      }
      return state;
    }

    case ActionTypes.REMOVE_RECENTLY_HIDDEN_POST: {
      const { postId } = action.payload;
      if (!state.recentlyHiddenEntries[postId]) {
        return state;
      }
      return {
        ...state,
        recentlyHiddenEntries: _.omit(state.recentlyHiddenEntries, postId),
      };
    }

    case ActionTypes.TOGGLE_HIDDEN_POSTS: {
      return {
        ...state,
        isHiddenRevealed: !state.isHiddenRevealed,
      };
    }
  }
  return state;
}

const NO_ERROR = {
  isError: false,
  errorString: '',
};

const POST_SAVE_ERROR = 'Something went wrong while editing the post...';

const indexById = (list) => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => ({ ...state, ...indexById(array) });

const initPostViewState = (post) => {
  const { id, omittedComments, omittedLikes } = post;
  const isEditing = false;

  return { omittedComments, omittedLikes, id, isEditing, ...NO_ERROR };
};

export function postsViewState(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.posts || []).map(initPostViewState));
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const { id } = action.payload.posts;
      const omittedLikes = 0;

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } };
    }
    case request(ActionTypes.SHOW_MORE_COMMENTS): {
      const id = action.payload.postId;
      const isLoadingComments = true;

      return { ...state, [id]: { ...state[id], isLoadingComments } };
    }
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      const { id } = action.payload.posts;
      const isLoadingComments = false;
      const omittedComments = 0;

      return { ...state, [id]: { ...state[id], isLoadingComments, omittedComments, ...NO_ERROR } };
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const { id } = action.payload.posts;
      return { ...state, [id]: initPostViewState(action.payload.posts) };
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_POST_UPDATE: {
      const { id } = action.post;
      const postAlreadyAdded = !!state[id];
      if (postAlreadyAdded) {
        return state;
      }
      return { ...state, [id]: initPostViewState(action.post) };
    }
    case fail(ActionTypes.GET_SINGLE_POST): {
      const id = action.request.postId;
      const isEditing = false;

      const isError = true;
      const errorString = `${action.response.status} ${action.response.statusText}`;

      return { ...state, [id]: { id, isEditing, isError, errorString } };
    }
    case ActionTypes.SHOW_MORE_LIKES_SYNC: {
      const id = action.payload.postId;
      const omittedLikes = 0;

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } };
    }
    case ActionTypes.TOGGLE_EDITING_POST: {
      const id = action.payload.postId;
      const isEditing = !state[id].isEditing;

      return { ...state, [id]: { ...state[id], isEditing, ...NO_ERROR } };
    }
    case ActionTypes.CANCEL_EDITING_POST: {
      const id = action.payload.postId;
      const isEditing = false;

      return { ...state, [id]: { ...state[id], isEditing, ...NO_ERROR } };
    }
    case request(ActionTypes.SAVE_EDITING_POST): {
      const id = action.payload.postId;
      return { ...state, [id]: { ...state[id], isSaving: true } };
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      const { id } = action.payload.posts;
      const isEditing = false;
      const isSaving = false;

      return { ...state, [id]: { ...state[id], isEditing, isSaving, ...NO_ERROR } };
    }
    case fail(ActionTypes.SAVE_EDITING_POST): {
      const id = action.request.postId;
      const isEditing = true;
      const isSaving = false;

      const isError = true;

      return {
        ...state,
        [id]: {
          ...state[id],
          isEditing,
          isSaving,
          isError,
          errorString: action.payload.err || POST_SAVE_ERROR,
        },
      };
    }
    case fail(ActionTypes.DELETE_POST): {
      const id = action.request.postId;

      const isError = true;
      const errorString = 'Something went wrong while deleting the post...';

      return { ...state, [id]: { ...state[id], isError, errorString } };
    }
    case ActionTypes.TOGGLE_COMMENTING: {
      const { postId, newCommentText = '' } = action.payload;
      return {
        ...state,
        [postId]: {
          ...state[postId],
          isCommenting: !state[postId].isCommenting,
          newCommentText,
        },
      };
    }
    case request(ActionTypes.ADD_COMMENT): {
      const post = state[action.payload.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isSavingComment: true,
        },
      };
    }
    case response(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isCommenting: false,
          isSavingComment: false,
          newCommentText: '',
          omittedComments: post.omittedComments ? post.omittedComments + 1 : 0,
        },
      };
    }
    case fail(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isSavingComment: false,
        },
      };
    }
    case ActionTypes.REALTIME_COMMENT_NEW: {
      const post = state[action.comment.postId];
      if (!post) {
        if (!action.post) {
          return state;
        }

        return {
          ...state,
          [action.post.posts.id]: initPostViewState(action.post.posts),
        };
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          omittedComments: post.omittedComments ? post.omittedComments + 1 : 0,
        },
      };
    }
    case ActionTypes.REALTIME_LIKE_NEW: {
      if (action.post && !state[action.post.id]) {
        return {
          ...state,
          [action.post.posts.id]: initPostViewState(action.post.posts),
        };
      }
      return state;
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      if (!action.postId || !state[action.postId]) {
        return state;
      }
      const postsViewState = state[action.postId];
      return {
        ...state,
        [action.postId]: {
          ...postsViewState,
          omittedComments: postsViewState.omittedComments ? postsViewState.omittedComments - 1 : 0,
        },
      };
    }
    // This doesn't work currently, since there's no information in the server
    // response, and just with request.commentId it's currently impossible to
    // find the post in postsViewState's state.
    // TODO: Fix this.
    /*
    case response(ActionTypes.DELETE_COMMENT): {
      const commentId = action.request.commentId
      const post = _(state).find(post => (post.comments||[]).indexOf(commentId) !== -1)
      return {...state,
        [post.id]: {...post,
          omittedComments: (post.omittedComments ? post.omittedComments - 1 : 0)
        }
      }
    }
    */

    case ActionTypes.REALTIME_LIKE_REMOVE: {
      const { postId, isLikeVisible } = action;
      const post = state[postId];
      if (!post) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          omittedLikes: isLikeVisible ? post.omittedLikes : Math.max(0, post.omittedLikes - 1),
        },
      };
    }

    case ActionTypes.TOGGLE_MODERATING_COMMENTS: {
      const post = state[action.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isModeratingComments: !post.isModeratingComments,
        },
      };
    }

    case request(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.payload.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: true,
        },
      };
    }
    case response(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: false,
          commentsDisabled: true,
        },
      };
    }
    case fail(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while disabling comments.',
        },
      };
    }

    case request(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.payload.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: true,
        },
      };
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: false,
          commentsDisabled: false,
        },
      };
    }
    case fail(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while enabling comments.',
        },
      };
    }

    case response(ActionTypes.CREATE_POST): {
      const post = action.payload.posts;
      const { id, omittedComments, omittedLikes } = post;
      const isEditing = false;

      return { ...state, [id]: { omittedComments, omittedLikes, id, isEditing, ...NO_ERROR } };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}

function updatePostData(state, action) {
  const postId = action.payload.posts.id;
  return { ...state, [postId]: postParser(action.payload.posts) };
}

const savePostStatusesReducer = asyncStatesMap(ActionTypes.SAVE_POST, {
  getKey: getKeyBy('postId'),
  keyMustExist: true,
  applyState: (post, savePostStatus) => ({ ...post, savePostStatus }),
});

export function posts(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.posts || []).map(postParser));
  }

  // Handle the savePostStatus changes
  state = savePostStatusesReducer(state, action);

  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      const post = state[action.payload.posts.id];
      return {
        ...state,
        [post.id]: {
          ...post,
          omittedComments: 0,
          comments: action.payload.posts.comments,
        },
      };
    }
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const post = state[action.payload.posts.id];
      return {
        ...state,
        [post.id]: {
          ...post,
          omittedLikes: 0,
          likes: action.payload.posts.likes,
        },
      };
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      const post = state[action.payload.posts.id];
      return {
        ...state,
        [post.id]: {
          ...post,
          body: action.payload.posts.body,
          updatedAt: action.payload.posts.updatedAt,
          attachments: action.payload.posts.attachments || [],
          postedTo: action.payload.posts.postedTo,
        },
      };
    }
    case response(ActionTypes.DELETE_COMMENT): {
      const { commentId } = action.request;
      const post = Object.values(state).find(
        (_post) => (_post.comments || []).indexOf(commentId) !== -1,
      );
      if (!post) {
        return state;
      }
      const comments = _.without(post.comments, commentId);
      return {
        ...state,
        [post.id]: {
          ...post,
          comments,
          omittedComments: post.omittedComments > 0 ? post.omittedComments - 1 : 0,
        },
      };
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      if (!action.postId || !state[action.postId]) {
        return state;
      }

      const post = state[action.postId];
      if (!post.comments.includes(action.commentId)) {
        return state;
      }

      return {
        ...state,
        [action.postId]: {
          ...post,
          comments: _.without(post.comments, action.commentId),
        },
      };
    }
    case response(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      const commentAlreadyAdded =
        post.comments && post.comments.indexOf(action.payload.comments.id) !== -1;
      if (commentAlreadyAdded) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          comments: [...(post.comments || []), action.payload.comments.id],
          omittedComments: post.omittedComments > 0 ? post.omittedComments + 1 : 0,
        },
      };
    }

    // Likes

    case ActionTypes.CLEAN_LIKE_ERROR: {
      const { postId } = action;
      const post = state[postId];
      if (!post || !post.likeError) {
        return state;
      }
      return {
        ...state,
        [postId]: {
          ...post,
          likeError: null,
        },
      };
    }

    case ActionTypes.LIKE_POST_OPTIMISTIC: {
      const { postId, userId } = action.payload;
      const post = state[postId];
      if (_.includes(post.likes, userId)) {
        return state;
      }
      return {
        ...state,
        [postId]: {
          ...post,
          likeError: null,
          likes: [userId, ...post.likes],
        },
      };
    }
    case fail(ActionTypes.LIKE_POST): {
      const { postId, userId } = action.request;
      const post = state[postId];
      if (!_.includes(post.likes, userId)) {
        return state;
      }
      return {
        ...state,
        [postId]: {
          ...post,
          likeError: `Cannot like post: ${action.payload.err}`,
          likes: _.without(post.likes, userId),
        },
      };
    }

    case ActionTypes.UNLIKE_POST_OPTIMISTIC: {
      const { postId, userId } = action.payload;
      const post = state[postId];
      if (!_.includes(post.likes, userId)) {
        return state;
      }
      return {
        ...state,
        [postId]: {
          ...post,
          likeError: null,
          likes: _.without(post.likes, userId),
        },
      };
    }
    case fail(ActionTypes.UNLIKE_POST): {
      const { postId, userId } = action.request;
      const post = state[postId];
      if (_.includes(post.likes, userId)) {
        return state;
      }
      return {
        ...state,
        [postId]: {
          ...post,
          likeError: `Cannot unlike post: ${action.payload.err}`,
          likes: [userId, ...post.likes],
        },
      };
    }

    case ActionTypes.REALTIME_LIKE_NEW: {
      const {
        postId,
        users: [{ id: userId }],
      } = action;
      const post = state[postId];
      if (!post && !action.post) {
        return state;
      }

      const postToAct = post || postParser(action.post.posts);

      if (postToAct.likes && _.includes(postToAct.likes, userId)) {
        return {
          ...state,
          [postToAct.id]: postToAct,
        };
      }

      const likes = action.iLiked
        ? [postToAct.likes[0], userId, ...postToAct.likes.slice(1)]
        : [userId, ...(postToAct.likes || [])];

      return {
        ...state,
        [postToAct.id]: { ...postToAct, likes },
      };
    }

    case ActionTypes.REALTIME_LIKE_REMOVE: {
      const { postId, userId, isLikeVisible } = action;
      const post = state[postId];
      if (!post) {
        return state;
      }

      const likes = _.without(post.likes, userId);
      const omittedLikes = isLikeVisible ? post.omittedLikes : Math.max(0, post.omittedLikes - 1);

      return {
        ...state,
        [post.id]: { ...post, likes, omittedLikes },
      };
    }

    case response(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isHidden: true,
        },
      };
    }
    case ActionTypes.REALTIME_POST_HIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          isHidden: true,
        },
      };
    }
    case response(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          isHidden: false,
        },
      };
    }
    case ActionTypes.REALTIME_POST_UNHIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          isHidden: false,
        },
      };
    }

    case response(ActionTypes.SAVE_POST): {
      return patchObjectByKey(state, action.request.postId, (post) => ({
        ...post,
        isSaved: action.request.save,
      }));
    }

    case ActionTypes.REALTIME_POST_SAVE: {
      return patchObjectByKey(state, action.payload.postId, (post) => ({
        ...post,
        isSaved: action.payload.save,
      }));
    }

    case response(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          commentsDisabled: true,
        },
      };
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {
        ...state,
        [post.id]: {
          ...post,
          commentsDisabled: false,
        },
      };
    }
    case response(ActionTypes.CREATE_POST): {
      return updatePostData(state, action);
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      return updatePostData(state, action);
    }
    case ActionTypes.REALTIME_POST_NEW: {
      return { ...state, [action.post.id]: postParser(action.post) };
    }
    case ActionTypes.REALTIME_POST_UPDATE: {
      const post = state[action.post.id];
      if (!post) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          body: action.post.body,
          updatedAt: action.post.updatedAt,
          attachments: action.post.attachments || [],
          postedTo: action.post.postedTo,
        },
      };
    }
    case ActionTypes.REALTIME_COMMENT_NEW: {
      const post = state[action.comment.postId];
      if (!post) {
        if (!action.post) {
          return state;
        }

        return {
          ...state,
          [action.post.posts.id]: postParser(action.post.posts),
        };
      }
      const commentAlreadyAdded = post.comments && post.comments.indexOf(action.comment.id) !== -1;
      if (commentAlreadyAdded) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          comments: [...(post.comments || []), action.comment.id],
        },
      };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}

export const postHideStatuses = asyncStatesMap(
  [
    ActionTypes.HIDE_POST,
    ActionTypes.UNHIDE_POST,
    ActionTypes.HIDE_BY_NAME,
    ActionTypes.UNHIDE_NAMES,
  ],
  { getKey: getKeyBy('postId'), cleanOnSuccess: true },
);

export function attachments(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, action.payload.attachments);
  }
  switch (action.type) {
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.CREATE_POST): {
      return mergeByIds(state, action.payload.attachments);
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_POST_UPDATE: {
      return mergeByIds(state, action.attachments);
    }
    case ActionTypes.REALTIME_COMMENT_NEW:
    case ActionTypes.REALTIME_LIKE_NEW: {
      if (action.post && action.post.attachments) {
        return mergeByIds(state, action.post.attachments);
      }
      return state;
    }
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      return {
        ...state,
        [action.payload.attachments.id]: action.payload.attachments,
      };
    }
  }
  return state;
}

function updateCommentData(state, action) {
  return mergeByIds(state, action.payload.comments);
}

export function comments(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return updateCommentData(state, action);
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      return updateCommentData(state, action);
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      return updateCommentData(state, action);
    }
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      return updateCommentData(state, action);
    }
    case response(ActionTypes.SAVE_EDITING_COMMENT): {
      return {
        ...state,
        [action.payload.comments.id]: {
          ...state[action.payload.comments.id],
          ...action.payload.comments,
          isExpanded: true,
        },
      };
    }
    case response(ActionTypes.DELETE_COMMENT): {
      return { ...state, [action.request.commentId]: undefined };
    }
    case ActionTypes.REALTIME_COMMENT_NEW: {
      //we already have that comment
      if (action.comment && state[action.comment.id]) {
        return state;
      }
      if (action.post) {
        return mergeByIds(state, [action.comment, ...action.post.comments]);
      }
      return mergeByIds(state, [action.comment]);
    }
    case ActionTypes.REALTIME_POST_NEW: {
      return mergeByIds(state, action.comments);
    }
    case ActionTypes.REALTIME_LIKE_NEW: {
      if (action.post) {
        return mergeByIds(state, action.post.comments);
      }
      return state;
    }
    case ActionTypes.REALTIME_COMMENT_UPDATE: {
      const newComment = {
        ...action.comment,
        isExpanded: (state[action.comment.id] || {}).isExpanded,
      };
      return mergeByIds(state, [newComment]);
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      if (!state[action.commentId]) {
        return state;
      }
      return _.omit(state, action.commentId);
    }
    case response(ActionTypes.ADD_COMMENT): {
      return {
        ...state,
        [action.payload.comments.id]: { ...action.payload.comments, isExpanded: true },
      };
    }
    case request(ActionTypes.LIKE_COMMENT): {
      const comment = state[action.payload.commentId];
      return {
        ...state,
        [action.payload.commentId]: { ...comment, likes: comment.likes + 1, hasOwnLike: true },
      };
    }
    case fail(ActionTypes.LIKE_COMMENT): {
      const comment = state[action.request.commentId];
      return {
        ...state,
        [action.payload.commentId]: { ...comment, likes: comment.likes - 1, hasOwnLike: false },
      };
    }
    case request(ActionTypes.UNLIKE_COMMENT): {
      const comment = state[action.payload.commentId];
      return {
        ...state,
        [action.payload.commentId]: { ...comment, likes: comment.likes - 1, hasOwnLike: false },
      };
    }
    case fail(ActionTypes.UNLIKE_COMMENT): {
      const comment = state[action.request.commentId];
      return {
        ...state,
        [action.payload.commentId]: { ...comment, likes: comment.likes + 1, hasOwnLike: true },
      };
    }
  }
  return state;
}

export { commentEditState } from './reducers/comment-edit.js';

const loadLikesListStatusesReducer = asyncStatesMap(ActionTypes.GET_COMMENT_LIKES, {
  getKey: getKeyBy('commentId'),
  applyState: (comment, status) => ({ ...comment, status }),
});

const commentLikesInitial = {};

export function commentLikes(state = commentLikesInitial, action) {
  state = loadLikesListStatusesReducer(state, action);

  switch (action.type) {
    case response(ActionTypes.GET_COMMENT_LIKES): {
      return patchObjectByKey(state, action.request.commentId, (comment) => ({
        ...comment,
        likes: action.payload.likes,
      }));
    }
    case LOCATION_CHANGE: {
      // Clean state on page navigation
      return commentLikesInitial;
    }
  }

  return state;
}

export function usersNotFound(state = [], action) {
  switch (action.type) {
    case fail(ActionTypes.GET_USER_INFO): {
      if (action.response.status === 404) {
        const username = action.request.username.toLowerCase();
        if (state.indexOf(username) < 0) {
          state = [...state, username];
        }
        return state;
      }
    }
  }
  return state;
}

/**
 * state is a map [username => status]
 * status is boolean (user can or canot receive directs from us)
 */
export function directsReceivers(state = {}, action) {
  switch (action.type) {
    case response(ActionTypes.GET_USER_INFO): {
      const {
        payload: {
          users: { username },
          acceptsDirects,
        },
      } = action;
      if (state[username] !== acceptsDirects) {
        return {
          ...state,
          [username]: acceptsDirects,
        };
      }
    }
  }
  return state;
}

export function users(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    const accounts = [];
    action.payload.users && accounts.push(...action.payload.users);
    action.payload.subscribers && accounts.push(...action.payload.subscribers);
    return mergeByIds(state, accounts.map(userParser));
  }
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I):
    case response(ActionTypes.GET_USER_INFO): {
      const userId = action.payload.users.id;
      const oldUser = state[userId] || {};
      const newUser = userParser(action.payload.users);
      return {
        ...state,
        [userId]: { ...oldUser, ...newUser },
      };
    }
    case response(ActionTypes.CREATE_GROUP): {
      const userId = action.payload.groups.id;
      const newUser = userParser(action.payload.groups);
      return {
        ...state,
        [userId]: { ...newUser },
      };
    }
    case response(ActionTypes.GET_COMMENT_LIKES): {
      return mergeByIds(state, (action.payload.users || []).map(userParser));
    }
    case response(ActionTypes.UPDATE_GROUP): {
      const userId = action.payload.groups.id;
      const oldUser = state[userId] || {};
      const newUser = userParser(action.payload.groups);
      return {
        ...state,
        [userId]: { ...oldUser, ...newUser },
      };
    }
    case response(ActionTypes.GET_NOTIFICATIONS):
    case response(ActionTypes.SHOW_MORE_COMMENTS):
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC):
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.GET_ALL_SUBSCRIPTIONS): {
      return mergeByIds(state, (action.payload.users || []).map(userParser));
    }
    case response(ActionTypes.GET_INVITATION): {
      const { users = [], groups = [] } = action.payload;
      return mergeByIds(state, users.concat(groups).map(userParser));
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_LIKE_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW: {
      if (!action.users || !action.users.length) {
        return state;
      }
      const usersToAdd = !action.post
        ? action.users
        : [...(action.users || []), ...(action.post.users || [])];

      const notAdded = (state) => (user) => !state[user.id];

      return mergeByIds(state, usersToAdd.filter(notAdded(state)).map(userParser));
    }
    case ActionTypes.HIGHLIGHT_COMMENT: {
      return state;
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
    case ActionTypes.REALTIME_GLOBAL_USER_UPDATE: {
      const userId = action.user.id;
      if (state[userId]) {
        const newUser = userParser(action.user);
        return { ...state, [userId]: { ...state[userId], ...newUser } };
      }
      return state;
    }
    case response(ActionTypes.GET_ALL_GROUPS): {
      const { users = [] } = action.payload;
      return mergeByIds(state, users.map(userParser));
    }
    case response(ActionTypes.BLOCKED_BY_ME): {
      return mergeByIds(state, action.payload.map(userParser));
    }
  }
  return state;
}

export function subscribers(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.subscribers || []).map(userParser));
  }
  switch (action.type) {
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW:
    case ActionTypes.REALTIME_LIKE_NEW: {
      const subscribers = !action.post
        ? action.subscribers || []
        : [...(action.subscribers || []), ...(action.post.subscribers || [])];
      return mergeByIds(state, (subscribers || []).map(userParser));
    }
    case response(ActionTypes.WHO_AM_I):
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.CREATE_POST): {
      return mergeByIds(state, (action.payload.subscribers || []).map(userParser));
    }
  }
  return state;
}

export function authenticated(state = !!getToken(), action) {
  switch (action.type) {
    case response(ActionTypes.SIGN_IN): {
      return true;
    }
    case response(ActionTypes.SIGN_UP): {
      return true;
    }
    case ActionTypes.UNAUTHENTICATED: {
      return false;
    }
  }
  return state;
}

const initUser = () => ({ frontendPreferences: frontendPrefsConfig.defaultValues });

export function user(state = initUser(), action) {
  if (ActionHelpers.isUserChangeResponse(action)) {
    const subscriptions = _.uniq((action.payload.subscriptions || []).map((sub) => sub.user));
    return { ...state, ...userParser(action.payload.users), subscriptions };
  }
  switch (action.type) {
    case response(ActionTypes.SEND_SUBSCRIPTION_REQUEST): {
      return {
        ...state,
        pendingSubscriptionRequests: [
          ...(state.pendingSubscriptionRequests || []),
          action.request.id,
        ],
      };
    }
    case response(ActionTypes.REVOKE_USER_REQUEST): {
      return {
        ...state,
        pendingSubscriptionRequests: _.without(
          state.pendingSubscriptionRequests || [],
          action.request.id,
        ),
      };
    }
    case response(ActionTypes.DIRECTS_ALL_READ): {
      return { ...state, unreadDirectsNumber: 0 };
    }
    case response(ActionTypes.NOTIFICATIONS_ALL_READ): {
      return { ...state, unreadNotificationsNumber: 0 };
    }
    case ActionTypes.REALTIME_USER_UPDATE: {
      return { ...state, ...action.user };
    }
    case response(ActionTypes.BAN): {
      return { ...state, banIds: [...state.banIds, action.request.id] };
    }
    case response(ActionTypes.UNBAN): {
      return { ...state, banIds: _.without(state.banIds, action.request.id) };
    }
    case response(ActionTypes.CREATE_GROUP): {
      return { ...state, subscriptions: [...state.subscriptions, action.payload.groups.id] };
    }
    case response(ActionTypes.ARCHIVE_ACTIVITY_REQUEST): {
      return {
        ...state,
        privateMeta: {
          ...state.privateMeta,
          archives: {
            ...state.privateMeta.archives,
            restore_comments_and_likes: true,
          },
        },
      };
    }
    case response(ActionTypes.ARCHIVE_RESTORATION_REQUEST): {
      return {
        ...state,
        privateMeta: {
          ...state.privateMeta,
          archives: {
            ...state.privateMeta.archives,
            recovery_status: 1,
          },
        },
      };
    }
    case ActionTypes.REALTIME_GLOBAL_USER_UPDATE: {
      const userId = action.user.id;
      if (state.id === userId) {
        const newUser = userParser(action.user);
        return { ...state, ...newUser };
      }
      return state;
    }
    case ActionTypes.UNAUTHENTICATED: {
      return initUser();
    }
  }
  return state;
}

const DEFAULT_FORM_STATE = {
  inProgress: false,
  success: false,
  error: false,
  errorText: '',
};

/**
 * Common helper for forms.
 * Returns a reducer that reacts on request/response/fail of reqActionType and on resetActionType.
 * reqActionType is an action of the form itself, resetActionType is used to reset the form state.
 * @param {string} reqActionType
 * @param {string} resetActionType
 * @return {function}
 */
function formState(reqActionType, resetActionType = '') {
  return (state = DEFAULT_FORM_STATE, action) => {
    switch (action.type) {
      case request(reqActionType): {
        return { ...DEFAULT_FORM_STATE, inProgress: true };
      }
      case response(reqActionType): {
        return { ...DEFAULT_FORM_STATE, success: true };
      }
      case fail(reqActionType): {
        return { ...DEFAULT_FORM_STATE, error: true, errorText: action.payload.err };
      }
      case resetActionType: {
        return { ...DEFAULT_FORM_STATE };
      }
    }
    return state;
  };
}

export const archiveActivityForm = formState(
  ActionTypes.ARCHIVE_ACTIVITY_REQUEST,
  ActionTypes.RESET_ARCHIVE_FORMS,
);
export const archiveRestorationForm = formState(
  ActionTypes.ARCHIVE_RESTORATION_REQUEST,
  ActionTypes.RESET_ARCHIVE_FORMS,
);

export function timelines(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action) && action.payload.timelines) {
    return mergeByIds(state, [action.payload.timelines]);
  }

  return state;
}

export function subscriptions(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, action.payload.subscriptions);
  }
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I):
    case response(ActionTypes.GET_SINGLE_POST):
    case response(ActionTypes.CREATE_POST): {
      return mergeByIds(state, action.payload.subscriptions);
    }
    case ActionTypes.REALTIME_POST_NEW: {
      return mergeByIds(state, action.subscriptions);
    }
    case ActionTypes.REALTIME_LIKE_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW: {
      const subscriptions = !action.post ? action.subscriptions : action.post.subscriptions;
      return mergeByIds(state, subscriptions);
    }
  }
  return state;
}

export const getUserInfoStatuses = asyncStatesMap(
  ActionTypes.GET_USER_INFO,
  {
    getKey: getKeyBy('username'),
  },
  setOnLocationChange({}),
);

export const updateGroupPictureStatuses = asyncStatesMap(
  ActionTypes.UPDATE_GROUP_PICTURE,
  {
    getKey: getKeyBy('groupName'),
  },
  setOnLocationChange({}),
);

export const updateGroupStatuses = asyncStatesMap(
  ActionTypes.UPDATE_GROUP,
  {},
  setOnLocationChange({}),
);

export function groupCreateForm(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.CREATE_GROUP): {
      return { ...state, status: 'loading' };
    }
    case response(ActionTypes.CREATE_GROUP): {
      const groupUrl = `/${action.payload.groups.username}`;
      return { ...state, status: 'success', groupUrl };
    }
    case fail(ActionTypes.CREATE_GROUP): {
      return { ...state, status: 'error', errorMessage: (action.payload || {}).err };
    }
    case ActionTypes.RESET_GROUP_CREATE_FORM: {
      return {};
    }
  }
  return state;
}

export function routeLoadingState(state = false, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return true;
  }
  if (ActionHelpers.isFeedResponse(action) || ActionHelpers.isFeedFail(action)) {
    return false;
  }
  if (action.type == request(ActionTypes.GET_SINGLE_POST)) {
    return true;
  }
  if (
    action.type == response(ActionTypes.GET_SINGLE_POST) ||
    action.type == fail(ActionTypes.GET_SINGLE_POST)
  ) {
    return false;
  }
  switch (action.type) {
    case ActionTypes.UNAUTHENTICATED: {
      return false;
    }
  }
  return state;
}

export function boxHeader(state = '', action) {
  switch (action.type) {
    case request(ActionTypes.HOME): {
      return 'Home';
    }
    case request(ActionTypes.DISCUSSIONS): {
      return 'My discussions';
    }
    case request(ActionTypes.SAVES): {
      return 'Saved posts';
    }
    case request(ActionTypes.DIRECT): {
      return 'Direct messages';
    }
    case request(ActionTypes.GET_SEARCH): {
      return `Search`;
    }
    case request(ActionTypes.MEMORIES): {
      return `Memories: posts from ${formatDateFromShortString(action.payload.from)} and earlier`;
    }
    case request(ActionTypes.GET_USER_MEMORIES): {
      return `${action.payload.username} memories: posts from ${formatDateFromShortString(
        action.payload.from,
      )} and earlier`;
    }
    case request(ActionTypes.GET_BEST_OF): {
      return `Best Of ${CONFIG.siteTitle}`;
    }
    case response(ActionTypes.GET_EVERYTHING): {
      return `Everything On ${CONFIG.siteTitle}`;
    }
    case request(ActionTypes.GET_USER_FEED): {
      return '';
    }
    case request(ActionTypes.GET_SUMMARY):
    case request(ActionTypes.GET_USER_SUMMARY): {
      const period = getSummaryPeriod(action.payload.days);
      return `Best of the ${period}`;
    }
    case request(ActionTypes.GET_SINGLE_POST): {
      return '';
    }
    case LOCATION_CHANGE: {
      return '';
    }
  }
  return state;
}

export function highlightTerms(state = [], action) {
  switch (action.type) {
    case request(ActionTypes.GET_SEARCH): {
      return parseQuery(action.payload.search || '');
    }
  }
  return state;
}

export function singlePostId(state = null, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return null;
  }
  if (action.type == request(ActionTypes.GET_SINGLE_POST)) {
    return action.payload.postId;
  }
  return state;
}

function getValidRecipients(state) {
  const subscriptions = _.map(state.subscriptions || [], (rs) => {
    const sub = _.find(state.subscriptions || [], { id: rs.id });
    let user = null;
    if (sub && sub.name == 'Posts') {
      user = _.find(state.subscribers || [], { id: sub.user });
    }
    if (user) {
      return { id: rs.id, user };
    }
  }).filter(Boolean);

  const canPostToGroup = function (subUser) {
    return (
      subUser.isRestricted === '0' || (subUser.administrators || []).indexOf(state.users.id) > -1
    );
  };

  const canSendDirect = function (subUser) {
    return _.findIndex(state.users.subscribers || [], { id: subUser.id }) > -1;
  };

  const validRecipients = _.filter(subscriptions, (sub) => {
    return (
      (sub.user.type === 'group' && canPostToGroup(sub.user)) ||
      (sub.user.type === 'user' && canSendDirect(sub.user))
    );
  });

  return validRecipients;
}

const INITIAL_SEND_TO_STATE = { expanded: false, feeds: [] };

function getHiddenSendTo(state) {
  return {
    expanded: false,
    feeds: state.feeds,
  };
}

export function sendTo(state = INITIAL_SEND_TO_STATE, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return getHiddenSendTo(state);
  }

  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return {
        expanded: state.expanded,
        feeds: getValidRecipients(action.payload),
      };
    }
    case ActionTypes.EXPAND_SEND_TO: {
      return {
        ...state,
        expanded: true,
      };
    }
    case response(ActionTypes.CREATE_POST): {
      return {
        ...state,
        expanded: false,
      };
    }
    case response(ActionTypes.CREATE_GROUP): {
      const groupId = action.payload.groups.id;
      const group = userParser(action.payload.groups);
      return {
        ...state,
        feeds: [...state.feeds, { id: groupId, user: group }],
      };
    }
    case response(ActionTypes.SUBSCRIBE):
    case response(ActionTypes.UNSUBSCRIBE): {
      return {
        ...state,
        feeds: getValidRecipients(action.payload),
      };
    }
  }

  return state;
}

const GROUPS_SIDEBAR_LIST_LENGTH = 4;

const getRecentGroups = ({ subscribers, frontendPreferences }) => {
  const clientPreferences = frontendPreferences || {};
  const pinnedGroups = clientPreferences.pinnedGroups || [];
  const groups = (subscribers || []).filter((i) => i.type == 'group');
  const recentGroups = groups
    .filter((i) => pinnedGroups.indexOf(i.id) > -1)
    .sort((i, j) => parseInt(j.updatedAt) - parseInt(i.updatedAt))
    .map((i) => ({ ...i, isPinned: true }));

  return recentGroups.concat(
    groups
      .filter((i) => pinnedGroups.indexOf(i.id) === -1)
      .sort((i, j) => parseInt(j.updatedAt) - parseInt(i.updatedAt))
      .slice(0, GROUPS_SIDEBAR_LIST_LENGTH),
  );
};

export function recentGroups(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.TOGGLE_PINNED_GROUP): {
      const { subscribers, users } = action.payload;
      const frontendPreferences = users.frontendPreferences[frontendPrefsConfig.clientId];
      return getRecentGroups({ subscribers, frontendPreferences });
    }
    case response(ActionTypes.WHO_AM_I): {
      const { subscribers } = action.payload;
      const frontendPreferences =
        action.payload.users.frontendPreferences[frontendPrefsConfig.clientId];
      return getRecentGroups({ subscribers, frontendPreferences });
    }
    case response(ActionTypes.CREATE_GROUP): {
      const newGroup = action.payload.groups;
      state.unshift(newGroup);
      return [...state];
    }
    case response(ActionTypes.UPDATE_GROUP): {
      const groupId = action.payload.groups.id || null;
      const groupIndex = _.findIndex(state, { id: groupId });
      if (groupIndex > -1) {
        const oldGroup = state[groupIndex];
        const newGroup = action.payload.groups || {};
        state[groupIndex] = { ...oldGroup, ...newGroup };
        return [...state];
      }
      return state;
    }
    case ActionTypes.REALTIME_USER_UPDATE: {
      if (action.updatedGroups) {
        let groups = action.updatedGroups.map((g) => ({
          ...g,
          // Do we already have this group pinned?
          isPinned: state.find((s) => s.id === g.id)?.isPinned || false,
        }));
        groups = _.uniqBy([...groups, ...state], 'id').sort((g1, g2) => {
          if (g1.isPinned !== g2.isPinned) {
            return g1.isPinned ? -1 : 1;
          }
          return parseInt(g2.updatedAt) - parseInt(g1.updatedAt);
        });
        return groups.slice(0, state.length);
      }
      return state;
    }
  }

  return state;
}

export function groups(state = {}, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      const groups = (action.payload.subscribers || []).filter((u) => u.type == 'group');
      return mergeByIds(state, groups.map(userParser));
    }
    case response(ActionTypes.CREATE_GROUP): {
      const groupId = action.payload.groups.id;
      const newGroup = userParser(action.payload.groups);
      return {
        ...state,
        [groupId]: { ...newGroup },
      };
    }
    case response(ActionTypes.UPDATE_GROUP): {
      const groupId = action.payload.groups.id;
      const oldGroup = state[groupId] || {};
      const newGroup = userParser(action.payload.groups);
      return {
        ...state,
        [groupId]: { ...oldGroup, ...newGroup },
      };
    }
    case response(ActionTypes.GET_NOTIFICATIONS): {
      return mergeByIds(state, action.payload.groups);
    }
    case response(ActionTypes.GET_INVITATION): {
      const { groups = [] } = action.payload;
      return mergeByIds(state, groups.map(userParser));
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}

const initialUserState = {
  initial: true, // will be removed by handleUsers
  payload: [],
  isPending: false,
  errorString: '',
};

const handleUsers = (state, action, type, errorString) => {
  if (action.type == request(type)) {
    return {
      payload: [],
      isPending: true,
      errorString: '',
    };
  }

  if (action.type == response(type)) {
    return {
      payload: (action.payload.subscribers || []).map(userParser),
      isPending: false,
      errorString: '',
    };
  }

  if (action.type == fail(type)) {
    return {
      payload: [],
      isPending: false,
      errorString,
    };
  }

  return state;
};

export function usernameSubscribers(state = initialUserState, action) {
  if (action.type == response(ActionTypes.UNSUBSCRIBE_FROM_GROUP)) {
    const { userName } = action.request;
    return {
      ...state,
      payload: state.payload.filter((user) => user.username !== userName),
    };
  }

  return handleUsers(
    state,
    action,
    ActionTypes.SUBSCRIBERS,
    'error occured while fetching subscribers',
  );
}

const usernameSubscriptionsState = {
  payload: [],
  isPending: false,
  errorString: '',
};

export function usernameSubscriptions(state = usernameSubscriptionsState, action) {
  return handleUsers(
    state,
    action,
    ActionTypes.SUBSCRIPTIONS,
    'error occured while fetching subscriptions',
  );
}

export function usernameBlockedByMe(state = {}, action) {
  return handleUsers(
    state,
    { ...action, payload: { subscribers: action.payload } },
    ActionTypes.BLOCKED_BY_ME,
    'error occured while fetching blocked users',
  );
}

export const blockedByMeStatus = asyncState(
  ActionTypes.BLOCKED_BY_ME,
  setOnLogOut(initialAsyncState),
);

const removeItemFromGroupRequests = (state, action) => {
  const { userName, groupName } = action.request;

  const group = state.find((group) => group.username === groupName);

  if (group && group.requests.length !== 0) {
    const newGroup = {
      ...group,
      requests: group.requests.filter((user) => user.username !== userName),
    };

    return [..._.without(state, group), newGroup];
  }

  return state;
};

export function managedGroups(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return action.payload.managedGroups.map(userParser).map((group) => {
        group.requests = group.requests.map(userParser);
        return { ...group };
      });
    }
    case response(ActionTypes.ACCEPT_GROUP_REQUEST):
    case response(ActionTypes.REJECT_GROUP_REQUEST): {
      return removeItemFromGroupRequests(state, action);
    }
    case response(ActionTypes.UNADMIN_GROUP_ADMIN): {
      if (action.request.isItMe) {
        return state.filter((group) => group.username !== action.request.groupName);
      }
      return state;
    }
    case ActionTypes.UNAUTHENTICATED: {
      return [];
    }
  }

  return state;
}

const findByIds = (collection, ids) => {
  return _.filter(collection, (item) => _.includes(ids, item.id));
};

const subscriptionRequests = (whoamiPayload) => {
  const subscriptionRequestsIds = whoamiPayload.users.subscriptionRequests || [];
  return findByIds(whoamiPayload.requests || [], subscriptionRequestsIds).map(userParser);
};

const pendingSubscriptionRequests = (whoamiPayload) => {
  const pendingSubscriptionRequestsIds = whoamiPayload.users.pendingSubscriptionRequests || [];
  return findByIds(whoamiPayload.requests || [], pendingSubscriptionRequestsIds).map(userParser);
};

export function userRequests(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return subscriptionRequests(action.payload);
    }
    case response(ActionTypes.ACCEPT_USER_REQUEST):
    case response(ActionTypes.REJECT_USER_REQUEST): {
      const { username } = action.request;
      return state.filter((user) => user.username !== username);
    }
  }

  return state;
}

export function sentRequests(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return pendingSubscriptionRequests(action.payload);
    }
    case response(ActionTypes.REVOKE_USER_REQUEST): {
      const { username } = action.request;
      return state.filter((user) => user.username !== username);
    }
  }

  return state;
}

export function groupRequestsCount(state = 0, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return action.payload.managedGroups.reduce((acc, group) => {
        return acc + group.requests.length;
      }, 0);
    }
    case response(ActionTypes.ACCEPT_GROUP_REQUEST):
    case response(ActionTypes.REJECT_GROUP_REQUEST): {
      return Math.max(0, state - 1);
    }
  }

  return state;
}

export function userRequestsCount(state = 0, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return subscriptionRequests(action.payload).length;
    }
    case response(ActionTypes.ACCEPT_USER_REQUEST):
    case response(ActionTypes.REJECT_USER_REQUEST): {
      return Math.max(0, state - 1);
    }
  }
  return state;
}

export function sentRequestsCount(state = 0, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return pendingSubscriptionRequests(action.payload).length;
    }
    case response(ActionTypes.REVOKE_USER_REQUEST): {
      return Math.max(0, state - 1);
    }
  }

  return state;
}

const initialRealtimeSettings = {
  realtimeActive: false,
  status: '',
  errorMessage: '',
};

export function frontendRealtimePreferencesForm(state = initialRealtimeSettings, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_REALTIME: {
      return { ...state, realtimeActive: !state.realtimeActive, status: '' };
    }
    case response(ActionTypes.WHO_AM_I): {
      const fp = action.payload.users.frontendPreferences[frontendPrefsConfig.clientId];
      return {
        ...state,
        realtimeActive: fp ? fp.realtimeActive : initialRealtimeSettings.realtimeActive,
      };
    }
  }
  return state;
}

export function groupAdmins(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.GET_USER_INFO): {
      return (action.payload.admins || []).map(userParser);
    }
    case response(ActionTypes.MAKE_GROUP_ADMIN): {
      const { user } = action.request;
      return [...state, user].map(userParser);
    }
    case response(ActionTypes.UNADMIN_GROUP_ADMIN): {
      const { user } = action.request;
      return state.filter((u) => u.username !== user.username);
    }
  }

  return state;
}

export function commentsHighlights(state = {}, action) {
  switch (action.type) {
    case ActionTypes.HIGHLIGHT_COMMENT: {
      return { ...action };
    }
    case ActionTypes.CLEAR_HIGHLIGHT_COMMENT: {
      return {};
    }
  }
  return state;
}

const userActionsStatusesStatusMaps = combineReducers({
  subscribing: asyncStatesMap(
    [
      ActionTypes.SUBSCRIBE,
      ActionTypes.SEND_SUBSCRIPTION_REQUEST,
      ActionTypes.REVOKE_USER_REQUEST,
      ActionTypes.UNSUBSCRIBE,
    ],
    { getKey: getKeyBy('username') },
  ),
  blocking: asyncStatesMap([ActionTypes.BAN, ActionTypes.UNBAN], { getKey: getKeyBy('username') }),
  pinned: asyncStatesMap([ActionTypes.TOGGLE_PINNED_GROUP]), // by user id!
  hiding: asyncStatesMap([ActionTypes.HIDE_BY_NAME], { getKey: getKeyBy('username') }),
  unsubscribingFromMe: asyncStatesMap([ActionTypes.UNSUBSCRIBE_FROM_ME], {
    getKey: getKeyBy('username'),
  }),
  reviewingRequest: asyncStatesMap(
    [ActionTypes.ACCEPT_USER_REQUEST, ActionTypes.REJECT_USER_REQUEST],
    { getKey: getKeyBy('username') },
  ),
  reviewingGroupRequest: asyncStatesMap(
    [ActionTypes.ACCEPT_GROUP_REQUEST, ActionTypes.REJECT_GROUP_REQUEST],
    {
      getKey: keyFromRequestPayload(({ userName, groupName }) => `${userName}:${groupName}`),
    },
  ),
});

const initialUserProfileStatuses = userActionsStatusesStatusMaps(undefined, { type: '' });

function clearStatusesById(state, userId) {
  return _.fromPairs(Object.keys(state).map((key) => [key, _.omit(state[key], userId)]));
}

export function userActionsStatuses(state = initialUserProfileStatuses, action) {
  if (action.type === response(ActionTypes.GET_USER_FEED)) {
    // Reset user statuses if user feed is loaded
    return clearStatusesById(state, action.payload.timelines.user);
  }
  if (action.type === ActionTypes.USER_CARD_CLOSING) {
    // Reset user statuses if user card is closing
    return clearStatusesById(state, action.payload.userId);
  }
  if (action.type === LOCATION_CHANGE) {
    // Reset all statuses if location changes
    return initialUserProfileStatuses;
  }
  return userActionsStatusesStatusMaps(state, action);
}

export function realtimeSubscriptions(state = [], action) {
  switch (action.type) {
    case ActionTypes.REALTIME_SUBSCRIBE: {
      const { rooms } = action.payload;
      const newState = _.union(state, rooms);
      return newState.length !== state.length ? newState : state;
    }
    case ActionTypes.REALTIME_UNSUBSCRIBE: {
      const { rooms } = action.payload;
      const newState = _.difference(state, rooms);
      return newState.length !== state.length ? newState : state;
    }
  }
  return state;
}

export function mediaViewer(state = [], action) {
  if (action.type === ActionTypes.SHOW_MEDIA) {
    return action.payload;
  }
  return state;
}

export function notifications(state = [], action) {
  switch (action.type) {
    case request(ActionTypes.GET_NOTIFICATIONS): {
      return {
        loading: true,
        error: false,
      };
    }
    case response(ActionTypes.GET_NOTIFICATIONS): {
      return {
        events: action.payload.Notifications,
        error: false,
        loading: false,
      };
    }
    case fail(ActionTypes.GET_NOTIFICATIONS): {
      return {
        events: [],
        error: true,
        loading: false,
      };
    }
  }
  return state;
}

const defaultArchivePostState = {
  ...DEFAULT_FORM_STATE,
  id: null,
};

export function archivePost(state = DEFAULT_FORM_STATE, action) {
  switch (action.type) {
    case request(ActionTypes.GET_POST_ID_BY_OLD_NAME): {
      return { ...defaultArchivePostState, inProgress: true };
    }
    case response(ActionTypes.GET_POST_ID_BY_OLD_NAME): {
      return { ...defaultArchivePostState, success: true, id: action.payload.postId };
    }
    case fail(ActionTypes.GET_POST_ID_BY_OLD_NAME): {
      return { ...defaultArchivePostState, error: true, errorText: action.payload.err };
    }
  }
  return state;
}

export function createInvitationForm(state = DEFAULT_FORM_STATE, action) {
  switch (action.type) {
    case request(ActionTypes.CREATE_FREEFEED_INVITATION): {
      return { ...state, isSaving: true, error: false, success: false };
    }
    case response(ActionTypes.CREATE_FREEFEED_INVITATION): {
      return {
        ...state,
        isSaving: false,
        success: true,
        invitationId: action.payload.invitation.secure_id,
      };
    }
    case fail(ActionTypes.CREATE_FREEFEED_INVITATION): {
      return {
        ...state,
        isSaving: false,
        error: true,
        errorText: action.payload.err || 'Something went wrong',
      };
    }
  }
  return state;
}

export function serverTimeAhead(state = 0, action) {
  if (action.type === ActionTypes.SERVER_TIME_AHEAD) {
    return action.payload;
  }
  return state;
}

const getInitialFeedViewOptions = () => {
  const { homeFeedSort } = frontendPrefsConfig.defaultValues;
  return {
    homeFeedSort,
    sort: homeFeedSort,
    currentFeed: ActionTypes.HOME,
    currentFeedType: 'RiverOfNews',
  };
};

export function feedViewOptions(state = getInitialFeedViewOptions(), action) {
  if (action.type === response(ActionTypes.WHO_AM_I)) {
    const defaultHomeFeedSort = frontendPrefsConfig.defaultValues.homeFeedSort;
    const frontendPreferences =
      action.payload.users.frontendPreferences &&
      action.payload.users.frontendPreferences[frontendPrefsConfig.clientId];
    const homeFeedSort =
      (frontendPreferences && frontendPreferences.homeFeedSort) || defaultHomeFeedSort;
    const sort = state.currentFeed === ActionTypes.HOME ? homeFeedSort : state.sort;
    return { ...state, homeFeedSort, sort };
  }
  if (ActionHelpers.isFeedRequest(action)) {
    let { sort } = state;
    if (state.currentFeed !== ActionHelpers.getFeedName(action)) {
      sort = action.type === request(ActionTypes.HOME) ? state.homeFeedSort : FeedOptions.ACTIVITY;
    }
    return {
      ...state,
      currentFeed: ActionHelpers.getFeedName(action),
      sort,
    };
  }
  if (ActionHelpers.isFeedResponse(action)) {
    const currentFeedType = action.payload.timelines ? action.payload.timelines.name : null;
    return { ...state, currentFeedType };
  }
  if (action.type === ActionTypes.TOGGLE_FEED_SORT) {
    const sort =
      state.sort === FeedOptions.ACTIVITY ? FeedOptions.CHRONOLOGIC : FeedOptions.ACTIVITY;
    return {
      ...state,
      sort,
      homeFeedSort: state.currentFeed === ActionTypes.HOME ? sort : state.homeFeedSort,
    };
  }
  return state;
}

export function systemColorScheme(state = getSystemColorScheme(), action) {
  if (action.type === ActionTypes.SET_SYSTEM_COLOR_SCHEME) {
    return action.payload;
  }
  return state;
}

export function userColorScheme(state = loadColorScheme(), action) {
  if (action.type === ActionTypes.SET_USER_COLOR_SCHEME) {
    return action.payload;
  }
  return state;
}

export function isNSFWVisible(state = loadNSFWVisibility(), action) {
  if (action.type === ActionTypes.SET_NSFW_VISIBILITY) {
    return action.payload;
  }
  return state;
}

export { settingsForms } from './reducers/settings-forms';
export { appTokens } from './reducers/app-tokens';

export const serverInfo = fromResponse(ActionTypes.GET_SERVER_INFO, ({ payload }) => payload, {});

export const serverInfoStatus = asyncState(ActionTypes.GET_SERVER_INFO);

export { extAuth } from './reducers/ext-auth.js';

export function hiddenUserNames(state = [], action) {
  if (ActionHelpers.isUserChangeResponse(action)) {
    return _.get(
      action.payload.users,
      ['frontendPreferences', CONFIG.frontendPreferences.clientId, 'homefeed', 'hideUsers'],
      CONFIG.frontendPreferences.defaultValues.homefeed.hideUsers,
    );
  }
  return state;
}

export const allGroupsStatus = asyncState(
  ActionTypes.GET_ALL_GROUPS,
  setOnLocationChange(initialAsyncState, ['/all-groups']),
);

const allGroupsDefaults = { withProtected: false, groups: [] };
export const allGroups = fromResponse(
  ActionTypes.GET_ALL_GROUPS,
  ({ payload: { withProtected, groups, users } }) => ({
    withProtected,
    groups: groups.map((g) => ({ ...g, createdAt: users.find((u) => u.id === g.id).createdAt })),
  }),
  allGroupsDefaults,
  setOnLocationChange(allGroupsDefaults, ['/all-groups']),
);

export {
  homeFeeds,
  homeFeedsStatus,
  usersInHomeFeeds,
  usersInHomeFeedsStates,
  updateUsersSubscriptionStates,
  allSubscriptions,
  allSubscriptionsStatus,
  crudHomeFeedStatus,
  homeFeedsOrderVersion,
} from './reducers/home-feeds';

export function resumeToken(state = null, action) {
  switch (action.type) {
    case fail(ActionTypes.SIGN_IN):
      return action.payload.resumeToken || null;
    case LOCATION_CHANGE:
    case request(ActionTypes.SIGN_IN):
      return null;
  }

  return state;
}

export { attachmentUploads, attachmentUploadStatuses } from './reducers/attachment-uploads';

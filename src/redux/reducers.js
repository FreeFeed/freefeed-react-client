import _ from 'lodash';
import {LOCATION_CHANGE} from 'react-router-redux';

import {userParser, postParser} from '../utils';
import config from '../config';
import {getToken, getPersistedUser} from '../services/auth';
import {parseQuery} from '../utils/search-highlighter';
import * as ActionTypes from './action-types';
import * as ActionHelpers from './action-helpers';


const frontendPrefsConfig = config.frontendPreferences;

const {request, response, fail} = ActionHelpers;

export function title(state = '', action) {
  switch (action.type) {
    case response(ActionTypes.HOME): {
      return 'FreeFeed';
    }
    case response(ActionTypes.DIRECT): {
      return 'Direct messages - FreeFeed';
    }
    case response(ActionTypes.DISCUSSIONS): {
      return 'My discussions - FreeFeed';
    }
    case response(ActionTypes.GET_BEST_OF): {
      return `Best Of FreeFeed`;
    }
    case response(ActionTypes.GET_SEARCH): {
      return `Search - FreeFeed`;
    }
    case response(ActionTypes.GET_USER_FEED): {
      const user = (action.payload.users || []).filter(user => user.username === action.request.username)[0];
      const author = user.screenName + (user.username !== user.screenName ? ' (' + user.username + ')' : '');
      return `${author} - FreeFeed`;
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const text = action.payload.posts.body.substr(0, 60);
      const user = (action.payload.users || [])[0];
      const author = user.screenName + (user.username !== user.screenName ? ' (' + user.username + ')' : '');
      return `${text} - ${author} - FreeFeed`;
    }

    case fail(ActionTypes.HOME):
    case fail(ActionTypes.DIRECT):
    case fail(ActionTypes.DISCUSSIONS):
    case fail(ActionTypes.GET_USER_FEED):
    case fail(ActionTypes.GET_SINGLE_POST): {
      return 'Error - FreeFeed';
    }

    case ActionTypes.STATIC_PAGE: {
      return `${action.payload.title} - FreeFeed`;
    }
  }
  return state;
}

export function signInForm(state={username:'', password:'', error:'', loading: false}, action) {
  switch (action.type) {
    case ActionTypes.SIGN_IN_CHANGE: {
      return {
        ...state,
        username: action.username || state.username,
        password: action.password || state.password,
        loading: false,
      };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {...state, error: (action.payload || {}).err, loading: false };
    }
    case ActionTypes.SIGN_IN_EMPTY: {
      return {...state, error: 'Enter login and password', loading: false };
    }
    case request(ActionTypes.SIGN_IN): {
      return {...state, loading: true };
    }
    case response(ActionTypes.SIGN_IN): {
      return {...state, loading: false };
    }
  }
  return state;
}

const defaultRestoreHeader = 'Reset FreeFeed Password';
const successRestoreHeader = 'Please check your email for password reset instructions.';

export function restorePassForm(state={error:'', loading: false, header: defaultRestoreHeader}, action) {
  switch (action.type) {
    case request(ActionTypes.RESTORE_PASSWORD): {
      return {...state, loading: true, header: defaultRestoreHeader };
    }
    case response(ActionTypes.RESTORE_PASSWORD): {
      return {...state, loading: false, header: successRestoreHeader };
    }
    case fail(ActionTypes.RESTORE_PASSWORD): {
      return {...state, error: (action.payload || {}).err, loading: false};
    }
  }
  return state;
}

const defaultResetHeader = 'Reset FreeFeed Password';
const successResetHeader = 'Please log in with your new password';

export function resetPassForm(state={error:'', loading: false, header: defaultResetHeader}, action) {
  switch (action.type) {
    case request(ActionTypes.RESET_PASSWORD): {
      return {...state, loading: true, header: defaultResetHeader };
    }
    case response(ActionTypes.RESET_PASSWORD): {
      return {...state, loading: false, header: successResetHeader };
    }
    case ActionTypes.RESET_PASSWORD_VALIDATION_FAIL: {
      return {...state, error: action.error, loading: false};
    }
    case fail(ActionTypes.RESET_PASSWORD): {
      return {...state, error: (action.payload || {}).err, loading: false};
    }
  }
  return state;
}


const INITIAL_SIGN_UP_FORM_STATE = {
  username: '',
  password: '',
  email: '',
  captcha: null,
  error: '',
  loading: false,
};

export function signUpForm(state=INITIAL_SIGN_UP_FORM_STATE, action) {
  switch (action.type) {
    case ActionTypes.SIGN_UP_CHANGE: {
      return {
        ...state,
        username: action.username || state.username,
        password: action.password || state.password,
        email: action.email || state.email,
        captcha: typeof action.captcha == 'undefined' ? state.captcha : action.captcha,
        loading: false,
        error: ''
      };
    }
    case ActionTypes.SIGN_UP_EMPTY: {
      return {...state, error: action.message, loading: false };
    }
    case request(ActionTypes.SIGN_UP): {
      return {...state, loading: true };
    }
    case response(ActionTypes.SIGN_UP): {
      return {...state, loading: false };
    }
    case fail(ActionTypes.SIGN_UP): {
      return {...state, error: action.payload.err, loading: false };
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
        lastPostId: action.payload.posts.id
      };
    }
    case request(ActionTypes.CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: true
      };
    }
    case fail(ActionTypes.CREATE_POST): {
      return {
        isError: true,
        errorString: CREATE_POST_ERROR,
        isPending: false
      };
    }
    case ActionTypes.RESET_POST_CREATE_FORM: {
      return {};
    }
  }
  return state;
}

const initFeed = {
  visibleEntries: [],
  hiddenEntries: [],
  isHiddenRevealed: false,
  isLastPage: true,
};

const hidePostInFeed = function(state, postId) {
  // Add it to hiddenEntries, but don't remove from visibleEntries just yet
  // (for the sake of "Undo"). And check first if it's already in hiddenEntries,
  // since realtime event might come first.
  const itsAlreadyThere = (state.hiddenEntries.indexOf(postId) > -1);
  if (itsAlreadyThere) {
    return state;
  }
  return {...state,
    hiddenEntries: [postId, ...state.hiddenEntries]
  };
};

const unhidePostInFeed = function(state, postId) {
  // Remove it from hiddenEntries and add to visibleEntries
  // (but check first if it's already in there, since this might be an "Undo" happening,
  // and/or realtime event might come first).
  const itsStillThere = (state.visibleEntries.indexOf(postId) > -1);
  return {...state,
    visibleEntries: (itsStillThere ? state.visibleEntries : [...state.visibleEntries, postId]),
    hiddenEntries: _.without(state.hiddenEntries, postId)
  };
};

export function feedViewState(state = initFeed, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return state;
  }
  if (ActionHelpers.isFeedResponse(action)) {
    const visibleEntries = (action.payload.posts || []).filter(post => !post.isHidden).map(post => post.id);
    const hiddenEntries = (action.payload.posts || []).filter(post => post.isHidden).map(post => post.id);
    const isHiddenRevealed = false;
    const isLastPage = action.payload.isLastPage;
    return {
      visibleEntries,
      hiddenEntries,
      isHiddenRevealed,
      isLastPage,
    };
  }
  if (ActionHelpers.isFeedFail(action)) {
    return initFeed;
  }

  switch (action.type) {
    case ActionTypes.UNAUTHENTICATED: {
      return initFeed;
    }
    case response(ActionTypes.DELETE_POST): {
      const postId = action.request.postId;
      return {...state,
        visibleEntries: _.without(state.visibleEntries, postId),
        hiddenEntries: _.without(state.hiddenEntries, postId)
      };
    }
    case ActionTypes.REALTIME_POST_DESTROY: {
      return {...state,
        visibleEntries: _.without(state.visibleEntries, action.postId),
        hiddenEntries: _.without(state.hiddenEntries, action.postId)
      };
    }
    case response(ActionTypes.CREATE_POST): {
      const postId = action.payload.posts.id;
      if (state.visibleEntries.indexOf(postId) !== -1) {
        return state;
      }
      return {...state,
        visibleEntries: [postId, ...state.visibleEntries]
      };
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const postId = action.request.postId;
      return {...initFeed,
        visibleEntries: [postId]
      };
    }
    case ActionTypes.REALTIME_POST_NEW: {
      if (state.visibleEntries.indexOf(action.post.id) !== -1) {
        return state;
      }
      if (!action.shouldBump) {
        return state;
      }
      return {
        ...state,
        visibleEntries: [action.post.id, ...state.visibleEntries],
      };
    }
    case ActionTypes.REALTIME_LIKE_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW: {
      if (action.post && action.shouldBump) {
        return {
          ...state,
          visibleEntries: [action.post.posts.id, ...state.visibleEntries],
        };
      }
      return state;
    }
    case fail(ActionTypes.GET_SINGLE_POST): {
      return initFeed;
    }
    case response(ActionTypes.HIDE_POST): {
      return hidePostInFeed(state, action.request.postId);
    }
    case ActionTypes.REALTIME_POST_HIDE: {
      return hidePostInFeed(state, action.postId);
    }
    case response(ActionTypes.UNHIDE_POST): {
      return unhidePostInFeed(state, action.request.postId);
    }
    case ActionTypes.REALTIME_POST_UNHIDE: {
      return unhidePostInFeed(state, action.postId);
    }
    case ActionTypes.TOGGLE_HIDDEN_POSTS: {
      return {...state,
        isHiddenRevealed: !state.isHiddenRevealed
      };
    }
  }
  return state;
}

const NO_ERROR = {
  isError: false,
  errorString: '',
  commentError: ''
};

const POST_SAVE_ERROR = 'Something went wrong while editing the post...';
const NEW_COMMENT_ERROR = 'Failed to add comment';

const indexById = list => _.keyBy(list || [], 'id');
const mergeByIds = (state, array) => {
  const mergeMap = (array || []).reduce((res, obj) => {
    res[obj.id] = !state[obj.id] ? obj : {...state[obj.id], ...obj};
    return res;
  }, {});
  return {...state, ...mergeMap};
};
const initPostViewState = post => {
  const id = post.id;

  const omittedComments = post.omittedComments;
  const omittedLikes = post.omittedLikes;
  const isEditing = false;
  const editingText = post.body;

  return { omittedComments, omittedLikes, id, isEditing, editingText, ...NO_ERROR };
};

export function postsViewState(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.posts || []).map(initPostViewState));
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const id = action.payload.posts.id;
      const omittedLikes = 0;

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } };
    }
    case request(ActionTypes.SHOW_MORE_COMMENTS): {
      const id = action.payload.postId;
      const isLoadingComments = true;

      return { ...state, [id]: { ...state[id], isLoadingComments } };
    }
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      const id = action.payload.posts.id;
      const isLoadingComments = false;
      const omittedComments = 0;

      return { ...state, [id]: { ...state[id], isLoadingComments, omittedComments, ...NO_ERROR } };
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const id = action.payload.posts.id;
      return { ...state, [id]: initPostViewState(action.payload.posts) };
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_POST_UPDATE: {
      const id = action.post.id;
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
      const errorString = action.response.status + ' ' + action.response.statusText;

      return { ...state, [id]: { id, isEditing, isError, errorString }};
    }
    case ActionTypes.SHOW_MORE_LIKES_SYNC: {
      const id = action.payload.postId;
      const omittedLikes = 0;

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } };
    }
    case ActionTypes.TOGGLE_EDITING_POST: {
      const id = action.payload.postId;
      const editingText = action.payload.newValue;
      const isEditing = !state[id].isEditing;

      return { ...state, [id]: { ...state[id], isEditing, editingText, ...NO_ERROR } };
    }
    case ActionTypes.CANCEL_EDITING_POST: {
      const id = action.payload.postId;
      const editingText = action.payload.newValue;
      const isEditing = false;

      return { ...state, [id]: { ...state[id], isEditing, editingText, ...NO_ERROR } };
    }
    case request(ActionTypes.SAVE_EDITING_POST): {
      const id = action.payload.postId;
      return { ...state, [id]: { ...state[id], isSaving: true } };
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      const id = action.payload.posts.id;
      const editingText = action.payload.posts.body;
      const isEditing = false;
      const isSaving = false;

      return { ...state, [id]: { ...state[id], isEditing, isSaving, editingText, ...NO_ERROR } };
    }
    case fail(ActionTypes.SAVE_EDITING_POST): {
      const id = action.request.postId;
      const isEditing = false;
      const isSaving = false;

      const isError = true;

      return { ...state, [id]: { ...state[id], isEditing, isSaving, isError, errorString: POST_SAVE_ERROR} };
    }
    case fail(ActionTypes.DELETE_POST): {
      const id = action.request.postId;

      const isError = true;
      const errorString = 'Something went wrong while deleting the post...';

      return { ...state, [id]: { ...state[id], isError, errorString} };
    }
    case ActionTypes.TOGGLE_COMMENTING: {
      return {
        ...state,
        [action.postId]: {
          ...state[action.postId],
          isCommenting: !state[action.postId].isCommenting,
          newCommentText: state[action.postId].newCommentText || ''
        }
      };
    }
    case ActionTypes.UPDATE_COMMENTING_TEXT: {
      const postState = state[action.postId];
      return {...state,
        [action.postId]: {...postState,
          newCommentText: action.commentText
        }
      };
    }
    case request(ActionTypes.ADD_COMMENT): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id] : {
          ...post,
          isSavingComment: true,
        }};
    }
    case response(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      return {...state,
        [post.id] : {
          ...post,
          isCommenting: false,
          isSavingComment: false,
          newCommentText: '',
          omittedComments: (post.omittedComments ? post.omittedComments + 1 : 0)
        }
      };
    }
    case fail(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      return {...state,
        [post.id] : {
          ...post,
          isSavingComment: false,
          commentError: NEW_COMMENT_ERROR
        }
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
          [action.post.posts.id]: initPostViewState(action.post.posts)
        };
      }
      return {...state,
        [post.id] : {
          ...post,
          omittedComments: (post.omittedComments ? post.omittedComments + 1 : 0)
        }
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
      if (!action.postId) {
        return state;
      }
      const postsViewState = state[action.postId];
      return {
        ...state,
        [action.postId] : {
          ...postsViewState,
          omittedComments: (postsViewState.omittedComments ? postsViewState.omittedComments - 1 : 0)
        }
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
      const {postId, isLikeVisible} = action;
      const post = state[postId];
      if (!post) {
        return state;
      }
      return {...state,
        [post.id] : {
          ...post,
          omittedLikes: isLikeVisible ? post.omittedLikes : Math.max(0, post.omittedLikes - 1),
        }
      };
    }

    case request(ActionTypes.HIDE_POST): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: true
        }};
    }
    case response(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: false
        }
      };
    }
    case ActionTypes.REALTIME_POST_HIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {...state,
        [post.id]: {...post,
          isHiding: false
        }
      };
    }
    case fail(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: false,
          hideError: 'Something went wrong while hiding the post.'
        }
      };
    }

    case request(ActionTypes.UNHIDE_POST): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: true
        }};
    }
    case response(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: false
        }
      };
    }
    case ActionTypes.REALTIME_POST_UNHIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {...state,
        [post.id]: {...post,
          isHiding: false
        }
      };
    }
    case fail(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHiding: false,
          hideError: 'Something went wrong while un-hiding the post.'
        }
      };
    }

    case ActionTypes.TOGGLE_MODERATING_COMMENTS: {
      const post = state[action.postId];
      return {...state,
        [post.id]: {...post,
          isModeratingComments: !post.isModeratingComments
        }
      };
    }

    case request(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: true
        }
      };
    }
    case response(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          commentsDisabled: true
        }
      };
    }
    case fail(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while disabling comments.'
        }
      };
    }

    case request(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: true
        }};
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          commentsDisabled: false
        }
      };
    }
    case fail(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while enabling comments.'
        }
      };
    }

    case response(ActionTypes.CREATE_POST): {
      const post = action.payload.posts;
      const id = post.id;

      const omittedComments = post.omittedComments;
      const omittedLikes = post.omittedLikes;
      const isEditing = false;
      const editingText = post.body;

      return { ...state, [id]: { omittedComments, omittedLikes, id, isEditing, editingText, ...NO_ERROR } };
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

export function posts(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.posts || []).map(postParser));
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      const post = state[action.payload.posts.id];
      return {...state,
        [post.id]: {...post,
          omittedComments: 0,
          comments: action.payload.posts.comments
        }
      };
    }
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const post = state[action.payload.posts.id];
      return {...state,
        [post.id]: {...post,
          omittedLikes: 0,
          likes: action.payload.posts.likes
        }
      };
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      const post = state[action.payload.posts.id];
      return {...state,
        [post.id]: {...post,
          body: action.payload.posts.body,
          updatedAt: action.payload.posts.updatedAt,
          attachments: action.payload.posts.attachments || []
        }
      };
    }
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      // If this is an attachment for create-post (non-existent post),
      // it should be handled in createPostForm(), not here
      if (!action.payload.postId) {
        return state;
      }

      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {
          ...post,
          attachments: [...(post.attachments || []), action.payload.attachments.id]
        }
      };
    }
    case ActionTypes.REMOVE_ATTACHMENT: {
      // If this is an attachment for create-post (non-existent post),
      // it should be handled in createPostForm(), not here
      if (!action.payload.postId) {
        return state;
      }

      const post = state[action.payload.postId];
      return {...state,
        [post.id]: {
          ...post,
          attachments: _.without((post.attachments || []), action.payload.attachmentId)
        }
      };
    }
    case response(ActionTypes.DELETE_COMMENT): {
      const commentId = action.request.commentId;
      const post = _(state).find(_post => (_post.comments||[]).indexOf(commentId) !== -1);
      if (!post) {
        return state;
      }
      const comments = _.without(post.comments, commentId);
      return {...state,
        [post.id]: {...post,
          comments,
          omittedComments: (post.omittedComments > 0 ? post.omittedComments - 1 : 0)
        }
      };
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      if (!action.postId) {
        return state;
      }

      const post = state[action.postId];

      return {...state, [action.postId] : {
        ...post,
        comments: _.without(post.comments, action.commentId),
      }};
    }
    case response(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId];
      const commentAlreadyAdded = post.comments && post.comments.indexOf(action.payload.comments.id)!==-1;
      if (commentAlreadyAdded) {
        return state;
      }
      return {...state,
        [post.id] : {
          ...post,
          comments: [...(post.comments || []), action.payload.comments.id],
          omittedComments: (post.omittedComments > 0 ? post.omittedComments + 1 : 0)
        }
      };
    }

    // Likes

    case ActionTypes.CLEAN_LIKE_ERROR: {
      const {postId} = action;
      const post = state[postId];
      if (!post || !post.likeError) {
        return state;
      }
      return {...state,
        [postId] : {
          ...post,
          likeError: null,
        }
      };
    }

    case ActionTypes.LIKE_POST_OPTIMISTIC: {
      const {postId, userId} = action.payload;
      const post = state[postId];
      if (_.includes(post.likes, userId)) {
        return state;
      }
      return {...state,
        [postId] : {
          ...post,
          likeError: null,
          likes: [userId, ...post.likes],
        }
      };
    }
    case fail(ActionTypes.LIKE_POST): {
      const {postId, userId} = action.request;
      const post = state[postId];
      if (!_.includes(post.likes, userId)) {
        return state;
      }
      return {...state,
        [postId] : {
          ...post,
          likeError: `Cannot like post: ${action.payload.err}`,
          likes: _.without(post.likes, userId),
        }
      };
    }

    case ActionTypes.UNLIKE_POST_OPTIMISTIC: {
      const {postId, userId} = action.payload;
      const post = state[postId];
      if (!_.includes(post.likes, userId)) {
        return state;
      }
      return {...state,
        [postId] : {
          ...post,
          likeError: null,
          likes: _.without(post.likes, userId),
        }
      };
    }
    case fail(ActionTypes.UNLIKE_POST): {
      const {postId, userId} = action.request;
      const post = state[postId];
      if (_.includes(post.likes, userId)) {
        return state;
      }
      return {...state,
        [postId] : {
          ...post,
          likeError: `Cannot unlike post: ${action.payload.err}`,
          likes: [userId, ...post.likes],
        }
      };
    }

    case ActionTypes.REALTIME_LIKE_NEW: {
      const {postId, users: [{id: userId}]} = action;
      const post = state[postId];
      if ((!post && !action.post)) {
        return state;
      }

      const postToAct = post || postParser(action.post.posts);

      if (postToAct.likes && _.includes(postToAct.likes, userId)) {
        return {
          ...state,
          [postToAct.id]: postToAct
        };
      }

      const likes = action.iLiked ? [postToAct.likes[0], userId, ...postToAct.likes.slice(1)]
                                  : [userId, ...(postToAct.likes || [])];

      return {
        ...state,
        [postToAct.id] : {...postToAct, likes}
      };
    }

    case ActionTypes.REALTIME_LIKE_REMOVE: {
      const {postId, userId, isLikeVisible} = action;
      const post = state[postId];
      if (!post) {
        return state;
      }

      const likes = _.without(post.likes, userId);
      const omittedLikes = isLikeVisible ? post.omittedLikes : Math.max(0, post.omittedLikes - 1);

      return {...state,
        [post.id] : {...post, likes, omittedLikes}
      };
    }

    case response(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHidden: true
        }
      };
    }
    case response(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          isHidden: false
        }
      };
    }
    case ActionTypes.REALTIME_POST_UNHIDE: {
      const post = state[action.postId];
      if (!post) {
        return state;
      }
      return {...state,
        [post.id]: {...post,
          isHidden: false
        }
      };
    }
    case response(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          commentsDisabled: true
        }
      };
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId];
      return {...state,
        [post.id]: {...post,
          commentsDisabled: false
        }
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
      return {...state,
        [post.id]: {...post,
          body: action.post.body,
          updatedAt: action.post.updatedAt,
          attachments: action.post.attachments || []
        }
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
          [action.post.posts.id]: postParser(action.post.posts)
        };
      }
      const commentAlreadyAdded = post.comments && post.comments.indexOf(action.comment.id)!==-1;
      if (commentAlreadyAdded) {
        return state;
      }
      return {
        ...state,
        [post.id]: {
          ...post,
          comments: [...(post.comments || []), action.comment.id],
        }
      };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}

export function attachments(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, action.payload.attachments);
  }
  switch (action.type) {
    case response(ActionTypes.GET_SINGLE_POST): {
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
      return {...state,
        [action.payload.attachments.id]: action.payload.attachments
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
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], ...action.payload.comments, isExpanded: true}};
    }
    case response(ActionTypes.DELETE_COMMENT): {
      return {...state, [action.request.commentId] : undefined};
    }
    case ActionTypes.REALTIME_COMMENT_NEW: {
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
      return mergeByIds(state, [action.comment]);
    }
    case ActionTypes.REALTIME_COMMENT_DESTROY: {
      return {...state, [action.commentId] : undefined};
    }
    case response(ActionTypes.ADD_COMMENT): {
      return {...state,
        [action.payload.comments.id] : {...action.payload.comments, isExpanded: true}
      };
    }
  }
  return state;
}

const COMMENT_SAVE_ERROR = 'Something went wrong while saving comment';

function updateCommentViewState(state, action) {
  const comments = action.payload.comments || [];
  const commentsViewState = comments.map(comment => ({
    id: comment.id,
    isEditing: false,
    editText: comment.body
  }));
  const viewStateMap = indexById(commentsViewState);
  return {...viewStateMap, ...state};
}

export function commentViewState(state={}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return updateCommentViewState(state, action);
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      return updateCommentViewState(state, action);
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      return updateCommentViewState(state, action);
    }
    case ActionTypes.TOGGLE_EDITING_COMMENT: {
      return {
        ...state,
        [action.commentId]: {
          ...state[action.commentId],
          isEditing: !state[action.commentId].isEditing
        }
      };
    }
    case request(ActionTypes.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.commentId]: {...state[action.payload.commentId], editText: action.payload.newCommentBody, isSaving: true}};
    }
    case response(ActionTypes.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], isEditing: false, isSaving: false, editText: action.payload.comments.body, ...NO_ERROR}};
    }
    case fail(ActionTypes.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], isEditing: true, isSaving: false, errorString: COMMENT_SAVE_ERROR}};
    }
    case response(ActionTypes.DELETE_COMMENT): {
      return {...state, [action.request.commentId] : undefined};
    }
    case response(ActionTypes.ADD_COMMENT): {
      return {...state,
        [action.payload.comments.id] : {
          id: action.payload.comments.id,
          isEditing: false,
          editText: action.payload.comments.body,
        }
      };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }
  return state;
}

export function usersNotFound(state = [], action) {
  switch (action.type) {
    case fail(ActionTypes.GET_USER_INFO): {
      if (action.response.status === 404) {
        const {username} = action.request;
        if (state.indexOf(username) < 0) {
          state = [...state, username];
        }
        return state;
      }
    }
  }
  return state;
}

export function users(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.users || []).map(userParser));
  }
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I):
    case response(ActionTypes.GET_USER_INFO): {
      const userId = action.payload.users.id;
      const oldUser = state[userId] || {};
      const newUser = userParser(action.payload.users);
      return {...state,
        [userId]: {...oldUser, ...newUser}
      };
    }
    case response(ActionTypes.CREATE_GROUP): {
      const userId = action.payload.groups.id;
      const newUser = userParser(action.payload.groups);
      return {...state,
        [userId]: {...newUser}
      };
    }
    case response(ActionTypes.UPDATE_GROUP): {
      const userId = action.payload.groups.id;
      const oldUser = state[userId] || {};
      const newUser = userParser(action.payload.groups);
      return {...state,
        [userId]: {...oldUser, ...newUser}
      };
    }
    case response(ActionTypes.SHOW_MORE_COMMENTS):
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC):
    case response(ActionTypes.GET_SINGLE_POST): {
      return mergeByIds(state, (action.payload.users || []).map(userParser));
    }
    case ActionTypes.REALTIME_POST_NEW:
    case ActionTypes.REALTIME_LIKE_NEW:
    case ActionTypes.REALTIME_COMMENT_NEW: {
      if (!action.users || !action.users.length) {
        return state;
      }
      const usersToAdd = !action.post ? action.users : [...(action.users || []), ...(action.post.users || [])];

      const notAdded = state => user => !state[user.id];

      return mergeByIds(state, usersToAdd.filter(notAdded(state)).map(userParser));
    }
    case ActionTypes.HIGHLIGHT_COMMENT: {
      return state;
    }
    case ActionTypes.UNAUTHENTICATED:
      return {};
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
      const subscribers = !action.post ? action.subscribers || [] : [...(action.subscribers || []), ...(action.post.subscribers || []) ];
      return mergeByIds(state, (subscribers || []).map(userParser));
    }
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

const initUser = () => ({
  frontendPreferences: frontendPrefsConfig.defaultValues,
  ...getPersistedUser()
});

export function user(state = initUser(), action) {
  if (ActionHelpers.isUserChangeResponse(action)) {
    const subscriptions = _.uniq((action.payload.subscriptions || []).map(sub => sub.user));
    return {...state, ...userParser(action.payload.users), subscriptions};
  }
  switch (action.type) {
    case response(ActionTypes.SEND_SUBSCRIPTION_REQUEST): {
      return {...state,
        pendingSubscriptionRequests: [...(state.pendingSubscriptionRequests || []),
          action.request.id
        ]
      };
    }
    case response(ActionTypes.DIRECTS_ALL_READ): {
      return {...state, unreadDirectsNumber: 0 };
    }
    case ActionTypes.REALTIME_USER_UPDATE: {
      return {...state, ...action.user};
    }
    case response(ActionTypes.BAN): {
      return {...state, banIds: [...state.banIds, action.request.id]};
    }
    case response(ActionTypes.UNBAN): {
      return {...state, banIds: _.without(state.banIds, action.request.id)};
    }
    case response(ActionTypes.CREATE_GROUP): {
      return {...state, subscriptions: [...state.subscriptions, action.payload.groups.id]};
    }
  }
  return state;
}

const DEFAULT_PASSWORD_FORM_STATE = {
  isSaving:false,
  success:false,
  error:false,
  errorText: '',
};

export function passwordForm(state=DEFAULT_PASSWORD_FORM_STATE, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: true, error: false, success: false};
    }
    case response(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: false, success: true, error: false};
    }
    case fail(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: false, success: false, error: true, errorText: action.payload.err};
    }
    case ActionTypes.RESET_SETTINGS_FORMS: {
      return {...state, isSaving: false, success: false, error: false, errorText: ''};
    }
  }
  return state;
}

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

export function userSettingsForm(state={saved: false}, action) {
  switch (action.type) {
    case ActionTypes.USER_SETTINGS_CHANGE: {
      return {...state, ...action.payload, success: false, error: false};
    }
    case request(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: true, error: false};
    }
    case response(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: false, success: true, error: false};
    }
    case fail(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: false, success: false, error: true, errorMessage: (action.payload || {}).err};
    }
    case ActionTypes.RESET_SETTINGS_FORMS: {
      return {...state, success: false, error: false, errorMessage: '', isSaving: false};
    }
  }
  return state;
}

export function frontendPreferencesForm(state={}, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return {...state, ...action.payload.users.frontendPreferences[frontendPrefsConfig.clientId]};
    }
    case request(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_FRONTEND_PREFERENCES): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
    case ActionTypes.RESET_SETTINGS_FORMS: {
      return {...state, status: '', errorMessage: ''};
    }
  }
  return state;
}

export function userPictureForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_USER_PICTURE): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_USER_PICTURE): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_USER_PICTURE): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
    case ActionTypes.RESET_SETTINGS_FORMS: {
      return {...state, status: '', errorMessage: ''};
    }
  }
  return state;
}

export function groupSettings(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.GET_USER_INFO): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.GET_USER_INFO): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.GET_USER_INFO): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
  }
  return state;
}

export function groupCreateForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.CREATE_GROUP): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.CREATE_GROUP): {
      const groupUrl = '/' + action.payload.groups.username;
      return {...state, status: 'success', groupUrl };
    }
    case fail(ActionTypes.CREATE_GROUP): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
    case ActionTypes.RESET_GROUP_CREATE_FORM: {
      return {};
    }
  }
  return state;
}

export function groupSettingsForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_GROUP): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_GROUP): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_GROUP): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
    case ActionTypes.RESET_GROUP_UPDATE_FORM: {
      return {};
    }
  }
  return state;
}

export function groupPictureForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_GROUP_PICTURE): {
      return {...state, status: 'loading'};
    }
    case response(ActionTypes.UPDATE_GROUP_PICTURE): {
      return {...state, status: 'success'};
    }
    case fail(ActionTypes.UPDATE_GROUP_PICTURE): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err};
    }
    case ActionTypes.RESET_GROUP_UPDATE_FORM: {
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
  if (action.type == response(ActionTypes.GET_SINGLE_POST) || action.type == fail(ActionTypes.GET_SINGLE_POST)) {
    return false;
  }
  switch (action.type) {
    case ActionTypes.UNAUTHENTICATED: {
      return false;
    }
  }
  return state;
}

export function boxHeader(state = "", action) {
  switch (action.type) {
    case request(ActionTypes.HOME): {
      return 'Home';
    }
    case request(ActionTypes.DISCUSSIONS): {
      return 'My discussions';
    }
    case request(ActionTypes.DIRECT): {
      return 'Direct messages';
    }
    case request(ActionTypes.GET_SEARCH): {
      return `Search${action.payload.search ? ': ' + action.payload.search : ''}`;
    }
    case request(ActionTypes.GET_BEST_OF): {
      return 'Best Of FreeFeed';
    }
    case request(ActionTypes.GET_USER_FEED): {
      return '';
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
    const sub = _.find(state.subscriptions || [], { 'id': rs.id });
    let user = null;
    if (sub && sub.name == 'Posts') {
      user = _.find(state.subscribers || [], { 'id': sub.user });
    }
    if (user) {
      return {id: rs.id, user: user};
    }
  }).filter(Boolean);

  const canPostToGroup = function(subUser) {
    return (
      (subUser.isRestricted === '0') ||
      ((subUser.administrators || []).indexOf(state.users.id) > -1)
    );
  };

  const canSendDirect = function(subUser) {
    return (_.findIndex(state.users.subscribers || [], { 'id': subUser.id }) > -1);
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
    feeds: state.feeds
  };
}

export function sendTo(state = INITIAL_SEND_TO_STATE, action) {
  if (ActionHelpers.isFeedRequest(action)) {
    return getHiddenSendTo(state);
  }

  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return {
        expanded: false,
        feeds: getValidRecipients(action.payload)
      };
    }
    case ActionTypes.EXPAND_SEND_TO: {
      return {...state,
        expanded: true
      };
    }
    case response(ActionTypes.CREATE_POST): {
      return {...state,
        expanded: false
      };
    }
    case response(ActionTypes.CREATE_GROUP): {
      const groupId = action.payload.groups.id;
      const group = userParser(action.payload.groups);
      return {...state,
        feeds: [ ...state.feeds, { id: groupId, user: group } ]
      };
    }
    case response(ActionTypes.SUBSCRIBE):
    case response(ActionTypes.UNSUBSCRIBE): {
      return {...state,
        feeds: getValidRecipients(action.payload)
      };
    }
  }

  return state;
}

export function createPostForm(state = {}, action) {
  switch (action.type) {
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state;
      }

      return {...state,
        attachments: [...(state.attachments || []), action.payload.attachments.id]
      };
    }
    case ActionTypes.REMOVE_ATTACHMENT: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state;
      }

      return {...state,
        attachments: _.without((state.attachments || []), action.payload.attachmentId)
      };
    }
  }

  return state;
}

const GROUPS_SIDEBAR_LIST_LENGTH = 4;

export function recentGroups(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      const subscribers = (action.payload.subscribers || []);
      return subscribers
        .filter(i => i.type == 'group')
        .sort((i, j) => parseInt(j.updatedAt) - parseInt(i.updatedAt))
        .slice(0, GROUPS_SIDEBAR_LIST_LENGTH);
    }
    case response(ActionTypes.CREATE_GROUP): {
      const newGroup = action.payload.groups;
      state.unshift(newGroup);
      return [...state];
    }
    case response(ActionTypes.UPDATE_GROUP): {
      const groupId = (action.payload.groups.id || null);
      const groupIndex = _.findIndex(state, { 'id': groupId });
      if (groupIndex > -1) {
        const oldGroup = state[groupIndex];
        const newGroup = (action.payload.groups || {});
        state[groupIndex] = {...oldGroup, ...newGroup};
        return [...state];
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
      return {...state,
        [groupId]: {...newGroup}
      };
    }
    case response(ActionTypes.UPDATE_GROUP): {
      const groupId = action.payload.groups.id;
      const oldGroup = state[groupId] || {};
      const newGroup = userParser(action.payload.groups);
      return {...state,
        [groupId]: {...oldGroup, ...newGroup}
      };
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {};
    }
  }

  return state;
}

const handleUsers = (state, action, type, errorString) => {
  if (action.type == request(type)) {
    return {
      payload: [],
      isPending: true,
      errorString: ''
    };
  }

  if (action.type == response(type)) {
    return {
      payload: (action.payload.subscribers || []).map(userParser),
      isPending: false,
      errorString: ''
    };
  }

  if (action.type == fail(type)) {
    return {
      payload: [],
      isPending: false,
      errorString: errorString
    };
  }

  return state;
};

export function usernameSubscribers(state = {}, action) {
  if (action.type == response(ActionTypes.UNSUBSCRIBE_FROM_GROUP)) {
    const userName = action.request.userName;
    return {
      ...state,
      payload: state.payload.filter((user) => user.username !== userName)
    };
  }

  return handleUsers(
    state,
    action,
    ActionTypes.SUBSCRIBERS,
    'error occured while fetching subscribers'
  );
}

export function usernameSubscriptions(state = {}, action) {
  return handleUsers(
    state,
    action,
    ActionTypes.SUBSCRIPTIONS,
    'error occured while fetching subscriptions'
  );
}

export function usernameBlockedByMe(state = {}, action) {
  return handleUsers(
    state,
    { ...action, 'payload': {'subscribers': action.payload } },
    ActionTypes.BLOCKED_BY_ME,
    'error occured while fetching blocked users'
  );
}

const removeItemFromGroupRequests = (state, action) => {
  const userName = action.request.userName;
  const groupName = action.request.groupName;

  const group = state.find(group => group.username === groupName);

  if (group && group.requests.length !== 0) {
    const newGroup = {
      ...group,
      requests: group.requests.filter(user => user.username !== userName)
    };

    return _(state).without(group).push(newGroup).value();
  }

  return state;
};

export function managedGroups(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      return action.payload.managedGroups.map(userParser).map(group => {
        group.requests = group.requests.map(userParser);
        return {...group};
      });
    }
    case response(ActionTypes.ACCEPT_GROUP_REQUEST):
    case response(ActionTypes.REJECT_GROUP_REQUEST): {
      return removeItemFromGroupRequests(state, action);
    }
    case response(ActionTypes.UNADMIN_GROUP_ADMIN): {
      if (action.request.isItMe) {
        return state.filter(group => group.username !== action.request.groupName);
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
      const userName = action.request.userName;
      return state.filter((user) => user.username !== userName);
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
      const userName = action.request.userName;
      return state.filter((user) => user.username !== userName);
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

export function frontendRealtimePreferencesForm(state=initialRealtimeSettings, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_REALTIME: {
      return {...state, realtimeActive: !state.realtimeActive, status: ''};
    }
    case response(ActionTypes.WHO_AM_I): {
      const fp = action.payload.users.frontendPreferences[frontendPrefsConfig.clientId];
      return {...state, realtimeActive: (fp ? fp.realtimeActive : initialRealtimeSettings.realtimeActive)};
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
      const user = action.request.user;
      return [...state, user].map(userParser);
    }
    case response(ActionTypes.UNADMIN_GROUP_ADMIN): {
      const user = action.request.user;
      return state.filter((u) => u.username !== user.username);
    }
  }

  return state;
}

export function commentsHighlights(state={}, action) {
  switch (action.type) {
    case ActionTypes.HIGHLIGHT_COMMENT: {
      return {
        ...action
      };
    }
    case ActionTypes.CLEAR_HIGHLIGHT_COMMENT: {
      return {};
    }
  }
  return state;
}

export function userViews(state = {}, action) {
  switch (action.type) {
    case request(ActionTypes.SUBSCRIBE):
    case request(ActionTypes.SEND_SUBSCRIPTION_REQUEST):
    case request(ActionTypes.REVOKE_USER_REQUEST):
    case request(ActionTypes.UNSUBSCRIBE): {
      const userId = action.payload.id;
      const userView = state[userId];
      return {...state, [userId]: {...userView, isSubscribing: true}};
    }
    case response(ActionTypes.SUBSCRIBE):
    case response(ActionTypes.SEND_SUBSCRIPTION_REQUEST):
    case response(ActionTypes.REVOKE_USER_REQUEST):
    case response(ActionTypes.UNSUBSCRIBE):
    case fail(ActionTypes.SUBSCRIBE):
    case fail(ActionTypes.SEND_SUBSCRIPTION_REQUEST):
    case fail(ActionTypes.REVOKE_USER_REQUEST):
    case fail(ActionTypes.UNSUBSCRIBE): {
      const userId = action.request.id;
      const userView = state[userId];
      return {...state, [userId]: {...userView, isSubscribing: false}};
    }

    case request(ActionTypes.BAN):
    case request(ActionTypes.UNBAN): {
      const userId = action.payload.id;
      const userView = state[userId];
      return {...state, [userId]: {...userView, isBlocking: true}};
    }
    case response(ActionTypes.BAN):
    case response(ActionTypes.UNBAN):
    case fail(ActionTypes.BAN):
    case fail(ActionTypes.UNBAN): {
      const userId = action.request.id;
      const userView = state[userId];
      return {...state, [userId]: {...userView, isBlocking: false}};
    }
  }

  return state;
}

export function realtimeSubscription(state = {type: null, id: null}, action) {
  switch (action.type) {
    case response(ActionTypes.REALTIME_SUBSCRIBE): {
      return {...state, type: action.subsType, id: action.id};
    }
    case response(ActionTypes.REALTIME_UNSUBSCRIBE): {
      return {...state, type: null, id: null};
    }
  }
  return state;
}

import * as ActionTypes from './action-types'
import * as ActionHelpers from './action-helpers'
const {request, response, fail} = ActionHelpers


import _ from 'lodash'
import {userParser, postParser} from '../utils'

export function signInForm(state={username:'', password:'', error:'', loading: false}, action) {
  switch(action.type) {
    case ActionTypes.SIGN_IN_CHANGE: {
      return {
        ...state,
        username: action.username || state.username,
        password: action.password || state.password,
        loading: false,
      }
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {...state, error: (action.payload || {}).err, loading: false }
    }
    case ActionTypes.SIGN_IN_EMPTY: {
      return {...state, error: 'Enter login and password', loading: false }
    }
    case request(ActionTypes.SIGN_IN): {
      return {...state, loading: true }
    }
    case response(ActionTypes.SIGN_IN): {
      return {...state, loading: false }
    }
  }
  return state
}

const INITIAL_SIGN_UP_FORM_STATE = {
  username: '',
  password: '',
  email: '',
  captcha: null,
  error: '',
  loading: false,
}

export function signUpForm(state=INITIAL_SIGN_UP_FORM_STATE, action) {
  switch(action.type) {
    case ActionTypes.SIGN_UP_CHANGE: {
      return {
        ...state,
        username: action.username || state.username,
        password: action.password || state.password,
        email: action.email || state.email,
        captcha: typeof action.captcha == 'undefined' ? state.captcha : action.captcha,
        loading: false,
        error: ''
      }
    }
    case ActionTypes.SIGN_UP_EMPTY: {
      return {...state, error: action.message, loading: false }
    }
    case request(ActionTypes.SIGN_UP): {
      return {...state, loading: true }
    }
    case response(ActionTypes.SIGN_UP): {
      return {...state, loading: false }
    }
    case fail(ActionTypes.SIGN_UP): {
      return {...state, error: action.payload.err, loading: false }
    }
  }
  return state
}

export function serverError(state = false, action) {
  switch (action.type) {
    case ActionTypes.SERVER_ERROR: {
      return true
    }
  }
  return state
}

const CREATE_POST_ERROR = 'Something went wrong while creating the post...'

export function createPostViewState(state = {}, action) {
  switch (action.type) {
    case response(ActionTypes.CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: false
      }
    }
    case request(ActionTypes.CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: true
      }
    }
    case fail(ActionTypes.CREATE_POST): {
      return {
        isError: true,
        errorString: CREATE_POST_ERROR,
        isPending: false
      }
    }
  }
  return state
}

const initFeed = {
  visibleEntries: [],
  hiddenEntries: [],
  isHiddenRevealed: false
}

export function feedViewState(state = initFeed, action) {
  if (ActionHelpers.isFeedRequest(action)){
    return state
  }
  if (ActionHelpers.isFeedResponse(action)){
    const visibleEntries = (action.payload.posts || []).filter(post => !post.isHidden).map(post => post.id)
    const hiddenEntries = (action.payload.posts || []).filter(post => post.isHidden).map(post => post.id)
    const isHiddenRevealed = false
    return {
      visibleEntries,
      hiddenEntries,
      isHiddenRevealed
    }
  }

  switch (action.type) {
    case ActionTypes.UNAUTHENTICATED: {
      return initFeed
    }
    case response(ActionTypes.DELETE_POST): {
      const postId = action.request.postId
      return {...state,
        visibleEntries: _.without(state.visibleEntries, postId),
        hiddenEntries: _.without(state.hiddenEntries, postId)
      }
    }
    case response(ActionTypes.CREATE_POST): {
      const postId = action.payload.posts.id
      return {...state,
        visibleEntries: [postId, ...state.visibleEntries]
      }
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const postId = action.request.postId
      return {...initFeed,
        visibleEntries: [postId]
      }
    }
    case fail(ActionTypes.GET_SINGLE_POST): {
      return initFeed
    }

    case response(ActionTypes.HIDE_POST): {
      // Add it to hiddenEntries, but don't remove from visibleEntries just yet
      // (for the sake of "Undo")
      const postId = action.request.postId
      return {...state,
        hiddenEntries: [postId, ...state.hiddenEntries]
      }
    }
    case response(ActionTypes.UNHIDE_POST): {
      // Remove it from hiddenEntries and add to visibleEntries
      // (but check first if it's already in there, since this might be an "Undo" happening)
      const postId = action.request.postId
      const itsStillThere = (state.visibleEntries.indexOf(postId) > -1)
      return {...state,
        visibleEntries: (itsStillThere ? state.visibleEntries : [...state.visibleEntries, postId]),
        hiddenEntries: _.without(state.hiddenEntries, postId)
      }
    }
    case ActionTypes.TOGGLE_HIDDEN_POSTS: {
      return {...state,
        isHiddenRevealed: !state.isHiddenRevealed
      }
    }
  }
  return state
}

const NO_ERROR = {
  isError: false,
  errorString: '',
  commentError: ''
}

const POST_SAVE_ERROR = 'Something went wrong while editing the post...'
const NEW_COMMENT_ERROR = 'Failed to add comment'
const GET_SINGLE_POST_ERROR = 'Can\'t find the post'

const indexById = list => _.indexBy(list || [], 'id')
const mergeByIds = (state, array) => ({...state, ...indexById(array)})
const initPostViewState = post => {
  const id = post.id

  const omittedComments = post.omittedComments
  const omittedLikes = post.omittedLikes
  const isEditing = false
  const editingText = post.body

  return { omittedComments, omittedLikes, id, isEditing, editingText, ...NO_ERROR }
}

export function postsViewState(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)){
    return mergeByIds(state, (action.payload.posts || []).map(initPostViewState))
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const id = action.payload.posts.id
      const omittedLikes = 0

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } }
    }
    case request(ActionTypes.SHOW_MORE_COMMENTS): {
      const id = action.payload.postId
      const isLoadingComments = true

      return { ...state, [id]: { ...state[id], isLoadingComments } }
    }
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      const id = action.payload.posts.id
      const isLoadingComments = false
      const omittedComments = 0

      return { ...state, [id]: { ...state[id], isLoadingComments, omittedComments, ...NO_ERROR } }
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      const id = action.payload.posts.id
      return { ...state, [id]: initPostViewState(action.payload.posts) }
    }
    case fail(ActionTypes.GET_SINGLE_POST): {
      const id = action.request.postId
      const isEditing = false

      const isError = true

      return { ...state, [id]: { id, isEditing, isError, errorString: GET_SINGLE_POST_ERROR }}
    }
    case ActionTypes.SHOW_MORE_LIKES_SYNC: {
      const id = action.payload.postId
      const omittedLikes = 0

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } }
    }
    case ActionTypes.TOGGLE_EDITING_POST: {
      const id = action.payload.postId
      const editingText = action.payload.newValue
      const isEditing = !state[id].isEditing

      return { ...state, [id]: { ...state[id], isEditing, editingText, ...NO_ERROR } }
    }
    case ActionTypes.CANCEL_EDITING_POST: {
      const id = action.payload.postId
      const editingText = action.payload.newValue
      const isEditing = false

      return { ...state, [id]: { ...state[id], isEditing, editingText, ...NO_ERROR } }
    }
    case request(ActionTypes.SAVE_EDITING_POST): {
      const id = action.payload.postId
      return { ...state, [id]: { ...state[id], isSaving: true } }
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      const id = action.payload.posts.id
      const editingText = action.payload.posts.body
      const isEditing = false
      const isSaving = false

      return { ...state, [id]: { ...state[id], isEditing, isSaving, editingText, ...NO_ERROR } }
    }
    case fail(ActionTypes.SAVE_EDITING_POST): {
      const id = action.request.postId
      const isEditing = false

      const isError = true

      return { ...state, [id]: { ...state[id], isEditing, isSaving, isError, errorString: POST_SAVE_ERROR} }
    }
    case fail(ActionTypes.DELETE_POST): {
      const id = action.request.postId

      const isError = true
      const errorString = 'Something went wrong while deleting the post...'

      return { ...state, [id]: { ...state[id], isError, errorString} }
    }
    case ActionTypes.TOGGLE_COMMENTING: {
      return {...state,
        [action.postId] : {
          ...state[action.postId],
          isCommenting:!state[action.postId].isCommenting,
          newCommentText: state[action.postId].newCommentText || '' }
        }
    }
    case ActionTypes.UPDATE_COMMENTING_TEXT: {
      const postState = state[action.postId]
      return {...state,
        [action.postId]: {...postState,
          newCommentText: action.commentText
        }
      }
    }
    case request(ActionTypes.ADD_COMMENT): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id] : {
          ...post,
          isSavingComment: true,
        }}
    }
    case response(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          isCommenting: false,
          isSavingComment: false,
          newCommentText: '',
          omittedComments: (post.omittedComments ? post.omittedComments + 1 : 0)
        }
      }
    }
    case fail(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          isSavingComment: false,
          commentError: NEW_COMMENT_ERROR
        }
      }
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
    case request(ActionTypes.LIKE_POST): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id] : {
          ...post,
          isLiking: true,
        }}
    }
    case response(ActionTypes.LIKE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
          omittedLikes: (post.omittedLikes > 0 ? post.omittedLikes + 1 : 0)
        }
      }
    }
    case fail(ActionTypes.LIKE_POST): {
      const post = state[action.request.postId]
      const errorString = 'Something went wrong while liking the post...'
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
          likeError: errorString,
        }
      }
    }
    case request(ActionTypes.UNLIKE_POST): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id] : {
          ...post,
          isLiking: true,
        }}
    }
    case response(ActionTypes.UNLIKE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
          omittedLikes: (post.omittedLikes > 0 ? post.omittedLikes - 1 : 0)
        }
      }
    }
    case fail(ActionTypes.UNLIKE_POST): {
      const post = state[action.request.postId]
      const errorString = 'Something went wrong while un-liking the post...'
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
          likeError: errorString,
        }
      }
    }

    case request(ActionTypes.HIDE_POST): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id]: {...post,
          isHiding: true
        }}
    }
    case response(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          isHiding: false
        }
      }
    }
    case fail(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          isHiding: false,
          hideError: 'Something went wrong while hiding the post.'
        }
      }
    }

    case request(ActionTypes.UNHIDE_POST): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id]: {...post,
          isHiding: true
        }}
    }
    case response(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          isHiding: false
        }
      }
    }
    case fail(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          isHiding: false,
          hideError: 'Something went wrong while un-hiding the post.'
        }
      }
    }

    case ActionTypes.TOGGLE_MODERATING_COMMENTS: {
      const post = state[action.postId]
      return {...state,
        [post.id]: {...post,
          isModeratingComments: !post.isModeratingComments
        }
      }
    }

    case request(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id]: {...post,
          isDisablingComments: true
        }
      }
    }
    case response(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          commentsDisabled: true
        }
      }
    }
    case fail(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while disabling comments.'
        }
      }
    }

    case request(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id]: {...post,
          isDisablingComments: true
        }}
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          commentsDisabled: false
        }
      }
    }
    case fail(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          isDisablingComments: false,
          disableCommentsError: 'Something went wrong while enabling comments.'
        }
      }
    }

    case response(ActionTypes.CREATE_POST): {
      const post = action.payload.posts
      const id = post.id

      const omittedComments = post.omittedComments
      const omittedLikes = post.omittedLikes
      const isEditing = false
      const editingText = post.body

      return { ...state, [id]: { omittedComments, omittedLikes, id, isEditing, editingText, ...NO_ERROR } }
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {}
    }
  }

  return state
}

function updatePostData(state, action) {
  const postId = action.payload.posts.id
  return { ...state, [postId]: postParser(action.payload.posts) }
}

export function posts(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)){
    return mergeByIds(state, (action.payload.posts || []).map(postParser))
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      const post = state[action.payload.posts.id]
      return {...state,
        [post.id]: {...post,
          omittedComments: 0,
          comments: action.payload.posts.comments
        }
      }
    }
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      const post = state[action.payload.posts.id]
      return {...state,
        [post.id]: {...post,
          omittedLikes: 0,
          likes: action.payload.posts.likes
        }
      }
    }
    case response(ActionTypes.SAVE_EDITING_POST): {
      const post = state[action.payload.posts.id]
      return {...state,
        [post.id]: {...post,
          body: action.payload.posts.body,
          updatedAt: action.payload.posts.updatedAt,
          attachments: action.payload.posts.attachments || []
        }
      }
    }
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      // If this is an attachment for create-post (non-existent post),
      // it should be handled in createPostForm(), not here
      if (!action.payload.postId) {
        return state
      }

      const post = state[action.payload.postId]
      return {...state,
        [post.id]: {
          ...post,
          attachments: [...(post.attachments || []), action.payload.attachments.id]
        }
      }
    }
    case ActionTypes.REMOVE_ATTACHMENT: {
      // If this is an attachment for create-post (non-existent post),
      // it should be handled in createPostForm(), not here
      if (!action.payload.postId) {
        return state
      }

      const post = state[action.payload.postId]
      return {...state,
        [post.id]: {
          ...post,
          attachments: _.without((post.attachments || []), action.payload.attachmentId)
        }
      }
    }
    case response(ActionTypes.DELETE_COMMENT): {
      const commentId = action.request.commentId
      const post = _(state).find(post => (post.comments||[]).indexOf(commentId) !== -1)
      const comments = _.without(post.comments, commentId)
      return {...state,
        [post.id]: {...post,
          comments,
          omittedComments: (post.omittedComments > 0 ? post.omittedComments - 1 : 0)
        }
      }
    }
    case response(ActionTypes.ADD_COMMENT): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          comments: [...(post.comments || []), action.payload.comments.id],
          omittedComments: (post.omittedComments > 0 ? post.omittedComments + 1 : 0)
        }
      }
    }
    case response(ActionTypes.LIKE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          likes: [action.request.userId, ...(post.likes || [])],
          omittedLikes: (post.omittedLikes > 0 ? post.omittedLikes + 1 : 0)
        }
      }
    }
    case response(ActionTypes.UNLIKE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          likes: _.without(post.likes, action.request.userId),
          omittedLikes: (post.omittedLikes > 0 ? post.omittedLikes - 1 : 0)
        }
      }
    }
    case response(ActionTypes.HIDE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          isHidden: true
        }
      }
    }
    case response(ActionTypes.UNHIDE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          isHidden: false
        }
      }
    }
    case response(ActionTypes.DISABLE_COMMENTS): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          commentsDisabled: true
        }
      }
    }
    case response(ActionTypes.ENABLE_COMMENTS): {
      const post = state[action.request.postId]
      return {...state,
        [post.id]: {...post,
          commentsDisabled: false
        }
      }
    }
    case response(ActionTypes.CREATE_POST): {
      return updatePostData(state, action)
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      return updatePostData(state, action)
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {}
    }
  }

  return state
}

export function attachments(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, action.payload.attachments)
  }
  switch (action.type) {
    case response(ActionTypes.GET_SINGLE_POST): {
      return mergeByIds(state, action.payload.attachments)
    }
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      return {...state,
        [action.payload.attachments.id]: action.payload.attachments
      }
    }
  }
  return state
}

function updateCommentData(state, action) {
  return mergeByIds(state, action.payload.comments)
}

export function comments(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)){
    return updateCommentData(state, action)
  }
  switch (action.type) {
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      return updateCommentData(state, action)
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      return updateCommentData(state, action)
    }
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC): {
      return updateCommentData(state, action)
    }
    case response(ActionTypes.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], ...action.payload.comments}}
    }
    case response(ActionTypes.DELETE_COMMENT): {
      return {...state, [action.request.commentId] : undefined}
    }
    case response(ActionTypes.ADD_COMMENT): {
      return {...state,
        [action.payload.comments.id] : action.payload.comments
      }
    }
  }
  return state
}

const COMMENT_SAVE_ERROR = 'Something went wrong while saving comment'

function updateCommentViewState(state, action) {
  const comments = action.payload.comments || []
  const commentsViewState = comments.map(comment => ({
    id: comment.id,
    isEditing: false,
    editText: comment.body
  }))
  const viewStateMap = indexById(commentsViewState)
  return {...viewStateMap, ...state}
}

export function commentViewState(state={}, action) {
  if (ActionHelpers.isFeedResponse(action)){
    return updateCommentViewState(state, action)
  }
  switch(action.type){
    case response(ActionTypes.SHOW_MORE_COMMENTS): {
      return updateCommentViewState(state, action)
    }
    case response(ActionTypes.GET_SINGLE_POST): {
      return updateCommentViewState(state, action)
    }
    case ActionTypes.TOGGLE_EDITING_COMMENT: {
      return {
        ...state,
        [action.commentId]: {
          ...state[action.commentId],
          isEditing: !state[action.commentId].isEditing
        }
      }
    }
    case request(ActionTypes.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.commentId]: {...state[action.payload.commentId], editText: action.payload.newCommentBody, isSaving: true}}
    }
    case response(ActionTypes.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], isEditing: false, isSaving: false, editText: action.payload.comments.body, ...NO_ERROR}}
    }
    case fail(ActionTypes.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], isEditing: true, isSaving: false, errorString: COMMENT_SAVE_ERROR}}
    }
    case response(ActionTypes.DELETE_COMMENT): {
      return {...state, [action.request.commentId] : undefined}
    }
    case response(ActionTypes.ADD_COMMENT): {
      return {...state,
        [action.payload.comments.id] : {
          id: action.payload.comments.id,
          isEditing: false,
          editText: action.payload.comments.body,
        }
      }
    }
    case ActionTypes.UNAUTHENTICATED: {
      return {}
    }
  }
  return state
}

export function users(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.users || []).map(userParser))
  }
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I):
    case response(ActionTypes.GET_USER_INFO): {
      let userId = action.payload.users.id
      let oldUser = state[userId] || {}
      let newUser = userParser(action.payload.users)
      return {...state,
        [userId]: {...oldUser, ...newUser}
      }
    }
    case response(ActionTypes.CREATE_GROUP): {
      let userId = action.payload.groups.id
      let newUser = userParser(action.payload.groups)
      return {...state,
        [userId]: {...newUser}
      }
    }
    case response(ActionTypes.UPDATE_GROUP): {
      let userId = action.payload.groups.id
      let oldUser = state[userId] || {}
      let newUser = userParser(action.payload.groups)
      return {...state,
        [userId]: {...oldUser, ...newUser}
      }
    }
    case response(ActionTypes.SHOW_MORE_COMMENTS):
    case response(ActionTypes.SHOW_MORE_LIKES_ASYNC):
    case response(ActionTypes.GET_SINGLE_POST):
      return mergeByIds(state, (action.payload.users || []).map(userParser))
    case ActionTypes.UNAUTHENTICATED:
      return {}
  }
  return state
}

export function subscribers(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action) || action.type === response(ActionTypes.GET_SINGLE_POST)){
    return mergeByIds(state, (action.payload.subscribers || []).map(userParser))
  }
  return state
}

import {getToken, getPersistedUser} from '../services/auth'

export function authenticated(state = !!getToken(), action) {
   switch (action.type) {
    case response(ActionTypes.SIGN_IN): {
      return true
    }
    case response(ActionTypes.SIGN_UP): {
      return true
    }
    case ActionTypes.UNAUTHENTICATED: {
      return false
    }
  }
  return state
}

//we're faking for now
import {user as defaultUserSettings} from '../config'

export function user(state = {settings: defaultUserSettings, ...getPersistedUser()}, action) {
  if (ActionHelpers.isUserChangeResponse(action) ||
      action.type === response(ActionTypes.WHO_AM_I) ||
      action.type === response(ActionTypes.SIGN_UP)){
    const subscriptions = _.uniq((action.payload.subscriptions || []).map(sub => sub.user))
    return {...state, ...userParser(action.payload.users), subscriptions}
  }
  switch (action.type) {
    case response(ActionTypes.UPDATE_USER): {
      return {...state, ...userParser(action.payload.users)}
    }
    case response(ActionTypes.SEND_SUBSCRIPTION_REQUEST): {
      return {...state,
        pendingSubscriptionRequests: [...(state.pendingSubscriptionRequests || []),
          action.request.id
        ]
      }
    }
    case response(ActionTypes.BAN): {
      return {...state, banIds: [...state.banIds, action.request.id]}
    }
    case response(ActionTypes.UNBAN): {
      return {...state, banIds: _.without(state.banIds, action.request.id)}
    }
    case response(ActionTypes.CREATE_GROUP): {
      return {...state, subscriptions: [...state.subscriptions, action.payload.groups.id]}
    }
  }
  return state
}

const DEFAULT_PASSWORD_FORM_STATE = {
  isSaving:false,
  success:false,
  error:false,
  errorText: '',
}

export function passwordForm(state=DEFAULT_PASSWORD_FORM_STATE, action){
  switch(action.type){
    case request(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: true, error: false, success: false}
    }
    case response(ActionTypes.UPDATE_PASSWORD): {
      return {...state, isSaving: false, success: true, error: false}
    }
    case fail(ActionTypes.UPDATE_PASSWORD):{
      return {...state, isSaving: false, success: false, error: true, errorText: action.payload.err}
    }
  }
  return state
}

export function timelines(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action)){
    return mergeByIds(state, [action.payload.timelines])
  }

  return state
}

export function subscriptions(state = {}, action) {
  if (ActionHelpers.isFeedResponse(action) || action.type === response(ActionTypes.GET_SINGLE_POST)){
    return mergeByIds(state, action.payload.subscriptions)
  }
  return state
}

export function userSettingsForm(state={saved: false}, action) {
  switch (action.type) {
    case ActionTypes.USER_SETTINGS_CHANGE: {
      return {...state, ...action.payload, success: false, error: false}
    }
    case request(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: true, error: false}
    }
    case response(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: false, success: true, error: false}
    }
    case fail(ActionTypes.UPDATE_USER): {
      return {...state, isSaving: false, success: false, error: true}
    }
  }
  return state
}

const DEFAULT_PHOTO_FORM_STATE = {
  isSaving:false,
  success:false,
  error:false,
  errorText: '',
}

export function userPhotoForm(state=DEFAULT_PHOTO_FORM_STATE, action){
  switch(action.type){
    case request(ActionTypes.UPDATE_USER_PHOTO): {
      return {isSaving: true, error: false, success: false}
    }
    case response(ActionTypes.UPDATE_USER_PHOTO): {
      return {isSaving: false, success: true, error: false}
    }
    case fail(ActionTypes.UPDATE_USER_PHOTO): {
      return {isSaving: false, success: false, error: true, errorText: action.payload.err}
    }
  }
  return state
}

export function groupSettings(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.GET_USER_INFO): {
      return {...state, status: 'loading'}
    }
    case response(ActionTypes.GET_USER_INFO): {
      return {...state, status: 'success'}
    }
    case fail(ActionTypes.GET_USER_INFO): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err}
    }
  }
  return state
}

export function groupCreateForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.CREATE_GROUP): {
      return {...state, status: 'loading'}
    }
    case response(ActionTypes.CREATE_GROUP): {
      const groupUrl = '/' + action.payload.groups.username
      return {...state, status: 'success', groupUrl }
    }
    case fail(ActionTypes.CREATE_GROUP): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err}
    }
  }
  return state
}

export function groupSettingsForm(state={}, action) {
  switch (action.type) {
    case request(ActionTypes.UPDATE_GROUP): {
      return {...state, status: 'loading'}
    }
    case response(ActionTypes.UPDATE_GROUP): {
      return {...state, status: 'success'}
    }
    case fail(ActionTypes.UPDATE_GROUP): {
      return {...state, status: 'error', errorMessage: (action.payload || {}).err}
    }
  }
  return state
}

export function routeLoadingState(state = false, action){
  if (ActionHelpers.isFeedRequest(action)){
    return true
  }
  if (ActionHelpers.isFeedResponse(action) || ActionHelpers.isFeedFail(action)){
    return false
  }
  if (action.type == request(ActionTypes.GET_SINGLE_POST)){
    return true
  }
  if (action.type == response(ActionTypes.GET_SINGLE_POST) || action.type == fail(ActionTypes.GET_SINGLE_POST)){
    return false
  }
  switch(action.type){
    case ActionTypes.UNAUTHENTICATED: {
      return false
    }
  }
  return state
}

export function boxHeader(state = "", action){
  switch(action.type){
    case request(ActionTypes.HOME): {
      return 'Home'
    }
    case request(ActionTypes.DISCUSSIONS): {
      return 'My discussions'
    }
    case request(ActionTypes.DIRECT): {
      return 'Direct messages'
    }
    case request(ActionTypes.GET_USER_FEED): {
      return ''
    }
    case request(ActionTypes.GET_SINGLE_POST): {
      return ''
    }
  }
  return state
}

export function singlePostId(state = null, action) {
  if (ActionHelpers.isFeedRequest(action)){
    return null
  }
  if (action.type == request(ActionTypes.GET_SINGLE_POST)){
    return action.payload.postId
  }
  return state
}

function calculateFeeds(state) {
  let rawSubscriptions = state.users.subscriptions || []
  let rawSubscribers = state.users.subscribers || []
  let feeds = []
  if(rawSubscriptions && rawSubscribers) {
    let subscriptions = _.map(rawSubscriptions, (rs) => {
      let sub = _.find(state.subscriptions, { 'id': rs })
      let user = null
      if (sub && sub.name == 'Posts')
        user = _.find(state.subscribers, { 'id': sub.user })
      if (user)
        return {id: rs, user: user}
    }).filter(Boolean)
    feeds = _.filter(subscriptions, (sub) => {
      return sub.user.type == 'group' || (_.find(rawSubscribers, { 'id': sub.user.id }) != null)
    })
  }

  return feeds
}

const INITIAL_SEND_TO_STATE = { expanded: false, feeds: [] }

function getHiddenSendTo(state) {
  return {
    expanded: false,
    feeds: state.feeds
  }
}

export function sendTo(state = INITIAL_SEND_TO_STATE, action) {
  if (ActionHelpers.isFeedRequest(action)){
    return getHiddenSendTo(state)
  }

  switch(action.type){
    case response(ActionTypes.WHO_AM_I): {
      return {
        expanded: false,
        feeds: calculateFeeds(action.payload)
      }
    }
    case ActionTypes.EXPAND_SEND_TO: {
      return {
        expanded: true,
        feeds: state.feeds
      }
    }
    case response(ActionTypes.CREATE_GROUP): {
      let groupId = action.payload.groups.id
      let group = userParser(action.payload.groups)
      return {
        expanded: state.expanded,
        feeds: [ ...state.feeds, { id: groupId, user: group } ]
      }
    }
  }

  return state
}

export function createPostForm(state = {}, action) {
  switch (action.type) {
    case ActionTypes.ADD_ATTACHMENT_RESPONSE: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state
      }

      return {...state,
        attachments: [...(state.attachments || []), action.payload.attachments.id]
      }
    }
    case ActionTypes.REMOVE_ATTACHMENT: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state
      }

      return {...state,
        attachments: _.without((state.attachments || []), action.payload.attachmentId)
      }
    }
  }

  return state
}

const GROUPS_SIDEBAR_LIST_LENGTH = 4

export function recentGroups(state = [], action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      const subscribers = (action.payload.subscribers || [])
      return subscribers.filter(i => i.type == 'group')
                        .sort((i, j) => parseInt(j.updatedAt) - parseInt(i.updatedAt))
                        .slice(0, GROUPS_SIDEBAR_LIST_LENGTH)
    }
    case response(ActionTypes.CREATE_GROUP): {
      const newGroup = action.payload.groups
      state.unshift(newGroup)
      return [...state]
    }
    case response(ActionTypes.UPDATE_GROUP): {
      const groupId = (action.payload.groups.id || null)
      const groupIndex = _.findIndex(state, { 'id': groupId })
      if (groupIndex > -1) {
        const oldGroup = state[groupIndex]
        const newGroup = (action.payload.groups || {})
        state[groupIndex] = {...oldGroup, ...newGroup}
        return [...state]
      }
      return state
    }
  }

  return state
}

export function groups(state = {}, action) {
  switch (action.type) {
    case response(ActionTypes.WHO_AM_I): {
      const groups = (action.payload.subscribers || []).filter((u) => u.type == 'group')
      return mergeByIds(state, groups.map(userParser))
    }
    case response(ActionTypes.CREATE_GROUP): {
      let groupId = action.payload.groups.id
      let newGroup = userParser(action.payload.groups)
      return {...state,
        [groupId]: {...newGroup}
      }
    }
    case response(ActionTypes.UPDATE_GROUP): {
      let groupId = action.payload.groups.id
      let oldGroup = state[groupId] || {}
      let newGroup = userParser(action.payload.groups)
      return {...state,
        [groupId]: {...oldGroup, ...newGroup}
      }
    }
  }

  return state
}

const handleSubs = (state, action, type) => {
  if (action.type == request(type)) {
    return {
      payload: [],
      isPending: true,
      errorString: ''
    }
  }

  if (action.type == response(type)) {
    return {
      payload: (action.payload.subscribers || []).map(userParser),
      isPending: false,
      errorString: ''
    }
  }

  if (action.type == fail(type)) {
    return {
      payload: [],
      isPending: false,
      errorString: 'error occured while fetching subscribers'
    }
  }

  return state
}

// for /:username/subscribers
export function usernameSubscribers(state = {}, action) {
  return handleSubs(state, action, ActionTypes.SUBSCRIBERS)
}

// for /:username/subscriptions
export function usernameSubscriptions(state = {}, action) {
  return handleSubs(state, action, ActionTypes.SUBSCRIPTIONS)
}

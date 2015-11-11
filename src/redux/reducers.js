import {request, response, fail, WHO_AM_I, SERVER_ERROR, UNAUTHENTICATED, HOME, DISCUSSIONS, GET_USER_FEED,
        UPDATE_USER, USER_SETTINGS_CHANGE,
        UPDATE_PASSWORD,
        UPDATE_USER_PHOTO,
        SHOW_MORE_COMMENTS, SIGN_IN, SIGN_IN_CHANGE, SIGN_IN_EMPTY,
        SHOW_MORE_LIKES_SYNC, SHOW_MORE_LIKES_ASYNC,
        TOGGLE_EDITING_POST, CANCEL_EDITING_POST, SAVE_EDITING_POST, DELETE_POST,
        TOGGLE_COMMENTING, ADD_COMMENT, TOGGLE_EDITING_COMMENT, CANCEL_EDITING_COMMENT,
        SAVE_EDITING_COMMENT, DELETE_COMMENT, CREATE_POST,
        LIKE_POST, UNLIKE_POST, GET_SINGLE_POST} from './action-creators'

import _ from 'lodash'
import {userParser} from '../utils'

const feedGeneratingActions = [HOME, DISCUSSIONS, GET_USER_FEED]
const feedRequests = feedGeneratingActions.map(request)
const feedResponses = feedGeneratingActions.map(response)
const feedFails = feedGeneratingActions.map(fail)
const isFeedRequest = action => feedRequests.indexOf(action.type) !== -1
const isFeedResponse = action => feedResponses.indexOf(action.type) !== -1
const isFeedFail = action => feedFails.indexOf(action.type) !== -1

export function signInForm(state={username:'', password:'', error:'', loading: false}, action) {
  switch(action.type) {
    case SIGN_IN_CHANGE: {
      return {
        ...state,
        username: action.username || state.username,
        password: action.password || state.password,
        loading: false,
      }
    }
    case UNAUTHENTICATED: {
      return {...state, error: (action.payload || {}).err, loading: false }
    }
    case SIGN_IN_EMPTY: {
      return {...state, error: 'Enter login and password', loading: false }
    }
    case request(SIGN_IN): {
      return {...state, loading: true }
    }
    case response(SIGN_IN): {
      return {...state, loading: false }
    }
  }
  return state
}

export function serverError(state = false, action) {
  switch (action.type) {
    case SERVER_ERROR: {
      return true
    }
  }
  return state
}

const CREATE_POST_ERROR = 'Something went wrong while creating the post...'

export function createPostViewState(state = {}, action) {
  switch (action.type) {
    case response(CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: false
      }
    }
    case request(CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: true
      }
    }
    case fail(CREATE_POST): {
      return {
        isError: true,
        errorString: CREATE_POST_ERROR,
        isPending: false
      }
    }
  }
  return state
}

const initFeed = {feed: []}

const loadFeedViewState = posts => {
  const feed = (posts || []).map(post => post.id)
  return { feed }
}

export function feedViewState(state = initFeed, action) {
  if (isFeedRequest(action)){
    return initFeed
  }
  if (isFeedResponse(action)){
    return loadFeedViewState(action.payload.posts)
  }

  switch (action.type) {
    case UNAUTHENTICATED: {
      return initFeed
    }
    case response(DELETE_POST): {
      const postId = action.request.postId
      return { feed: _.without(state.feed, postId) }
    }
    case response(CREATE_POST): {
      const postId = action.payload.posts.id
      return { feed: [postId, ...state.feed] }
    }
    case response(GET_SINGLE_POST): {
      const postId = action.request.postId
      return { feed: [postId] }
    }
    case fail(GET_SINGLE_POST): {
      return { feed: [] }
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
  if (isFeedResponse(action)){
    return mergeByIds(state, (action.payload.posts || []).map(initPostViewState))
  }
  switch (action.type) {
    case response(SHOW_MORE_LIKES_ASYNC): {
      const id = action.payload.posts.id
      const omittedLikes = 0

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } }
    }
    case response(SHOW_MORE_COMMENTS): {
      const id = action.payload.posts.id
      const omittedComments = 0

      return { ...state, [id]: { ...state[id], omittedComments, ...NO_ERROR } }
    }
    case response(GET_SINGLE_POST): {
      const id = action.payload.posts.id
      return { ...state, [id]: initPostViewState(action.payload.posts) }
    }
    case fail(GET_SINGLE_POST): {
      const id = action.request.postId
      const isEditing = false

      const isError = true

      return { ...state, [id]: { id, isEditing, isError, errorString: GET_SINGLE_POST_ERROR }}
    }
    case SHOW_MORE_LIKES_SYNC: {
      const id = action.payload.postId
      const omittedLikes = 0

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } }
    }
    case TOGGLE_EDITING_POST: {
      const id = action.payload.postId
      const editingText = action.payload.newValue
      const isEditing = !state[id].isEditing

      return { ...state, [id]: { ...state[id], isEditing, editingText, ...NO_ERROR } }
    }
    case CANCEL_EDITING_POST: {
      const id = action.payload.postId
      const editingText = action.payload.newValue
      const isEditing = false

      return { ...state, [id]: { ...state[id], isEditing, editingText, ...NO_ERROR } }
    }
    case request(SAVE_EDITING_POST): {
      const id = action.payload.postId
      return { ...state, [id]: { ...state[id], isSaving: true } }
    }
    case response(SAVE_EDITING_POST): {
      const id = action.payload.posts.id
      const editingText = action.payload.posts.body
      const isEditing = false
      const isSaving = false

      return { ...state, [id]: { ...state[id], isEditing, isSaving, editingText, ...NO_ERROR } }
    }
    case fail(SAVE_EDITING_POST): {
      const id = action.request.postId
      const isEditing = false

      const isError = true

      return { ...state, [id]: { ...state[id], isEditing, isSaving, isError, errorString: POST_SAVE_ERROR} }
    }
    case fail(DELETE_POST): {
      const id = action.request.postId

      const isError = true
      const errorString = 'Something went wrong while deleting the post...'

      return { ...state, [id]: { ...state[id], isError, errorString} }
    }
    case TOGGLE_COMMENTING: {
      return {...state,
        [action.postId] : {
          ...state[action.postId],
          isCommenting:!state[action.postId].isCommenting,
          newCommentText: state[action.postId].newCommentText || '' }
        }
    }
    case request(ADD_COMMENT): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id] : {
          ...post,
          savingComment: true,
        }}
    }
    case response(ADD_COMMENT): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          isCommenting: false,
          savingComment: false,
          newCommentText: '',
        }
      }
    }
    case fail(ADD_COMMENT): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          savingComment: false,
          commentError: NEW_COMMENT_ERROR
        }
      }
    }
    case request(LIKE_POST): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id] : {
          ...post,
          liking: true,
        }}
    }
    case response(LIKE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          liking: false,
        }
      }
    }
    case fail(LIKE_POST): {
      const post = state[action.request.postId]
      const errorString = 'Something went wrong while liking the post...'
      return {...state,
        [post.id] : {
          ...post,
          liking: false,
          likeError: errorString,
        }
      }
    }
    case request(UNLIKE_POST): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id] : {
          ...post,
          liking: true,
        }}
    }
    case response(UNLIKE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          liking: false,
        }
      }
    }
    case fail(UNLIKE_POST): {
      const post = state[action.request.postId]
      const errorString = 'Something went wrong while un-liking the post...'
      return {...state,
        [post.id] : {
          ...post,
          liking: false,
          likeError: errorString,
        }
      }
    }
    case response(CREATE_POST): {
      const post = action.payload.posts
      const id = post.id

      const omittedComments = post.omittedComments
      const omittedLikes = post.omittedLikes
      const isEditing = false
      const editingText = post.body

      return { ...state, [id]: { omittedComments, omittedLikes, id, isEditing, editingText, ...NO_ERROR } }
    }
    case UNAUTHENTICATED: {
      return {}
    }
  }

  return state
}

function updatePostData(state, action) {
  const postId = action.payload.posts.id
  return { ...state, [postId]: action.payload.posts }
}

export function posts(state = {}, action) {
  if (isFeedResponse(action)){
    return mergeByIds(state, action.payload.posts)
  }
  switch (action.type) {
    case response(SHOW_MORE_COMMENTS): {
      return updatePostData(state, action)
    }
    case response(SHOW_MORE_LIKES_ASYNC): {
      return updatePostData(state, action)
    }
    case response(SAVE_EDITING_POST): {
      return updatePostData(state, action)
    }
    case response(DELETE_COMMENT): {
      const commentId = action.request.commentId
      const commentedPost = _(state).find(post => (post.comments||[]).indexOf(commentId) !== -1)
      const comments = _.without(commentedPost.comments, commentId)
      return {...state, [commentedPost.id] : {...commentedPost, comments}}
    }
    case response(ADD_COMMENT): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          comments: [...(post.comments || []), action.payload.comments.id],
        }
      }
    }
    case response(LIKE_POST): {
      const post = state[action.request.postId]
      // @todo Update omittedLikes properly here
      //const omitted = post.omittedLikes > 0 ? post.omittedLikes+1 : 0
      return {...state,
        [post.id] : {
          ...post,
          likes: [action.request.userId, ...(post.likes || [])],
          //omittedLikes: omitted,
        }
      }
    }
    case response(UNLIKE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          likes: _.without(post.likes, action.request.userId),
        }
      }
    }
    case response(CREATE_POST): {
      return updatePostData(state, action)
    }
    case response(GET_SINGLE_POST): {
      return updatePostData(state, action)
    }
    case UNAUTHENTICATED: {
      return {}
    }
  }

  return state
}

export function attachments(state = {}, action) {
  if (isFeedResponse(action)){
    return mergeByIds(state, action.payload.attachments)
  }
  if(action.type == response(GET_SINGLE_POST)){
    return mergeByIds(state, action.payload.attachments)
  }
  return state
}

function updateCommentData(state, action) {
  return mergeByIds(state, action.payload.comments)
}

export function comments(state = {}, action) {
  if (isFeedResponse(action)){
    return updateCommentData(state, action)
  }
  switch (action.type) {
    case response(SHOW_MORE_COMMENTS): {
      return updateCommentData(state, action)
    }
    case response(GET_SINGLE_POST): {
      return updateCommentData(state, action)
    }
    case response(SHOW_MORE_LIKES_ASYNC): {
      return updateCommentData(state, action)
    }
    case response(SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], ...action.payload.comments}}
    }
    case response(DELETE_COMMENT): {
      return {...state, [action.request.commentId] : undefined}
    }
    case response(ADD_COMMENT): {
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
  if (isFeedResponse(action)){
    return updateCommentViewState(state, action)
  }
  switch(action.type){
    case response(SHOW_MORE_COMMENTS): {
      return updateCommentViewState(state, action)
    }
    case response(GET_SINGLE_POST): {
      return updateCommentViewState(state, action)
    }
    case TOGGLE_EDITING_COMMENT: {
      return {
        ...state,
        [action.commentId]: {
          ...state[action.commentId],
          isEditing: !state[action.commentId].isEditing
        }
      }
    }
    case request(SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.commentId]: {...state[action.payload.commentId], editText: action.payload.newCommentBody, isSaving: true}}
    }
    case response(SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], isEditing: false, isSaving: false, editText: action.payload.comments.body, ...NO_ERROR}}
    }
    case fail(SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], isEditing: true, isSaving: false, errorString: COMMENT_SAVE_ERROR}}
    }
    case response(DELETE_COMMENT): {
      return {...state, [action.request.commentId] : undefined}
    }
    case response(ADD_COMMENT): {
      return {...state,
        [action.payload.comments.id] : {
          id: action.payload.comments.id,
          isEditing: false,
          editText: action.payload.comments.body,
        }
      }
    }
    case UNAUTHENTICATED: {
      return {}
    }
  }
  return state
}

export function users(state = {}, action) {
  if (isFeedResponse(action)){
    return mergeByIds(state, (action.payload.users || []).map(userParser))
  }
  switch (action.type) {
    case response(SHOW_MORE_COMMENTS): {
      return mergeByIds(state, action.payload.users)
    }
    case response(GET_SINGLE_POST): {
      return mergeByIds(state, action.payload.users)
    }
    case response(SHOW_MORE_LIKES_ASYNC): {
      return mergeByIds(state, action.payload.users)
    }
    case UNAUTHENTICATED: {
      return {}
    }
  }
  return state
}

import {getToken, getPersistedUser} from '../services/auth'

export function authenticated(state = !!getToken(), action) {
   switch (action.type) {
    case response(SIGN_IN): {
      return true
    }
    case UNAUTHENTICATED: {
      return false
    }
  }
  return state
}

//we're faking for now
import {user as defaultUserSettings} from '../config'

export function user(state = {settings: defaultUserSettings, ...getPersistedUser()}, action) {
  switch (action.type) {
    case response(WHO_AM_I): {
      return {...state, ...userParser(action.payload.users)}
    }
    case response(UPDATE_USER): {
      return {...state, ...userParser(action.payload.users)}
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
    case request(UPDATE_PASSWORD): {
      return {...state, isSaving: true, error: false, success: false}
    }
    case response(UPDATE_PASSWORD): {
      return {...state, isSaving: false, success: true, error: false}
    }
    case fail(UPDATE_PASSWORD):{
      return {...state, isSaving: false, success: false, error: true, errorText: action.payload.err}
    }
  }
  return state
}
export function timelines(state = {}, action) {
  if (isFeedResponse(action)){
    return {...action.payload.timelines}
  }

  return state
}

export function userSettingsForm(state={saved: false}, action) {
  switch (action.type) {
    case USER_SETTINGS_CHANGE: {
      return {...state, ...action.payload, success: false, error: false}
    }
    case request(UPDATE_USER): {
      return {...state, isSaving: true, error: false}
    }
    case response(UPDATE_USER): {
      return {...state, isSaving: false, success: true, error: false}
    }
    case fail(UPDATE_USER): {
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
    case request(UPDATE_USER_PHOTO): {
      return {isSaving: true, error: false, success: false}
    }
    case response(UPDATE_USER_PHOTO): {
      return {isSaving: false, success: true, error: false}
    }
    case fail(UPDATE_USER_PHOTO): {
      return {isSaving: false, success: false, error: true, errorText: action.payload.err}
    }
  }
  return state
}

export function routeLoadingState(state = false, action){
  if (isFeedRequest(action)){
    return true
  }
  if (isFeedResponse(action) || isFeedFail(action)){
    return false
  }
  if (action.type == request(GET_SINGLE_POST)){
    return true
  }
  if (action.type == response(GET_SINGLE_POST) || action.type == fail(GET_SINGLE_POST)){
    return false
  }
  switch(action.type){
    case UNAUTHENTICATED: {
      return false
    }
  }
  return state
}

export function boxHeader(state = "", action){
  switch(action.type){
    case request(HOME): {
      return 'Home'
    }
    case request(DISCUSSIONS): {
      return 'My discussions'
    }
    case request(GET_SINGLE_POST): {
      return ''
    }
  }
  return state
}

export function singlePostId(state = null, action) {
  if (isFeedRequest(action)){
    return null
  }
  if (action.type == request(GET_SINGLE_POST)){
    return action.payload.postId
  }
  return state
}

import * as ActionCreators from './action-creators'
const {request, response, fail} = ActionCreators

import _ from 'lodash'
import {userParser} from '../utils'

export function signInForm(state={username:'', password:'', error:'', loading: false}, action) {
  switch(action.type) {
    case ActionCreators.SIGN_IN_CHANGE: {
      return {
        ...state,
        username: action.username || state.username,
        password: action.password || state.password,
        loading: false,
      }
    }
    case ActionCreators.UNAUTHENTICATED: {
      return {...state, error: (action.payload || {}).err, loading: false }
    }
    case ActionCreators.SIGN_IN_EMPTY: {
      return {...state, error: 'Enter login and password', loading: false }
    }
    case request(ActionCreators.SIGN_IN): {
      return {...state, loading: true }
    }
    case response(ActionCreators.SIGN_IN): {
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
    case ActionCreators.SIGN_UP_CHANGE: {
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
    case ActionCreators.SIGN_UP_EMPTY: {
      return {...state, error: action.message, loading: false }
    }
    case request(ActionCreators.SIGN_UP): {
      return {...state, loading: true }
    }
    case response(ActionCreators.SIGN_UP): {
      return {...state, loading: false }
    }
    case fail(ActionCreators.SIGN_UP): {
      return {...state, error: action.payload.err, loading: false }
    }
  }
  return state
}

export function serverError(state = false, action) {
  switch (action.type) {
    case ActionCreators.SERVER_ERROR: {
      return true
    }
  }
  return state
}

const CREATE_POST_ERROR = 'Something went wrong while creating the post...'

export function createPostViewState(state = {}, action) {
  switch (action.type) {
    case response(ActionCreators.CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: false
      }
    }
    case request(ActionCreators.CREATE_POST): {
      return {
        isError: false,
        errorString: '',
        isPending: true
      }
    }
    case fail(ActionCreators.CREATE_POST): {
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
  if (ActionCreators.isFeedRequest(action)){
    return state
  }
  if (ActionCreators.isFeedResponse(action)){
    return loadFeedViewState(action.payload.posts)
  }

  switch (action.type) {
    case ActionCreators.UNAUTHENTICATED: {
      return initFeed
    }
    case response(ActionCreators.DELETE_POST): {
      const postId = action.request.postId
      return { feed: _.without(state.feed, postId) }
    }
    case response(ActionCreators.CREATE_POST): {
      const postId = action.payload.posts.id
      return { feed: [postId, ...state.feed] }
    }
    case response(ActionCreators.GET_SINGLE_POST): {
      const postId = action.request.postId
      return { feed: [postId] }
    }
    case fail(ActionCreators.GET_SINGLE_POST): {
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
  if (ActionCreators.isFeedResponse(action)){
    return mergeByIds(state, (action.payload.posts || []).map(initPostViewState))
  }
  switch (action.type) {
    case response(ActionCreators.SHOW_MORE_LIKES_ASYNC): {
      const id = action.payload.posts.id
      const omittedLikes = 0

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } }
    }
    case request(ActionCreators.SHOW_MORE_COMMENTS): {
      const id = action.payload.postId
      const isLoadingComments = true

      return { ...state, [id]: { ...state[id], isLoadingComments } }
    }
    case response(ActionCreators.SHOW_MORE_COMMENTS): {
      const id = action.payload.posts.id
      const isLoadingComments = false
      const omittedComments = 0

      return { ...state, [id]: { ...state[id], isLoadingComments, omittedComments, ...NO_ERROR } }
    }
    case response(ActionCreators.GET_SINGLE_POST): {
      const id = action.payload.posts.id
      return { ...state, [id]: initPostViewState(action.payload.posts) }
    }
    case fail(ActionCreators.GET_SINGLE_POST): {
      const id = action.request.postId
      const isEditing = false

      const isError = true

      return { ...state, [id]: { id, isEditing, isError, errorString: GET_SINGLE_POST_ERROR }}
    }
    case ActionCreators.SHOW_MORE_LIKES_SYNC: {
      const id = action.payload.postId
      const omittedLikes = 0

      return { ...state, [id]: { ...state[id], omittedLikes, ...NO_ERROR } }
    }
    case ActionCreators.TOGGLE_EDITING_POST: {
      const id = action.payload.postId
      const editingText = action.payload.newValue
      const isEditing = !state[id].isEditing

      return { ...state, [id]: { ...state[id], isEditing, editingText, ...NO_ERROR } }
    }
    case ActionCreators.CANCEL_EDITING_POST: {
      const id = action.payload.postId
      const editingText = action.payload.newValue
      const isEditing = false

      return { ...state, [id]: { ...state[id], isEditing, editingText, ...NO_ERROR } }
    }
    case request(ActionCreators.SAVE_EDITING_POST): {
      const id = action.payload.postId
      return { ...state, [id]: { ...state[id], isSaving: true } }
    }
    case response(ActionCreators.SAVE_EDITING_POST): {
      const id = action.payload.posts.id
      const editingText = action.payload.posts.body
      const isEditing = false
      const isSaving = false

      return { ...state, [id]: { ...state[id], isEditing, isSaving, editingText, ...NO_ERROR } }
    }
    case fail(ActionCreators.SAVE_EDITING_POST): {
      const id = action.request.postId
      const isEditing = false

      const isError = true

      return { ...state, [id]: { ...state[id], isEditing, isSaving, isError, errorString: POST_SAVE_ERROR} }
    }
    case fail(ActionCreators.DELETE_POST): {
      const id = action.request.postId

      const isError = true
      const errorString = 'Something went wrong while deleting the post...'

      return { ...state, [id]: { ...state[id], isError, errorString} }
    }
    case ActionCreators.TOGGLE_COMMENTING: {
      return {...state,
        [action.postId] : {
          ...state[action.postId],
          isCommenting:!state[action.postId].isCommenting,
          newCommentText: state[action.postId].newCommentText || '' }
        }
    }
    case request(ActionCreators.ADD_COMMENT): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id] : {
          ...post,
          isSavingComment: true,
        }}
    }
    case response(ActionCreators.ADD_COMMENT): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          isCommenting: false,
          isSavingComment: false,
          newCommentText: '',
          omittedComments: post.omittedComments + 1
        }
      }
    }
    case fail(ActionCreators.ADD_COMMENT): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          isSavingComment: false,
          commentError: NEW_COMMENT_ERROR
        }
      }
    }
    case request(ActionCreators.LIKE_POST): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id] : {
          ...post,
          isLiking: true,
        }}
    }
    case response(ActionCreators.LIKE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
        }
      }
    }
    case fail(ActionCreators.LIKE_POST): {
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
    case request(ActionCreators.UNLIKE_POST): {
      const post = state[action.payload.postId]
      return {...state,
        [post.id] : {
          ...post,
          isLiking: true,
        }}
    }
    case response(ActionCreators.UNLIKE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          isLiking: false,
        }
      }
    }
    case fail(ActionCreators.UNLIKE_POST): {
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
    case response(ActionCreators.CREATE_POST): {
      const post = action.payload.posts
      const id = post.id

      const omittedComments = post.omittedComments
      const omittedLikes = post.omittedLikes
      const isEditing = false
      const editingText = post.body

      return { ...state, [id]: { omittedComments, omittedLikes, id, isEditing, editingText, ...NO_ERROR } }
    }
    case ActionCreators.UNAUTHENTICATED: {
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
  if (ActionCreators.isFeedResponse(action)){
    return mergeByIds(state, action.payload.posts)
  }
  switch (action.type) {
    case response(ActionCreators.SHOW_MORE_COMMENTS): {
      const post = state[action.payload.posts.id]
      return {...state,
        [post.id]: {...post,
          comments: action.payload.posts.comments
        }
      }
    }
    case response(ActionCreators.SHOW_MORE_LIKES_ASYNC): {
      const post = state[action.payload.posts.id]
      return {...state,
        [post.id]: {...post,
          likes: action.payload.posts.likes
        }
      }
    }
    case response(ActionCreators.SAVE_EDITING_POST): {
      const post = state[action.payload.posts.id]
      return {...state,
        [post.id]: {...post,
          body: action.payload.posts.body,
          updatedAt: action.payload.posts.updatedAt,
          attachments: action.payload.posts.attachments || []
        }
      }
    }
    case ActionCreators.ADD_ATTACHMENT_RESPONSE: {
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
    case response(ActionCreators.DELETE_COMMENT): {
      const commentId = action.request.commentId
      const commentedPost = _(state).find(post => (post.comments||[]).indexOf(commentId) !== -1)
      const comments = _.without(commentedPost.comments, commentId)
      return {...state, [commentedPost.id] : {...commentedPost, comments}}
    }
    case response(ActionCreators.ADD_COMMENT): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          comments: [...(post.comments || []), action.payload.comments.id],
          omittedComments: post.omittedComments + 1
        }
      }
    }
    case response(ActionCreators.LIKE_POST): {
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
    case response(ActionCreators.UNLIKE_POST): {
      const post = state[action.request.postId]
      return {...state,
        [post.id] : {
          ...post,
          likes: _.without(post.likes, action.request.userId),
        }
      }
    }
    case response(ActionCreators.CREATE_POST): {
      return updatePostData(state, action)
    }
    case response(ActionCreators.GET_SINGLE_POST): {
      return updatePostData(state, action)
    }
    case ActionCreators.UNAUTHENTICATED: {
      return {}
    }
  }

  return state
}

export function attachments(state = {}, action) {
  if (ActionCreators.isFeedResponse(action)) {
    return mergeByIds(state, action.payload.attachments)
  }
  switch (action.type) {
    case response(ActionCreators.GET_SINGLE_POST): {
      return mergeByIds(state, action.payload.attachments)
    }
    case ActionCreators.ADD_ATTACHMENT_RESPONSE: {
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
  if (ActionCreators.isFeedResponse(action)){
    return updateCommentData(state, action)
  }
  switch (action.type) {
    case response(ActionCreators.SHOW_MORE_COMMENTS): {
      return updateCommentData(state, action)
    }
    case response(ActionCreators.GET_SINGLE_POST): {
      return updateCommentData(state, action)
    }
    case response(ActionCreators.SHOW_MORE_LIKES_ASYNC): {
      return updateCommentData(state, action)
    }
    case response(ActionCreators.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], ...action.payload.comments}}
    }
    case response(ActionCreators.DELETE_COMMENT): {
      return {...state, [action.request.commentId] : undefined}
    }
    case response(ActionCreators.ADD_COMMENT): {
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
  if (ActionCreators.isFeedResponse(action)){
    return updateCommentViewState(state, action)
  }
  switch(action.type){
    case response(ActionCreators.SHOW_MORE_COMMENTS): {
      return updateCommentViewState(state, action)
    }
    case response(ActionCreators.GET_SINGLE_POST): {
      return updateCommentViewState(state, action)
    }
    case ActionCreators.TOGGLE_EDITING_COMMENT: {
      return {
        ...state,
        [action.commentId]: {
          ...state[action.commentId],
          isEditing: !state[action.commentId].isEditing
        }
      }
    }
    case request(ActionCreators.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.commentId]: {...state[action.payload.commentId], editText: action.payload.newCommentBody, isSaving: true}}
    }
    case response(ActionCreators.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], isEditing: false, isSaving: false, editText: action.payload.comments.body, ...NO_ERROR}}
    }
    case fail(ActionCreators.SAVE_EDITING_COMMENT): {
      return {...state, [action.payload.comments.id]: {...state[action.payload.comments.id], isEditing: true, isSaving: false, errorString: COMMENT_SAVE_ERROR}}
    }
    case response(ActionCreators.DELETE_COMMENT): {
      return {...state, [action.request.commentId] : undefined}
    }
    case response(ActionCreators.ADD_COMMENT): {
      return {...state,
        [action.payload.comments.id] : {
          id: action.payload.comments.id,
          isEditing: false,
          editText: action.payload.comments.body,
        }
      }
    }
    case ActionCreators.UNAUTHENTICATED: {
      return {}
    }
  }
  return state
}

export function users(state = {}, action) {
  if (ActionCreators.isFeedResponse(action)) {
    return mergeByIds(state, (action.payload.users || []).map(userParser))
  }
  switch (action.type) {
    case response(ActionCreators.SHOW_MORE_COMMENTS):
    case response(ActionCreators.SHOW_MORE_LIKES_ASYNC):
    case response(ActionCreators.GET_SINGLE_POST):
      return mergeByIds(state, (action.payload.users || []).map(userParser))
    case ActionCreators.UNAUTHENTICATED:
      return {}
  }
  return state
}

export function subscribers(state = {}, action) {
  if (ActionCreators.isFeedResponse(action)){
    return mergeByIds(state, (action.payload.subscribers || []).map(userParser))
  }
  return state
}

import {getToken, getPersistedUser} from '../services/auth'

export function authenticated(state = !!getToken(), action) {
   switch (action.type) {
    case response(ActionCreators.SIGN_IN): {
      return true
    }
    case response(ActionCreators.SIGN_UP): {
      return true
    }
    case ActionCreators.UNAUTHENTICATED: {
      return false
    }
  }
  return state
}

//we're faking for now
import {user as defaultUserSettings} from '../config'

export function user(state = {settings: defaultUserSettings, ...getPersistedUser()}, action) {
  if (ActionCreators.isUserChangeResponse(action) ||
      action.type === response(ActionCreators.WHO_AM_I) ||
      action.type === response(ActionCreators.SIGN_UP)){
    const subscriptions = _.uniq(action.payload.subscriptions.map(sub => sub.user))
    return {...state, ...userParser(action.payload.users), subscriptions}
  }
  switch (action.type) {
    case response(ActionCreators.UPDATE_USER): {
      return {...state, ...userParser(action.payload.users)}
    }
    case response(ActionCreators.BAN): {
      return {...state, banIds: [...state.banIds, action.request.id]}
    }
    case response(ActionCreators.UNBAN): {
      return {...state, banIds: _.without(state.banIds, action.request.id)}
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
    case request(ActionCreators.UPDATE_PASSWORD): {
      return {...state, isSaving: true, error: false, success: false}
    }
    case response(ActionCreators.UPDATE_PASSWORD): {
      return {...state, isSaving: false, success: true, error: false}
    }
    case fail(ActionCreators.UPDATE_PASSWORD):{
      return {...state, isSaving: false, success: false, error: true, errorText: action.payload.err}
    }
  }
  return state
}

export function timelines(state = {}, action) {
  if (ActionCreators.isFeedResponse(action)){
    return mergeByIds(state, [action.payload.timelines])
  }

  return state
}

export function subscriptions(state = {}, action) {
  if (ActionCreators.isFeedResponse(action)){
    return mergeByIds(state, action.payload.subscriptions)
  }

  return state
}

export function userSettingsForm(state={saved: false}, action) {
  switch (action.type) {
    case ActionCreators.USER_SETTINGS_CHANGE: {
      return {...state, ...action.payload, success: false, error: false}
    }
    case request(ActionCreators.UPDATE_USER): {
      return {...state, isSaving: true, error: false}
    }
    case response(ActionCreators.UPDATE_USER): {
      return {...state, isSaving: false, success: true, error: false}
    }
    case fail(ActionCreators.UPDATE_USER): {
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
    case request(ActionCreators.UPDATE_USER_PHOTO): {
      return {isSaving: true, error: false, success: false}
    }
    case response(ActionCreators.UPDATE_USER_PHOTO): {
      return {isSaving: false, success: true, error: false}
    }
    case fail(ActionCreators.UPDATE_USER_PHOTO): {
      return {isSaving: false, success: false, error: true, errorText: action.payload.err}
    }
  }
  return state
}

export function routeLoadingState(state = false, action){
  if (ActionCreators.isFeedRequest(action)){
    return true
  }
  if (ActionCreators.isFeedResponse(action) || ActionCreators.isFeedFail(action)){
    return false
  }
  if (action.type == request(ActionCreators.GET_SINGLE_POST)){
    return true
  }
  if (action.type == response(ActionCreators.GET_SINGLE_POST) || action.type == fail(ActionCreators.GET_SINGLE_POST)){
    return false
  }
  switch(action.type){
    case ActionCreators.UNAUTHENTICATED: {
      return false
    }
  }
  return state
}

export function boxHeader(state = "", action){
  switch(action.type){
    case request(ActionCreators.HOME): {
      return 'Home'
    }
    case request(ActionCreators.DISCUSSIONS): {
      return 'My discussions'
    }
    case request(ActionCreators.GET_SINGLE_POST): {
      return ''
    }
    case request(ActionCreators.DIRECT): {
      return 'Direct messages'
    }
  }
  return state
}

export function singlePostId(state = null, action) {
  if (ActionCreators.isFeedRequest(action)){
    return null
  }
  if (action.type == request(ActionCreators.GET_SINGLE_POST)){
    return action.payload.postId
  }
  return state
}

function calculateFeeds(state) {
  let rawSubscriptions = state.users.subscriptions
  let rawSubscribers = state.users.subscribers
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
  if (ActionCreators.isFeedRequest(action)){
    return getHiddenSendTo(state)
  }

  switch(action.type){
    case response(ActionCreators.WHO_AM_I): {
      return {
        expanded: false,
        feeds: calculateFeeds(action.payload)
      }
    }
    case ActionCreators.EXPAND_SEND_TO: {
      return {
        expanded: true,
        feeds: state.feeds
      }
    }
  }

  return state
}

export function createPostForm(state = {}, action) {
  switch (action.type) {
    case ActionCreators.ADD_ATTACHMENT_RESPONSE: {
      // If this is an attachment for edit-post (existent post),
      // it should be handled in posts(), not here
      if (action.payload.postId) {
        return state
      }

      return {...state,
        attachments: [...(state.attachments || []), action.payload.attachments.id]
      }
    }
    case ActionCreators.REMOVE_ATTACHMENT: {
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
  if (action.type == response(ActionCreators.WHO_AM_I)) {
    let subscribers = [].concat(action.payload.subscribers)
    return subscribers.filter(i => i.type == 'group')
                      .sort((i, j) => parseInt(j.updatedAt) - parseInt(i.updatedAt))
                      .slice(0, GROUPS_SIDEBAR_LIST_LENGTH)
  }

  return state
}

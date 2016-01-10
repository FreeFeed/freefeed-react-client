import {showMoreComments, showMoreLikes, toggleEditingPost, cancelEditingPost,
        saveEditingPost, deletePost, addAttachmentResponse, removeAttachment,
        likePost, unlikePost, disableComments, enableComments, toggleCommenting, addComment,
        toggleEditingComment, cancelEditingComment, saveEditingComment, deleteComment,
        ban, unban, subscribe, unsubscribe, } from '../redux/action-creators'

const MAX_LIKES = 4

export const joinPostData = state => postId => {
  const post = state.posts[postId]
  if (!post){
    return
  }
  const user = state.user

  const attachments = (post.attachments || []).map(attachmentId => state.attachments[attachmentId])
  let comments = (post.comments || []).map(commentId => {
    const comment = state.comments[commentId]
    const commentViewState = state.commentViewState[commentId]
    const author = state.users[comment.createdBy]
    const isEditable = (user.id === comment.createdBy)
    return { ...comment, ...commentViewState, user: author, isEditable }
  })

  const postViewState = state.postsViewState[post.id]

  if (postViewState.omittedComments !== 0) {
    comments = [ comments[0], comments[comments.length - 1] ]
  }

  let usersLikedPost = _.map(post.likes, userId => state.users[userId])

  if (postViewState.omittedLikes !== 0) {
    usersLikedPost = usersLikedPost.slice(0, MAX_LIKES)
  }

  const createdBy = state.users[post.createdBy]
  const isEditable = (post.createdBy === user.id)
  const directFeeds = post.postedTo.map(feedId => state.timelines[feedId]).filter(feed => feed && feed.name === 'Directs')
  const isDirect = directFeeds.length

  // Get the list of post's recipients
  let recipients = post.postedTo
    .map(function(subscriptionId) {
      let userId = (state.subscriptions[subscriptionId]||{}).user
      let subscriptionType = (state.subscriptions[subscriptionId]||{}).name
      if (userId === post.createdBy && subscriptionType === 'Directs') {
        // Remove "directs to yourself" from the list
        return false
      } else {
        return userId
      }
    })
    .map(userId => state.subscribers[userId])
    .filter(user => user)

  return {...post,
    createdBy, isDirect, recipients,
    attachments, usersLikedPost, comments,
    ...postViewState, isEditable
  }
}

export function joinCreatePostData(state) {
  const createPostForm = state.createPostForm
  return {...createPostForm,
    attachments: (createPostForm.attachments || []).map(attachmentId => state.attachments[attachmentId])
  }
}

export function postActions(dispatch) {
  return {
    showMoreComments: (postId) => dispatch(showMoreComments(postId)),
    showMoreLikes: (postId) => dispatch(showMoreLikes(postId)),
    toggleEditingPost: (postId, newValue) => dispatch(toggleEditingPost(postId, newValue)),
    cancelEditingPost: (postId, newValue) => dispatch(cancelEditingPost(postId, newValue)),
    saveEditingPost: (postId, newPost) => dispatch(saveEditingPost(postId, newPost)),
    deletePost: (postId) => dispatch(deletePost(postId)),
    toggleCommenting: (postId) => dispatch(toggleCommenting(postId)),
    addComment:(postId, commentText) => dispatch(addComment(postId, commentText)),
    likePost: (postId, userId) => dispatch(likePost(postId, userId)),
    unlikePost: (postId, userId) => dispatch(unlikePost(postId, userId)),
    disableComments: (postId) => dispatch(disableComments(postId)),
    enableComments: (postId) => dispatch(enableComments(postId)),
    addAttachmentResponse:(postId, attachments) => dispatch(addAttachmentResponse(postId, attachments)),
    removeAttachment:(postId, attachmentId) => dispatch(removeAttachment(postId, attachmentId)),
    commentEdit: {
      toggleEditingComment: (commentId) => dispatch(toggleEditingComment(commentId)),
      saveEditingComment: (commentId, newValue) => dispatch(saveEditingComment(commentId, newValue)),
      deleteComment: (commentId) => dispatch(deleteComment(commentId)),
    },
  }
}

export function userActions(dispatch) {
  return {
    ban: username => dispatch(ban(username)),
    unban: username => dispatch(unban(username)),
    subscribe: username => dispatch(subscribe(username)),
    unsubscribe: username => dispatch(unsubscribe(username)),
  }
}

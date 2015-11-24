import {showMoreComments, showMoreLikes, toggleEditingPost, cancelEditingPost,
        saveEditingPost, deletePost, likePost, unlikePost, toggleCommenting, addComment,
        toggleEditingComment, cancelEditingComment, saveEditingComment,
        deleteComment } from '../redux/action-creators'

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
    const isEditable = user.id === comment.createdBy
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
  const isEditable = post.createdBy == user.id
  const directFeeds = post.postedTo.map(feedId => state.timelines[feedId]).filter(feed => feed && feed.name === 'Directs')
  const isDirect = directFeeds.length
  const directReceivers = post.postedTo.map(subscriptionId => (state.subscriptions[subscriptionId]||{}).user).map(userId=>state.users[userId]).filter(user=>user)

  return { ...post, attachments, comments, usersLikedPost, createdBy, ...postViewState, isEditable, isDirect, directReceivers }
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
    commentEdit: {
      toggleEditingComment: (commentId) => dispatch(toggleEditingComment(commentId)),
      saveEditingComment: (commentId, newValue) => dispatch(saveEditingComment(commentId, newValue)),
      deleteComment: (commentId) => dispatch(deleteComment(commentId)),
    },
  }
}

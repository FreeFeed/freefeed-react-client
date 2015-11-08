import React from 'react'
import {connect} from 'react-redux'

import {showMoreComments, showMoreLikes, toggleEditingPost, cancelEditingPost,
        saveEditingPost, deletePost, likePost, unlikePost, toggleCommenting, addComment,
        toggleEditingComment, cancelEditingComment, saveEditingComment,
        deleteComment, createPost } from '../redux/action-creators'


import CreatePost from './create-post'
import HomeFeed from './home-feed'

const HomeHandler = (props) => {
  const createPost = (postText) => {
    const feedName = props.user.username
    props.createPost(postText, feedName)
  }

  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <CreatePost createPostViewState={props.createPostViewState}
                    createPost={createPost} />
        <HomeFeed {...props}/>
      </div>
      <div className='box-footer'>
      </div>
    </div>)
}

HomeHandler.childContextTypes = {settings: React.PropTypes.object}

const MAX_LIKES = 4

function selectState(state) {
  const user = state.user
  const feed = state.feedViewState.feed
  .map(id => state.posts[id])
  .map(post => {
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

    return { ...post, attachments, comments, usersLikedPost, createdBy, ...postViewState, isEditable }
  })

  const createPostViewState = state.createPostViewState
  const timelines = state.timelines
  const boxHeader = state.boxHeader

  return { feed, user, timelines, createPostViewState, boxHeader }
}

function selectActions(dispatch) {
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
    createPost: (postText, feedName) => dispatch(createPost(postText, feedName)),
    commentEdit: {
      toggleEditingComment: (commentId) => dispatch(toggleEditingComment(commentId)),
      saveEditingComment: (commentId, newValue) => dispatch(saveEditingComment(commentId, newValue)),
      deleteComment: (commentId) => dispatch(deleteComment(commentId)),
    },
  }
}

export default connect(selectState, selectActions)(HomeHandler)

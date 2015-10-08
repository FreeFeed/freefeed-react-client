import React from 'react'
import {connect} from 'react-redux'

import {showMoreComments, showMoreLikes,
        toggleEditingPost, cancelEditingPost, saveEditingPost, deletePost, likePost, toggleCommenting,
        addComment, toggleEditingComment, cancelEditingComment, saveEditingComment, deleteComment } from '../redux/action-creators'

import FeedPost from './feed-post'


const HomeFeed = (props) => {
  const feed_posts = props.feed.map(post => {
    const saveEditingPost = (postId, newValue) => {
      let newPost =  {...props.posts[postId]}
      newPost.body = newValue
      newPost.timeline = props.timelines.id
      delete newPost['id']

      props.saveEditingPost(postId, newPost)
    }

    return (<FeedPost {...post}
              key={post.id}
              user={props.user}
              showMoreComments={props.showMoreComments}
              showMoreLikes={props.showMoreLikes}
              toggleEditingPost={props.toggleEditingPost}
              cancelEditingPost={props.cancelEditingPost}
              saveEditingPost={saveEditingPost}
              deletePost={props.deletePost}
              toggleCommenting={props.toggleCommenting}
              addComment={props.addComment}
              likePost={props.likePost}
              commentEdit={props.commentEdit} />)
  })

  return (
    <div className='posts'>
      <p>submit-post</p>
      <p>pagination (if not first page)</p>
      <div className='posts'>
        {feed_posts}
      </div>
      <p>hidden-posts</p>
      <p>pagination</p>
    </div>
  )
}

class HomeHandler extends React.Component {

  getChildContext(){
    return {
      settings: this.props.user.settings
    }
  }

  render(){
    return (
      <div className='box'>
        <div className='box-header-timeline'>
          Home
        </div>
        <div className='box-body'>
          <HomeFeed {...this.props}/>
        </div>
        <div className='box-footer'>
        </div>
      </div>)
  }
}

HomeHandler.childContextTypes = {settings: React.PropTypes.object}

const MAX_LIKES = 4

function selectState(state) {
  const user = state.user
  const posts = state.posts
  const timelines = state.timelines
  const feed = state.feedViewState.feed
  .map(id => state.posts[id])
  .map(post => {
    let comments = _.map(post.comments, commentId => {
      const comment = state.comments[commentId]
      const commentViewState = state.commentViewState[commentId]
      const author = state.users[comment.createdBy]
      const isEditable = user.id === comment.createdBy
      return { ...comment, ...commentViewState, user: author, isEditable }
    })

    let usersLikedPost = _.map(post.likes, userId => state.users[userId])

    const createdBy = state.users[post.createdBy]
    const postViewState = state.postsViewState[post.id]

    if (postViewState.omittedComments !== 0) {
      comments = [ comments[0], comments[comments.length - 1] ]
    }

    if (postViewState.omittedLikes !== 0) {
      usersLikedPost = usersLikedPost.slice(0, MAX_LIKES)
    }

    const isEditable = post.createdBy == user.id

    return { ...post, comments, usersLikedPost, createdBy, ...postViewState, isEditable }
  })

  return { feed, user, posts, timelines }
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
    likePost: (postId) => dispatch(likePost(postId)),
    commentEdit: {
      toggleEditingComment: (commentId) => dispatch(toggleEditingComment(commentId)),
      saveEditingComment: (commentId, newValue) => dispatch(saveEditingComment(commentId, newValue)),
      deleteComment: (commentId) => dispatch(deleteComment(commentId)),
    },
  }
}

export default connect(selectState, selectActions)(HomeHandler)

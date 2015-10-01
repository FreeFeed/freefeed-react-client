import React from 'react'
import {connect} from 'react-redux'

import {showMoreComments, showMoreLikes} from '../redux/action-creators'
import FeedPost from './feed-post'


const HomeFeed = (props) => {
  const post_tags = props.home
  .map(id => props.posts[id])
  .map(post => {
    const comments = _.map(post.comments, commentId => {
      const comment = props.comments[commentId]
      comment.user = props.users[comment.createdBy]
      return comment
    })

    const likes = _.map(post.likes, userId => props.users[userId])

    return (<FeedPost data={post}
                      key={post.id}
                      users={props.users}
                      comments={comments}
                      likes={likes}
                      current_user={props.user}
                      authenticated={props.authenticated}
                      showMoreComments={props.showMoreComments}
                      showMoreLikes={props.showMoreLikes}/>)
  })

  return (
    <div className='posts'>
      <p>submit-post</p>
      <p>pagination (if not first page)</p>
      <div className='posts'>
        {post_tags}
      </div>
      <p>hidden-posts</p>
      <p>pagination</p>
    </div>
  )
}

const HomeHandler = (props) => (
  <div className='box'>
    <div className='box-header-timeline'>
      Home
    </div>
    <div className='box-body'>
      {props.authenticated ? (<HomeFeed {...props}/>) : false}
    </div>
    <div className='box-footer'>
    </div>
  </div>
)

function selectState(state) {
  return state
}

function selectActions(dispatch) {
  return {
    showMoreComments: (postId, likesExpanded) => dispatch(showMoreComments(postId, likesExpanded)),
    showMoreLikes: (postId, commentsExpanded) => dispatch(showMoreLikes(postId, commentsExpanded))
  }
}

export default connect(selectState, selectActions)(HomeHandler)

import React from 'react'
import {connect} from 'react-redux'
import {joinPostData, postActions} from './select-utils'

import FeedPost from './feed-post'

const SinglePostHandler = (props) => {
  const post = props.post
  
  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
      {props.post ? (<FeedPost {...post}
          key={post.id}
          user={props.user}
          showMoreComments={props.showMoreComments}
          showMoreLikes={props.showMoreLikes}
          toggleEditingPost={props.toggleEditingPost}
          cancelEditingPost={props.cancelEditingPost}
          saveEditingPost={props.saveEditingPost}
          deletePost={props.deletePost}
          toggleCommenting={props.toggleCommenting}
          addComment={props.addComment}
          likePost={props.likePost}
          unlikePost={props.unlikePost}
          commentEdit={props.commentEdit} />) : false }
      </div>
      <div className='box-footer'>
      </div>
    </div>)
}

SinglePostHandler.childContextTypes = {settings: React.PropTypes.object}

function selectState(state) {
  const boxHeader = state.boxHeader
  const user = state.user
  const post = state.feedViewState.feed[0] ? joinPostData(state.feedViewState.feed[0], state) : null
  return { post, user, boxHeader }
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) }
}

export default connect(selectState, selectActions)(SinglePostHandler)

import React from 'react'
import {connect} from 'react-redux'
import {joinPostData, postActions} from './select-utils'

import FeedPost from './feed-post'

const SinglePostHandler = (props) => {
  let post = props.post

  const postsViewState = props.postsViewState

  let postBody = <div></div>

  if (postsViewState && postsViewState.isError) {
    postBody = <div className='single-post-error'>{postsViewState.errorString}</div>
  }

  if (post) {
    post.isCommenting = true
    
    postBody = <FeedPost {...post}
                  key={post.id}
                  isSinglePost={true}
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
                  commentEdit={props.commentEdit} />
  }

  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
       {postBody}
      </div>
      <div className='box-footer'>
      </div>
    </div>
  )
}

function selectState(state) {
  const boxHeader = state.boxHeader
  const user = state.user

  const post = state.feedViewState.feed[0] ? joinPostData(state.feedViewState.feed[0], state) : null
  const postsViewState = state.postsViewState[state.singlePostId] ? state.postsViewState[state.singlePostId] : null

  return { post, user, boxHeader, postsViewState }
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) }
}

export default connect(selectState, selectActions)(SinglePostHandler)

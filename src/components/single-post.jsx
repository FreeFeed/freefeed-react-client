import React from 'react'
import {connect} from 'react-redux'
import {joinPostData, postActions} from './select-utils'

import FeedPost from './feed-post'

const SinglePostHandler = (props) => {
  let post = props.post
  let errorString = props.errorString

  let postBody = <div></div>

  if (errorString) {
    postBody = <div className='single-post-error'>{errorString}</div>
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
                  addAttachmentResponse={props.addAttachmentResponse}
                  toggleCommenting={props.toggleCommenting}
                  addComment={props.addComment}
                  likePost={props.likePost}
                  unlikePost={props.unlikePost}
                  disableComments={props.disableComments}
                  enableComments={props.enableComments}
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

  const post = joinPostData(state)(state.singlePostId)
  const viewState = state.postsViewState[state.singlePostId]
  const errorString = viewState && viewState.isError ? viewState.errorString : null

  return { post, user, boxHeader, errorString }
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) }
}

export default connect(selectState, selectActions)(SinglePostHandler)

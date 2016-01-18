import React from 'react'
import {connect} from 'react-redux'
import {createPost, expandSendTo} from '../redux/action-creators'
import {joinPostData, joinCreatePostData, postActions} from './select-utils'
import {getQuery} from '../utils'

import CreatePost from './create-post'
import Feed from './feed'
import PaginatedView from './paginated-view'
import Welcome from './welcome'

const FeedHandler = (props) => {
  const createPostComponent = (
    <CreatePost
      createPostViewState={props.createPostViewState}
      sendTo={props.sendTo}
      user={props.user}
      createPost={props.createPost}
      expandSendTo={props.expandSendTo}
      createPostForm={props.createPostForm}
      addAttachmentResponse={props.addAttachmentResponse}
      removeAttachment={props.removeAttachment}/>
  )

  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <PaginatedView firstPageHead={createPostComponent}>
        <Feed {...props}/>
      </PaginatedView>
      <div className='box-footer'>
      </div>
    </div>)
}

function selectState(state) {
  const user = state.user
  const authenticated = state.authenticated
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state))
  const createPostViewState = state.createPostViewState
  const createPostForm = joinCreatePostData(state)
  const timelines = state.timelines
  const boxHeader = state.boxHeader
  const sendTo = state.sendTo

  return { user, authenticated, visibleEntries, createPostViewState, createPostForm, timelines, boxHeader, sendTo }
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (feeds, postText, attachmentIds, more) => dispatch(createPost(feeds, postText, attachmentIds, more)),
    expandSendTo: () => dispatch(expandSendTo())
  }
}

export default connect(selectState, selectActions)(FeedHandler)

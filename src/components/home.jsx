import React from 'react'
import {connect} from 'react-redux'
import {createPost} from '../redux/action-creators'
import {joinPostData, postActions} from './select-utils'

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

function selectState(state) {
  const user = state.user
  const feed = state.feedViewState.feed.map(joinPostData(state))
  const createPostViewState = state.createPostViewState
  const timelines = state.timelines
  const boxHeader = state.boxHeader

  return { feed, user, timelines, createPostViewState, boxHeader }
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (postText, feedName) => dispatch(createPost(postText, feedName))
  }
}

export default connect(selectState, selectActions)(HomeHandler)

import React from 'react'
import {connect} from 'react-redux'
import {createPost} from '../redux/action-creators'
import {joinPostData, postActions} from './select-utils'
import {getQuery} from '../utils'

import CreatePost from './create-post'
import HomeFeed from './home-feed'
import PaginatedView from './paginated-view'

const FeedHandler = (props) => {
  const createPost = (postText) => {
    const feedName = props.user.username
    props.createPost(postText, feedName)
  }

  const createPostForm = (<CreatePost createPostViewState={props.createPostViewState}
                                      createPost={createPost} />)

  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <PaginatedView firstPageHead={createPostForm}>
        {props.feed && props.feed.length ? <HomeFeed {...props}/> : false}
      </PaginatedView>
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
    createPost: (postText, feedName) => dispatch(createPost(postText, feedName)),
  }
}

export default connect(selectState, selectActions)(FeedHandler)

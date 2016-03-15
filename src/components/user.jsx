import React from 'react'
import {connect} from 'react-redux'

import {createPost, resetPostCreateForm, expandSendTo} from '../redux/action-creators'
import {joinPostData, joinCreatePostData, postActions, userActions} from './select-utils'
import {getCurrentRouteName} from '../utils'
import Breadcrumbs from './breadcrumbs'
import UserProfile from './user-profile'
import UserFeed from './user-feed'

const UserHandler = (props) => {
  return (
    <div className="box">
      <div className="box-header-timeline">
        {props.boxHeader}
      </div>

      <div className="box-body">
        {props.breadcrumbs.shouldShowBreadcrumbs ? <Breadcrumbs {...props.breadcrumbs}/> : false}

        <UserProfile
          {...props.viewUser}
          {...props.userActions}
          user={props.user}
          sendTo={props.sendTo}
          expandSendTo={props.expandSendTo}
          createPostViewState={props.createPostViewState}
          createPost={props.createPost}
          resetPostCreateForm={props.resetPostCreateForm}
          createPostForm={props.createPostForm}
          addAttachmentResponse={props.addAttachmentResponse}
          removeAttachment={props.removeAttachment}/>
      </div>

      <UserFeed {...props}/>
    </div>
  )
}

function selectState(state, ownProps) {
  const user = state.user
  const authenticated = state.authenticated
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state))
  const createPostViewState = state.createPostViewState
  const createPostForm = joinCreatePostData(state)
  const timelines = state.timelines
  const boxHeader = state.boxHeader
  const foundUser = Object.getOwnPropertyNames(state.users)
    .map(key => state.users[key] || state.subscribers[key])
    .filter(user => user.username === ownProps.params.userName)[0]

  const amIGroupAdmin = (
    authenticated &&
    foundUser &&
    foundUser.type === 'group' &&
    ((foundUser.administrators || []).indexOf(state.user.id) > -1)
  )

  const currentRouteName = getCurrentRouteName(ownProps)
  const isItPostsPage = ['userComments', 'userLikes'].indexOf(currentRouteName) === -1

  const statusExtension = {
    authenticated,
    isLoading: state.routeLoadingState,
    isUserFound: !!foundUser,
    isItMe: (foundUser ? foundUser.username === user.username : false),
    isItPostsPage,
    amIGroupAdmin,
    subscribed: authenticated && foundUser && (user.subscriptions.indexOf(foundUser.id) > -1),
    blocked: authenticated && foundUser && (user.banIds.indexOf(foundUser.id) > -1),
    hasRequestBeenSent: authenticated && foundUser && ((user.pendingSubscriptionRequests || []).indexOf(foundUser.id) > -1)
  }

  statusExtension.canISeeSubsList = statusExtension.isUserFound &&
    (foundUser.isPrivate === '0' || statusExtension.subscribed || statusExtension.isItMe)

  const viewUser = {...(foundUser), ...statusExtension}

  const breadcrumbs = {
    shouldShowBreadcrumbs: !isItPostsPage,
    user: viewUser,
    breadcrumb: currentRouteName.replace('user','')
  }

  const sendTo = {...state.sendTo, defaultFeed: (foundUser ? foundUser.username : null)}

  return { user, visibleEntries, timelines, createPostViewState, createPostForm, boxHeader, viewUser, breadcrumbs, sendTo }
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (feeds, postText, attachmentIds, more) => dispatch(createPost(feeds, postText, attachmentIds, more)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    expandSendTo: () => dispatch(expandSendTo()),
    userActions: userActions(dispatch),
  }
}

export default connect(selectState, selectActions)(UserHandler)

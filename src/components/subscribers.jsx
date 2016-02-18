import React from 'react'
import {connect} from 'react-redux'

import {Link} from 'react-router'
import {acceptGroupRequest, rejectGroupRequest,
        acceptUserRequest, rejectUserRequest} from '../redux/action-creators'
import {tileUserListFactroy, PLAIN, REQUESTS} from './tile-user-list'

const RequestsList = tileUserListFactroy({type: REQUESTS})
const SubscribersList = tileUserListFactroy({type: PLAIN})

const SubscribersHandler = (props) => {
  const acceptGroupRequest = (userName) => props.acceptGroupRequest(props.username, userName)
  const rejectGroupRequest = (userName) => props.rejectGroupRequest(props.username, userName)

  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div><Link to={`/${props.username}`}>{props.username}</Link> › Subscribers</div>
        {props.groupRequests
          ? <RequestsList title='Subscription requests'
                          acceptRequest={acceptGroupRequest}
                          rejectRequest={rejectGroupRequest}
                          {...props.groupRequests} />
          : false}

        {props.userRequests
          ? <RequestsList title='Subscription requests'
                          acceptRequest={props.acceptUserRequest}
                          rejectRequest={props.rejectUserRequest}
                          {...props.userRequests} />
          : false}
        
        <SubscribersList title='Subscribers'
                         {...props.subscribers} />
      </div>
      <div className='box-footer'></div>
    </div>
  )
}

function selectState(state) {
  const selectedState = {}

  selectedState.boxHeader = state.boxHeader
  selectedState.username = state.router.params.userName
  
  selectedState.subscribers = {
    users: _.sortBy(state.usernameSubscribers.payload, 'username'),
    isPending: state.usernameSubscribers.isPending,
    errorString: state.usernameSubscribers.errorString
  }

  const groupRequests = state.groupRequests.find(group => group.username === state.router.params.userName)
  if (groupRequests && groupRequests.requests.length != 0) {
    const requests = {
      users: groupRequests.requests,
      isPending: false,
      errorString: false
    }
    selectedState.groupRequests = requests
  }

  const isItMySubsPage = state.user && state.user.username === state.router.params.userName
  const rawRequests = state.requests
  if (isItMySubsPage && rawRequests && rawRequests.length != 0) {
    const requests = {
      users: rawRequests,
      isPending: false,
      errorString: false
    }
    selectedState.userRequests = requests
  }

  return selectedState
}

function selectActions(dispatch) {
  return {
    acceptGroupRequest: (...args) => dispatch(acceptGroupRequest(...args)),
    rejectGroupRequest: (...args) => dispatch(rejectGroupRequest(...args)),
    acceptUserRequest: (...args) => dispatch(acceptUserRequest(...args)),
    rejectUserRequest: (...args) => dispatch(rejectUserRequest(...args))
  }
}

export default connect(selectState, selectActions)(SubscribersHandler)

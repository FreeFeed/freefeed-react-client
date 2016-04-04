import React from 'react'
import {connect} from 'react-redux'

import {Link} from 'react-router'
import SubsList from './subs-list'


const SubscriptionsHandler = (props) => {
  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div><Link to={`/${props.username}`}>{props.username}</Link> › Subscriptions</div>
        <SubsList {...props.subs}
                  subs={props.subs.users}
                  emptyString='No user subscriptions'
                  title='Users'/>
        <SubsList {...props.subs}
                  subs={props.subs.groups}
                  emptyString='No group subscriptions'
                  title='Groups'/>
        {props.blockedByMe ? (
          <SubsList {...props.blockedByMe}
                    subs={props.blockedByMe.blockedUsers}
                    emptyString='No users are blocked'
                    title='Blocked users'/>
        ) : false}
      </div>
      <div className='box-footer'></div>
    </div>
  )
}

function selectState(state, ownProps) {
  const boxHeader = state.boxHeader
  const username = ownProps.params.userName

  const sortedSubs = _.sortBy(state.usernameSubscriptions.payload, 'username')

  const subs = {
    groups: _.filter(sortedSubs, (item) => item.type == 'group'),
    users: _.filter(sortedSubs, (item) => item.type == 'user'),
    isPending: state.usernameSubscriptions.isPending,
    errorString: state.usernameSubscriptions.errorString,
    displayQuantity: true
  }

  const blockedByMe = username == state.user.username ? {
    blockedUsers: _.sortBy(state.usernameBlockedByMe.payload, 'username'),
    isPending: state.usernameBlockedByMe.isPending,
    errorString: state.usernameBlockedByMe.errorString,
    displayQuantity: true
  } : false

  return { boxHeader, username, subs, blockedByMe }
}

export default connect(selectState)(SubscriptionsHandler)

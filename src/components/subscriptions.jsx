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
        <SubsList {...props}
                  subs={props.users}
                  emptyString='No user subscriptions'
                  title='Users'/>
        <SubsList {...props}
                  subs={props.groups}
                  emptyString='No group subscriptions'
                  title='Groups'/>
      </div>
      <div className='box-footer'></div>
    </div>
  )
}

function selectState(state, ownProps) {
  const boxHeader = state.boxHeader
  const username = ownProps.params.userName
  const subs = _.sortBy(state.usernameSubscriptions.payload, 'username')

  const groups = _.filter(subs, (item) => item.type == 'group')
  const users = _.filter(subs, (item) => item.type == 'user')

  const isPending = state.usernameSubscriptions.isPending
  const errorString = state.usernameSubscriptions.errorString
  const displayQuantity = true

  return { boxHeader, username, users, groups, isPending, errorString, displayQuantity }
}

export default connect(selectState)(SubscriptionsHandler)

import React from 'react'
import {connect} from 'react-redux'

import {Link} from 'react-router'
import {tileUserListFactroy, PLAIN} from './tile-user-list'

const TileUserList = tileUserListFactroy({type: PLAIN})

const SubscriptionsHandler = (props) => {
  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div><Link to={`/${props.username}`}>{props.username}</Link> › Subscriptions</div>
        <TileUserList {...props} title='Subscriptions' />
      </div>
      <div className='box-footer'></div>
    </div>
  )
}

function selectState(state) {
  const boxHeader = state.boxHeader
  const username = state.router.params.userName
  const users = _.sortBy(state.usernameSubscriptions.payload, 'username')
  const isPending = state.usernameSubscriptions.isPending
  const errorString = state.usernameSubscriptions.errorString

  return { boxHeader, username, users, isPending, errorString }
}

export default connect(selectState)(SubscriptionsHandler)

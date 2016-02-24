import React from 'react'
import {connect} from 'react-redux'

import {Link} from 'react-router'
import TileUserList from './tile-user-list'

const SubscribersHandler = (props) => {
  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div><Link to={`/${props.username}`}>{props.username}</Link> › Subscribers</div>
        <TileUserList {...props} title='Subscribers' />
      </div>
      <div className='box-footer'></div>
    </div>
  )
}

function selectState(state, ownProps) {
  const boxHeader = state.boxHeader
  const username = ownProps.params.userName
  const users = _.sortBy(state.usernameSubscribers.payload, 'username')
  const isPending = state.usernameSubscribers.isPending
  const errorString = state.usernameSubscribers.errorString

  return { boxHeader, username, users, isPending, errorString }
}

export default connect(selectState)(SubscribersHandler)

import React from 'react'
import {connect} from 'react-redux'

import {Link} from 'react-router'
import TileUserList from './tile-user-list'


const SubscriptionsHandler = (props) => {
  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div><Link to={`/${props.username}`}>{props.username}</Link> › Subscriptions</div>
        <TileUserList title='Subscriptions' users={props.subscriptions} />
      </div>
      <div className='box-footer'></div>
    </div>
  )
}

function selectState(state) {
  const boxHeader = state.boxHeader
  const username = state.router.params.userName
  const subscriptions = state.usernameSubscriptions

  return { boxHeader, username, subscriptions }
}

export default connect(selectState)(SubscriptionsHandler)

import React from 'react'
import {connect} from 'react-redux'

import {Link} from 'react-router'
import SubscribersList from './subscribers-list'
import throbber16 from 'assets/images/throbber-16.gif'

const SubscribersHandler = (props) => {
  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div><Link to={`/${props.username}`}>{props.username}</Link> › Subscribers</div>
        <h3 className='p-user-subscribers'>
          <span>Subscribers&nbsp;</span>
          {props.subscribers.isPending ? (
            <span className="comment-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
        </h3>
        {props.subscribers.errorString ? (
          <span className="error-string">{props.subscribers.errorString}</span>
        ) : false}
        <SubscribersList subscribers={props.subscribers.payload}/>
      </div>
      <div className='box-footer'></div>
    </div>
  )
}

function selectState(state) {
  const boxHeader = state.boxHeader
  const username = state.router.params.userName
  const subscribers = state.usernameSubscribers

  return { boxHeader, username, subscribers }
}

export default connect(selectState)(SubscribersHandler)

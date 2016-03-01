import React from 'react'
import {connect} from 'react-redux'

import {Link} from 'react-router'

const ManageSubscribersHandler = (props) => {
  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div className="row">
          <div className="col-md-6">
            <Link to={`/${props.username}`}>{props.username}</Link> › Manage subscribers
          </div>
          <div className="col-md-6 text-right">
            <Link to={`/${props.username}/subscribers`}>Browse subscribers</Link>
          </div>       
        </div>
      </div>
      <div className='box-footer'></div>
    </div>
  )
}

function selectState(state) {
  const boxHeader = state.boxHeader
  const username = state.router.params.userName

  return { boxHeader, username }
}

function selectActions(dispatch) {
  return {}
}

export default connect(selectState, selectActions)(ManageSubscribersHandler)

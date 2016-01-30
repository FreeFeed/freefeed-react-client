import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'

import TileUserList from './tile-user-list'


const GroupsHandler = (props) => {
  return (
    <div className="box">
      <div className="box-header-timeline">
        Groups
      </div>
      <div className="box-body">
        <div>All your groups, sorted alphabetically</div>
        <TileUserList {...props} size="large" />
      </div>
      <div className="box-footer"></div>
    </div>
  )
}

function selectState(state) {
  const users = _.sortBy(state.groups, 'username')

  return { users }
}

export default connect(selectState)(GroupsHandler)

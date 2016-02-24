import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'

import {tileUserListFactory, PLAIN} from './tile-user-list'
const TileList = tileUserListFactory({type: PLAIN, size: 'large'})

const GroupsHandler = (props) => {
  return (
    <div className="box">
      <div className="box-header-timeline">
        Groups
      </div>
      <div className="box-body">
        <div className="row">
          <div className="col-md-6">
            All your groups, sorted alphabetically
          </div>
          <div className="col-md-6 text-right">
            <Link to="/groups/create">Create a group</Link>
          </div>
        </div>

        <TileList users={props.users}/>
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

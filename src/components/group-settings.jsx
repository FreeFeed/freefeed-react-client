import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import _ from 'lodash'

import {updateGroup} from '../redux/action-creators'
import GroupSettingsForm from './group-settings-form'

const GroupSettings = (props) => (
  <div className="content">
    <div className="box">
      <div className="box-header-timeline">
        <Link to={`/${props.group.username}`}>{props.group.username}</Link>: group settings
      </div>
      <div className="box-body">
        <GroupSettingsForm
          group={props.group}
          updateGroup={props.updateGroup}
          {...props.groupSettingsForm}/>
      </div>
    </div>
  </div>
)

function mapStateToProps(state) {
  return {
    group: (_.find(state.users, { 'username': state.router.params.userName }) || {}),
    groupSettingsForm: state.groupSettingsForm
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateGroup: (...args) => dispatch(updateGroup(...args))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupSettings)

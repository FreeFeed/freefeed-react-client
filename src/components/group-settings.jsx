import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import _ from 'lodash'

import {updateGroup} from '../redux/action-creators'
import GroupSettingsForm from './group-settings-form'
import throbber100 from 'assets/images/throbber.gif'

const GroupSettings = (props) => (
  props.groupSettings.status === 'loading' ? (
    <div className="box">
      <div className="box-header-timeline">
        Group settings
      </div>
      <div className="box-body">
        <img width="100" height="100" src={throbber100}/>
      </div>
    </div>
  ) : props.groupSettings.status === 'success' ? (
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
  ) : props.groupSettings.status === 'error' ? (
    <div className="box">
      <div className="box-header-timeline">
        Group settings
      </div>
      <div className="box-body">
        <div className="alert alert-danger">{props.groupSettings.errorMessage}</div>
      </div>
    </div>
  ) : (
    <div/>
  )
)

function mapStateToProps(state, ownProps) {
  return {
    group: (_.find(state.users, { 'username': ownProps.params.userName }) || {}),
    groupSettings: state.groupSettings,
    groupSettingsForm: state.groupSettingsForm
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateGroup: (...args) => dispatch(updateGroup(...args))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupSettings)

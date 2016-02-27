import React from 'react'
import {connect} from 'react-redux'
import {toggleRealtime, updateFrontendRealtimePreferences, home} from '../redux/action-creators'

const getStatusIcon = (active, status) => {
  if (status === 'loading'){
    return 'refresh'
  }
  return active ? 'pause' : 'play'
}

const realtimeSwitch = props => (
  <div className='realtime-switch' onClick={_ => props.toggle(props.userId, !props.realtimeActive)}>
    {props.realtimeActive ? false : 'Paused'}
    <span className={`glyphicon glyphicon-${getStatusIcon(props.realtimeActive, props.status)}`}/>
  </div>
)

const mapStateToProps = (state) => {
  return {
    userId: state.user.id,
    realtimeActive: state.frontendRealtimePreferencesForm.realtimeActive,
    status: state.frontendRealtimePreferencesForm.status,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    toggle: (userId, settingActive) => {
      //send a request to change flag
      dispatch(updateFrontendRealtimePreferences(userId, {realtimeActive: settingActive}))
      //set a flag to show
      dispatch(toggleRealtime())
      if (settingActive) {
        dispatch(home())
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(realtimeSwitch)

import React from 'react'
import {connect} from 'react-redux'
import {updateUser, userSettingsChange, updatePassword} from '../redux/action-creators'
import UserSettingsForm from './user-settings-form'
import ChangePasswordForm from './change-password-form'

const Settings = (props) => (
  <div className='content'>
    <div className='box'>
      <div className='box-header-timeline'>
        Settings
      </div>
      <div className='box-body'>
        <UserSettingsForm user={props.user} updateUser={props.updateUser} userSettingsChange={props.userSettingsChange} {...props.userSettingsForm}/>
        <hr/>
        <ChangePasswordForm {...props.passwordForm} updatePassword={props.updatePassword} />
        <hr/>
        <h2 className='p-settings-updateprofilepicture-header'>Update Profile Picture</h2>
        <div className='form-group'>
          <input className='' type='file'/>
        </div>
        <p>
          <button className='btn btn-default p-settings-updateprofilepicture'>Update</button>
        </p>
        </div>
      </div>
  </div>
)

function mapStateToProps(state){
  return {
    user: state.user,
    userSettingsForm: state.userSettingsForm,
    passwordForm: state.passwordForm,
  }
}

function mapDispatchToProps(dispatch){
  return {
    updateUser: (...args) => dispatch(updateUser(...args)),
    userSettingsChange: (...args) => dispatch(userSettingsChange(...args)),
    updatePassword: (...args) => dispatch(updatePassword(...args)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
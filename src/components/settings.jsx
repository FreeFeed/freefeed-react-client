import React from 'react'
import {connect} from 'react-redux'
import {updateUser, userSettingsChange} from '../redux/action-creators'
import UserSettingsForm from './user-settings-form'

const Settings = (props) => (
  <div className='content'>
    <div className='box'>
      <div className='box-header-timeline'>
        Settings
      </div>
      <div className='box-body'>
        <UserSettingsForm user={props.user} updateUser={props.updateUser} userSettingsChange={props.userSettingsChange} {...props.userSettingsForm}/>
        <hr/>
        <h2 className='p-settings-changepassword-header'>Change password</h2>
        <div className='form-group p-settings-currentpassword'>
          <label htmlFor='currentPassword'>Current password:</label>
          <input id='currentPassword' className='form-control' name='currentPassword' type='password'/>
        </div>
        <div className='form-group p-settings-newpassword'>
          <label htmlFor='password'>New password:</label>
          <input id='password' className='form-control' name='password' type='password'/>
        </div>

        <div className='form-group p-settings-confirmpassword'>
          <label htmlFor='passwordConfirmation'>Confirm password:</label>
          <input id='passwordConfirmation' className='form-control' name='passwordConfirmation' type='password'/>
        </div>

        <p>
          <button className='btn btn-default p-settings-updatepassword'>Update Password</button>
        </p>
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
    userSettingsForm: state.userSettingsForm
  }
}

function mapDispatchToProps(dispatch){
  return {
    updateUser: (...args) => dispatch(updateUser(...args)),
    userSettingsChange: (...args) => dispatch(userSettingsChange(...args)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
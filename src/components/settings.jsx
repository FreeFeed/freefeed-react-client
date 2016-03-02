import React from 'react'
import {connect} from 'react-redux'
import {updateUser, userSettingsChange, updateFrontendPreferences, updatePassword, updateUserPhoto} from '../redux/action-creators'
import UserSettingsForm from './user-settings-form'
import UserFrontendPreferencesForm from './user-frontend-preferences-form'
import UserChangePasswordForm from './user-change-password-form'
import UserPhotoForm from './user-photo-form'

const Settings = (props) => (
  <div className="content">
    <div className="box">
      <div className="box-header-timeline">
        Settings
      </div>
      <div className="box-body">
        <UserSettingsForm
          user={props.user}
          updateUser={props.updateUser}
          userSettingsChange={props.userSettingsChange}
          {...props.userSettingsForm}/>

        <hr/>

        <UserFrontendPreferencesForm
          userId={props.user.id}
          preferences={props.user.frontendPreferences}
          updateFrontendPreferences={props.updateFrontendPreferences}
          {...props.frontendPreferencesForm}/>

        <hr/>

        <UserChangePasswordForm
          updatePassword={props.updatePassword}
          {...props.passwordForm}/>

        <hr/>

        <UserPhotoForm
          updateUserPhoto={props.updateUserPhoto}
          {...props.userPhotoForm}/>

        <hr/>
      </div>
    </div>
  </div>
)

function mapStateToProps(state){
  return {
    user: state.user,
    userSettingsForm: state.userSettingsForm,
    frontendPreferencesForm: state.frontendPreferencesForm,
    passwordForm: state.passwordForm,
    userPhotoForm: state.userPhotoForm,
  }
}

function mapDispatchToProps(dispatch){
  return {
    updateUser: (...args) => dispatch(updateUser(...args)),
    userSettingsChange: (...args) => dispatch(userSettingsChange(...args)),
    updateFrontendPreferences: (...args) => dispatch(updateFrontendPreferences(...args)),
    updatePassword: (...args) => dispatch(updatePassword(...args)),
    updateUserPhoto: (...args) => dispatch(updateUserPhoto(...args)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)

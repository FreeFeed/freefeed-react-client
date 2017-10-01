import React from 'react';
import {connect} from 'react-redux';
import {
  updateUser,
  userSettingsChange,
  updateUserPreferences,
  updatePassword,
  updateUserPicture,
  toggleRealtime,
  resetSettingsForms,
} from '../redux/action-creators';
import UserSettingsForm from './user-settings-form';
import UserPreferencesForm from './user-preferences-form';
import UserChangePasswordForm from './user-change-password-form';
import UserPictureForm from './user-picture-form';

class Settings extends React.Component {
  componentWillUnmount() {
    this.props.resetSettingsForms();
  }

  render() {
    const props = this.props;
    return (
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

            <UserPreferencesForm
              userId={props.user.id}
              frontendPreferences={props.user.frontendPreferences}
              backendPreferences={props.user.preferences}
              updateUserPreferences={props.updateUserPreferences}
              {...props.frontendPreferencesForm}/>

            <hr/>

            <UserChangePasswordForm
              updatePassword={props.updatePassword}
              {...props.passwordForm}/>

            <hr/>

            <UserPictureForm
              user={props.user}
              updateUserPicture={props.updateUserPicture}
              {...props.userPictureForm}/>

            <hr/>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    userSettingsForm: state.userSettingsForm,
    frontendPreferencesForm: state.frontendPreferencesForm,
    frontendRealtimePreferencesForm: state.frontendRealtimePreferencesForm,
    passwordForm: state.passwordForm,
    userPictureForm: state.userPictureForm
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateUser: (...args) => dispatch(updateUser(...args)),
    userSettingsChange: (...args) => dispatch(userSettingsChange(...args)),
    updateUserPreferences: (...args) => dispatch(updateUserPreferences(...args)),
    updatePassword: (...args) => dispatch(updatePassword(...args)),
    updateUserPicture: (...args) => dispatch(updateUserPicture(...args)),
    toggleRealtime: () => dispatch(toggleRealtime()),
    resetSettingsForms: () => dispatch(resetSettingsForms())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);

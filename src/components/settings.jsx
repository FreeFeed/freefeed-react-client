import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {
  updateUser,
  userSettingsChange,
  updateUserPreferences,
  updateUserNotificationPreferences,
  updatePassword,
  updateUserPicture,
  toggleRealtime,
  resetSettingsForms,
} from '../redux/action-creators';
import UserSettingsForm from './user-settings-form';
import UserPreferencesForm from './user-preferences-form';
import UserChangePasswordForm from './user-change-password-form';
import UserPictureForm from './user-picture-form';
import UserNotificationsForm from './user-notifications-form';

class Settings extends React.Component {
  componentWillUnmount() {
    this.props.resetSettingsForms();
  }

  render() {
    const { props } = this;

    if (!props.authenticated) {
      return (
        <div className="content">
          <div className="alert alert-danger" role="alert">You must <Link to="/signin">sign in</Link> or <Link to="/signup">sign up</Link> before visiting this page.</div>
        </div>
      );
    }

    if (!props.user.frontendPreferences || !props.user.preferences) {
      return null;
    }

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
              updateUserPreferences={props.updateUserPreferences}
              userSettingsChange={props.userSettingsChange}
              {...props.userSettingsForm}
            />

            <hr />

            <UserPreferencesForm
              userId={props.user.id}
              frontendPreferences={props.user.frontendPreferences}
              backendPreferences={props.user.preferences}
              updateUserPreferences={props.updateUserPreferences}
              {...props.frontendPreferencesForm}
            />

            <hr />

            <UserChangePasswordForm
              updatePassword={props.updatePassword}
              {...props.passwordForm}
            />

            <hr />

            <UserPictureForm
              user={props.user}
              updateUserPicture={props.updateUserPicture}
              {...props.userPictureForm}
            />

            <hr />

            <UserNotificationsForm
              userId={props.user.id}
              backendPreferences={props.user.preferences}
              updateUserNotificationPreferences={props.updateUserNotificationPreferences}
              {...props.userNotificationsForm}
            />

            <hr />
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
    userNotificationsForm: state.userNotificationsForm,
    passwordForm: state.passwordForm,
    userPictureForm: state.userPictureForm,
    authenticated: state.authenticated
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateUser: (...args) => dispatch(updateUser(...args)),
    userSettingsChange: (...args) => dispatch(userSettingsChange(...args)),
    updateUserPreferences: (...args) => dispatch(updateUserPreferences(...args)),
    updateUserNotificationPreferences: (...args) => dispatch(updateUserNotificationPreferences(...args)),
    updatePassword: (...args) => dispatch(updatePassword(...args)),
    updateUserPicture: (...args) => dispatch(updateUserPicture(...args)),
    toggleRealtime: () => dispatch(toggleRealtime()),
    resetSettingsForms: () => dispatch(resetSettingsForms())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);

import { encode as qsEncode } from 'querystring';
import React from 'react';
import { Link } from 'react-router';
import { preventDefault } from '../utils';

export default class UserChangePasswordForm extends React.Component {
  currentPassword;
  password;
  passwordConfirmation;

  handleSubmit = preventDefault(() => {
    if (!this.props.isSaving) {
      this.props.updatePassword({
        currentPassword: this.currentPassword.value,
        password: this.password.value,
        passwordConfirmation: this.passwordConfirmation.value,
      });
    }
  });

  registerCurrentPassword = (el) => {
    this.currentPassword = el;
  };

  registerPassword = (el) => {
    this.password = el;
  };

  registerPasswordConfirmation = (el) => {
    this.passwordConfirmation = el;
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Change password</h3>
        <div className="form-group p-settings-currentpassword">
          <label htmlFor="currentPassword">Current password:</label>
          <input
            name="currentPassword"
            id="currentPassword"
            className="form-control"
            ref={this.registerCurrentPassword}
            type="password"
          />
        </div>
        <div className="form-group p-settings-newpassword">
          <label htmlFor="password">New password:</label>
          <input
            name="password"
            id="password"
            className="form-control"
            ref={this.registerPassword}
            type="password"
          />
        </div>

        <div className="form-group p-settings-confirmpassword">
          <label htmlFor="passwordConfirmation">Confirm password:</label>
          <input
            name="passwordConfirmation"
            id="passwordConfirmation"
            className="form-control"
            ref={this.registerPasswordConfirmation}
            type="password"
          />
        </div>
        <p>
          <button className="btn btn-default p-settings-updatepassword" type="submit">
            Update Password
          </button>
        </p>
        {this.props.success ? (
          <div className="alert alert-info p-settings-alert" role="alert">
            <span id="error-message">Your password has been changed</span>
          </div>
        ) : (
          false
        )}
        {this.props.error ? (
          <div className="alert alert-danger p-settings-alert" role="alert">
            <span id="error-message">{this.props.errorText}</span>
          </div>
        ) : (
          false
        )}
        <p>
          Or{' '}
          <Link to={`/restore?${qsEncode({ email: this.props.email })}`}>
            Reset your password by email
          </Link>{' '}
          if you forget your current password
        </p>
      </form>
    );
  }
}

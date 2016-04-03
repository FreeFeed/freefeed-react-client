import React from 'react';
import {preventDefault} from '../utils';

export default class UserChangePasswordForm extends React.Component {
  render(){
    return (
      <form onSubmit={preventDefault(this.updatePassword)}>
        <h3>Change password</h3>
        <div className='form-group p-settings-currentpassword'>
          <label htmlFor='currentPassword'>Current password:</label>
          <input id='currentPassword' className='form-control' ref='currentPassword' type='password'/>
        </div>
        <div className='form-group p-settings-newpassword'>
          <label htmlFor='password'>New password:</label>
          <input id='password' className='form-control' ref='password' type='password'/>
        </div>

        <div className='form-group p-settings-confirmpassword'>
          <label htmlFor='passwordConfirmation'>Confirm password:</label>
          <input id='passwordConfirmation' className='form-control' ref='passwordConfirmation' type='password'/>
        </div>
        <p>
          <button className='btn btn-default p-settings-updatepassword' type='submit'>Update Password</button>
        </p>
        {this.props.success ?
          (<div className='alert alert-info p-settings-alert' role='alert'>
              <span id='error-message'>Your password has been changed</span>
            </div>) : false}
        {this.props.error ?
          (<div className='alert alert-danger p-settings-alert' role='alert'>
              <span id='error-message'>{this.props.errorText}</span>
            </div>) : false}
      </form>);
  }
  updatePassword = () => {
    if (!this.props.isSaving) {
      this.props.updatePassword({
        currentPassword: this.refs.currentPassword.value,
        password: this.refs.password.value,
        passwordConfirmation: this.refs.passwordConfirmation.value,
      });
    }
  }
}
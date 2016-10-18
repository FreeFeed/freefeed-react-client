import React from 'react';
import classnames from 'classnames';

import throbber16 from '../../assets/images/throbber-16.gif';
import {preventDefault} from '../utils';

export default class UserSettingsForm extends React.Component {
  updateSetting = (setting) => (e) => {
    this.props.userSettingsChange({[setting]: e.target.value});
  }
  updateChecked = (e) => {
    this.props.userSettingsChange({isPrivate: e.target.checked ? '1' : '0'});
  }
  updateUser = () => {
    if (!this.props.isSaving) {
      this.props.updateUser(this.props.user.id, this.props.screenName, this.props.email, this.props.isPrivate, this.props.description);
    }
  }

  render() {
    const className = classnames({
      'form-group': true,
      'has-feedback': this.props.screenName,
      'has-error': this.props.screenName && (this.props.screenName.length < 3 || this.props.screenName.length > 25),
      'has-success': this.props.screenName && (this.props.screenName.length >= 3 && this.props.screenName.length <= 25)
    });

    return (
      <form onSubmit={preventDefault(this.updateUser)}>
        <div className={className}>
          {
            this.props.screenName ? (
              <span className="help-block displayName-input-hint">{this.props.screenName.length} of 25</span>
            ) : false
          }
          <label htmlFor="displayName-input">Display name:</label>
          <input id="displayName-input" className="form-control" name="screenName" type="text" defaultValue={this.props.user.screenName} onChange={this.updateSetting('screenName')} maxLength="100"/>
        </div>
        <div className="form-group">
          <label htmlFor="email-input">Email:</label>
          <input id="email-input" className="form-control" name="email" type="text" defaultValue={this.props.user.email} onChange={this.updateSetting('email')}/>
        </div>
        <div className="form-group">
          <label htmlFor="description-textarea">Description:</label>
          <textarea id="description-textarea" className="form-control" name="description" defaultValue={this.props.user.description} onChange={this.updateSetting('description')} maxLength="1500"/>
        </div>
        <div className="checkbox">
          <label>
            <input type="checkbox" name="isPrivate" defaultChecked={this.props.user.isPrivate == '1' ? true : false} onChange={this.updateChecked}/>
            Private feed
            <small> (only let people I approve see my feed)</small>
          </label>
        </div>
        <p>
          <button className="btn btn-default" type="submit">Update</button>
          {this.props.isSaving ? (
            <span className="settings-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
        </p>
        {this.props.success ? (
          <div className="alert alert-info" role="alert">Updated!</div>
        ) : this.props.error ? (
          <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
        ) : false}
      </form>
    );
  }
}

import React from 'react';
import classnames from 'classnames';

import throbber16 from '../../assets/images/throbber-16.gif';
import { preventDefault } from '../utils';


const
  PUBLIC_FEED = 'PUBLIC',
  PROTECTED_FEED = 'PROTECTED',
  PRIVATE_FEED = 'PRIVATE';

export default class UserSettingsForm extends React.Component {
  constructor(props) {
    super(props);

    this.props.userSettingsChange({
      isPrivate:      this.props.user.isPrivate,
      isProtected:    this.props.user.isProtected,
      directsFromAll: this.props.user.preferences.acceptDirectsFrom === 'all',
    });
  }

  updateSetting = (setting) => (e) => {
    if (e.target.type === 'checkbox') {
      this.props.userSettingsChange({ [setting]: e.target.checked });
    } else {
      this.props.userSettingsChange({ [setting]: e.target.value });
    }
  };

  updatePrivacy = (e) => {
    if (e.target.value === PUBLIC_FEED) {
      this.props.userSettingsChange({ isProtected: '0', isPrivate: '0' });
    } else if (e.target.value === PROTECTED_FEED) {
      this.props.userSettingsChange({ isProtected: '1', isPrivate: '0' });
    } else if (e.target.value === PRIVATE_FEED) {
      this.props.userSettingsChange({ isProtected: '1', isPrivate: '1' });
    }
  };

  updateUser = () => {
    if (this.props.isSaving) {
      return;
    }

    this.props.updateUser(
      this.props.user.id,
      this.props.screenName,
      this.props.email,
      this.props.isPrivate,
      this.props.isProtected,
      this.props.description,
      undefined, // frontendPreferences will not updates
      { acceptDirectsFrom: this.props.directsFromAll ? 'all' : 'friends' },
    );
  };

  render() {
    const className = classnames({
      'form-group':   true,
      'has-feedback': this.props.screenName,
      'has-error':    this.props.screenName && (this.props.screenName.length < 3 || this.props.screenName.length > 25),
      'has-success':  this.props.screenName && (this.props.screenName.length >= 3 && this.props.screenName.length <= 25)
    });

    let feedPrivacy;
    if (this.props.isPrivate === '1') {
      feedPrivacy = PRIVATE_FEED;
    } else if (this.props.isProtected === '1') {
      feedPrivacy = PROTECTED_FEED;
    } else {
      feedPrivacy = PUBLIC_FEED;
    }

    return (
      <form onSubmit={preventDefault(this.updateUser)}>
        <div className={className}>
          {
            this.props.screenName ? (
              <span className="help-block displayName-input-hint">{this.props.screenName.length} of 25</span>
            ) : false
          }
          <label htmlFor="displayName-input">Display name:</label>
          <input id="displayName-input" className="form-control" name="screenName" type="text" defaultValue={this.props.user.screenName} onChange={this.updateSetting('screenName')} maxLength="100" />
        </div>
        <div className="form-group">
          <label htmlFor="email-input">Email:</label>
          <input id="email-input" className="form-control" name="email" type="text" defaultValue={this.props.user.email} onChange={this.updateSetting('email')} />
        </div>
        <div className="form-group">
          <label htmlFor="description-textarea">Description:</label>
          <textarea id="description-textarea" className="form-control" name="description" defaultValue={this.props.user.description} onChange={this.updateSetting('description')} maxLength="1500" />
        </div>
        <div className="form-group">
          <p>
          Your feed is:
          </p>
          <div className="radio">
            <label>
              <input
                type="radio"
                name="privacy"
                value={PUBLIC_FEED}
                checked={feedPrivacy === PUBLIC_FEED}
                onChange={this.updatePrivacy}
              />
              Public &mdash; anyone can see your posts
            </label>
          </div>
          <div className="radio">
            <label>
              <input
                type="radio"
                name="privacy"
                value={PROTECTED_FEED}
                checked={feedPrivacy === PROTECTED_FEED}
                onChange={this.updatePrivacy}
              />
              Protected &mdash; anonymous users and search engines cannot see your posts
            </label>
          </div>
          <div className="radio">
            <label>
              <input
                type="radio"
                name="privacy"
                value={PRIVATE_FEED}
                checked={feedPrivacy === PRIVATE_FEED}
                onChange={this.updatePrivacy}
              />
              Private &mdash; only people you approve can see your posts
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                name="directsFromAll"
                checked={this.props.directsFromAll || false}
                onChange={this.updateSetting('directsFromAll')}
              />
              Accept direct messages from all users
            </label>
          </div>
        </div>
        <p>
          <button className="btn btn-default" type="submit">Update</button>
          {this.props.isSaving ? (
            <span className="settings-throbber">
              <img width="16" height="16" src={throbber16} />
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

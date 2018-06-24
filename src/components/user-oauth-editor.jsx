import React from 'react';
import { connect } from 'react-redux';
import { isArray, isObject } from 'lodash';

import config from '../config';
import { linkOauthAccount, unlinkOauthAccount } from '../redux/action-creators';
import { openOauthLinkPopup } from '../services/auth';

const oauthConfig = config.auth.oauth;

function selectState(state) {
  const { authMethods } = state;

  return { authMethods };
}

function selectActions(dispatch) {
  return {
    linkOauthAccount: (...args) => dispatch(linkOauthAccount(...args)),
    unlinkOauthAccount: (...args) => dispatch(unlinkOauthAccount(...args)),
  };
}

function getProviderIcon(provider) {
  return (
    <i className={`fa fa-${provider} oauth-editor-icon`} />
  );
}

class Account extends React.PureComponent {
  handleUnlink = () => {
    this.props.onUnlink(this.props.profile.id);
  };

  render() {
    const {
      profile,
    } = this.props;

    return (
      <div className="oauth-account">
        <div className="oauth-account-logo">{getProviderIcon(profile.provider)}</div>
        <div className="oauth-account-name">{profile.displayName}</div>
        <button className="btn btn-danger oauth-account-remove" onClick={this.handleUnlink}>
          <i className="fa fa-trash" aria-hidden="true" />
        </button>
      </div>
    );
  }
}

class AddProviderButtons extends React.PureComponent {
  linkHandlers = oauthConfig.reduce((acc, provider) => {
    acc[provider] = this.props.onLink.bind(this, provider);
    return acc;
  }, {});

  render() {
    return (
      <div>
        <div><label>Add new account:</label></div>
        <div className="btn-group btn-group-lg">
          {oauthConfig.map((provider) => (
            <button className="btn btn-default" key={provider} onClick={this.linkHandlers[provider]}>
              {getProviderIcon(provider)}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

class UserSettingsOauthEditor extends React.PureComponent {
  linkAccount = async (provider) => {
    const response = await openOauthLinkPopup(provider);
    if (isObject(response.authMethods)) {
      this.props.linkOauthAccount(response.authMethods);
    } else {
      // eslint-disable-next-line no-console
      console.error(`'authMethods' field is not present in response`, response);
    }
  };

  async unlinkAccount(provider, providerId) {
    if (confirm(`Unlink ${provider} account?`)) {
      this.props.unlinkOauthAccount(provider, providerId);
    }
  }

  unlinkHandlers = oauthConfig.reduce((acc, provider) => {
    acc[provider] = this.unlinkAccount.bind(this, provider);
    return acc;
  }, {});

  render() {
    if (!isArray(oauthConfig)) {
      return null;
    }

    const { authMethods: { profiles } } = this.props;

    return (
      <div>
        <h3>External accounts</h3>
        <div>
          {profiles.map((profile, index) => (
            <Account
              key={index}
              profile={profile}
              onUnlink={this.unlinkHandlers[profile.provider]}
            />
          ))}
          <AddProviderButtons
            onLink={this.linkAccount}
          />
        </div>
      </div>
    );
  }
}

export default connect(selectState, selectActions)(UserSettingsOauthEditor);

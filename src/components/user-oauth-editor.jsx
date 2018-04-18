import React from 'react';
import { connect } from 'react-redux';
import { isArray, isObject } from 'lodash';

import config from '../config';
import { linkOauthAccount, unlinkOauthAccount } from '../redux/action-creators';
import { openOauthLinkPopup } from '../services/auth';

const oauthConfig = config.auth.oauth;

function selectState(state) {
  const { authenticated, user } = state;

  return { user, authenticated };
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

class ProviderButton extends React.PureComponent {
  handleClick = () => {
    if (this.isLinked()) {
      this.props.onUnlink();
    } else {
      this.props.onLink();
    }
  };

  isLinked() {
    const { user, provider } = this.props;
    return isObject(user.providers[provider]);
  }

  render() {
    const {
      provider,
    } = this.props;

    if (!oauthConfig.includes(provider)) {
      return null;
    }

    let className = 'btn btn-default oauth-editor-button';
    if (this.isLinked()) {
      className = 'btn btn-success oauth-editor-button';
    }

    return (
      <button className={className} onClick={this.handleClick}>
        {getProviderIcon(provider)}
      </button>
    );
  }
}

class UserSettingsOauthEditor extends React.PureComponent {
  async linkAccount(provider) {
    const response = await openOauthLinkPopup(provider);
    if (isObject(response.providers)) {
      this.props.linkOauthAccount(response.providers);
    } else {
      // eslint-disable-next-line no-console
      console.error(`'providers' field is not present in`, response);
    }
  }

  async unlinkAccount(provider) {
    if (confirm(`Unlink ${provider} account?`)) {
      this.props.unlinkOauthAccount(provider);
    }
  }

  linkHandlers = isArray(oauthConfig) && oauthConfig.reduce((acc, provider) => {
    acc[provider] = this.linkAccount.bind(this, provider);
    return acc;
  }, {});

  unlinkHandlers = isArray(oauthConfig) && oauthConfig.reduce((acc, provider) => {
    acc[provider] = this.unlinkAccount.bind(this, provider);
    return acc;
  }, {});

  render() {
    if (!isArray(oauthConfig)) {
      return null;
    }

    const { user } = this.props;

    return (
      <div>
        <h3>External accounts</h3>
        <div className="input-group">
          <div className="input-group-btn oauth-editor">
            {oauthConfig.map((provider, index) => (
              <ProviderButton
                key={index}
                user={user}
                provider={provider}
                onLink={this.linkHandlers[provider]}
                onUnlink={this.unlinkHandlers[provider]}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(selectState, selectActions)(UserSettingsOauthEditor);

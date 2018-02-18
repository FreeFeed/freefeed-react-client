import React from 'react';
import { connect } from 'react-redux';
import { isString, isArray } from 'lodash';

import config from '../config';
import { signInWithToken } from '../redux/action-creators';
import { openOauthAuthPopup } from '../services/auth';

const oauthConfig = config.auth.oauth;

function selectActions(dispatch) {
  return {
    signInWithToken: (...args) => dispatch(signInWithToken(...args)),
  };
}

class OauthButtons extends React.PureComponent {
  async signInWith(provider) {
    const response = await openOauthAuthPopup(provider);

    if (isString(response.authToken)) {
      this.props.signInWithToken(response.authToken);
    } else {
      // eslint-disable-next-line no-console
      console.error('No auth token in response', response);
    }
  }

  handleFacebook = this.signInWith.bind(this, 'facebook');
  handleGoogle = this.signInWith.bind(this, 'google');
  handleGithub = this.signInWith.bind(this, 'github');

  render() {
    if (!isArray(oauthConfig)) {
      return null;
    }

    return (
      <div className="form-group">
        {oauthConfig.includes('facebook') &&
          <button className="btn btn-default p-signin-action" onClick={this.handleFacebook}>
            <i className="fa fa-facebook" />
          </button>
        }
        {oauthConfig.includes('google') &&
          <button className="btn btn-default p-signin-action" onClick={this.handleGoogle}>
            <i className="fa fa-google" />
          </button>
        }
        {oauthConfig.includes('github') &&
          <button className="btn btn-default p-signin-action" onClick={this.handleGithub}>
            <i className="fa fa-github" />
          </button>
        }
      </div>
    );
  }
}

export default connect(() => ({}), selectActions)(OauthButtons);

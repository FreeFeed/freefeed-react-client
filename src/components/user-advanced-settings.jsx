import React from 'react';

import {getToken} from '../services/auth';

export default class UserAdvancedSettings extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showAccessToken: false
    };
  }

  toggleAccessToken = () => {
    this.setState({showAccessToken: !this.state.showAccessToken});
  }

  render() {
    return (
      <div>
        <h3>Advanced</h3>
        {!this.state.showAccessToken ? (
          <p>
            <a onClick={this.toggleAccessToken}>Show your access token</a>
          </p>
        ) : (
          <div className="bg-danger access-token-panel">
            <p>Your access token is:</p>
            <p className="access-token">{getToken()}</p>
            <p>
              <strong>WARNING:</strong> Keep your token secure at all times and do not share it with services you do not fully trust.
              They will be able to perform ANY operation on your behalf including changing your password
              and <strong>locking you out of your account</strong>.
            </p>
            <p>
              Giving your token to third party services provides them with FULL and UNLIMITED access to your account.
              You can not change the token, you cannot revert access once you give it out.
            </p>
            <p>
              If you suspect your token is being abused,
              contact <a href="mailto:freefeed.net@gmail.com">freefeed.net@gmail.com</a> <strong>immediately</strong>.
            </p>
            <p>
              (<a onClick={this.toggleAccessToken}>Hide</a>)
            </p>
          </div>
        )}
      </div>
    );
  }

}

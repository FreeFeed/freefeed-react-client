import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { pick } from 'lodash';

import { faLaptop } from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { getAppTokens } from '../../redux/action-creators';
import { Icon } from '../fontawesome-icons';
import TokenRow from './token-row';

function Tokens({ tokensStatus: status, tokenIds, getAppTokens }) {
  useEffect(() => void getAppTokens(), [getAppTokens]);

  if (status.loading) {
    return <p>Loading...</p>;
  }

  if (status.error) {
    return <div className="alert alert-danger">Can not load tokens: {status.errorText}</div>;
  }

  return (
    <>
      <p>
        <Link className="btn btn-default" to="/settings/app-tokens/create">
          Generate new token
        </Link>
      </p>
      {!tokenIds.length && <p>You have no application tokens yet.</p>}
      <div className="list-group">
        {tokenIds.map((id) => (
          <TokenRow key={id} id={id} />
        ))}
      </div>
      <p>
        <Icon icon={faQuestionCircle} />{' '}
        <Link to="/settings/app-tokens/scopes">About the token access rights and scopes</Link>
      </p>
      <p>
        <Icon icon={faLaptop} /> For developers:{' '}
        <Link to="/settings/app-tokens/create-link">Create magic link</Link>
      </p>
    </>
  );
}

export default connect((state) => pick(state.appTokens, ['tokensStatus', 'tokenIds']), {
  getAppTokens,
})(Tokens);

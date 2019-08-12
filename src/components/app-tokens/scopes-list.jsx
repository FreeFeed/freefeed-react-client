import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { pick } from 'lodash';

import { faLaptop } from '@fortawesome/free-solid-svg-icons';
import { getAppTokensScopes } from '../../redux/action-creators';
import { Icon } from '../fontawesome-icons';


function ScopesList({
  scopesStatus,
  scopes,
  getAppTokensScopes,
}) {
  useEffect(() => void (scopesStatus.success || scopesStatus.loading || getAppTokensScopes()), []);

  if (scopesStatus.loading) {
    return <p>Loading...</p>;
  }

  if (scopesStatus.error) {
    return <div className="alert alert-danger">Can not load scopes: {scopesStatus.error}</div>;
  }

  return (
    <>
      <p>
        <Icon icon={faLaptop} /> This page is for the application developers.
      </p>
      <p>
        Token access rights are defined by access scopes set.
        This page lists the API methods available in different access scopes.
      </p>
      {scopes.map((scope, i) => (
        <div key={i} className="panel panel-default">
          <div className="panel-heading"><code className="pull-right">{scope.name}</code> {scope.title}</div>
          <div className="panel-body">
            {scope.name === 'read-realtime' ? (
              <p>Token can read realtime messages.</p>
            ) : scope.routes.map((r, i) => <div key={i}><samp>{r}</samp></div>)}
          </div>
        </div>
      ))}
    </>
  );
}

export default connect(
  (state) => pick(state.appTokens, ['scopesStatus', 'scopes']),
  { getAppTokensScopes }
)(ScopesList);

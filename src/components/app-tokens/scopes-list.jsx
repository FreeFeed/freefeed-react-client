import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { pick } from 'lodash';
import snarkdown from 'snarkdown';

import { faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { getAppTokensScopes } from '../../redux/action-creators';
import { Icon } from '../fontawesome-icons';
import { descriptions } from './scopes-descriptions';
import styles from './scopes-list.module.scss';

function ScopesList({ scopesStatus, scopes, getAppTokensScopes }) {
  useEffect(() => void (scopesStatus.success || scopesStatus.loading || getAppTokensScopes()), [
    getAppTokensScopes,
    scopesStatus,
  ]);

  if (scopesStatus.loading) {
    return <p>Loading...</p>;
  }

  if (scopesStatus.error) {
    return <div className="alert alert-danger">Can not load scopes: {scopesStatus.errorText}</div>;
  }

  return (
    <>
      <p>
        Token access rights are defined by access scopes set. This page describes the access rights
        that the tokens will receive when selecting specific access scopes.
      </p>
      <p>
        From a technical point of view, each scope corresponds to a set of API methods that the
        token can access.
      </p>
      {scopes.map((scope, i) => (
        <div key={i} className="panel panel-default">
          <div className="panel-heading">
            <code className="pull-right">{scope.name}</code> {scope.title}
          </div>
          <div className="panel-body">
            {descriptions[scope.name] && (
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: snarkdown(descriptions[scope.name]) }}
              />
            )}
            <APIList>
              {scope.routes.map((r, i) => (
                <div key={i}>
                  <samp>{r}</samp>
                </div>
              ))}
            </APIList>
          </div>
        </div>
      ))}
    </>
  );
}

export default connect(
  (state) => pick(state.appTokens, ['scopesStatus', 'scopes']),
  { getAppTokensScopes },
)(ScopesList);

function APIList({ children }) {
  const [opened, setOpened] = useState(false);
  const toggle = useCallback(() => setOpened((x) => !x), []);
  return (
    <div className={styles.apiList}>
      <div>
        <a onClick={toggle}>
          <Icon icon={opened ? faCaretDown : faCaretRight} /> Allowed API methods
        </a>{' '}
        (for developers)
      </div>
      {opened && <div className={styles.apiListMethods}>{children}</div>}
    </div>
  );
}

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { signInViaExternalProvider } from '../redux/action-creators';
import { providerTitle, useExtAuthProviders } from './ext-auth-helpers';

export const ExtAuthButtons = React.memo(function ExtAuthButtons({ actionTitle = 'Sign in' }) {
  const dispatch = useDispatch();
  const [providers] = useExtAuthProviders();
  const signInStatus = useSelector((state) => state.extAuth.signInStatus);

  const doSignIn = useCallback((provider) => () => dispatch(signInViaExternalProvider(provider)), [
    dispatch,
  ]);

  if (providers.length === 0) {
    // No allowed providers so do not show anything
    return null;
  }

  return (
    <>
      <p>
        {providers.map((p) => (
          <span key={p}>
            <button
              className="btn btn-default"
              onClick={doSignIn(p)}
              disabled={signInStatus.loading}
            >
              {actionTitle} via {providerTitle(p)}
            </button>{' '}
          </span>
        ))}
      </p>
      {signInStatus.loading && (
        <p className="alert alert-info" role="alert">
          Signing in...
        </p>
      )}
      {signInStatus.error && (
        <p className="alert alert-danger" role="alert">
          {signInStatus.errorText}
        </p>
      )}
    </>
  );
});

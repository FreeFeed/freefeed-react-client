import { memo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';

import { signInViaExternalProvider, connectToExtProvider } from '../redux/action-creators';
import { extAuthPopup } from '../services/popup';
import { providerTitle, useExtAuthProviders } from './ext-auth-helpers';

export const CONNECT = 'connect';
export const SIGN_IN = 'sign-in';
export const SIGN_UP = 'sign-up';

/**
 * [FBC]
 * Facebook Container (https://addons.mozilla.org/ru/firefox/addon/facebook-container/) is a
 * Firefox extension authored and promoted by Mozilla that isolates Facebook and all its domains
 * in a separate container. Because of this extension it is not possible to sign in via Facebook
 * unless the FreeFeed site is in the same container. The following code contains some hacks to
 * indicate this situation to user.
 */

export const ExtAuthButtons = memo(function ExtAuthButtons({ mode = SIGN_IN }) {
  const dispatch = useDispatch();
  const [providers] = useExtAuthProviders();
  const status = useSelector(statusSelector[mode]);

  // [FBC] Emulate click on page to activate the extension
  useEffect(() => document.body.click(), []);

  const onClick = useCallback(
    (provider) => () => {
      // Popup must be opened synchronously to avoid being blocked by the browser
      const popup = extAuthPopup();
      dispatch(actionCreator[mode](provider.id, popup));
    },
    [dispatch, mode],
  );

  if (providers.length === 0) {
    // No allowed providers so do not show anything
    return null;
  }

  return (
    <>
      <p>
        {commonLabel[mode]}
        {providers.map((p) => (
          <span key={p.id}>
            <button
              className={cn('btn btn-default', {
                // [FBC] This class tells FBC that this button is a Facebook login button
                'fb-login-button': p.brand === 'facebook',
              })}
              onClick={onClick(p)}
              disabled={status.loading}
            >
              {btnLabel[mode]}
              {providerTitle(p)}
            </button>{' '}
          </span>
        ))}
      </p>
      {status.loading && (
        <p className="alert alert-info" role="alert">
          {progressLabel[mode]}
        </p>
      )}
      {status.error && (
        <p className="alert alert-danger" role="alert">
          {status.errorText}
        </p>
      )}
    </>
  );
});

const btnLabel = {
  [SIGN_IN]: 'Sign in via ',
  [SIGN_UP]: 'Sign up via ',
};

const commonLabel = {
  [CONNECT]: 'Connect to ',
};

const progressLabel = {
  [CONNECT]: 'Connecting...',
  [SIGN_IN]: 'Signing in...',
  [SIGN_UP]: 'Signing up...',
};

const actionCreator = {
  [CONNECT]: connectToExtProvider,
  [SIGN_IN]: signInViaExternalProvider,
  [SIGN_UP]: signInViaExternalProvider,
};

const statusSelector = {
  [CONNECT]: (state) => state.extAuth.connectStatus,
  [SIGN_IN]: (state) => state.extAuth.signInStatus,
  [SIGN_UP]: (state) => state.extAuth.signInStatus,
};

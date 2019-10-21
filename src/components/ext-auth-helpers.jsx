import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';

import { getServerInfo } from '../redux/action-creators';
import { Icon } from './fontawesome-icons';

export const useExtAuthProviders = () => {
  const dispatch = useDispatch();
  const providers = useSelector((state) => state.extAuth.providers);
  const status = useSelector((state) => state.serverInfoStatus);

  useEffect(() => void (status.initial && dispatch(getServerInfo())), [dispatch, status]);

  return [providers, status];
};

export function providerTitle(provider, { withText = true, withIcon = true } = {}) {
  switch (provider) {
    case 'facebook':
      return (
        <>
          {withIcon && <Icon icon={faFacebook} title="Facebook" />} {withText && 'Facebook'}
        </>
      );
    case 'google':
      return (
        <>
          {withIcon && <Icon icon={faGoogle} title="Google" />} {withText && 'Google'}
        </>
      );
    default:
      return (
        <>
          {withIcon && <Icon icon={faQuestion} title={provider} />} {withText && provider}
        </>
      );
  }
}

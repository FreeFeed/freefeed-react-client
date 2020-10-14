import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faKey } from '@fortawesome/free-solid-svg-icons';

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
  let icon;
  if (provider.brand === 'google') {
    icon = faGoogle;
  } else if (provider.brand === 'facebook') {
    icon = faFacebook;
  } else {
    icon = faKey;
  }
  return (
    <>
      {withIcon && <Icon icon={icon} title={provider.title} />} {withText && provider.title}
    </>
  );
}

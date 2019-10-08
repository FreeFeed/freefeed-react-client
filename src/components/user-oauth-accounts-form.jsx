import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { intersection } from 'lodash';

import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faTimes, faQuestion, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import config from '../config';
import {
  getServerInfo,
  getExtAuthProfiles,
  connectToExtProvider,
  unlinkExternalProfile,
} from '../redux/action-creators';
import { combineAsyncStates, initialAsyncState } from '../redux/async-helpers';
import { Icon } from './fontawesome-icons';
import { Throbber } from './throbber';

const userExtAuthFormSelector = (state) => {
  const allowedProviders = intersection(
    config.auth.oAuthProviders || [],
    state.serverInfo.externalAuthProviders || [],
  );
  return {
    // Load statuses
    loadStatus: combineAsyncStates(state.serverInfoStatus, state.extAuth.profilesStatus),
    serverInfoStatus: state.serverInfoStatus,
    existingProfilesStatus: state.extAuth.profilesStatus,

    // Data
    oAuthProviders: allowedProviders,
    existingProfiles: state.extAuth.profiles.filter((p) => allowedProviders.includes(p.provider)),
  };
};

export const UserExtAuthForm = connect(userExtAuthFormSelector)(function UserOAuthAccountsForm({
  loadStatus,
  serverInfoStatus,
  existingProfilesStatus,
  oAuthProviders,
  existingProfiles,
  dispatch,
}) {
  useEffect(() => void (serverInfoStatus.initial && dispatch(getServerInfo())), [
    serverInfoStatus,
    dispatch,
  ]);

  useEffect(() => void (existingProfilesStatus.initial && dispatch(getExtAuthProfiles())), [
    dispatch,
    existingProfilesStatus,
  ]);

  if (config.auth.oAuthProviders.length === 0) {
    // External authentication is disabled so do not show anything
    return null;
  }

  return (
    <>
      <h3>Connected social network profiles</h3>
      <p>
        You can use these profiles to sign in to FreeFeed. This will not let FreeFeed do anything on
        your behalf on external sites.
      </p>
      {(loadStatus.loading || loadStatus.initial) && (
        <p>
          <em>Loading...</em>
        </p>
      )}
      {loadStatus.error && (
        <p className="alert alert-danger" role="alert">
          {loadStatus.errorText}
        </p>
      )}
      {loadStatus.success && (
        <>
          {existingProfiles.length === 0 && (
            <p>You don&#x2019;t have any connected profiles yet.</p>
          )}
          {existingProfiles.map((profile) => (
            <ConnectedProfile key={profile.id} profile={profile} />
          ))}
          <ConnectButtons providers={oAuthProviders} />
        </>
      )}
      <hr />
    </>
  );
});

const connectedProfileSelector = (state, { profile }) => ({
  disconnectStatus: state.extAuth.disconnectStatuses[profile.id] || initialAsyncState,
});

const ConnectedProfile = connect(connectedProfileSelector)(function ConnectedProfile({
  profile,
  disconnectStatus,
  dispatch,
}) {
  const doUnlink = useCallback(
    (profileId) => () =>
      confirm('Are you sure you want to disconnect this profile?') &&
      dispatch(unlinkExternalProfile(profileId)),
    [dispatch],
  );

  return (
    <p>
      {providerTitle(profile.provider, false)} {profile.title}{' '}
      <button
        className="btn btn-default btn-sm"
        onClick={doUnlink(profile.id)}
        disabled={disconnectStatus.loading}
      >
        <Icon icon={faTimes} /> Disconnect
      </button>
      {disconnectStatus.loading && <Throbber />}
      {disconnectStatus.error && (
        <>
          {' '}
          <Icon icon={faExclamationTriangle} className="post-like-fail" />{' '}
          {disconnectStatus.errorText}
        </>
      )}
    </p>
  );
});

const connectButtonsSelector = (state) => ({ connectStatus: state.extAuth.connectStatus });

const ConnectButtons = connect(connectButtonsSelector)(function ConnectButtons({
  providers,
  connectStatus,
  dispatch,
}) {
  const doLink = useCallback((provider) => () => dispatch(connectToExtProvider(provider)), [
    dispatch,
  ]);

  if (providers.length === 0) {
    return <p>No supported identity providers.</p>;
  }

  return (
    <>
      <p>
        Connect to{' '}
        {providers.map((p) => (
          <span key={p}>
            <button
              className="btn btn-default"
              onClick={doLink(p)}
              disabled={connectStatus.loading}
            >
              {providerTitle(p)}
            </button>{' '}
          </span>
        ))}
      </p>
      {connectStatus.loading && (
        <p className="alert alert-info" role="alert">
          Connecting...
        </p>
      )}
      {connectStatus.error && (
        <p className="alert alert-danger" role="alert">
          {connectStatus.errorText}
        </p>
      )}
    </>
  );
});

function providerTitle(provider, withText = true) {
  switch (provider) {
    case 'facebook':
      return (
        <>
          <Icon icon={faFacebook} title="Facebook" /> {withText && 'Facebook'}
        </>
      );
    case 'google':
      return (
        <>
          <Icon icon={faGoogle} title="Google" /> {withText && 'Google'}
        </>
      );
    default:
      return (
        <>
          <Icon icon={faQuestion} title={provider} /> {withText && provider}
        </>
      );
  }
}

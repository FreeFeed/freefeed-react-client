/* global CONFIG */
import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';

import { Helmet } from 'react-helmet';
import { updateGroupPicture } from '../redux/action-creators';
import { initialAsyncState } from '../redux/async-helpers';
import { PictureEditForm } from './settings/forms/profile-picture';
import GroupSettingsForm from './group-settings-form';
import settingsStyles from './settings/settings.module.scss';

export default function GroupSettings({ params: { userName: username } }) {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.id);
  const group = useSelector((state) => _.find(state.users, { username }));
  const loadStatus = useSelector(
    (state) => state.getUserInfoStatuses[username] || initialAsyncState,
  );
  const pictureStatus = useSelector(
    (state) => state.updateGroupPictureStatuses[username] || initialAsyncState,
  );
  const pictureUpdate = useCallback((file) => dispatch(updateGroupPicture(username, file)), [
    dispatch,
    username,
  ]);
  const amIAdmin = useMemo(() => group && group.administrators.includes(userId), [group, userId]);

  if (!group && loadStatus.loading) {
    return (
      <Layout username={username}>
        <p>Loading...</p>
      </Layout>
    );
  }
  if (loadStatus.error) {
    return (
      <Layout username={username}>
        <p className="alert alert-danger">Loading error: {loadStatus.errorText}</p>
      </Layout>
    );
  }
  if (!amIAdmin) {
    return (
      <Layout username={username}>
        <p className="alert alert-danger">You aren&#x2019;t an administrator of this group</p>
      </Layout>
    );
  }

  return (
    <Layout username={username}>
      <section className={settingsStyles.formSection}>
        <h3>
          Group: <Link to={`/${username}`}>{username}</Link>
        </h3>
      </section>

      <section className={settingsStyles.formSection}>
        <PictureEditForm
          pictureURL={group.profilePictureLargeUrl}
          pictureStatus={pictureStatus}
          onUpdate={pictureUpdate}
        />
      </section>

      <GroupSettingsForm username={username} />
    </Layout>
  );
}

function Layout({ username, children }) {
  return (
    <div className="box">
      <Helmet title={`'${username}' group settings - ${CONFIG.siteTitle}`} />
      <div className="box-header-timeline">Group settings</div>
      <div className="box-body">{children}</div>
    </div>
  );
}

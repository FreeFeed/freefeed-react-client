import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNouter } from '../services/nouter';

import { pluralForm } from '../utils';
import CreatePost from './create-post';
import ErrorBoundary from './error-boundary';
import { UserProfileHead } from './user-profile-head';
import { SubscriptionRequestsAlert } from './susbscription-requests-alert';

export default function UserProfile({ allowToPost }) {
  const {
    authenticated,
    isLoading,
    isItMe,
    foundUser,
    canIPostHere,
    whyCannotPost,
    groupRequestsCount,
    sendTo,
  } = useUserProfileData(allowToPost);

  return (
    <div>
      <ErrorBoundary>
        {isItMe && !isLoading ? <SubscriptionRequestsAlert /> : false}

        {groupRequestsCount > 0 && (
          <p className="subscriptions-request-alert">
            <span className="message">
              You have{' '}
              <Link to="/groups">{pluralForm(groupRequestsCount, 'subscription request')}</Link> to
              this group
            </span>
          </p>
        )}

        <UserProfileHead />

        {canIPostHere && <CreatePost key={`profile:${foundUser.username}`} sendTo={sendTo} />}

        {whyCannotPost && <p className="alert alert-warning">{whyCannotPost}</p>}

        {authenticated && !canIPostHere && foundUser?.isRestricted === '1' && (
          <div className="create-post create-post-restricted">
            Only administrators can post to this group.
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

function useUserProfileData(allowToPost) {
  const { params } = useNouter();
  const username = params.userName.toLowerCase();

  const authenticated = useSelector((state) => state.authenticated);
  const currentUser = useSelector((state) => state.user);
  const isLoading = useSelector((state) => state.routeLoadingState);
  const managedGroups = useSelector((state) => state.managedGroups);
  const sendToBase = useSelector((state) => state.sendTo);

  const foundUser = useSelector((state) =>
    Object.values(state.users).find((u) => u.username === username),
  );

  const isItMe = foundUser ? foundUser.username === currentUser.username : false;

  const amIGroupAdmin =
    authenticated &&
    foundUser &&
    foundUser.type === 'group' &&
    (foundUser.administrators || []).includes(currentUser.id);

  const subscribed = authenticated && foundUser && currentUser.subscriptions.includes(foundUser.id);
  const shouldIPostToGroup = subscribed && (foundUser.isRestricted === '0' || amIGroupAdmin);

  const canIPostHere = (foundUser?.youCan.includes('post') ?? false) && allowToPost;

  const whyCannotPost =
    shouldIPostToGroup && foundUser.theyDid.includes('block')
      ? 'You are blocked in this group'
      : null;

  const groupRequestsCount =
    foundUser?.type === 'group' && authenticated
      ? (managedGroups.find((g) => g.id === foundUser.id) || { requests: [] }).requests.length
      : 0;

  const sendTo = useMemo(
    () => ({ ...sendToBase, defaultFeed: foundUser ? foundUser.username : null }),
    [sendToBase, foundUser],
  );

  return {
    authenticated,
    isLoading,
    isItMe,
    foundUser,
    canIPostHere,
    whyCannotPost,
    groupRequestsCount,
    sendTo,
  };
}

/* global CONFIG */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import { inject as injectParams } from 'regexparam';

import { initialAsyncState } from '../redux/async-helpers';
import { apiVersion } from '../services/api-version';
import { withNouter } from '../services/nouter';
import { postActions } from './select-utils';
import FeedOptionsSwitch from './feed-options-switch';
import Breadcrumbs from './breadcrumbs';
import ErrorBoundary from './error-boundary';
import UserProfile from './user-profile';
import UserFeed from './user-feed';
import { ButtonLink } from './button-link';
import { useResolvedRoutes } from '../services/nouter/hooks';

const UserHandler = (props) => {
  // Redirect to canonical username in URI (/uSErNAme/likes?offset=30 → /username/likes?offset=30)
  const resolvedRoutes = useResolvedRoutes();
  const {
    router: { params, location, navigate },
    viewUser,
  } = props;
  useEffect(() => {
    if (
      !viewUser.isLoading &&
      viewUser.username &&
      params.userName &&
      viewUser.username !== params.userName
    ) {
      const userRoute = resolvedRoutes.find((route) => route.name === 'userFeed');
      if (userRoute) {
        const newPath = injectParams(userRoute.pattern, { ...params, userName: viewUser.username });
        navigate(newPath + location.search, { replace: true });
      }
    }
  }, [navigate, location.search, params, viewUser.isLoading, viewUser.username, resolvedRoutes]);

  const [forceShowContent, setForceShowContent] = useState(false);
  const displayPosts = useCallback(() => setForceShowContent(true), []);

  const allowToPost =
    !CONFIG.privacyControlGroups.hidePosts ||
    !CONFIG.privacyControlGroups.groups[viewUser.username];
  const showContent =
    forceShowContent ||
    !CONFIG.privacyControlGroups.hidePosts ||
    !CONFIG.privacyControlGroups.groups[viewUser.username];
  const controlledPrivacy = CONFIG.privacyControlGroups.groups[viewUser.username]?.privacy;

  const nameForTitle = useMemo(
    () =>
      viewUser.username === viewUser.screenName
        ? viewUser.username
        : `${viewUser.screenName} (${viewUser.username})`,
    [viewUser.screenName, viewUser.username],
  );

  return (
    <div className="box">
      <ErrorBoundary>
        {props.viewUser.id && (
          <Helmet>
            <link
              rel="alternate"
              type="application/rss+xml"
              title={
                viewUser.type === 'user'
                  ? `Posts of ${viewUser.username}`
                  : `Posts in group ${viewUser.username}`
              }
              href={`${CONFIG.api.root}/v${apiVersion}/timelines-rss/${viewUser.username}`}
            />
            <title>
              {nameForTitle} - {CONFIG.siteTitle}
            </title>
          </Helmet>
        )}

        <div className="box-header-timeline" role="heading">
          {props.boxHeader}
          <div className="pull-right">
            <FeedOptionsSwitch />
          </div>
        </div>

        <div className="box-body">
          {props.breadcrumbs.shouldShowBreadcrumbs ? <Breadcrumbs {...props.breadcrumbs} /> : false}

          <UserProfile allowToPost={allowToPost} />
        </div>

        {showContent ? (
          <UserFeed {...props} />
        ) : (
          <div className="alert alert-warning">
            <p>
              This is a <strong>{viewUser.username}</strong> group page. This is a special group
              that is used for changing the visibility of posts in other feeds to “
              {controlledPrivacy}”.
            </p>
            <p>
              The posts in this group itself are random and are not organized around any specific
              topic.
            </p>
            <p>
              Do you still want to see them?{' '}
              <ButtonLink onClick={displayPosts}>Yes, show me posts</ButtonLink>
            </p>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};

// eslint-disable-next-line complexity
function selectState(state, ownProps) {
  const { authenticated, boxHeader, timelines, user } = state;
  const anonymous = !authenticated;

  const paramsUserName = ownProps.router.params.userName.toLowerCase();
  const foundUser =
    (state.feedViewState.timeline && state.users[state.feedViewState.timeline.user]) ||
    Object.values(state.users).find((user) => user.username === paramsUserName);

  const amIGroupAdmin =
    authenticated &&
    foundUser &&
    foundUser.type === 'group' &&
    (foundUser.administrators || []).includes(state.user.id);

  const currentRouteName = ownProps.router.name;
  const isItPostsPage = !['userComments', 'userLikes'].includes(currentRouteName);

  const statusExtension = {
    authenticated,
    isLoading: state.routeLoadingState,
    isUserFound: !!foundUser,
    isItMe: foundUser ? foundUser.username === user.username : false,
    subscribingStatus:
      state.userActionsStatuses.subscribing[foundUser && foundUser.id] || initialAsyncState,
    blockingStatus:
      state.userActionsStatuses.blocking[foundUser && foundUser.id] || initialAsyncState,
    pinnedStatus: state.userActionsStatuses.pinned[foundUser && foundUser.id] || initialAsyncState,
    isItPostsPage,
    amIGroupAdmin,
    subscribed: authenticated && foundUser && user.subscriptions.includes(foundUser.id),
    subscribedToMe:
      authenticated && foundUser && _.findIndex(state.user.subscribers, { id: foundUser.id }) > -1,
    blocked: authenticated && foundUser && user.banIds.includes(foundUser.id),
    hasRequestBeenSent:
      authenticated && foundUser && (user.pendingSubscriptionRequests || []).includes(foundUser.id),
    canAcceptDirects: foundUser?.youCan.includes('dm') ?? false,
    pinned:
      authenticated &&
      foundUser &&
      (user.frontendPreferences.pinnedGroups || []).includes(foundUser.id),
    managedGroups: state.managedGroups,
  };

  statusExtension.canISeeSubsList =
    statusExtension.isUserFound &&
    (!anonymous || foundUser.isProtected === '0') &&
    (foundUser.isPrivate === '0' || statusExtension.subscribed || statusExtension.isItMe);

  const shouldIPostToGroup =
    statusExtension.subscribed && (foundUser.isRestricted === '0' || amIGroupAdmin);

  statusExtension.canIPostHere = foundUser?.youCan.includes('post') ?? false;

  if (shouldIPostToGroup && foundUser.theyDid.includes('block')) {
    statusExtension.whyCannotPost = 'You are blocked in this group';
  }

  const viewUser = { ...foundUser, ...statusExtension };

  const breadcrumbs = {
    shouldShowBreadcrumbs: !isItPostsPage,
    user: viewUser,
    breadcrumb: currentRouteName.replace('user', ''),
  };

  const showSummaryHeader = currentRouteName === 'userSummary';

  return {
    user,
    timelines,
    boxHeader,
    showSummaryHeader,
    viewUser,
    breadcrumbs,
  };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
  };
}

export default withNouter(connect(selectState, selectActions)(UserHandler));

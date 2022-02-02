/* global CONFIG */
import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import _ from 'lodash';
import { formatPattern } from 'react-router/es/PatternUtils';

import {
  createPost,
  resetPostCreateForm,
  expandSendTo,
  getUserInfo,
  togglePinnedGroup,
} from '../redux/action-creators';
import { getCurrentRouteName } from '../utils';
import { initialAsyncState } from '../redux/async-helpers';
import { postActions, userActions, canAcceptDirects } from './select-utils';
import FeedOptionsSwitch from './feed-options-switch';
import Breadcrumbs from './breadcrumbs';
import ErrorBoundary from './error-boundary';
import UserProfile from './user-profile';
import UserFeed from './user-feed';

const UserHandler = (props) => {
  // Redirect to canonical username in URI (/uSErNAme/likes?offset=30 → /username/likes?offset=30)
  useEffect(() => {
    if (
      !props.viewUser.isLoading &&
      props.viewUser.username &&
      props.routeParams.userName &&
      props.viewUser.username !== props.routeParams.userName
    ) {
      const newPath = formatPattern(props.route.path, {
        ...props.routeParams,
        userName: props.viewUser.username,
      });
      props.router.replace(newPath + props.location.search);
    }
  }, [
    props.location.search,
    props.route.path,
    props.routeParams,
    props.routeParams.userName,
    props.router,
    props.viewUser.isLoading,
    props.viewUser.username,
  ]);

  const nameForTitle = useMemo(
    () =>
      props.viewUser.username === props.viewUser.screenName
        ? props.viewUser.username
        : `${props.viewUser.screenName} (${props.viewUser.username})`,
    [props.viewUser.screenName, props.viewUser.username],
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
                props.viewUser.type === 'user'
                  ? `Posts of ${props.viewUser.username}`
                  : `Posts in group ${props.viewUser.username}`
              }
              href={`${CONFIG.api.root}/v2/timelines-rss/${props.viewUser.username}`}
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

          <UserProfile
            {...props.viewUser}
            {...props.userActions}
            user={props.user}
            sendTo={props.sendTo}
            expandSendTo={props.expandSendTo}
            createPostViewState={props.createPostViewState}
            createPost={props.createPost}
            resetPostCreateForm={props.resetPostCreateForm}
            addAttachmentResponse={props.addAttachmentResponse}
            getUserInfo={props.getUserInfo}
            togglePinnedGroup={props.togglePinnedGroup}
            showMedia={props.showMedia}
          />
        </div>

        <UserFeed {...props} />
      </ErrorBoundary>
    </div>
  );
};

// eslint-disable-next-line complexity
function selectState(state, ownProps) {
  const { authenticated, boxHeader, createPostViewState, timelines, user } = state;
  const anonymous = !authenticated;

  const foundUser =
    (state.feedViewState.timeline && state.users[state.feedViewState.timeline.user]) ||
    Object.values(state.users).find(
      (user) => user.username === ownProps.params.userName.toLowerCase(),
    );

  const amIGroupAdmin =
    authenticated &&
    foundUser &&
    foundUser.type === 'group' &&
    (foundUser.administrators || []).includes(state.user.id);

  const currentRouteName = getCurrentRouteName(ownProps);
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
    canAcceptDirects: canAcceptDirects(foundUser, state),
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

  const canIPostToGroup =
    statusExtension.subscribed && (foundUser.isRestricted === '0' || amIGroupAdmin);

  statusExtension.canIPostHere =
    statusExtension.isUserFound &&
    ((statusExtension.isItMe && isItPostsPage) || (foundUser.type === 'group' && canIPostToGroup));

  const viewUser = { ...foundUser, ...statusExtension };

  const breadcrumbs = {
    shouldShowBreadcrumbs: !isItPostsPage,
    user: viewUser,
    breadcrumb: currentRouteName.replace('user', ''),
  };

  const sendTo = { ...state.sendTo, defaultFeed: foundUser ? foundUser.username : null };

  const showSummaryHeader = currentRouteName === 'userSummary';

  return {
    user,
    timelines,
    createPostViewState,
    boxHeader,
    showSummaryHeader,
    viewUser,
    breadcrumbs,
    sendTo,
  };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (feeds, postText, attachmentIds, more) =>
      dispatch(createPost(feeds, postText, attachmentIds, more)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    expandSendTo: () => dispatch(expandSendTo()),
    userActions: userActions(dispatch),
    getUserInfo: (username) => dispatch(getUserInfo(username)),
    togglePinnedGroup: ({ id }) => dispatch(togglePinnedGroup(id)),
  };
}

export default connect(selectState, selectActions)(UserHandler);

import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import _ from 'lodash';

import { createPost, resetPostCreateForm, expandSendTo, getUserInfo } from '../redux/action-creators';
import { getCurrentRouteName } from '../utils';
import config from '../config';
import { joinPostData, joinCreatePostData, postActions, userActions, canAcceptDirects } from './select-utils';
import FeedOptionsSwitch from './feed-options-switch';
import Breadcrumbs from './breadcrumbs';
import UserProfile from './user-profile';
import UserFeed from './user-feed';


const UserHandler = (props) => {
  return (
    <div className="box">
      {props.viewUser.id && (
        <Helmet>
          <link
            rel="alternate"
            type="application/rss+xml"
            title={props.viewUser.type === 'user' ? `Posts of ${props.viewUser.username}` : `Posts in group ${props.viewUser.username}`}
            href={`${config.api.host}/v2/timelines-rss/${props.viewUser.username}`}
          />
        </Helmet>
      )}

      <div className="box-header-timeline">
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
          createPostForm={props.createPostForm}
          addAttachmentResponse={props.addAttachmentResponse}
          removeAttachment={props.removeAttachment}
          reorderImageAttachments={props.reorderImageAttachments}
          getUserInfo={props.getUserInfo}
        />
      </div>

      <UserFeed {...props} />
    </div>
  );
};

function selectState(state, ownProps) {
  const { authenticated, boxHeader, createPostViewState, timelines, user } = state;
  const anonymous = !authenticated;
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));
  const createPostForm = joinCreatePostData(state);
  const [foundUser] = Object.getOwnPropertyNames(state.users)
    .map((key) => state.users[key] || state.subscribers[key])
    .filter((user) => user.username === ownProps.params.userName);

  const amIGroupAdmin = (
    authenticated &&
    foundUser &&
    foundUser.type === 'group' &&
    ((foundUser.administrators || []).indexOf(state.user.id) > -1)
  );

  const currentRouteName = getCurrentRouteName(ownProps);
  const isItPostsPage = ['userComments', 'userLikes'].indexOf(currentRouteName) === -1;

  const statusExtension = {
    authenticated,
    isLoading:          state.routeLoadingState,
    isUserFound:        !!foundUser,
    isItMe:             (foundUser ? foundUser.username === user.username : false),
    userView:           ((foundUser && state.userViews[foundUser.id]) || {}),
    isItPostsPage,
    amIGroupAdmin,
    subscribed:         authenticated && foundUser && (user.subscriptions.indexOf(foundUser.id) > -1),
    subscribedToMe:     authenticated && foundUser && (_.findIndex(state.user.subscribers, { id: foundUser.id }) > -1),
    blocked:            authenticated && foundUser && (user.banIds.indexOf(foundUser.id) > -1),
    hasRequestBeenSent: authenticated && foundUser && ((user.pendingSubscriptionRequests || []).indexOf(foundUser.id) > -1),
    canAcceptDirects:   canAcceptDirects(foundUser, state),
  };

  statusExtension.canISeeSubsList = statusExtension.isUserFound &&
    (!anonymous || foundUser.isProtected === '0') &&
    (foundUser.isPrivate === '0' || statusExtension.subscribed || statusExtension.isItMe);

  const canIPostToGroup = statusExtension.subscribed && (foundUser.isRestricted === '0' || amIGroupAdmin);

  statusExtension.canIPostHere = statusExtension.isUserFound &&
    ((statusExtension.isItMe && isItPostsPage) || (foundUser.type === 'group' && canIPostToGroup));

  const viewUser = { ...(foundUser), ...statusExtension };

  const breadcrumbs = {
    shouldShowBreadcrumbs: !isItPostsPage,
    user:                  viewUser,
    breadcrumb:            currentRouteName.replace('user', '')
  };

  const sendTo = { ...state.sendTo, defaultFeed: (foundUser ? foundUser.username : null) };

  const showSummaryHeader = (currentRouteName === 'userSummary');

  return { user, visibleEntries, timelines, createPostViewState, createPostForm, boxHeader, showSummaryHeader, viewUser, breadcrumbs, sendTo };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost:          (feeds, postText, attachmentIds, more) => dispatch(createPost(feeds, postText, attachmentIds, more)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    expandSendTo:        () => dispatch(expandSendTo()),
    userActions:         userActions(dispatch),
    getUserInfo:         (username) => dispatch(getUserInfo(username)),
  };
}

export default connect(selectState, selectActions)(UserHandler);

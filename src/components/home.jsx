import React, { memo } from 'react';
import { connect, useSelector } from 'react-redux';
import { Link } from 'react-router';

import {
  createPost,
  resetPostCreateForm,
  expandSendTo,
  toggleHiddenPosts,
} from '../redux/action-creators';
import { pluralForm } from '../utils';
import { postActions } from './select-utils';
import CreatePost from './create-post';
import Feed from './feed';
import PaginatedView from './paginated-view';
import FeedOptionsSwitch from './feed-options-switch';
import Welcome from './welcome';
import ErrorBoundary from './error-boundary';

const FeedHandler = (props) => {
  const createPostComponent = (
    <CreatePost
      createPostViewState={props.createPostViewState}
      sendTo={props.sendTo}
      user={props.user}
      createPost={props.createPost}
      resetPostCreateForm={props.resetPostCreateForm}
      expandSendTo={props.expandSendTo}
      addAttachmentResponse={props.addAttachmentResponse}
      showMedia={props.showMedia}
    />
  );

  return (
    <div className="box">
      <ErrorBoundary>
        <div className="box-header-timeline">
          {props.boxHeader}
          <div className="pull-right">{props.authenticated && <FeedOptionsSwitch />}</div>
        </div>

        <SubscrRequests />

        {props.authenticated ? (
          <PaginatedView firstPageHead={createPostComponent} {...props}>
            <Feed {...props} isInHomeFeed={!props.feedIsLoading} />
          </PaginatedView>
        ) : (
          <Welcome />
        )}
        <div className="box-footer" />
      </ErrorBoundary>
    </div>
  );
};

function selectState(state) {
  const { authenticated, boxHeader, createPostViewState, timelines, user } = state;

  const sendTo = { ...state.sendTo, defaultFeed: user.username };
  const feedIsLoading = state.routeLoadingState;

  return {
    user,
    authenticated,
    createPostViewState,
    timelines,
    boxHeader,
    sendTo,
    feedIsLoading,
  };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (feeds, postText, attachmentIds, more) =>
      dispatch(createPost(feeds, postText, attachmentIds, more)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    expandSendTo: () => dispatch(expandSendTo()),
    toggleHiddenPosts: () => dispatch(toggleHiddenPosts()),
  };
}

export default connect(selectState, selectActions)(FeedHandler);

export const SubscrRequests = memo(function SubscrRequests() {
  const userRequestsCount = useSelector((state) => state.userRequestsCount);
  const groupRequestsCount = useSelector((state) => state.groupRequestsCount);

  const uLink = userRequestsCount && (
    <Link key="uLink" to="/friends">
      {pluralForm(userRequestsCount, 'subscription request')}
    </Link>
  );

  const gLink = groupRequestsCount && (
    <Link key="gLink" to="/groups">
      {pluralForm(groupRequestsCount, 'group subscription request')}
    </Link>
  );

  const links = [uLink, gLink].filter(Boolean);
  if (links.length === 0) {
    return null;
  }

  return (
    <div className="box-message alert alert-info">
      <span className="message">
        <span>
          <span>You have </span>
          {links.map((link, i) => (
            <>
              {i > 0 && ' and '}
              {link}
            </>
          ))}
        </span>
      </span>
    </div>
  );
});

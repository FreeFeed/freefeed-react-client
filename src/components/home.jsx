import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { createPost, resetPostCreateForm, expandSendTo, toggleHiddenPosts } from '../redux/action-creators';
import { pluralForm } from '../utils';
import { joinPostData, joinCreatePostData, postActions } from './select-utils';
import CreatePost from './create-post';
import Feed from './feed';
import PaginatedView from './paginated-view';
import RealtimeSwitch from './realtime-switch';
import Welcome from './welcome';

const FeedHandler = (props) => {
  const createPostComponent = (
    <CreatePost
      createPostViewState={props.createPostViewState}
      sendTo={props.sendTo}
      user={props.user}
      createPost={props.createPost}
      resetPostCreateForm={props.resetPostCreateForm}
      expandSendTo={props.expandSendTo}
      createPostForm={props.createPostForm}
      addAttachmentResponse={props.addAttachmentResponse}
      removeAttachment={props.removeAttachment}/>
  );

  const { userRequestsCount, groupRequestsCount } = props;
  const totalRequestsCount = userRequestsCount + groupRequestsCount;

  const userRequestsText = pluralForm(userRequestsCount, 'subscription request');
  const groupRequestsText = pluralForm(groupRequestsCount, 'group subscription request');
  const bothRequestsDisplayed = userRequestsCount > 0 && groupRequestsCount > 0;

  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
        <div className='pull-right'>
          {props.areOnFirstHomePage && props.authenticated ? <RealtimeSwitch/> : false}
        </div>
      </div>

      {props.authenticated && totalRequestsCount > 0 ? (
        <div className="box-message alert alert-info">
          <span className="message">
            {totalRequestsCount > 0 ? (
              <span>
                <span>You have </span>
                {userRequestsCount > 0 ? (<Link to="/friends">{userRequestsText}</Link>) : false}
                {bothRequestsDisplayed ? (<span> and </span>) : false}
                {groupRequestsCount > 0 ? (<Link to="/groups">{groupRequestsText}</Link>) : false}
              </span>
            ) : false}
          </span>
        </div>
      ) : false}

      {props.authenticated ? (
        <PaginatedView firstPageHead={createPostComponent} {...props}>
          <Feed {...props} isInHomeFeed={!props.feedIsLoading}/>
        </PaginatedView>
      ) : (
        <Welcome/>
      )}
      <div className='box-footer'>
      </div>
    </div>);
};

function selectState(state) {
  const { authenticated, boxHeader, createPostViewState, groupRequestsCount, timelines, user, userRequestsCount } = state;

  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));
  const hiddenEntries = state.feedViewState.hiddenEntries.map(joinPostData(state));
  const { isHiddenRevealed } = state.feedViewState;
  const createPostForm = joinCreatePostData(state);
  const sendTo = { ...state.sendTo, defaultFeed: user.username };
  const feedIsLoading = state.routeLoadingState;

  return {
    user, authenticated,
    visibleEntries, hiddenEntries, isHiddenRevealed,
    createPostViewState, createPostForm,
    timelines, boxHeader, sendTo, userRequestsCount, groupRequestsCount,
    feedIsLoading,
    areOnFirstHomePage: !state.routing.locationBeforeTransitions.query.offset,
  };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (feeds, postText, attachmentIds, more) => dispatch(createPost(feeds, postText, attachmentIds, more)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    expandSendTo: () => dispatch(expandSendTo()),
    toggleHiddenPosts: () => dispatch(toggleHiddenPosts())
  };
}

export default connect(selectState, selectActions)(FeedHandler);

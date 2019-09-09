import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { pluralForm } from '../utils';

import {
  acceptUserRequest, rejectUserRequest,
  revokeSentRequest
} from '../redux/action-creators';
import { tileUserListFactory, PLAIN, WITH_REQUEST_HANDLES, WITH_REVOKE_SENT_REQUEST } from './tile-user-list';
import ErrorBoundary from './error-boundary';


const TileList = tileUserListFactory({ type: PLAIN, displayQuantity: true });
const TileListWithAcceptAndReject = tileUserListFactory({ type: WITH_REQUEST_HANDLES, displayQuantity: true });
const TileListWithRevoke = tileUserListFactory({ type: WITH_REVOKE_SENT_REQUEST, displayQuantity: true });

const FriendsHandler = (props) => {
  const feedRequestsHeader = `Subscription ${pluralForm(props.feedRequests.length, 'request', null, 'w')}`;
  const sentRequestsHeader = `Sent ${pluralForm(props.sentRequests.length, 'request', null, 'w')}`;

  return (
    <div className="box">
      <ErrorBoundary>
        <div className="box-header-timeline">
          Friends
        </div>
        <div className="box-body">
          <TileListWithAcceptAndReject
            header={feedRequestsHeader}
            users={props.feedRequests}
            acceptRequest={props.acceptUserRequest}
            rejectRequest={props.rejectUserRequest}
          />


          <TileList {...props.mutual} />
          <TileList {...props.subscriptions} />
          <TileList {...props.blockedByMe} />

          <TileListWithRevoke
            header={sentRequestsHeader}
            users={props.sentRequests}
            revokeSentRequest={props.revokeSentRequest}
          />
        </div>
        <div className="box-footer" />
      </ErrorBoundary>
    </div>
  );
};

function calculateMutual(subscriptions, subscribers) {
  if (
    subscribers.isPending || subscriptions.isPending ||
    subscribers.errorString || subscriptions.errorString
  ) {
    return { users: [] };
  }

  const mutual = _.intersectionWith(
    subscriptions.payload.filter((u) => u.type === 'user'),
    subscribers.payload,
    (a, b) => a.id == b.id
  );

  return {
    header: 'Friends',
    users:  mutual
  };
}

function selectState(state) {
  const feedRequests = state.userRequests;
  // const sortingRule = 'username';

  const mutual = calculateMutual(
    state.usernameSubscriptions,
    state.usernameSubscribers
  );

  const mutualIds = _.map(mutual.users, (f) => f.id);
  const subscriptionList = _.filter(state.usernameSubscriptions.payload.filter((u) => u.type === 'user'), (f) => mutualIds.indexOf(f.id) === -1);

  const subscriptions = {
    header: 'Subscriptions',
    users:  subscriptionList
  };
  const blockedByMe = {
    header: 'Blocked',
    users:  state.usernameBlockedByMe.payload
  };
  const { sentRequests } = state;

  return { feedRequests, subscriptions, mutual, blockedByMe, sentRequests };
}

function selectActions(dispatch) {
  return {
    acceptUserRequest: (...args) => dispatch(acceptUserRequest(...args)),
    rejectUserRequest: (...args) => dispatch(rejectUserRequest(...args)),
    revokeSentRequest: (...args) => dispatch(revokeSentRequest(...args))
  };
}

export default connect(selectState, selectActions)(FriendsHandler);

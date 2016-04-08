import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';

import {pluralForm} from '../utils';

import {acceptUserRequest, rejectUserRequest,
        revokeSentRequest} from '../redux/action-creators';
import {tileUserListFactory, PLAIN, WITH_REQUEST_HANDLES, WITH_REVOKE_SENT_REQUEST} from './tile-user-list';

const TileList = tileUserListFactory({type: PLAIN, displayQuantity: true});
const TileListWithAcceptAndReject = tileUserListFactory({type: WITH_REQUEST_HANDLES, displayQuantity: true});
const TileListWithRevoke = tileUserListFactory({type: WITH_REVOKE_SENT_REQUEST, displayQuantity: true});

const FriendsHandler = (props) => {
  const feedRequestsHeader = `Subscription ${pluralForm(props.feedRequests.length, 'request', null, 'w')}`;
  const sentRequestsHeader = `Sent ${pluralForm(props.sentRequests.length, 'request', null, 'w')}`;

  return (
    <div className="box">
      <div className="box-header-timeline">
        Friends
      </div>
      <div className="box-body">
        <TileListWithAcceptAndReject
          header={feedRequestsHeader}
          users={props.feedRequests}
          acceptRequest={props.acceptUserRequest}
          rejectRequest={props.rejectUserRequest}/>

        <TileList {...props.subscriptions}/>
        <TileList {...props.mutual}/>
        <TileList {...props.blockedByMe}/>

        <TileListWithRevoke
          header={sentRequestsHeader}
          users={props.sentRequests}
          revokeSentRequest={props.revokeSentRequest}/>
      </div>
      <div className="box-footer"></div>
    </div>
  );
};

function calculateMutual(subscriptions, subscribers) {
  if (!subscribers.isPending && !subscriptions.isPending &&
     !subscribers.errorString && !subscriptions.errorString) {

    const mutual = _.intersectionWith(
      subscriptions.payload,
      subscribers.payload,
      (a, b) => a.id == b.id
    );

    return {
      header: 'Mutual Friends',
      users: _.sortBy(mutual, 'username')
    };

  } else {
    return { users: [] };
  }
}

function selectState(state) {
  const feedRequests = state.userRequests;
  const subscriptions = {
    header: 'Friends',
    users: _.sortBy(state.usernameSubscriptions.payload, 'username')
  };
  const mutual = calculateMutual(
    state.usernameSubscriptions,
    state.usernameSubscribers
  );
  const blockedByMe = {
    header: 'Blocked',
    users: _.sortBy(state.usernameBlockedByMe.payload, 'username')
  };
  const sentRequests = state.sentRequests;

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

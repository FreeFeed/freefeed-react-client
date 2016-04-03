import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {acceptGroupRequest, rejectGroupRequest,
        acceptUserRequest, rejectUserRequest,
        revokeSentRequest} from '../redux/action-creators';
import {tileUserListFactory, WITH_REQUEST_HANDLES, WITH_REVOKE_SENT_REQUEST} from './tile-user-list';

const TileListWithAcceptAndReject = tileUserListFactory({type: WITH_REQUEST_HANDLES});
const TileListWithRevoke = tileUserListFactory({type: WITH_REVOKE_SENT_REQUEST});

const renderRequestsToGroup = (accept, reject) => (groupRequests) => {
  const acceptGroupRequest = (userName) => accept(groupRequests.username, userName);
  const rejectGroupRequest = (userName) => reject(groupRequests.username, userName);

  return (
    <div key={groupRequests.id}>
      <h3>{groupRequests.screenName}</h3>
      <TileListWithAcceptAndReject
        users={groupRequests.requests}
        acceptRequest={acceptGroupRequest}
        rejectRequest={rejectGroupRequest}/>
    </div>
  );
};

const RequestsHandler = (props) => {
  const groupRequests = props.groupRequests.map(renderRequestsToGroup(props.acceptGroupRequest, props.rejectGroupRequest));

  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div><Link to={`/${props.username}`}>{props.username}</Link> › Requests</div>
        {props.overallRequestsCount == 0 ? (
          <p>You have no requests</p>
        ) : (
          <div>
            {props.feedRequests && props.feedRequests.length ? (
              <div>
                <h3>Requests to your feed</h3>
                <TileListWithAcceptAndReject
                  users={props.feedRequests}
                  acceptRequest={props.acceptUserRequest}
                  rejectRequest={props.rejectUserRequest}/>
              </div>
            ) : false}

            {groupRequests ? (
              <div>
                {groupRequests}
              </div>
            ) : false}

            {props.sentRequests && props.sentRequests.length ? (
              <div>
                <h3>Sent requests</h3>
                <TileListWithRevoke
                  users={props.sentRequests}
                  revokeSentRequest={props.revokeSentRequest}/>
              </div>
            ) : false}
          </div>
        )}
      </div>
    </div>
  );
};

function selectState(state, ownProps) {
  const boxHeader = state.boxHeader;
  const username = ownProps.params.userName;

  const overallRequestsCount = state.userRequestsCount +
                               state.groupRequestsCount +
                               state.sentRequestsCount;

  const feedRequests = state.userRequests;
  const groupRequests = state.managedGroups.filter(group => group.requests.length) || [];
  const sentRequests = state.sentRequests;

  return {boxHeader, username, feedRequests, groupRequests, sentRequests, overallRequestsCount};
}

function selectActions(dispatch) {
  return {
    acceptGroupRequest: (...args) => dispatch(acceptGroupRequest(...args)),
    rejectGroupRequest: (...args) => dispatch(rejectGroupRequest(...args)),
    acceptUserRequest: (...args) => dispatch(acceptUserRequest(...args)),
    rejectUserRequest: (...args) => dispatch(rejectUserRequest(...args)),
    revokeSentRequest: (...args) => dispatch(revokeSentRequest(...args))
  };
}

export default connect(selectState, selectActions)(RequestsHandler);

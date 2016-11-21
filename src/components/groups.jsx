import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import _ from 'lodash';

import {pluralForm} from '../utils';

import {acceptGroupRequest, rejectGroupRequest} from '../redux/action-creators';
import {tileUserListFactory, WITH_REQUEST_HANDLES, PLAIN} from './tile-user-list';
const TileListWithAcceptAndReject = tileUserListFactory({type: WITH_REQUEST_HANDLES, displayQuantity: true});
const TileList = tileUserListFactory({type: PLAIN, displayQuantity: true});

const renderRequestsToGroup = (accept, reject) => (groupRequests) => {
  const acceptGroupRequest = (userName) => accept(groupRequests.username, userName);
  const rejectGroupRequest = (userName) => reject(groupRequests.username, userName);

  const count = groupRequests.requests.length;
  const groupName = groupRequests.screenName;
  const header = `${pluralForm(count, 'Request', null, 'w')} to join ${groupName}`;

  return (
    <div key={groupRequests.id}>
      <TileListWithAcceptAndReject
        header={header}
        users={groupRequests.requests}
        acceptRequest={acceptGroupRequest}
        rejectRequest={rejectGroupRequest}/>
    </div>
  );
};

const GroupsHandler = (props) => {
  const groupRequests = props.groupRequests.map(
    renderRequestsToGroup(props.acceptGroupRequest, props.rejectGroupRequest)
  );

  return (
    <div className="box">
      <div className="box-header-timeline">
        Groups
      </div>
      <div className="box-body">
        <div className="row">
          <div className="col-md-8">
            All the groups you are subscribed to
          </div>
          <div className="col-md-4 text-right">
            <Link to="/groups/create">Create a group</Link>
          </div>
        </div>

        {groupRequests ? (
          <div>
            {groupRequests}
          </div>
        ) : false}

        <TileList {...props.myGroups}/>
        <TileList {...props.groupsIAmIn}/>
      </div>
      <div className="box-footer"></div>
    </div>
  );
};

function selectState(state) {
  const groupRequests = state.managedGroups.filter(group => group.requests.length) || [];

  const managedIds = _.map(state.managedGroups, g => g.id);
  const sortingRule = g => -(g.updatedAt || g.createdAt);

  const adminGroups = _.filter(state.groups, group => managedIds.indexOf(group.id) !== -1);
  const regularGroups = _.filter(state.groups, group => managedIds.indexOf(group.id) === -1);

  const myGroups = {
    header: 'Groups you admin',
    users: _.sortBy(adminGroups, sortingRule)
  };

  const groupsIAmIn = {
    header: 'Groups you are in',
    users: _.sortBy(regularGroups, sortingRule)
  };

  return { groupRequests, myGroups, groupsIAmIn };
}

function selectActions(dispatch) {
  return {
    acceptGroupRequest: (...args) => dispatch(acceptGroupRequest(...args)),
    rejectGroupRequest: (...args) => dispatch(rejectGroupRequest(...args))
  };
}

export default connect(selectState, selectActions)(GroupsHandler);

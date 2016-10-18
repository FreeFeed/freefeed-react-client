import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import _ from 'lodash';

import {unsubscribeFromGroup, makeGroupAdmin,
        unadminGroupAdmin} from '../redux/action-creators';

import {tileUserListFactory, WITH_REMOVE_AND_MAKE_ADMIN_HANDLES, WITH_REMOVE_ADMIN_RIGHTS} from './tile-user-list';
const SubsList = tileUserListFactory({type: WITH_REMOVE_AND_MAKE_ADMIN_HANDLES});
const AdminsList = tileUserListFactory({type: WITH_REMOVE_ADMIN_RIGHTS});

const ManageSubscribersHandler = (props) => {
  const remove = (username) => props.unsubscribeFromGroup(props.groupName, username);
  const makeAdmin = (user) => props.makeGroupAdmin(props.groupName, user);
  const removeAdminRights = (user) => {
    const isItMe = props.user.id === user.id;
    props.unadminGroupAdmin(props.groupName, user, isItMe);
  };

  return (
    <div className="box">
      <div className="box-header-timeline">
        {props.boxHeader}
      </div>
      <div className="box-body">
        <div className="row">
          <div className="col-md-6">
            <Link to={`/${props.groupName}`}>{props.groupName}</Link> › Manage subscribers
          </div>
          <div className="col-md-6 text-right">
            <Link to={`/${props.groupName}/subscribers`}>Browse subscribers</Link>
          </div>       
        </div>
        <div className="manage-subscribers-body">
          <h3>Manage subscribers</h3>
          {props.users ? <h4 className="tile-list-subheader">Subscribers</h4> : false}
          {props.users ? props.users.length == 0 ? (
              <div className="tile-list-text">There&#x2019;s not a single one subscriber yet. You might invite some friends to change that.</div>
            ) : (
              <SubsList
                users={props.users}
                makeAdmin={makeAdmin}
                remove={remove}/>
            )
          : false}

          <h4 className="tile-list-subheader">Admins</h4>

          {props.amILastGroupAdmin ? (
            <div className="tile-list-text">You are the only Admin for this group. Before you can drop administrative privileges
              or leave this group, you have to promote another group member to Admin first.</div>
          ) : (
            <AdminsList
              users={props.groupAdmins}
              removeAdminRights={removeAdminRights}/>
          )}
        </div>
      </div>
    </div>
  );
};

function selectState(state, ownProps) {
  const boxHeader = state.boxHeader;
  const groupName = ownProps.params.userName;
  const user = state.user;
  const groupAdmins = state.groupAdmins;
  const usersWhoAreNotAdmins = _.filter(state.usernameSubscribers.payload, user => {
    return groupAdmins.find(u => u.username == user.username) == null;
  });
  const users = _.sortBy(usersWhoAreNotAdmins, 'username');

  const amILastGroupAdmin = (
    groupAdmins.find(u => u.username == state.user.username ) != null &&
    groupAdmins.length == 1
  );

  return { boxHeader, groupName, user, groupAdmins, users, amILastGroupAdmin };
}

function selectActions(dispatch) {
  return {
    unsubscribeFromGroup: (...args) => dispatch(unsubscribeFromGroup(...args)),
    makeGroupAdmin: (...args) => dispatch(makeGroupAdmin(...args)),
    unadminGroupAdmin: (...args) => dispatch(unadminGroupAdmin(...args))
  };
}

export default connect(selectState, selectActions)(ManageSubscribersHandler);

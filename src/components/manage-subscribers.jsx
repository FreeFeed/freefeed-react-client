import { useCallback, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import * as _ from 'lodash-es';

import {
  unsubscribeFromGroup,
  makeGroupAdmin,
  unadminGroupAdmin,
  getGroupBlockedUsers,
  unblockUserInGroup,
} from '../redux/action-creators';

import {
  tileUserListFactory,
  WITH_REMOVE_AND_MAKE_ADMIN_HANDLES,
  WITH_REMOVE_ADMIN_RIGHTS,
} from './tile-user-list';
import { BlockInGroupForm } from './block-in-group-form';

const SubsList = tileUserListFactory({ type: WITH_REMOVE_AND_MAKE_ADMIN_HANDLES });
const AdminsList = tileUserListFactory({ type: WITH_REMOVE_ADMIN_RIGHTS });
const BlockedList = tileUserListFactory();

function ManageSubscribersHandler({ user: currentUser, groupName, amIAdmin, ...props }) {
  const dispatch = useDispatch();
  const blockedUsersStatus = useSelector((state) => state.groupBlockedUsersStatus);
  const blockedUsersIds = useSelector((state) => state.groupBlockedUsers);
  const allUsers = useSelector((state) => state.users);

  const blockedUsers = useMemo(
    () => blockedUsersIds.map((id) => allUsers[id]),
    [allUsers, blockedUsersIds],
  );

  const handleRemove = useCallback(
    (username) => dispatch(unsubscribeFromGroup(groupName, username)),
    [dispatch, groupName],
  );
  const handleMakeAdmin = useCallback(
    (user) => dispatch(makeGroupAdmin(groupName, user)),
    [dispatch, groupName],
  );
  const handleRemoveAdminRights = useCallback(
    (user) => {
      const isItMe = currentUser.id === user.id;
      dispatch(unadminGroupAdmin(groupName, user, isItMe));
    },
    [currentUser.id, dispatch, groupName],
  );

  useEffect(
    () => amIAdmin && blockedUsersStatus.initial && dispatch(getGroupBlockedUsers(groupName)),
    [amIAdmin, blockedUsersStatus.initial, dispatch, groupName],
  );

  const blockedUsersActions = useMemo(
    () => [
      {
        title: 'Unblock',
        handler: (user) => dispatch(unblockUserInGroup(groupName, user.username)),
      },
    ],
    [dispatch, groupName],
  );

  useEffect(() => {
    if (!amIAdmin) {
      props.router.replace(`/${groupName}/subscribers`);
    }
  }, [amIAdmin, groupName, props.router]);

  if (!amIAdmin) {
    return null;
  }

  return (
    <div className="box">
      <div className="box-header-timeline" role="heading">
        {props.boxHeader}
      </div>
      <div className="box-body">
        <div className="row">
          <div className="col-md-6">
            <Link to={`/${groupName}`}>{groupName}</Link> › Manage subscribers
          </div>
          <div className="col-md-6 text-right">
            <Link to={`/${groupName}/subscribers`}>Browse subscribers</Link>
          </div>
        </div>
        <div className="manage-subscribers-body">
          <h3>Manage subscribers</h3>
          {props.users ? <h4 className="tile-list-subheader">Subscribers</h4> : false}
          {props.users ? (
            props.users.length === 0 ? (
              <div className="tile-list-text">
                There&#x2019;s not a single one subscriber yet. You might invite some friends to
                change that.
              </div>
            ) : (
              <SubsList users={props.users} makeAdmin={handleMakeAdmin} remove={handleRemove} />
            )
          ) : (
            false
          )}

          <h4 className="tile-list-subheader" id="admins">
            Admins
          </h4>

          {props.amILastGroupAdmin ? (
            <div className="tile-list-text">
              You are the only Admin for this group. Before you can drop administrative privileges
              or leave this group, you have to promote another group member to Admin first.
            </div>
          ) : (
            <AdminsList users={props.groupAdmins} removeAdminRights={handleRemoveAdminRights} />
          )}

          <h4 className="tile-list-subheader" id="blocked">
            Blocked users
          </h4>
          <div className="tile-list-text">
            <p>
              Blocked users cannot write posts to the group. They can still see and comment the
              posts in the group while it is not private.
            </p>
            <BlockInGroupForm groupName={groupName} />
            {(blockedUsersStatus.loading || blockedUsersStatus.initial) && (
              <p>Loading list&hellip;</p>
            )}
            {blockedUsersStatus.error && <p>{blockedUsersStatus.errorText}</p>}
          </div>
          {blockedUsersStatus.success && blockedUsers.length > 0 ? (
            <BlockedList users={blockedUsers} actions={blockedUsersActions} />
          ) : (
            <p>This group has no blocked users.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function selectState(state, ownProps) {
  const { boxHeader, groupAdmins: allGroupAdmins, user } = state;
  const groupName = ownProps.params.userName;
  const groupAdmins = allGroupAdmins[groupName] || [];
  const usersWhoAreNotAdmins = _.filter(state.usernameSubscribers.payload, (user) => {
    return groupAdmins.find((u) => u.username == user.username) == null;
  });
  const users = _.sortBy(usersWhoAreNotAdmins, 'username');

  const amIAdmin = state.managedGroups.some((g) => g.username === groupName);
  const amILastGroupAdmin = amIAdmin && groupAdmins.length == 1;

  return {
    boxHeader,
    groupName,
    user,
    groupAdmins,
    users,
    amIAdmin,
    amILastGroupAdmin,
  };
}

export default connect(selectState)(ManageSubscribersHandler);

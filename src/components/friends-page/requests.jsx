import { useCallback, useMemo } from 'react';
import cn from 'classnames';
import { Helmet } from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';

import UserName from '../user-name';
import {
  revokeSentRequest,
  acceptUserRequest,
  rejectUserRequest,
  acceptGroupRequest,
  rejectGroupRequest,
} from '../../redux/action-creators';
import { initialAsyncState } from '../../redux/async-helpers';
import { UserPicture } from '../user-picture';
import { Throbber } from '../throbber';
import styles from './styles.module.scss';
import { UsersList, ErrorIcon } from './ui';

export function Requests() {
  const blocks = [RequestsToMe(), RequestsToGroups(), SentRequests()].filter(Boolean);
  return (
    <>
      <Helmet title="Requests" defer={false} />
      <h2>Requests</h2>
      {blocks.length === 0 ? <p>You have not incoming or sent any requests.</p> : blocks}
    </>
  );
}

function RequestsToMe() {
  const dispatch = useDispatch();
  const requests = useSelector((state) => state.userRequests);
  const statusesMap = useSelector((state) => state.userActionsStatuses.reviewingRequest);

  const processRequest = useCallback(
    ({ target }) => {
      const { action, userId } = target.dataset;
      const user = requests.find((u) => u.id === userId);
      if (confirm(`Are you sure you want ${action} request from @${user.username}?`)) {
        dispatch((action === 'accept' ? acceptUserRequest : rejectUserRequest)(user.username));
      }
    },
    [requests, dispatch],
  );

  if (requests.length === 0) {
    return null;
  }
  return (
    <section key="to me" className={styles.requestsSection}>
      <h3>Requests to you</h3>
      <p>These users wants to subscribe to your feed:</p>
      <UsersList users={requests}>
        {(user) => {
          const status = statusesMap[user.username] || initialAsyncState;
          return (
            <div className={styles.btnGroup}>
              {status.loading && <Throbber />}
              <ErrorIcon
                message={status.error && status.errorText}
                className="btn btn-link btn-sm"
              />
              <button
                data-user-id={user.id}
                data-action="accept"
                onClick={processRequest}
                className={cn('btn btn-default btn-sm', status.loading && 'disabled')}
              >
                Accept
              </button>
              <button
                data-user-id={user.id}
                data-action="reject"
                onClick={processRequest}
                className={cn('btn btn-default btn-sm', status.loading && 'disabled')}
              >
                Reject
              </button>
            </div>
          );
        }}
      </UsersList>
    </section>
  );
}

function RequestsToGroups() {
  const dispatch = useDispatch();
  const managedGroups = useSelector((state) => state.managedGroups);
  const statusesMap = useSelector((state) => state.userActionsStatuses.reviewingGroupRequest);
  const groups = useMemo(() => managedGroups.filter((group) => group.requests.length > 0), [
    managedGroups,
  ]);

  const processRequest = useCallback(
    ({ target }) => {
      const { action, userId, groupId } = target.dataset;
      const group = groups.find((g) => g.id === groupId);
      const user = group.requests.find((u) => u.id === userId);
      if (
        confirm(`Are you sure you want ${action} @${user.username} to join @${group.username}?`)
      ) {
        dispatch(
          (action === 'allow' ? acceptGroupRequest : rejectGroupRequest)(
            group.username,
            user.username,
          ),
        );
      }
    },
    [groups, dispatch],
  );

  if (groups.length === 0) {
    return null;
  }
  return (
    <section key="to groups" className={styles.requestsSection}>
      <h3>Requests to groups you admin</h3>
      {groups.map((group) => (
        <div key={group.id}>
          <p>
            These users wants to join group <UserPicture user={group} inline />{' '}
            <UserName user={group} /> that you manage:
          </p>
          <UsersList users={group.requests}>
            {(user) => {
              const status = statusesMap[`${user.username}:${group.username}`] || initialAsyncState;
              return (
                <div className={styles.btnGroup}>
                  {status.loading && <Throbber />}
                  <ErrorIcon
                    message={status.error && status.errorText}
                    className="btn btn-link btn-sm"
                  />
                  <button
                    data-user-id={user.id}
                    data-group-id={group.id}
                    data-action="allow"
                    onClick={processRequest}
                    className={cn('btn btn-default btn-sm', status.loading && 'disabled')}
                  >
                    Accept
                  </button>
                  <button
                    data-user-id={user.id}
                    data-group-id={group.id}
                    data-action="deny"
                    onClick={processRequest}
                    className={cn('btn btn-default btn-sm', status.loading && 'disabled')}
                  >
                    Reject
                  </button>
                </div>
              );
            }}
          </UsersList>
        </div>
      ))}
    </section>
  );
}

function SentRequests() {
  const dispatch = useDispatch();
  const sentRequests = useSelector((state) => state.sentRequests);
  const revokeStatusesMap = useSelector((state) => state.userActionsStatuses.subscribing);

  const revokeRequest = useCallback(
    ({ target }) => {
      const reqUser = sentRequests.find((u) => u.id === target.dataset.userId);
      if (confirm(`Are you sure you want to revoke request to @${reqUser.username}?`)) {
        dispatch(revokeSentRequest(reqUser));
      }
    },
    [sentRequests, dispatch],
  );

  if (sentRequests.length === 0) {
    return null;
  }

  return (
    <section key="sent" className={styles.requestsSection}>
      <h3>Sent requests</h3>
      <p>You have sent requests to the following users/groups:</p>
      <UsersList users={sentRequests}>
        {(user) => {
          const status = revokeStatusesMap[user.username] || initialAsyncState;
          return (
            <div className={styles.btnGroup}>
              <ErrorIcon
                message={status.error && status.errorText}
                className="btn btn-link btn-sm"
              />
              <button
                type="button"
                className={cn('btn btn-default btn-sm', status.loading && 'disabled')}
                data-user-id={user.id}
                onClick={revokeRequest}
              >
                {status.loading ? 'Revoking\u2026' : 'Revoke'}
              </button>
            </div>
          );
        }}
      </UsersList>
    </section>
  );
}

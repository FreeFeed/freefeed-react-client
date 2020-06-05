import React, { useMemo, useCallback } from 'react';
import cn from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';

import { initialAsyncState } from '../../redux/async-helpers';
import { unban } from '../../redux/action-creators';
import { UsersList, ErrorIcon } from './ui';
import styles from './styles.module.scss';

export function Blocked() {
  const dispatch = useDispatch();
  const banIds = useSelector((state) => state.user.banIds);
  const allUsers = useSelector((state) => state.users);
  const unblockStatusesMap = useSelector((state) => state.userActionsStatuses.blocking);

  const users = useMemo(
    () => banIds.map((id) => allUsers[id]).sort((u1, u2) => u1.username.localeCompare(u2.username)),
    [banIds, allUsers],
  );

  const doUnblock = useCallback(
    ({ target }) => {
      const user = users.find((u) => u.id === target.dataset.userId);
      if (confirm(`Are you sure you want to unblock @${user.username}?`)) {
        dispatch(unban(user));
      }
    },
    [users, dispatch],
  );

  return (
    <>
      <Helmet title="Blocked users" defer={false} />
      <h2>
        Blocked users <small>({banIds.length})</small>
      </h2>

      {users.length > 0 ? (
        <UsersList users={users}>
          {(user) => {
            const status = unblockStatusesMap[user.username] || initialAsyncState;
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
                  onClick={doUnblock}
                >
                  {status.loading ? 'Unblocking\u2026' : 'Unblock'}
                </button>
              </div>
            );
          }}
        </UsersList>
      ) : (
        <p>You have no blocked users.</p>
      )}
    </>
  );
}

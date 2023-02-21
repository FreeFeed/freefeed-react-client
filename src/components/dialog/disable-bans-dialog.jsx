import { useCallback, useMemo } from 'react';

import { useDispatch } from 'react-redux';
import { disableBansInGroup } from '../../redux/action-creators';
import { useShowDialog } from './context';

export function useShowDisableBansDialog(group, isAdmin) {
  const dispatch = useDispatch();
  const action = useCallback(() => dispatch(disableBansInGroup(group.username)), [dispatch, group]);
  const uname = `@${group.username}`;

  return useShowDialog(
    useMemo(
      () => ({
        title: `Disable blocking in ${uname}`,
        actionLabel: `Disable blocking`,
        action,
        body: (
          <>
            <p>You are going to disable blocking in {uname}. What does this mean?</p>
            <ul>
              <li>
                <p>You will see all the posts of your blocked users in {uname}.</p>
              </li>
              <li>
                <p>
                  You will see comments and likes from your blocked users under posts in {uname}.
                </p>
              </li>
              {isAdmin && (
                <li>
                  <p>
                    <strong>As an administrator</strong>, you will also see all the posts in {uname}{' '}
                    of the users who have blocked you.
                  </p>
                </li>
              )}
            </ul>
            <p>You can enable blocks in {uname} at any time.</p>
          </>
        ),
      }),
      [action, isAdmin, uname],
    ),
  );
}

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
        title: `Show blocked content in ${uname}`,
        actionLabel: `Show blocked content`,
        action,
        body: (
          <>
            <p>You are going to show blocked content in {uname}. What does this mean?</p>
            <ul>
              <li>
                <p>
                  You will see all the content (posts, comments and likes) of your blocked users in{' '}
                  {uname}.
                </p>
              </li>
              {isAdmin && (
                <li>
                  <p>
                    <strong>As an administrator</strong>, you will also see all all the content in{' '}
                    {uname} of the users who have blocked you.
                  </p>
                </li>
              )}
            </ul>
            <p>You can hide back blocked content in {uname} at any time.</p>
          </>
        ),
      }),
      [action, isAdmin, uname],
    ),
  );
}

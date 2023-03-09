import { useCallback, useMemo } from 'react';

import { useDispatch } from 'react-redux';
import { ban } from '../../redux/action-creators';
import { useShowDialog } from './context';

export function useShowBanDialog(user) {
  const dispatch = useDispatch();
  const action = useCallback(() => dispatch(ban(user)), [dispatch, user]);
  const uname = `@${user.username}`;

  return useShowDialog(
    useMemo(
      () => ({
        title: `Block ${uname}`,
        actionLabel: `Block ${uname}`,
        action,
        body: (
          <div style={{ maxWith: '600px' }}>
            <p>You are going to block {uname}. What does this mean?</p>
            <ul>
              <li>
                <p>You and {uname} will not see each other&#x2019;s posts.</p>
              </li>
              <li>
                <p>
                  You will not see the {uname}&#x2019;s comments and likes, while {uname} will be
                  able to see your comments in other people&#x2019;s posts.
                </p>
              </li>
              <li>
                <p>If {uname} was subscribed to you, he/she will be unsubscribed.</p>
              </li>
            </ul>
            <p>You can unblock {uname} at any time.</p>
            <hr />
            <p>
              <strong>Blocks in groups</strong>
            </p>
            <p>
              You can disable blocking in selected groups, in those groups you will see all posts
              and comments of those you have blocked.
            </p>
            <p>
              If {uname} is an admin of some group, he will be able to see your posts in that group.
            </p>
          </div>
        ),
      }),
      [action, uname],
    ),
  );
}

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { disableBansInGroup } from '../redux/action-creators';
import { useActionWithConfirmation } from './action-with-confirmation';

export function DisableBansDialog({ group, isAdmin = false, children: renderTrigger }) {
  const dispatch = useDispatch();
  const action = useCallback(() => dispatch(disableBansInGroup(group.username)), [dispatch, group]);

  const uname = `@${group.username}`;

  return useActionWithConfirmation({
    renderTrigger,
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
            <p>You will see comments and likes from your blocked users under posts in {uname}.</p>
          </li>
          {isAdmin && (
            <li>
              <p>
                <strong>As an administrator</strong>, you will also see all the posts in {uname} of
                the users who have blocked you.
              </p>
            </li>
          )}
        </ul>
        <p>You can enable blocks in {uname} at any time.</p>
      </>
    ),
  });
}

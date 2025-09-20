import classnames from 'classnames';

import { shallowEqual, useSelector } from 'react-redux';
import UserName from './user-name';
import TimeDisplay from './time-display';

function RecentGroup({ group, isPinned }) {
  return (
    <li className={classnames('p-my-groups-link', isPinned && 'pinned')}>
      <UserName user={group} userCardMode="sidebar-group">
        {group.screenName}
      </UserName>
      <TimeDisplay className="updated-ago" timeStamp={+group.updatedAt} />
    </li>
  );
}

export default function RecentGroups() {
  const recentGroups = useSelector(
    (state) => state.recentGroups.map((g) => state.users[g.id]),
    shallowEqual,
  );
  const pinnedGroupIds = useSelector(
    (state) =>
      state.recentGroups
        .filter((g) => g.isPinned)
        .map((g) => g.id)
        .sort(),
    shallowEqual,
  );

  return (
    <ul className="p-my-groups">
      {recentGroups.map((g) => (
        <RecentGroup key={g.id} group={g} isPinned={pinnedGroupIds.includes(g.id)} />
      ))}
    </ul>
  );
}

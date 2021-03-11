import classnames from 'classnames';

import { shallowEqual, useSelector } from 'react-redux';
import UserName from './user-name';
import TimeDisplay from './time-display';

const renderRecentGroup = (group, isPinned) => (
  <li className={classnames('p-my-groups-link', isPinned && 'pinned')} key={group.id}>
    <UserName user={group} noUserCard>
      {group.screenName}
    </UserName>
    <TimeDisplay className="updated-ago" timeStamp={+group.updatedAt} />
  </li>
);

export default () => {
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
      {recentGroups.map((g) => renderRecentGroup(g, pinnedGroupIds.includes(g.id)))}
    </ul>
  );
};

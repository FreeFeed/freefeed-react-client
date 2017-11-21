import React from 'react';

import UserName from './user-name';
import TimeDisplay from './time-display';

const renderRecentGroup = (recentGroup) => (
  <li className="p-my-groups-link" key={recentGroup.id}>
    <UserName user={recentGroup} display={recentGroup.screenName} applyHyphenations={true} />
    <TimeDisplay className="updated-ago" timeStamp={+recentGroup.updatedAt} />
  </li>
);

export default (props) => {
  const recentGroups = props.recentGroups.map(renderRecentGroup);

  return (
    <ul className="p-my-groups">
      {recentGroups}
    </ul>
  );
};

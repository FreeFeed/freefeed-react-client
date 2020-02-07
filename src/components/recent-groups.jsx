import React from 'react';
import classnames from 'classnames';

import UserName from './user-name';
import TimeDisplay from './time-display';

const renderRecentGroup = (recentGroup) => (
  <li className="p-my-groups-link" key={recentGroup.id}>
    <UserName user={recentGroup} applyHyphenations={true}>
      {recentGroup.screenName}
    </UserName>
    <TimeDisplay
      className={classnames('updated-ago', recentGroup.isPinned && 'pinned')}
      timeStamp={+recentGroup.updatedAt}
    />
  </li>
);

export default (props) => {
  const recentGroups = props.recentGroups.map(renderRecentGroup);

  return <ul className="p-my-groups">{recentGroups}</ul>;
};

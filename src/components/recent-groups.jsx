import React from 'react';

import {fromNowOrNow} from '../utils';
import UserName from './user-name';

const renderRecentGroup = recentGroup => {
  const updatedAgo = fromNowOrNow(parseInt(recentGroup.updatedAt));
  return (
    <li className="p-my-groups-link" key={recentGroup.id}>
      <UserName user={recentGroup} display={recentGroup.screenName} applyHyphenations={true}/>
      <div className="updated-ago">{updatedAgo}</div>
    </li>
  );
};

export default props => {
  const recentGroups = props.recentGroups.map(renderRecentGroup);

  return (
    <ul className="p-my-groups">
      {recentGroups}
    </ul>
  );
};

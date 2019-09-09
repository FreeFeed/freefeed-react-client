import React from 'react';
import { faLock, faUserFriends, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './fontawesome-icons';

export default function UserFeedStatus(props) {
  return (
    <span>
      {props.isPrivate === '1' ? (
        <span>
          <Icon icon={faLock} className="status-icon" /> Private
        </span>
      ) : props.isProtected === '1' ? (
        <span>
          <Icon icon={faUserFriends} className="status-icon" /> Protected
        </span>
      ) : (
        <span>
          <Icon icon={faGlobeAmericas} className="status-icon" /> Public
        </span>
      )}
      {props.isRestricted === '1' ? ' restricted' : false}
      {props.type === 'user' ? ' feed' : ' group'}
    </span>
  );
}

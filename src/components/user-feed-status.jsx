import React from 'react';

export default function UserFeedStatus(props) {
  return (
    <span>
      {props.isPrivate === '1' ? (
        <span><i className="status-icon fa fa-lock" />Private</span>
      ) : props.isProtected === '1' ? (
        <span>
          <i className="icon-protected">
            <i className="status-icon fa fa-lock" />
          </i>Protected
        </span>
      ) : (
        <span><i className="status-icon fa fa-globe" />Public</span>
      )}
      {props.isRestricted === '1' ? ' restricted' : false}
      {props.type === 'user' ? ' feed' : ' group'}
    </span>
  );
}

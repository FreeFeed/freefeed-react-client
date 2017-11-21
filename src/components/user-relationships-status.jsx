import React from 'react';

export default function UserRelationshipStatus(props) {
  return (
    <span>
      {props.isUserBlockedByMe ? (
        <span><i className="status-icon fa fa-ban"></i>You{"'"}ve blocked the user</span>
      ) : props.amIBlockedByUser ? (
        <span><i className="status-icon fa fa-question-circle"></i>User may have blocked you</span>
      ) : props.hasRequestBeenSent ? (
        <span><i className="status-icon fa fa-clock-o"></i>You{"'"}ve sent sub request</span>
      ) : props.amISubscribedToUser ? (
        props.type === 'user' ? (
          props.isUserSubscribedToMe ? (
            <span><i className="status-icon fa fa-check-circle"></i>Mutually subscribed</span>
          ) : (
            <span><i className="status-icon fa fa-check-circle"></i>You are subscribed</span>
          )
        ) : props.amIGroupAdmin ? (
          <span><i className="status-icon fa fa-check-square"></i>You are an admin</span>
        ) : (
          <span><i className="status-icon fa fa-check-square"></i>You are a member</span>
        )
      ) : props.isUserSubscribedToMe ? (
        <span><i className="status-icon fa fa-check-circle-o"></i>User subscribed to you</span>
      ) : (
        false
      )}
    </span>
  );
}

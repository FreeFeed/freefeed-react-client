import React from 'react';


export default function UserRelationshipStatus(props) {
  return (
    <span>
      {props.isUserBlockedByMe ? (
        <span><i className="status-icon fa fa-ban" />You{"'"}ve blocked the user</span>
      ) : props.amIBlockedByUser ? (
        <span><i className="status-icon fa fa-question-circle" />User may have blocked you</span>
      ) : props.hasRequestBeenSent ? (
        <span><i className="status-icon fa fa-clock-o" />You{"'"}ve sent sub request</span>
      ) : props.amISubscribedToUser ? (
        props.type === 'user' ? (
          props.isUserSubscribedToMe ? (
            <span><i className="status-icon fa fa-check-circle" />Mutually subscribed</span>
          ) : (
            <span><i className="status-icon fa fa-check-circle" />You are subscribed</span>
          )
        ) : props.amIGroupAdmin ? (
          <span><i className="status-icon fa fa-check-square" />You are an admin</span>
        ) : (
          <span><i className="status-icon fa fa-check-square" />You are a member</span>
        )
      ) : props.isUserSubscribedToMe ? (
        <span><i className="status-icon fa fa-check-circle-o" />User subscribed to you</span>
      ) : (
        false
      )}
    </span>
  );
}

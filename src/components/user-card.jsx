import React from 'react'
import {Link} from 'react-router'

export default (props) => (
  <div className="user-card">
    <div className="user-card-info">
      <Link to={`/${props.user.username}`} className="userpic">
        <img src={props.user.profilePictureLargeUrl} width="75" height="75"/>
      </Link>

      <Link to={`/${props.user.username}`} className="display-name">{props.user.screenName}</Link>

      {props.user.screenName !== props.user.username ? (
        <span className="username">{props.user.username}</span>
      ) : false}
    </div>
  </div>
)

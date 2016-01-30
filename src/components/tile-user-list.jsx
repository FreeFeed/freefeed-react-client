import React from 'react'
import {Link} from 'react-router'
import classnames from 'classnames'

import throbber16 from 'assets/images/throbber-16.gif'

const renderUsers = (size) => (user) => {
  const userpicUrl = (size === 'large') ? user.profilePictureLargeUrl : user.profilePictureMediumUrl

  return (
    <li key={user.id}>
      <Link to={`/${user.username}`}>
        <div className="avatar">
          <img src={userpicUrl}/>
        </div>
        <span>{user.screenName}</span>
      </Link>
    </li>
  )
}

const TileList = props => {
  const users = props.users.map(renderUsers(props.size))

  const listClasses = classnames({
    'tile-list': true,
    'large-pics': props.size === 'large'
  })

  return (
    <ul className={listClasses}>
      {users}
    </ul>
  )
}

export default (props) => {
  return (
    <div>
      {props.title ? (
        <h3>
          <span>{props.title} </span>
          {props.isPending ? (
            <span className="comment-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
        </h3>
      ) : false}

      {props.errorString ? (
        <span className="error-string">{props.errorString}</span>
      ) : false}

      <TileList users={props.users} size={props.size}/>
    </div>
  )
}

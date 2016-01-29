import React from 'react'
import {Link} from 'react-router'

import throbber16 from 'assets/images/throbber-16.gif'

const renderUsers = user => {
  const profilePictureMediumUrl = user.profilePictureMediumUrl

  return (
    <li key={user.id} className='p-user-subscriber'>
      <Link to={`/${user.username}`}>
        <div className='avatar'>
          <img src={profilePictureMediumUrl}/>
        </div>
        <span>{user.username}</span>
      </Link>
    </li>
  )
}

const TileList = props => {
  const users = props.users.map(renderUsers)

  return (
    <ul className='tile-list'>
      {users}
    </ul>
  )
}

export default (props) => {
  return (
    <div>
      <h3 className='p-user-subscribers'>
        <span>{props.title}&nbsp;</span>
        {props.users.isPending ? (
          <span className="comment-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </h3>
      {props.users.errorString ? (
        <span className="error-string">{props.users.errorString}</span>
      ) : false}
      <TileList users={props.users.payload}/>
    </div>
  )
}

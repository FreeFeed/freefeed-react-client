import React from 'react'
import {Link} from 'react-router'
import classnames from 'classnames'
import _ from 'lodash'

import {preventDefault} from '../utils'

const renderUsers = (type) => (user) => {
  return (
    <li key={user.id}>
      <Link to={`/${user.username}`}>
        <div className="avatar">
          <img src={user.profilePictureUrl}/>
        </div>
        <span>{user.screenName}</span>
      </Link>

      {type == WITH_REQUEST_HANDLES ? (
        <div className='user-actions'>
          <a onClick={preventDefault(() => user.acceptRequest(user.username))}>Accept</a>
          <span> | </span>
          <a onClick={preventDefault(() => user.rejectRequest(user.username))}>Reject</a>
        </div>
      ) : false}
      
    </li>
  )
}

export const PLAIN = 'PLAIN'
export const WITH_REQUEST_HANDLES = 'WITH_REQUEST_HANDLES'

export const tileUserListFactory = (config) => (props) => {
  const handleGroupsRequests = _.pick(props, ['acceptRequest', 'rejectRequest'])
  const usersData = props.users.map(user => {
    return {
      ..._.pick(user, ['id', 'screenName', 'username']),
      profilePictureUrl: (config.size === 'large') ? user.profilePictureLargeUrl : user.profilePictureMediumUrl,
      ...handleGroupsRequests
    }
  })

  const users = usersData.map(renderUsers(config.type))

  const listClasses = classnames({
    'tile-list': true,
    'large-pics': config.size === 'large'
  })

  return (
    <div>
      <ul className={listClasses}>
        {users}
      </ul>
    </div>
  )
}

import React from 'react'
import {Link} from 'react-router'
import classnames from 'classnames'
import _ from 'lodash'

import UserName from './user-name'
import {preventDefault} from '../utils'

const renderUsers = (type) => (user) => {
  return (
    <li key={user.id}>
      <div className="avatar">
        <Link to={`/${user.username}`}>
          <img src={user.profilePictureUrl}/>
        </Link>
      </div>

      <UserName user={user}/>

      {type == WITH_REQUEST_HANDLES ? (
        <div className='user-actions'>
          <a onClick={preventDefault(() => user.acceptRequest(user.username))}>Accept</a>
          <span> | </span>
          <a onClick={preventDefault(() => user.rejectRequest(user.username))}>Reject</a>
        </div>
      ) : false}

      {type == WITH_REMOVE_AND_MAKE_ADMIN_HANDLES ? (
        <div className='user-actions'>
          <a onClick={preventDefault(() => user.remove(user.username))}>Remove</a>
          <br/>
          <a onClick={preventDefault(() => user.makeAdmin(user))}>Make admin</a>
        </div>
      ) : false}

      {type == WITH_REMOVE_ADMIN_RIGHTS ? (
        <div className='user-actions'>
          <a onClick={preventDefault(() => user.removeAdminRights(user))}>Remove admin rights</a>
        </div>
      ) : false}
      
    </li>
  )
}

export const PLAIN = 'PLAIN'
export const WITH_REQUEST_HANDLES = 'WITH_REQUEST_HANDLES'
export const WITH_REMOVE_AND_MAKE_ADMIN_HANDLES = 'WITH_REMOVE_AND_MAKE_ADMIN_HANDLES'
export const WITH_REMOVE_ADMIN_RIGHTS = 'WITH_REMOVE_ADMIN_RIGHTS'

function pickActions(type, props) {
  switch (type) {
    case WITH_REQUEST_HANDLES: {
      return _.pick(props, ['acceptRequest', 'rejectRequest'])
    }
    case WITH_REMOVE_AND_MAKE_ADMIN_HANDLES: {
      return _.pick(props, ['makeAdmin', 'remove'])
    }
    case WITH_REMOVE_ADMIN_RIGHTS: {
      return { removeAdminRights: props.removeAdminRights }
    }
  }

  return {}
}

export const tileUserListFactory = (config) => (props) => {
  const usersData = props.users.map(user => {
    return {
      ..._.pick(user, ['id', 'screenName', 'username']),
      profilePictureUrl: (config.size === 'large') ? user.profilePictureLargeUrl : user.profilePictureMediumUrl,
      ...pickActions(config.type, props)
    }
  })

  const users = usersData.map(renderUsers(config.type))

  const listClasses = classnames({
    'tile-list': true,
    'large-pics': config.size === 'large',
    'with-actions': config.type !== PLAIN
  })

  return (
    <div>
      <ul className={listClasses}>
        {users}
      </ul>
    </div>
  )
}

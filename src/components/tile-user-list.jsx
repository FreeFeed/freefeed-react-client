import React from 'react'
import {Link} from 'react-router'
import classnames from 'classnames'
import _ from 'lodash'

import UserName from './user-name'
import {confirmFirst} from '../utils'

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
        <div className="user-actions">
          <a onClick={() => user.acceptRequest(user.username)}>Accept</a>
          <span> - </span>
          <a onClick={() => user.rejectRequest(user.username)}>Reject</a>
        </div>
      ) : false}

      {type == WITH_REMOVE_AND_MAKE_ADMIN_HANDLES ? (
        <div className="user-actions">
          <a onClick={() => user.makeAdmin(user)} title="Promote user to admin">Promote</a>
          <span> - </span>
          <a onClick={confirmFirst(() => user.remove(user.username))} title="Unsubscribe user from the group">Unsub</a>
        </div>
      ) : false}

      {type == WITH_REMOVE_ADMIN_RIGHTS ? (
        <div className="user-actions">
          <a onClick={() => user.removeAdminRights(user)} title="Demote user from admin">Demote</a>
        </div>
      ) : false}

      {type == WITH_REVOKE_SENT_REQUEST ? (
        <div className="user-actions">
          <a onClick={() => user.revokeSentRequest(user.username)} title="Revoke sent request">Revoke</a>
        </div>
      ) : false}

    </li>
  )
}

export const PLAIN = 'PLAIN'
export const WITH_REQUEST_HANDLES = 'WITH_REQUEST_HANDLES'
export const WITH_REMOVE_AND_MAKE_ADMIN_HANDLES = 'WITH_REMOVE_AND_MAKE_ADMIN_HANDLES'
export const WITH_REMOVE_ADMIN_RIGHTS = 'WITH_REMOVE_ADMIN_RIGHTS'
export const WITH_REVOKE_SENT_REQUEST = 'WITH_REVOKE_SENT_REQUEST'

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
    case WITH_REVOKE_SENT_REQUEST: {
      return { revokeSentRequest: props.revokeSentRequest }
    }
  }

  return {}
}

export const tileUserListFactory = (config) => (props) => {
  const usersData = props.users.map(user => {
    return {
      ..._.pick(user, ['id', 'screenName', 'username']),
      profilePictureUrl:
        (user.profilePictureUrl
          ? user.profilePictureUrl
          : (config.size === 'large'
            ? user.profilePictureLargeUrl
            : user.profilePictureMediumUrl)),
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

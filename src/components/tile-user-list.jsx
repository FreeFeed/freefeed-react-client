import React from 'react'
import {Link} from 'react-router'
import classnames from 'classnames'
import _ from 'lodash'

import {preventDefault} from '../utils'

import throbber16 from 'assets/images/throbber-16.gif'

const renderUsers = (type) => (user) => {
  return (
    <li key={user.id}>
      <Link to={`/${user.username}`}>
        <div className="avatar">
          <img src={user.profilePictureUrl}/>
        </div>
        <span>{user.screenName}</span>
      </Link>

      {type == REQUESTS ? (
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
export const REQUESTS = 'REQUESTS'

export const tileUserListFactroy = (config) => (props) => {
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

      <ul className={listClasses}>
        {users}
      </ul>
    </div>
  )
}

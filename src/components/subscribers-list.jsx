import React from 'react'
import {Link} from 'react-router'

const renderSubscribers = user => {
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

export default props => {
  const subscribers = props.subscribers.map(renderSubscribers)

  return (
    <ul className='tile-list'>
      {subscribers}
    </ul>
  )
}

import React from 'react'

import UserName from './user-name'
import {preventDefault} from '../utils'

const renderLike = (user) => (
  <li className="p-timeline-user-like" key={user.id}>
    <UserName user={user}/>
    <span>,&#32;</span>
  </li>
)

const renderLastLike = (user, omittedLikes = 0, showMoreLikes = null) => (
  <li className="p-timeline-user-like" key={user.id}>
    <UserName user={user}/>
    <span>
    { omittedLikes > 0 ? (
      <span>
        &nbsp;and&nbsp;
        <a onClick={preventDefault(showMoreLikes)}>
          {omittedLikes} other people
        </a>
      </span>
    ) : false }
    &nbsp;liked this
    </span>
  </li>
)

export default ({likes, showMoreLikes, post}) => {
  const hasLikes = likes.length > 0
  const _showMoreLikes = () => showMoreLikes(post.id)
  const likes_exclude_last = likes.slice(0, likes.length - 1).map(renderLike)
  const last = hasLikes && likes[likes.length - 1]
  const rendered_last = last ? renderLastLike(last, post.omittedLikes, _showMoreLikes) : false

  const rendered_likes = rendered_last ? [...likes_exclude_last, rendered_last] : likes_exclude_last

  return (hasLikes ? (
    <div className="likes">
      <i className="fa fa-heart icon"></i>
      <ul className="p-timeline-user-likes">
        {rendered_likes}
      </ul>
    </div>
  ) : <div/>)
}

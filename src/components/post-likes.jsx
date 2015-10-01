import React from 'react'

import UserName from './user-name'

const renderLike = (user, isLast=false, omittedLikes = 0, showMoreLikes = null) => (
  <li className="p-timeline-user-like" key={user.id}>
    <UserName mode='screen' user={user}/>
    {isLast ? (
      <span>
      { omittedLikes > 0 ? (
        <span>
          &nbsp;and&nbsp;
          <a onClick={(e) => {e.preventDefault(); showMoreLikes()}}>
            {omittedLikes} other people
          </a>
        </span>
      ) : false }
      &nbsp;liked this
      </span>
    ) : (<span>,&nbsp;</span>)}
  </li>
)

export default (props) => {
  const hasLikes = props.likes.length > 0
  const likes_exclude_last = props.likes.slice(0, props.likes.length - 2).map((user) => renderLike(user))
  const last = props.likes.length > 0 && props.likes[props.likes.length - 1]

  const commentsExpanded = (props.post.omittedComments == 0)
  const showMoreLikes = () => props.showMoreLikes(props.post.id, commentsExpanded)

  return (
    <div className="likes">
      {hasLikes ? (<i className="fa fa-heart icon"></i>) : false}
      <ul className="p-timeline-user-likes">
        {likes_exclude_last}
        {last ? renderLike(last, true, props.post.omittedLikes, showMoreLikes) : false}
      </ul>
    </div>
  )
}

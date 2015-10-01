import React from 'react'
import {Link} from 'react-router'
import moment from 'moment'
import Linkify from 'react-linkify'

import {fromNowOrNow} from '../utils'
import PostComments from './post-comments'
import PostLikes from './post-likes'
import UserName from './user-name'
import FeedPost from './feed-post'

export default (props) => {
  const user = props.users[props.data.createdBy]
  const screenName = props.current_user.id === user.id ? 'You' : user.screenName

  const isDirect = false

  const createdAt = new Date(props.data.createdAt - 0)
  const createdAtISO = moment(createdAt).format()
  const createdAgo = fromNowOrNow(createdAt)

  const firstFeedName = user.username  // FIXME

  return (
    <div className='timeline-post-container'>
      <div className='avatar'>
        <Link to='timeline.index' params={{username: user.username}}>
          <img src={ user.profilePictureMediumUrl } />
        </Link>
      </div>
      <div className='post-body p-timeline-post'>
        <div className='title'>
          <UserName className='post-author' mode='screen' user={user}/>
        </div>

        <div className='body'>
          <div className='text'>
            <Linkify>{props.data.body}</Linkify>
          </div>
        </div>

        <div className='info p-timeline-post-info'>
          {isDirect ? (<span>»</span>) : false}
          <span className='post-date'>
            <Link to='post' params={{username: firstFeedName, postId: props.data.id}} className='datetime'>
              <time dateTime={createdAtISO} title={createdAtISO}>{createdAgo}</time>
            </Link>
          </span>

          <span className='post-controls'>
          </span>

          <PostLikes post={props.data} likes={props.likes} showMoreLikes={props.showMoreLikes} />
        </div>

        <PostComments post={props.data}
                      comments={props.comments}
                      showMoreComments={props.showMoreComments} />
      </div>
    </div>
  )
}